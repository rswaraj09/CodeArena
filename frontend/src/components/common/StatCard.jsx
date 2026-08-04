import { Box, Paper, Typography } from '@mui/material';

const StatCard = ({ label, value, sublabel, icon: Icon, accent = 'primary.main' }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.5,
      borderRadius: 3,
      bgcolor: 'background.paper',
      display: 'flex',
      flexDirection: 'column',
      gap: 1,
      minWidth: 0,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      {Icon && <Icon sx={{ fontSize: 18, color: accent }} />}
    </Box>
    <Typography sx={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '1.9rem', lineHeight: 1, color: 'text.primary' }}>
      {value}
    </Typography>
    {sublabel && (
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {sublabel}
      </Typography>
    )}
  </Paper>
);

export default StatCard;
