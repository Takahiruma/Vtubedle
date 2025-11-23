import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SQLiteProvider } from './components/SQliteProvider/SQliteProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SQLiteProvider>
      <App />
    </SQLiteProvider>
  </StrictMode>,
)
