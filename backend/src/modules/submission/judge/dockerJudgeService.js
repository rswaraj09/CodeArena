const fs = require('fs/promises');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { execFile, spawn } = require('child_process');
const languageRuntime = require('./languageRuntime');
const env = require('../../../config/env');

const COMPILE_FAILURE_EXIT_CODE = 42;
const TIMEOUT_EXIT_CODE = 124;
const CONTAINER_MEMORY_OVERHEAD_MB = 64; // headroom over the judged program's own limit

/**
 * Executes one submission per call in a brand-new, disposable Docker
 * container. Mirrors DockerJudgeService.java flag-for-flag — see
 * docs/docker-sandbox-guide.md in the original repo for the reasoning
 * behind every flag.
 *
 * IMPORTANT: this shells out to the `docker` CLI and therefore requires a
 * host with the Docker daemon available. It will NOT run inside a Vercel
 * serverless function — see README.md for how to host this piece
 * separately (a VM / Render / Railway / Fly.io) and point the API at it.
 */
const PISTON_LANGUAGES = {
  javascript: 'javascript',
  js: 'javascript',
  python: 'python',
  python3: 'python',
  cpp: 'c++',
  c: 'c',
  java: 'java',
};

async function executePiston(language, code, stdin) {
  const pistonLang = PISTON_LANGUAGES[(language || '').toLowerCase()] || (language || '').toLowerCase() || 'javascript';
  const startTime = Date.now();

  try {
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: pistonLang,
        version: '*',
        files: [{ content: code || '' }],
        stdin: stdin || '',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return {
        verdict: 'RUNTIME_ERROR',
        stdout: '',
        stderr: `Execution failed (${response.status}): ${errText}`,
        runtimeMs: Date.now() - startTime,
      };
    }

    const data = await response.json();
    const runtimeMs = Date.now() - startTime;

    if (data.compile && data.compile.code !== 0 && data.compile.code !== null) {
      return {
        verdict: 'COMPILATION_ERROR',
        stdout: data.compile.stdout || '',
        stderr: data.compile.stderr || data.compile.output || 'Compilation Error.',
        runtimeMs,
      };
    }

    const runResult = data.run || {};
    if (runResult.signal === 'SIGKILL' || runResult.code === 124) {
      return {
        verdict: 'TIME_LIMIT_EXCEEDED',
        stdout: runResult.stdout || '',
        stderr: 'Time Limit Exceeded.',
        runtimeMs,
      };
    }

    if (runResult.code !== 0 && runResult.code !== null) {
      return {
        verdict: 'RUNTIME_ERROR',
        stdout: runResult.stdout || '',
        stderr: runResult.stderr || runResult.output || 'Runtime Error.',
        runtimeMs,
      };
    }

    return {
      verdict: 'PENDING',
      stdout: runResult.stdout || '',
      stderr: runResult.stderr || '',
      runtimeMs,
    };
  } catch (err) {
    return {
      verdict: 'RUNTIME_ERROR',
      stdout: '',
      stderr: `Online compiler error: ${err.message}`,
      runtimeMs: Date.now() - startTime,
    };
  }
}

async function execute(language, code, stdin, timeLimitMs, memoryLimitMb) {
  if (env.judge.disabled) {
    return executePiston(language, code, stdin);
  }

  const runtime = languageRuntime.of(language);
  const submissionId = uuidv4();
  const workDir = path.join(env.judge.workdir, submissionId);

  try {
    await fs.mkdir(workDir, { recursive: true });
    await fs.writeFile(path.join(workDir, runtime.sourceFileName), code, 'utf8');
    await fs.writeFile(path.join(workDir, 'input.txt'), stdin || '', 'utf8');
    await fs.writeFile(path.join(workDir, 'run.sh'), buildRunScript(runtime, timeLimitMs, memoryLimitMb), 'utf8');

    return await runContainer(submissionId, workDir, runtime, timeLimitMs);
  } catch (err) {
    console.error('Failed to prepare submission workspace', err);
    return { verdict: 'RUNTIME_ERROR', stdout: '', stderr: 'Internal judge error while preparing the submission.', runtimeMs: 0 };
  } finally {
    await cleanup(workDir);
  }
}

