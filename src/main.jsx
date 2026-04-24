import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/animations.css'
import App from './App.jsx'

const setAppDvh = () => {
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight
  document.documentElement.style.setProperty('--app-dvh', `${viewportHeight * 0.01}px`)
}

if (typeof window !== 'undefined') {
  setAppDvh()
  window.addEventListener('resize', setAppDvh, { passive: true })
  window.addEventListener('orientationchange', setAppDvh, { passive: true })
  window.visualViewport?.addEventListener('resize', setAppDvh, { passive: true })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App />
  </StrictMode>,
)
