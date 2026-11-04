import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { startNativeAuthListener } from '@/lib/nativeAuth'
import { setPhoneBars } from '@/hooks/useDarkMode'

// In the iPhone/Android apps: finish Google/Apple sign-in when the browser sheet returns.
startNativeAuthListener()
// Match the phone's status-bar icons to the theme chosen by the boot script in index.html.
setPhoneBars(document.documentElement.classList.contains('dark'))

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
