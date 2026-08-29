import { useEffect, useRef } from 'react'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useLocation } from 'react-router-dom'

// Customize the progress bar appearance
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.2 })

export default function TopProgressBar() {
  const location = useLocation()
  const apiActiveCount = useRef(0)

  // Trigger on route changes
  useEffect(() => {
    // Start progress on route change
    NProgress.start()
    
    // Complete it shortly after if no fetch is active
    const timer = setTimeout(() => {
      if (apiActiveCount.current === 0) {
        NProgress.done()
      }
    }, 300)
    
    return () => clearTimeout(timer)
  }, [location.pathname, location.search])

  // Trigger on API requests across the entire app
  useEffect(() => {
    const handleStart = () => {
      if (apiActiveCount.current === 0) {
        NProgress.start()
      }
      apiActiveCount.current += 1
    }

    const handleEnd = () => {
      apiActiveCount.current = Math.max(0, apiActiveCount.current - 1)
      if (apiActiveCount.current === 0) {
        NProgress.done()
      }
    }

    window.addEventListener('api:start', handleStart)
    window.addEventListener('api:end', handleEnd)

    return () => {
      window.removeEventListener('api:start', handleStart)
      window.removeEventListener('api:end', handleEnd)
      NProgress.done()
    }
  }, [])

  return null
}
