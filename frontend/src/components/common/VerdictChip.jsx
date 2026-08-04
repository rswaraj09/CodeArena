import { Chip } from '@mui/material';

// Maps every possible judge verdict to a color so it's instantly scannable
// in tables, submission feeds and the run console.
const VERDICT_STYLES = {
  ACCEPTED: { label: 'Accepted', color: '#34D399', bg: 'rgba(52,211,153,0.12)' },
  WRONG_ANSWER: { label: 'Wrong Answer', color: '#FB6467', bg: 'rgba(251,100,103,0.12)' },
  TIME_LIMIT_EXCEEDED: { label: 'Time Limit Exceeded', color: '#FFB020', bg: 'rgba(255,176,32,0.12)' },
  MEMORY_LIMIT_EXCEEDED: { label: 'Memory Limit Exceeded', color: '#FFB020', bg: 'rgba(255,176,32,0.12)' },
  RUNTIME_ERROR: { label: 'Runtime Error', color: '#FB6467', bg: 'rgba(251,100,103,0.12)' },
  COMPILATION_ERROR: { label: 'Compilation Error', color: '#FB6467', bg: 'rgba(251,100,103,0.12)' },
  PRESENTATION_ERROR: { label: 'Presentation Error', color: '#38BDF8', bg: 'rgba(56,189,248,0.12)' },
  PENDING: { label: 'Judging…', color: '#8C9AAE', bg: 'rgba(140,154,174,0.12)' },
};

const VerdictChip = ({ verdict, size = 'small' }) => {
  const style = VERDICT_STYLES[verdict] || VERDICT_STYLES.PENDING;
  return (
    <Chip
      size={size}
      label={style.label}
      sx={{
        color: style.color,
        backgroundColor: style.bg,
        border: `1px solid ${style.color}33`,
        fontWeight: 600,
      }}
    />
  );
};

export default VerdictChip;