function buildRunScript(runtime, timeLimitMs, memoryLimitMb) {
  const timeoutSeconds = Math.max(1, Math.ceil(timeLimitMs / 1000));
  const runCommand = runtime.runCommand.includes('%d')
    ? runtime.runCommand.replace('%d', memoryLimitMb)
    : runtime.runCommand;

  let script = '#!/bin/sh\nset -e\n';
  if (runtime.requiresCompilation) {
    script += `${runtime.compileCommand} 2> compile_err.txt\n`;
    script += `if [ $? -ne 0 ]; then cat compile_err.txt >&2; exit ${COMPILE_FAILURE_EXIT_CODE}; fi\n`;
  }
  script += `timeout ${timeoutSeconds}s ${runCommand} < input.txt\n`;
  return script;
}

function runContainer(submissionId, workDir, runtime, timeLimitMs) {
  return new Promise((resolve) => {
    const containerMemoryMb = env.judge.memoryLimitMb + CONTAINER_MEMORY_OVERHEAD_MB;

    const args = [
      'run', '--rm',
      '--name', `submission-${submissionId}`,
      `--memory=${containerMemoryMb}m`,
      `--memory-swap=${containerMemoryMb}m`,
      `--cpus=${env.judge.cpuLimit}`,
      `--pids-limit=${env.judge.pidsLimit}`,
      '--network', 'none',
      '--read-only',
      '--tmpfs', '/tmp:rw,size=16m',
      '--cap-drop=ALL',
      '--security-opt=no-new-privileges',
      '-v', `${path.resolve(workDir)}:/submission:rw`,
      '-w', '/submission',
      runtime.dockerImage,
      'sh', 'run.sh',
    ];

    const startedAt = Date.now();
    const child = spawn('docker', args);

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });

    // Outer guard beyond the inner `timeout` — covers cases where the
    // container itself hangs, rather than the judged program.
    const guardMs = (env.judge.executionTimeoutSeconds + 3) * 1000;
    const guardTimer = setTimeout(async () => {
      child.kill('SIGKILL');
      await forceRemoveContainer(submissionId);
      resolve({ verdict: 'TIME_LIMIT_EXCEEDED', stdout: '', stderr: 'Execution exceeded the time limit.', runtimeMs: timeLimitMs });
    }, guardMs);

    child.on('close', (exitCode) => {
      clearTimeout(guardTimer);
      const runtimeMs = Date.now() - startedAt;

      if (exitCode === COMPILE_FAILURE_EXIT_CODE) {
        return resolve({ verdict: 'COMPILATION_ERROR', stdout, stderr, runtimeMs });
      }
      if (exitCode === TIMEOUT_EXIT_CODE) {
        return resolve({ verdict: 'TIME_LIMIT_EXCEEDED', stdout, stderr, runtimeMs });
      }
      if (exitCode !== 0) {
        return resolve({ verdict: 'RUNTIME_ERROR', stdout, stderr, runtimeMs });
      }
      // Ran to completion — caller compares stdout against expected output.
      resolve({ verdict: 'PENDING', stdout, stderr, runtimeMs });
    });

    child.on('error', (err) => {
      clearTimeout(guardTimer);
      resolve({ verdict: 'RUNTIME_ERROR', stdout: '', stderr: `Judge error: ${err.message}`, runtimeMs: Date.now() - startedAt });
    });
  });
}

function forceRemoveContainer(submissionId) {
  return new Promise((resolve) => {
    execFile('docker', ['rm', '-f', `submission-${submissionId}`], { timeout: 5000 }, () => resolve());
  });
}

async function cleanup(workDir) {
  try {
    await fs.rm(workDir, { recursive: true, force: true });
  } catch (err) {
    console.warn(`Could not clean up submission workspace ${workDir}:`, err.message);
  }
}

module.exports = { execute };
