import React from 'react';
import { Box } from '@mui/material';

export default function BlawdTrackLogo() {
  return (
    <Box display="flex" justifyContent="center" mb={3}>
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '120px', height: '120px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <rect width="200" height="200" fill="#1A3C34"></rect>
        <rect x="0" y="40" width="200" height="6" fill="#FF6C0E"></rect>
        <text x="100" y="110" fontFamily="sans-serif" fontWeight="700" fontSize="28" fill="#ffffff" textAnchor="middle">
          BT
        </text>
      </svg>
    </Box>
  );
}