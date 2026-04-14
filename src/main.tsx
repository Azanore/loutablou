// Purpose: Vite entry point — mounts the React app into the DOM.
// Related: src/App.tsx, src/index.css
// Must not include: business logic, component definitions

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
