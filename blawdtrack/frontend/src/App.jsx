import React, { useState } from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';
import LoginPage from './pages/LoginPage';

function App() {
  const [lastResponse, setLastResponse] = useState(null);

  return (
    <main>
      <LoginPage
        onLoginSuccess={setLastResponse}
        onSubmitAttempt={() => setLastResponse(null)}
      />

      {lastResponse && (
        <Container maxWidth="xs" sx={{ pb: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Respuesta recibida (esto es lo que T16 va a guardar):
            </Typography>
            <Box
              component="pre"
              sx={{ fontSize: '0.75rem', whiteSpace: 'pre-wrap', m: 0 }}
            >
              {JSON.stringify(lastResponse, null, 2)}
            </Box>
          </Paper>
        </Container>
      )}
    </main>
  );
}

export default App;
