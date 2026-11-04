import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { startNativeAuthListener } from '@/lib/nativeAuth'

// In the iPhone/Android apps: finish Google/Apple sign-in when the browser sheet returns.
startNativeAuthListener()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
