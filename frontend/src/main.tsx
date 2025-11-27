import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { DevServerProvider } from './context/DevServerContext'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <DevServerProvider>
      <App />
    </DevServerProvider>
  </React.StrictMode>
)

