import { createTheme } from '@mui/material/styles';

export const tokens = {
  ink: '#0A0E14',
  surface: '#121822',
  surface2: '#1A2230',
  line: '#232C3A',
  text: '#E8EDF4',
  textMuted: '#8C9AAE',
  textFaint: '#56637A',
  amber: '#FFB020',
  amberDim: '#A97418',
  violet: '#7C5CFF',
  violetDim: '#4C3AA0',
  emerald: '#34D399',
  rose: '#FB6467',
  sky: '#38BDF8',
};

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: tokens.ink,
      paper: tokens.surface,
    },
    primary: {
      main: tokens.amber,
      contrastText: '#12100A',
    },
    secondary: {
      main: tokens.violet,
      contrastText: '#FFFFFF',
    },
    success: { main: tokens.emerald },
    error: { main: tokens.rose },
    info: { main: tokens.sky },
    warning: { main: tokens.amber },
    text: {
      primary: tokens.text,
      secondary: tokens.textMuted,
    },
    divider: tokens.line,
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
    h1: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '-0.01em' },
    h2: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: '-0.01em' },
    h3: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 },
    h4: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
    h5: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
    h6: { fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${tokens.line}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        containedPrimary: {
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 0 0 1px rgba(255,176,32,0.4)' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.72rem' },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: tokens.line },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.surface2,
          border: `1px solid ${tokens.line}`,
          fontSize: '0.75rem',
        },
      },
    },
  },
});

export default theme;
