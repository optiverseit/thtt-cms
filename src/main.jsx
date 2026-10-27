import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from "@react-oauth/google";
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
 
   <GoogleOAuthProvider
    clientId={
      (typeof window !== "undefined" && window.__ENV__?.VITE_GOOGLE_CLIENT_ID) ||
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "178127958696-vk4jhq3sh9jk8ki3h92c7q832qtemlb5.apps.googleusercontent.com"
    }
  >
    <App />
  </GoogleOAuthProvider>
)
