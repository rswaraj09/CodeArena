import { Box, Typography, Paper } from '@mui/material';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';

const ComingSoon = ({ title, description }) => (
  <Box>
    <Typography variant="h4" sx={{ fontSize: '1.6rem', mb: 0.5 }}>{title}</Typography>
    <Typography sx={{ color: 'text.secondary', mb: 3 }}>{description}</Typography>
    <Paper elevation={0} sx={{ p: 6, borderRadius: 3, textAlign: 'center' }}>
      <ConstructionRoundedIcon sx={{ fontSize: 32, color: 'text.secondary', mb: 1.5 }} />
      <Typography variant="body2" color="text.secondary">
        This module is scaffolded and ready for its backend wiring — build it out next.
      </Typography>
    </Paper>
  </Box>
);

export default ComingSoon;
