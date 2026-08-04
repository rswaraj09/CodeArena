import { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  IconButton,
  Button,
  Tooltip,
  Divider,
  Chip,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import TextDecreaseRoundedIcon from '@mui/icons-material/TextDecreaseRounded';
import TextIncreaseRoundedIcon from '@mui/icons-material/TextIncreaseRounded';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { toggleTheme, setFontSize } from '@/features/editor/editorSlice';
import { defineMonacoThemes } from '@/features/problems/monacoConfig';
import problemService from '@/services/problemService';

const COMPILER_LANGUAGES = [
  {
    id: 'c',
    name: 'C',
    filename: 'main.c',
    monacoLang: 'c',
    badge: 'C',
    color: '#00599C',
    defaultCode: `// Online C Compiler to run C program online
#include <stdio.h>

int main() {
    // Write C code here
    printf("Start small. Ship something.\\n");

    return 0;
}`,
  },
  {
    id: 'cpp',
    name: 'C++',
    filename: 'main.cpp',
    monacoLang: 'cpp',
    badge: 'C++',
    color: '#00599C',
    defaultCode: `// Online C++ Compiler to run C++ program online
#include <iostream>
using namespace std;

int main() {
    // Write C++ code here
    cout << "Start small. Ship something." << endl;

    return 0;
}`,
  },
  {
    id: 'java',
    name: 'Java',
    filename: 'Main.java',
    monacoLang: 'java',
    badge: 'JAVA',
    color: '#ED8B00',
    defaultCode: `// Online Java Compiler to run Java program online
public class Main {
    public static void main(String[] args) {
        // Write Java code here
        System.out.println("Start small. Ship something.");
    }
}`,
  },
  {
    id: 'python',
    name: 'Python',
    filename: 'main.py',
    monacoLang: 'python',
    badge: 'PY',
    color: '#3776AB',
    defaultCode: `# Online Python Compiler to run Python program online
# Write Python code here
print("Start small. Ship something.")
`,
  },
  {
    id: 'javascript',
    name: 'JavaScript',
    filename: 'script.js',
    monacoLang: 'javascript',
    badge: 'JS',
    color: '#F7DF1E',
    defaultCode: `// Online JavaScript Compiler to run JS program online
// Write JavaScript code here
console.log("Start small. Ship something.");
`,
  },
  {
    id: 'go',
    name: 'Go',
    filename: 'main.go',
    monacoLang: 'go',
    badge: 'GO',
    color: '#00ADD8',
    defaultCode: `// Online Go Compiler to run Go program online
package main
import "fmt"

func main() {
    // Write Go code here
    fmt.Println("Start small. Ship something.")
}`,
  },
  {
    id: 'rust',
    name: 'Rust',
    filename: 'main.rs',
    monacoLang: 'rust',
    badge: 'RS',
    color: '#CE412B',
    defaultCode: `// Online Rust Compiler to run Rust program online
fn main() {
    // Write Rust code here
    println!("Start small. Ship something.");
}`,
  },
];

const OnlineCompilerPage = () => {
  const dispatch = useAppDispatch();
  const { monacoTheme, fontSize } = useAppSelector((s) => s.editor);

  const [selectedLang, setSelectedLang] = useState(COMPILER_LANGUAGES[0]); // default C
  const [code, setCode] = useState(COMPILER_LANGUAGES[0].defaultCode);
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState(null); // { verdict, text, runtimeMs }
  const [isRunning, setIsRunning] = useState(false);

  const handleLanguageSelect = (langObj) => {
    setSelectedLang(langObj);
    setCode(langObj.defaultCode);
    setOutput(null);
  };

  const handleRun = async () => {
    setIsRunning(true);
    try {
      const res = await problemService.compile({
        language: selectedLang.id,
        code,
        stdin,
      });

      const data = res.data || res;
      setOutput({
        verdict: data.verdict || 'SUCCESS',
        text: data.output || data.stderr || 'Program executed with no output.',
        runtimeMs: data.runtimeMs || 0,
      });
    } catch (err) {
      setOutput({
        verdict: 'RUNTIME_ERROR',
        text: err.response?.data?.message || err.message || 'Execution error.',
        runtimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 96px)', display: 'flex', gap: 2, p: 0.5 }}>
      {/* Left Icon Sidebar for Language Selection */}
      <Paper
        elevation={0}
        sx={{
          width: 64,
          borderRadius: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 2,
          gap: 1.5,
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        {COMPILER_LANGUAGES.map((lang) => {
          const isSelected = selectedLang.id === lang.id;
          return (
            <Tooltip key={lang.id} title={`${lang.name} Compiler`} placement="right">
              <Box
                onClick={() => handleLanguageSelect(lang)}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  fontFamily: "'JetBrains Mono', monospace",
                  bgcolor: isSelected ? 'primary.main' : 'background.default',
                  color: isSelected ? '#ffffff' : 'text.secondary',
                  border: isSelected ? 'none' : '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.main' : 'action.hover',
                    color: isSelected ? '#ffffff' : 'text.primary',
                  },
                }}
              >
                {lang.badge}
              </Box>
            </Tooltip>
          );
        })}
      </Paper>

      {/* Main Container: Editor (Left) & Console (Right) */}
      <Box sx={{ flex: 1, display: 'flex', gap: 2, minWidth: 0 }}>
        {/* Editor Panel */}
        <Paper
          elevation={0}
          sx={{
            flex: 1,
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          {/* Header Bar */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Chip
                label={selectedLang.filename}
                size="small"
                variant="outlined"
                sx={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  borderRadius: 1.5,
                  px: 0.5,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {selectedLang.name} Online Compiler
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Tooltip title="Decrease font size">
                <IconButton size="small" onClick={() => dispatch(setFontSize(Math.max(11, fontSize - 1)))}>
                  <TextDecreaseRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Increase font size">
                <IconButton size="small" onClick={() => dispatch(setFontSize(Math.min(22, fontSize + 1)))}>
                  <TextIncreaseRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Toggle theme">
                <IconButton size="small" onClick={() => dispatch(toggleTheme())}>
                  {monacoTheme === 'ca-dark' ? (
                    <DarkModeRoundedIcon fontSize="small" />
                  ) : (
                    <LightModeRoundedIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowRoundedIcon />}
                onClick={handleRun}
                disabled={isRunning}
                sx={{ px: 3, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
              >
                {isRunning ? 'Running…' : 'Run'}
              </Button>
            </Stack>
          </Stack>

          {/* Monaco Editor */}
          <Box sx={{ flex: 1, minHeight: 0 }}>
            <Editor
              height="100%"
              language={selectedLang.monacoLang}
              theme={monacoTheme}
              value={code}
              onChange={(val) => setCode(val ?? '')}
              beforeMount={defineMonacoThemes}
              options={{
                fontSize,
                minimap: { enabled: false },
                automaticLayout: true,
                scrollBeyondLastLine: false,
                fontFamily: "'JetBrains Mono', monospace",
                padding: { top: 16 },
              }}
            />
          </Box>
        </Paper>

        {/* Output & Input Panel */}
        <Paper
          elevation={0}
          sx={{
            width: { xs: '100%', md: '42%' },
            borderRadius: 3,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          {/* Header Bar */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2, py: 1.2, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Typography variant="subtitle2" fontWeight={600}>
              Output
            </Typography>
            <Tooltip title="Clear output">
              <IconButton size="small" onClick={() => setOutput(null)}>
                <DeleteSweepRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          {/* Output Display Area */}
          <Box
            sx={{
              flex: 1,
              p: 2,
              overflow: 'auto',
              bgcolor: monacoTheme === 'ca-dark' ? '#0d1117' : '#f8fafc',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.88rem',
              color: monacoTheme === 'ca-dark' ? '#e6edf3' : '#1e293b',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {isRunning && (
              <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                Compiling and running {selectedLang.name} program…
              </Typography>
            )}
            {!isRunning && output && (
              <Stack spacing={1}>
                {output.verdict === 'COMPILATION_ERROR' && (
                  <Typography variant="caption" color="error.main" fontWeight={700}>
                    Compilation Error:
                  </Typography>
                )}
                {output.verdict === 'RUNTIME_ERROR' && (
                  <Typography variant="caption" color="error.main" fontWeight={700}>
                    Runtime Error:
                  </Typography>
                )}
                <Box component="span" sx={{ lineHeight: 1.6 }}>
                  {output.text}
                </Box>

                <Divider sx={{ my: 1 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Execution time: {output.runtimeMs} ms
                </Typography>
              </Stack>
            )}
            {!isRunning && !output && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Click <strong>Run</strong> to compile and execute your code.
              </Typography>
            )}
          </Box>

          {/* Stdin / Custom Input Section */}
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 1.5, bgcolor: 'background.default' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 0.5, display: 'block' }}>
              Standard Input (stdin):
            </Typography>
            <Box
              component="textarea"
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              placeholder="Provide input for scanf / cin / input() / Scanner here…"
              sx={{
                width: '100%',
                height: 70,
                resize: 'none',
                bgcolor: 'transparent',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1.5,
                p: 1,
                outline: 'none',
                color: 'text.primary',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.82rem',
              }}
            />
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default OnlineCompilerPage;
