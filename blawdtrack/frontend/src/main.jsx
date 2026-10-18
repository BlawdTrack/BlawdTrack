import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { theme } from './theme.js'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'

// Router de datos (en vez de <BrowserRouter>) para poder avisar de cambios sin guardar antes de salir de
// una pantalla (useBlocker). Una única ruta comodín entrega todo a <App />, que sigue definiendo las rutas.
const router = createBrowserRouter([
  {
    path: '*',
    element: (
      <AuthProvider>
        <App />
      </AuthProvider>
    ),
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)
