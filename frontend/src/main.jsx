import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { PhoneContextProvider } from './context/phoneChatContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PhoneContextProvider>
      <App />
    </PhoneContextProvider>
  </StrictMode>,
)
