import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Stack,
  Chip,
  Select,
  MenuItem,
  IconButton,
  Button,
  Tooltip,
  Divider,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import VerticalSplitRoundedIcon from '@mui/icons-material/VerticalSplitRounded';
import TextDecreaseRoundedIcon from '@mui/icons-material/TextDecreaseRounded';
import TextIncreaseRoundedIcon from '@mui/icons-material/TextIncreaseRounded';
import VerdictChip from '@/components/common/VerdictChip';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setLanguage, toggleTheme, setFontSize, toggleSplitScreen } from '@/features/editor/editorSlice';
import { defineMonacoThemes, LANGUAGE_BOILERPLATE, MONACO_LANGUAGE_ID } from './monacoConfig';
import { getProblemBySlug } from './mockProblems';
import problemService from '@/services/problemService';

const DIFFICULTY_COLOR = { Easy: 'success.main', Medium: '#FFB020', Hard: 'error.main' };

const ProblemWorkspacePage = () => {
  const { slug } = useParams();
  const fallbackProblem = getProblemBySlug(slug);
  const [problem, setProblem] = useState(fallbackProblem);
  const dispatch = useAppDispatch();
  const { language, monacoTheme, fontSize, splitScreen } = useAppSelector((s) => s.editor);

  const [code, setCode] = useState(LANGUAGE_BOILERPLATE[language]);
  const [leftTab, setLeftTab] = useState('description');
  const [consoleTab, setConsoleTab] = useState('input');
  const [customInput, setCustomInput] = useState('');
  const [output, setOutput] = useState(null); // { verdict, stdout, runtimeMs }
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    problemService
      .getBySlug(slug)
      .then((res) => {
        if (res.data) setProblem(res.data);
      })
      .catch(() => {
        // Fallback to mock problem if offline / backend not loaded
      });
  }, [slug]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    dispatch(setLanguage(lang));
    setCode(LANGUAGE_BOILERPLATE[lang]);
  };

  const runCode = async (isSubmit) => {
    setIsRunning(true);
    setConsoleTab('output');

    try {
      if (!isSubmit) {
        const res = await problemService.run(slug, { language, code, customInput });
        const data = res.data || res;
        setOutput({
          verdict: data.verdict || 'ACCEPTED',
          stdout: data.output || data.stderr || 'Code executed successfully.',
          runtimeMs: data.runtimeMs || 0,
        });
      } else {
        const res = await problemService.submit(slug, { language, code });
        const data = res.data || res;
        setOutput({
          verdict: data.verdict || 'ACCEPTED',
          stdout: data.judgeOutput || `All test cases checked (${data.testCasesPassed || 0}/${data.testCasesTotal || 0} passed).`,
          runtimeMs: data.runtimeMs || 0,
        });
      }
    } catch (err) {
      setOutput({
        verdict: 'RUNTIME_ERROR',
        stdout: err.response?.data?.message || err.message || 'Failed to execute code.',
        runtimeMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Box sx={{ height: 'calc(100vh - 96px)', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontSize: '1.25rem' }}>{problem.title}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: DIFFICULTY_COLOR[problem.difficulty], fontWeight: 700 }}>
              {problem.difficulty}
            </Typography>
            <Typography variant="caption" color="text.secondary">·</Typography>
            <Typography variant="caption" color="text.secondary">{problem.timeLimitMs} ms / {problem.memoryLimitMb} MB</Typography>
          </Stack>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="inherit" startIcon={<PlayArrowRoundedIcon />} onClick={() => runCode(false)} disabled={isRunning} sx={{ borderColor: 'divider' }}>
            Run
          </Button>
          <Button variant="contained" color="primary" startIcon={<SendRoundedIcon />} onClick={() => runCode(true)} disabled={isRunning}>
            Submit
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2} sx={{ flex: 1, minHeight: 0 }}>
        {/* Left: problem panel */}
        <Grid item xs={12} md={splitScreen ? 5 : 12} sx={{ height: { md: '100%' } }}>
          <Paper elevation={0} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Tabs value={leftTab} onChange={(_, v) => setLeftTab(v)} sx={{ borderBottom: '1px solid', borderColor: 'divider', minHeight: 42, px: 1 }}>
              <Tab value="description" label="Description" sx={{ minHeight: 42, textTransform: 'none' }} />
              <Tab value="hints" label="Hints" sx={{ minHeight: 42, textTransform: 'none' }} />
              <Tab value="submissions" label="Submissions" sx={{ minHeight: 42, textTransform: 'none' }} />
            </Tabs>
            <Box sx={{ p: 3, overflow: 'auto', flex: 1 }}>
              {leftTab === 'description' && (
                <>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3 }}>
                    {problem.description}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Examples</Typography>
                  <Stack spacing={2} sx={{ mb: 3 }}>
                    {problem.examples.map((ex, i) => (
                      <Paper key={i} elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                        <Typography variant="caption" className="font-mono" sx={{ display: 'block', color: 'text.secondary' }}>Input: {ex.input}</Typography>
                        <Typography variant="caption" className="font-mono" sx={{ display: 'block', color: 'success.main', mt: 0.5 }}>Output: {ex.output}</Typography>
                        {ex.explanation && <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>{ex.explanation}</Typography>}
                      </Paper>
                    ))}
                  </Stack>
                  <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Constraints</Typography>
                  <Stack component="ul" sx={{ pl: 2.5, m: 0 }} spacing={0.5}>
                    {problem.constraints.map((c, i) => (
                      <Typography component="li" key={i} variant="caption" className="font-mono" sx={{ color: 'text.secondary' }}>{c}</Typography>
                    ))}
                  </Stack>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 3 }}>
                    {problem.tags.map((t) => <Chip key={t} size="small" label={t} />)}
                  </Stack>
                </>
              )}
              {leftTab === 'hints' && (
                <Stack spacing={1.5}>
                  {problem.hints.map((h, i) => (
                    <Paper key={i} elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                      <Typography variant="body2" color="text.secondary">Hint {i + 1}: {h}</Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
              {leftTab === 'submissions' && (
                <Typography variant="body2" color="text.secondary">No submissions yet for this session.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Right: editor + console */}
        {splitScreen && (
          <Grid item xs={12} md={7} sx={{ height: { md: '100%' } }}>
            <Paper elevation={0} sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Select value={language} onChange={handleLanguageChange} size="small" variant="standard" disableUnderline sx={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' }}>
                  <MenuItem value="java">Java</MenuItem>
                  <MenuItem value="python">Python</MenuItem>
                  <MenuItem value="cpp">C++</MenuItem>
                  <MenuItem value="c">C</MenuItem>
                  <MenuItem value="javascript">JavaScript</MenuItem>
                </Select>
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Decrease font size">
                    <IconButton size="small" onClick={() => dispatch(setFontSize(Math.max(11, fontSize - 1)))}><TextDecreaseRoundedIcon fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Increase font size">
                    <IconButton size="small" onClick={() => dispatch(setFontSize(Math.min(22, fontSize + 1)))}><TextIncreaseRoundedIcon fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Toggle editor theme">
                    <IconButton size="small" onClick={() => dispatch(toggleTheme())}>
                      {monacoTheme === 'ca-dark' ? <DarkModeRoundedIcon fontSize="small" /> : <LightModeRoundedIcon fontSize="small" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Toggle split screen">
                    <IconButton size="small" onClick={() => dispatch(toggleSplitScreen())}><VerticalSplitRoundedIcon fontSize="small" /></IconButton>
                  </Tooltip>
                  <Tooltip title="Fullscreen">
                    <IconButton size="small"><FullscreenRoundedIcon fontSize="small" /></IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Editor
                  height="100%"
                  language={MONACO_LANGUAGE_ID[language]}
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

              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', height: 200, display: 'flex', flexDirection: 'column' }}>
                <Tabs value={consoleTab} onChange={(_, v) => setConsoleTab(v)} sx={{ minHeight: 36, px: 1 }}>
                  <Tab value="input" label="Input" sx={{ minHeight: 36, textTransform: 'none', fontSize: '0.8rem' }} />
                  <Tab value="output" label="Output" sx={{ minHeight: 36, textTransform: 'none', fontSize: '0.8rem' }} />
                </Tabs>
                <Divider />
                <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
                  {consoleTab === 'input' ? (
                    <Box
                      component="textarea"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter custom input for the Run button…"
                      sx={{
                        width: '100%',
                        height: '100%',
                        resize: 'none',
                        bgcolor: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'text.primary',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.82rem',
                      }}
                    />
                  ) : (
                    <Box>
                      {isRunning && <Typography variant="body2" color="text.secondary">Running…</Typography>}
                      {!isRunning && output && (
                        <Stack spacing={1}>
                          <VerdictChip verdict={output.verdict} />
                          <Typography variant="body2" className="font-mono" sx={{ color: 'text.secondary' }}>{output.stdout}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            Runtime: {output.runtimeMs} ms · Memory: {(output.memoryKb / 1024).toFixed(1)} MB
                          </Typography>
                        </Stack>
                      )}
                      {!isRunning && !output && <Typography variant="body2" color="text.secondary">Run your code to see output here.</Typography>}
                    </Box>
                  )}
                </Box>
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ProblemWorkspacePage;
