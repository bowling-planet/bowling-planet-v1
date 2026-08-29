import { useEffect } from 'react'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useLocation } from 'react-router-dom'
import { useIsFetching, useIsMutating } from '@tanstack/react-query'

// Customize the progress bar appearance
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.2 })

export default function TopProgressBar() {
  const location = useLocation()
  const isFetching = useIsFetching()
  const isMutating = useIsMutating()

  useEffect(() => {
    // Start progress on route change
    NProgress.start()
    
    // Complete it shortly after if no fetch is active
    const timer = setTimeout(() => {
      if (isFetching === 0 && isMutating === 0) {
        NProgress.done()
      }
    }, 300)
    
    return () => clearTimeout(timer)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (isFetching > 0 || isMutating > 0) {
      NProgress.start()
    } else {
      NProgress.done()
    }
    
    return () => {
      NProgress.done()
    }
  }, [isFetching, isMutating])

  return null
}
