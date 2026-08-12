import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AccesibilidadProvider } from './context/AccesibilidadContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AccesibilidadProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AccesibilidadProvider>
  </React.StrictMode>,
)
