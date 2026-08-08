import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AccesibilidadProvider } from './context/AccesibilidadContext.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AccesibilidadProvider>
      <App />
    </AccesibilidadProvider>
  </React.StrictMode>,
)
