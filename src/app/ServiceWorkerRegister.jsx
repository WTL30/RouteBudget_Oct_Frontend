"use client"
import { useEffect } from "react"

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    const enabled = (process.env.NEXT_PUBLIC_ENABLE_SW || '').toLowerCase() === 'true'
    const manage = async () => {
      try {
        const regs = await navigator.serviceWorker.getRegistrations()
        if (!enabled) {
          // Unregister all existing service workers to avoid stale cached bundles
          await Promise.all(regs.map(r => r.unregister().catch(() => {})))
          return
        }
        // Only register when explicitly enabled
        await navigator.serviceWorker.register('/sw.js', { scope: '/' })
      } catch (e) {
        console.debug('SW manage error', e)
      }
    }
    manage()
  }, [])

  return null
}
