"use client"
import { useEffect } from "react"

// Precompile and prewarm key routes in development to avoid first-click compile lag
export default function DevRoutePrewarm() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    if (typeof window === 'undefined') return

    const routes = [
      '/',
      '/AdminDashboard',
      '/DriverDetails',
      '/CabDetails',
      '/AssignCab',
      '/CabInfo',
      '/JobMarket',
      '/PredictiveMaintenance',
      '/InvoicePDF',
      '/GPSTracking',
      '/FastTagPayments',
      '/Subscription',
      '/TripLogs',
      '/Servicing',
      '/Expensive',
      '/MyBookings',
    ]

    let cancelled = false

    const prewarm = async () => {
      // stagger requests slightly to not overload dev server
      for (let i = 0; i < routes.length; i++) {
        if (cancelled) break
        const r = routes[i]
        try {
          // Trigger dev compilation by fetching HTML; ignore results
          await fetch(r, { method: 'GET', cache: 'no-store' })
        } catch {}
        // 150ms gap between prewarms
        await new Promise(res => setTimeout(res, 150))
      }
    }

    // Start after a short idle delay to not block first load
    const t = setTimeout(() => { prewarm() }, 800)

    return () => { cancelled = true; clearTimeout(t) }
  }, [])

  return null
}
