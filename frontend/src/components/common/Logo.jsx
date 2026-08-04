import { Box, Typography } from '@mui/material';

/**
 * CodeArena wordmark: a monospace "><" bracket motif (opening/closing tag,
 * doubling as a competitive "versus" mark) followed by the name set in
 * the display face. Used in the topbar, auth screens and footer.
 */
const Logo = ({ size = 'md', withText = true }) => {
  const px = size === 'sm' ? 22 : size === 'lg' ? 34 : 26;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: px,
          height: px,
          borderRadius: '7px',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, #FFB020 0%, #7C5CFF 100%)',
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 800,
          fontSize: px * 0.5,
          color: '#0A0E14',
          flexShrink: 0,
        }}
      >
        {'</>'}
      </Box>
      {withText && (
        <Typography
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            fontSize: px * 0.62,
            letterSpacing: '-0.02em',
            color: 'text.primary',
          }}
        >
          Code<Box component="span" sx={{ color: 'primary.main' }}>Arena</Box>
        </Typography>
      )}
    </Box>
  );
};

export default Logo;
