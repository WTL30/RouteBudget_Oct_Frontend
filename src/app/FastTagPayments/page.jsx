"use client"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CreditCard, Plus, Search, Filter, Download, RefreshCw } from "lucide-react"
import Sidebar from "../slidebar/page"
import axios from "axios"
import baseURL from "@/utils/api"

// Initialize from cache for instant render; these will be replaced by live data when available
const getCachedExpenses = () => {
  try {
    const raw = localStorage.getItem('cache:expenses')
    const data = raw ? JSON.parse(raw) : []
    // normalize to expected shape for this page
    // Each item is an expense per assignment with breakdown
    return Array.isArray(data) ? data : []
  } catch { return [] }
}

export default function FastTagPayments() {
  const router = useRouter()
  const [selectedCab, setSelectedCab] = useState("")
  const [rechargeAmount, setRechargeAmount] = useState("")
  const [isRechargeDialogOpen, setIsRechargeDialogOpen] = useState(false)
  const [fasttagData, setFasttagData] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])

  // FASTag state
  const [tags, setTags] = useState([])
  const [initiated, setInitiated] = useState(null) // { localTxnId, paymentOrder, qrPayload }
  const [txnStatus, setTxnStatus] = useState(null) // { status, provider_status }
  const [pollTimer, setPollTimer] = useState(null)
  const [isMobileClient, setIsMobileClient] = useState(false)
  const [scannerOn, setScannerOn] = useState(false)
  const [modalSecondsLeft, setModalSecondsLeft] = useState(null)
  const videoRef = useRef(null)
  const rafRef = useRef(null)
  const detectorRef = useRef(null)

  // Cleanup polling timer on unmount
  useEffect(() => {
    return () => {
      if (pollTimer) clearInterval(pollTimer)
    }
  }, [pollTimer])

  // Detect mobile device for UPI intent support
  useEffect(() => {
    try {
      if (typeof navigator !== 'undefined') {
        setIsMobileClient(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
      }
    } catch {}
  }, [])

  // Stop camera scanner when modal closes/unmounts
  useEffect(() => {
    if (!initiated && scannerOn) {
      // stop scanner
      try {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks?.() || []
          tracks.forEach(t => t.stop())
          videoRef.current.srcObject = null
        }
      } catch {}
      setScannerOn(false)
    }
    return () => {
      try {
        if (rafRef.current) cancelAnimationFrame(rafRef.current)
        if (videoRef.current && videoRef.current.srcObject) {
          const tracks = videoRef.current.srcObject.getTracks?.() || []
          tracks.forEach(t => t.stop())
          videoRef.current.srcObject = null
        }
      } catch {}
    }
  }, [initiated, scannerOn])

  // Razorpay removed. UPI-only flow.

  // Auto-close payment modal after 60s, with countdown
  useEffect(() => {
    if (!initiated) { setModalSecondsLeft(null); return }
    setModalSecondsLeft(60)
    const iv = setInterval(() => {
      setModalSecondsLeft((s) => (typeof s === 'number' && s > 0 ? s - 1 : 0))
    }, 1000)
    const to = setTimeout(() => {
      setInitiated(null)
    }, 60000)
    return () => { clearInterval(iv); clearTimeout(to) }
  }, [initiated])

  // Fetch user's tags/cabs from backend
  const fetchTagsOrCabs = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      let mapped = []
      try {
        const res = await axios.get(`${baseURL}api/fastag/tags`, { headers: { Authorization: `Bearer ${token}` } })
        const t = res?.data?.tags || []
        setTags(t)
        mapped = t.map((x) => ({
          id: String(x.id),
          cabNumber: x.cab_number || `Cab-${x.cab_id || x.id}`,
          tagId: x.tag_number,
          balance: Number(x.balance_cached || 0),
          lastRecharge: null,
          status: (Number(x.balance_cached || 0) < 500 ? "Low Balance" : "Active"),
          cabId: x.cab_id,
        }))
      } catch (e) {
        // ignore and fallback
      }
      if (!mapped.length) {
        try {
          const r2 = await axios.get(`${baseURL}api/cabDetails`, { headers: { Authorization: `Bearer ${token}` } })
          const cabs = Array.isArray(r2?.data) ? r2.data : []
          mapped = cabs.map((c) => ({
            id: String(c.id || c.cabNumber),
            cabNumber: c.cabNumber,
            tagId: c.tagNumber || "",
            balance: 0,
            lastRecharge: null,
            status: "Active",
            cabId: c.id,
          }))
        } catch (e) {
          console.error('fallback fetch cabs error', e)
        }
      }
      setFasttagData(mapped)
    } catch (e) {
      console.error("fetchTagsOrCabs error", e)
    }
  }

  useEffect(() => { fetchTagsOrCabs() }, [])

  // Razorpay flow removed — UPI-only

  const openUpiLink = (upiLink) => {
    try {
      if (!upiLink) {
        alert('UPI link missing')
        return
      }
      const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      if (!isMobile) {
        alert('UPI apps are not available on desktop browsers. Please scan the QR using your mobile UPI app, or open this page on your phone and tap "Open UPI app".')
        return
      }
      // Try native upi:// link first
      window.location.href = upiLink
      // Fallback intent for Android (GPay/others)
      setTimeout(() => {
        if (/Android/i.test(navigator.userAgent)) {
          const rest = upiLink.replace('upi://', '')
          const intent = `intent://${rest}#Intent;scheme=upi;end`
          window.location.href = intent
        }
      }, 500)
    } catch (e) {
      console.error('openUpiLink error', e)
      alert('Could not open a UPI app. Scan the QR or copy the UPI link.')
    }
  }

  // Minimal camera QR scanner (mobile only) using BarcodeDetector
  const startScanner = async () => {
    try {
      if (!isMobileClient) {
        alert('Scanner is intended for mobile devices. On desktop, scan this page\'s QR from your phone.')
        return
      }
      if (!(window && 'BarcodeDetector' in window)) {
        alert('Camera QR scanner not supported on this browser. Use your UPI app\'s scanner or tap Open UPI app.')
        return
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      detectorRef.current = new window.BarcodeDetector({ formats: ['qr_code'] })
      const scan = async () => {
        try {
          if (!videoRef.current) return
          const codes = await detectorRef.current.detect(videoRef.current)
          if (codes && codes.length) {
            const txt = codes[0]?.rawValue || codes[0]?.rawValue || codes[0]?.data || ''
            if (txt) {
              // stop and handle
              stopScanner()
              if (txt.startsWith('upi://')) {
                openUpiLink(txt)
              } else {
                alert(`Scanned: ${txt}`)
              }
              return
            }
          }
        } catch {}
        rafRef.current = requestAnimationFrame(scan)
      }
      setScannerOn(true)
      rafRef.current = requestAnimationFrame(scan)
    } catch (e) {
      console.error('startScanner error', e)
      alert('Could not access camera. Please allow camera permission or use your UPI app\'s scanner.')
    }
  }

  const stopScanner = () => {
    try {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks?.() || []
        tracks.forEach(t => t.stop())
        videoRef.current.srcObject = null
      }
    } catch {}
    setScannerOn(false)
  }

  const markPaid = async (localTxnId) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(`${baseURL}api/fastag/mark-paid`, { localTxnId }, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
      })
      const r = await axios.get(`${baseURL}api/fastag/txn/${localTxnId}`, { headers: { Authorization: `Bearer ${token}` } })
      setTxnStatus(r?.data?.txn)
    } catch (e) {
      console.error('mark-paid error', e)
      alert(e?.response?.data?.error || 'Failed to mark as paid')
    }
  }

  const handleRecharge = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      const cab = fasttagData.find((c) => c.cabNumber === selectedCab)
      if (!cab) return
      // Ensure FASTag is linked for this cab; if not, prompt the user to link now
      let tagNum = cab.tagId
      if (!tagNum || String(tagNum).trim() === "") {
        const input = typeof window !== 'undefined' ? window.prompt(`No FASTag linked to ${cab.cabNumber}. Enter FASTag number to link:`) : null
        if (!input || !input.trim()) {
          alert('FASTag number is required to proceed')
          return
        }
        try {
          await axios.post(`${baseURL}api/fastag/link-tag`, {
            tagNumber: input.trim(),
            cabId: cab.cabId || null,
            cabNumber: cab.cabNumber,
          }, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
          await fetchTagsOrCabs()
          tagNum = input.trim()
        } catch (e) {
          console.error('link-tag error', e)
          alert(e?.response?.data?.error || 'Failed to link FASTag')
          return
        }
      }
      const payload = {
        tagNumber: tagNum || undefined,
        cabId: cab.cabId || null,
        cabNumber: cab.cabNumber || undefined,
        amount: Number(rechargeAmount),
      }
      const res = await axios.post(`${baseURL}api/fastag/initiate-upi`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      const data = res?.data
      setInitiated(data)
      setIsRechargeDialogOpen(false)
      // start polling
      if (pollTimer) clearInterval(pollTimer)
      const timer = setInterval(async () => {
        try {
          const r = await axios.get(`${baseURL}api/fastag/txn/${data.localTxnId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          const st = r?.data?.txn?.status
          setTxnStatus(r?.data?.txn)
          if (st === "COMPLETED" || st === "FAILED") {
            clearInterval(timer)
            setPollTimer(null)
          }
        } catch (e) {
          console.error("poll error", e)
        }
      }, 3000)
      setPollTimer(timer)
      // For Direct UPI, we don't auto-open an app; user can scan the QR or tap the button.
    } catch (e) {
      console.error("initiate-recharge error", e)
      const msg = e?.response?.data?.error || e?.message || 'Failed to initiate recharge'
      if (typeof window !== 'undefined') {
        alert(msg)
      }
    } finally {
      setSelectedCab("")
      setRechargeAmount("")
    }
  }

  // Fetch transactions from backend (real data)
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        const res = await axios.get(`${baseURL}api/fastag/transactions`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const list = Array.isArray(res?.data?.txns) ? res.data.txns : []
        // Map to UI
        const tx = list.map((t, i) => {
          const dt = t.created_at ? new Date(t.created_at) : new Date()
          const status = (t.status || '').toUpperCase()
          return {
            id: t.local_txn_id || `TXN${(i+1).toString().padStart(3,'0')}`,
            cabNumber: t.cab_number || '—',
            amount: Number(t.amount || 0),
            tollPlaza: 'FASTag Recharge',
            date: dt.toISOString().slice(0,10),
            time: dt.toTimeString().slice(0,5),
            status: status === 'COMPLETED' ? 'Success' : status === 'FAILED' ? 'Failed' : status,
          }
        })
        setRecentTransactions(tx)
      } catch (e) {
        console.error('fetchTransactions error', e)
      }
    }
    fetchTransactions()
  }, [])

  const totalBalance = fasttagData.reduce((sum, item) => sum + (Number(item.balance) || 0), 0)
  const todayTransactions = recentTransactions.length
  const lowBalanceCabs = fasttagData.filter((item) => (Number(item.balance) || 0) < 500).length

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <Sidebar />

      <div className="p-8 mt-20 md:ml-60 sm:mt-0 flex-1">
        <div className="p-6 bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/">
              {/* <button className="bg-transparent hover:text-gray-600 text-gray-500 p-2 rounded">
                <ArrowLeft className="w-5 h-5" />
              </button> */}
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FastTag Payments</h1>
              <p className="text-gray-600">Manage FastTag recharges and monitor transactions</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[
              {
                title: "Total Balance",
                value: `₹${totalBalance}`,
                icon: <CreditCard className="w-6 h-6 text-blue-600" />,
                bg: "bg-blue-50",
              },
              {
                title: "Today's Transactions",
                value: todayTransactions,
                icon: <RefreshCw className="w-6 h-6 text-green-600" />,
                bg: "bg-green-50",
              },
              {
                title: "Low Balance Alerts",
                value: lowBalanceCabs,
                icon: <CreditCard className="w-6 h-6 text-orange-600" />,
                bg: "bg-orange-50",
              },
              {
                title: "Active Tags",
                value: fasttagData.length,
                icon: <CreditCard className="w-6 h-6 text-purple-600" />,
                bg: "bg-purple-50",
              },
            ].map(({ title, value, icon, bg }, idx) => (
              <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bg}`}>{icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* FastTag Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left panel */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">FastTag Status</h2>
                <button
                  onClick={() => setIsRechargeDialogOpen(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Recharge
                </button>
              </div>
              {fasttagData.length === 0 && (
                <div className="text-sm text-gray-600 mb-3">
                  No FASTag tags found for your account. Showing your cabs if available. If you still don't see cabs, add cabs in Vehicle Details.
                  <button onClick={fetchTagsOrCabs} className="ml-2 text-blue-600 hover:underline">Refresh</button>
                </div>
              )}

              {isRechargeDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg border border-gray-200 p-6 w-full max-w-md shadow-xl">
                    <h3 className="text-gray-900 text-lg font-semibold mb-2">Recharge FastTag</h3>
                    <p className="text-gray-600 mb-4">Select a cab and enter the recharge amount</p>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="cab" className="text-gray-900 block mb-2 font-medium">
                          Select Cab
                        </label>
                        <select
                          id="cab"
                          value={selectedCab}
                          onChange={(e) => setSelectedCab(e.target.value)}
                          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="" disabled>
                            Choose a cab
                          </option>
                          {fasttagData.map((cab) => (
                            <option key={cab.id} value={cab.cabNumber}>
                              {cab.cabNumber} - Balance: ₹{cab.balance}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="amount" className="text-gray-900 block mb-2 font-medium">
                          Recharge Amount
                        </label>
                        <input
                          id="amount"
                          type="number"
                          placeholder="Enter amount"
                          value={rechargeAmount}
                          onChange={(e) => setRechargeAmount(e.target.value)}
                          className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-6 space-x-3">
                      <button
                        onClick={() => setIsRechargeDialogOpen(false)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRecharge}
                        disabled={!selectedCab || !rechargeAmount}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          selectedCab && rechargeAmount
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Recharge Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment/Recharge status modal */}
              {initiated && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">FASTag Recharge</h3>
                      <button className="text-gray-500" onClick={() => setInitiated(null)}>×</button>
                    </div>
                    {typeof modalSecondsLeft === 'number' && (
                      <div className="text-xs text-gray-500 mb-2">Auto closes in {modalSecondsLeft}s</div>
                    )}
                    {initiated?.upi ? (
                      <p className="text-sm text-gray-600 mb-4">Scan the QR below using your UPI app to pay to <span className="font-mono">{initiated.upi.vpa}</span>. This will recharge FASTag for cab: <span className="font-medium">{initiated?.upi?.cabNumber || ""}</span> (tag: <span className="font-mono">{initiated?.upi?.tagNumber || ""}</span>).</p>
                    ) : (
                      <p className="text-sm text-gray-600 mb-4">Scan the UPI QR shown or use your UPI app to complete the payment. This will recharge your FASTag.</p>
                    )}
                    {initiated?.upi && (
                      <div className="flex flex-col items-center gap-2 mb-3">
                        <img src={initiated.upi.qrUrl} alt="UPI QR" className="w-48 h-48 border rounded" />
                        <div className="text-sm text-gray-700">Payee UPI: <span className="font-mono">{initiated.upi.vpa}</span></div>
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => navigator.clipboard?.writeText(initiated.upi.vpa)} className="px-2 py-1 text-xs bg-gray-100 rounded">Copy UPI ID</button>
                          <button onClick={() => navigator.clipboard?.writeText(initiated.upi.upiLink)} className="px-2 py-1 text-xs bg-gray-100 rounded">Copy UPI link</button>
                          <a href={initiated.upi.qrUrl} download={`upi-qr-${initiated.localTxnId}.png`} className="px-2 py-1 text-xs bg-gray-100 rounded">Download QR</a>
                        </div>
                        {isMobileClient && (
                          <div className="mt-2 w-full">
                            {!scannerOn ? (
                              <button onClick={startScanner} className="w-full px-3 py-2 text-sm rounded bg-indigo-50 text-indigo-700 border border-indigo-200">Scan UPI QR with Camera</button>
                            ) : (
                              <div className="w-full">
                                <video ref={videoRef} playsInline muted className="w-full rounded border" />
                                <div className="flex justify-end mt-2">
                                  <button onClick={stopScanner} className="px-3 py-1 text-xs rounded bg-red-50 text-red-700 border border-red-200">Stop Scanner</button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>Amount: ₹{Number((initiated?.amount ?? rechargeAmount) || 0)}</p>
                      <p>Status: <span className="font-semibold">{txnStatus?.status || 'Awaiting Payment'}</span></p>
                      {txnStatus?.status === 'PAID' || txnStatus?.status === 'PROCESSING' ? (
                        <div className="text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">Payment received — attempting recharge...</div>
                      ) : null}
                      {txnStatus?.status === 'COMPLETED' ? (
                        <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2">Recharge completed.</div>
                      ) : null}
                      {txnStatus?.status === 'FAILED' ? (
                        <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2">Recharge failed — refunded to wallet / contact support.</div>
                      ) : null}
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={() => markPaid(initiated.localTxnId)}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white"
                      >
                        Mark Paid
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem("token")
                            const r = await axios.get(`${baseURL}api/fastag/txn/${initiated.localTxnId}`, { headers: { Authorization: `Bearer ${token}` } })
                            setTxnStatus(r?.data?.txn)
                          } catch (e) {
                            console.error(e)
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
                      >
                        Refresh
                      </button>
                      <button
                        onClick={() => setInitiated(null)}
                        className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
                      >
                        Close
                      </button>
                    </div>
                    {txnStatus?.status === 'COMPLETED' && (
                      <div className="mt-4 p-3 bg-green-50 text-green-800 rounded">Recharge completed successfully.</div>
                    )}
                    {txnStatus?.status === 'FAILED' && (
                      <div className="mt-4 p-3 bg-red-50 text-red-800 rounded">Recharge failed. If payment was captured, refund has been initiated to wallet.</div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {fasttagData.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{item.cabNumber}</p>
                        <p className="text-gray-500 text-sm">Tag: {item.tagId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-gray-900">₹{item.balance}</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            item.status === "Active" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      {(!item.tagId || String(item.tagId).trim() === "") ? (
                        <button
                          onClick={async () => {
                            const tag = typeof window !== 'undefined' ? window.prompt(`Enter FASTag number for cab ${item.cabNumber}`) : null
                            if (!tag) return
                            try {
                              const token = localStorage.getItem("token")
                              await axios.post(`${baseURL}api/fastag/link-tag`, {
                                tagNumber: tag.trim(),
                                cabId: item.cabId || null,
                                cabNumber: item.cabNumber,
                              }, { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } })
                              await fetchTagsOrCabs()
                              alert('FASTag linked successfully. You can recharge now.')
                            } catch (e) {
                              console.error('link-tag error', e)
                              alert(e?.response?.data?.error || 'Failed to link FASTag')
                            }
                          }}
                          className="ml-2 px-3 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                        >
                          Link FASTag
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedCab(item.cabNumber)
                            setIsRechargeDialogOpen(true)
                          }}
                          className="ml-2 px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Recharge
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Recent Transactions</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("token")
                        const res = await axios.get(`${baseURL}api/fastag/transactions`, { headers: { Authorization: `Bearer ${token}` } })
                        const list = Array.isArray(res?.data?.txns) ? res.data.txns : []
                        const tx = list.map((t, i) => {
                          const dt = t.created_at ? new Date(t.created_at) : new Date()
                          const status = (t.status || '').toUpperCase()
                          return {
                            id: t.local_txn_id || `TXN${(i+1).toString().padStart(3,'0')}`,
                            cabNumber: t.cab_number || '—',
                            amount: Number(t.amount || 0),
                            tollPlaza: 'FASTag Recharge',
                            date: dt.toISOString().slice(0,10),
                            time: dt.toTimeString().slice(0,5),
                            status: status === 'COMPLETED' ? 'Success' : status === 'FAILED' ? 'Failed' : status,
                          }
                        })
                        setRecentTransactions(tx)
                      } catch (e) {
                        console.error(e)
                      }
                    }}
                    className="text-gray-600 hover:text-gray-900 flex items-center space-x-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
              <div className="space-y-3">
                {recentTransactions.slice(0, 5).map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{transaction.cabNumber}</p>
                      <p className="text-gray-600 text-sm">{transaction.tollPlaza}</p>
                      <p className="text-gray-500 text-xs">
                        {transaction.date} at {transaction.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">₹{transaction.amount}</p>
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Transaction History Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    placeholder="Search transactions..."
                    className="pl-10 bg-white border border-gray-300 text-gray-900 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select className="bg-white border border-gray-300 text-gray-900 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="all">All Cabs</option>
                  {fasttagData.map((cab) => (
                    <option key={cab.id} value={cab.cabNumber}>
                      {cab.cabNumber}
                    </option>
                  ))}
                </select>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <Filter className="w-4 h-4" /> Filter
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left p-4 text-gray-700 font-medium">Cab Number</th>
                    <th className="text-left p-4 text-gray-700 font-medium">Toll Plaza</th>
                    <th className="text-left p-4 text-gray-700 font-medium">Amount</th>
                    <th className="text-left p-4 text-gray-700 font-medium">Date</th>
                    <th className="text-left p-4 text-gray-700 font-medium">Time</th>
                    <th className="text-left p-4 text-gray-700 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-gray-900">{tx.cabNumber}</td>
                      <td className="p-4 text-gray-900">{tx.tollPlaza}</td>
                      <td className="p-4 text-gray-900 font-medium">₹{tx.amount}</td>
                      <td className="p-4 text-gray-600">{tx.date}</td>
                      <td className="p-4 text-gray-600">{tx.time}</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            tx.status === "Success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
