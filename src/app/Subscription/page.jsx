
// "use client"
// import { useState, useEffect } from "react"
// import axios from "axios"
// import Sidebar from "../slidebar/page"
// import { useRouter } from "next/navigation"
// import { Bell, User, Lock } from "lucide-react"
// import { motion, AnimatePresence } from "framer-motion"
// import { toast } from "react-toastify"
// import baseURL from "@/utils/api"

// export default function SubscriptionPage() {
//   const router = useRouter()
//   const [loading, setLoading] = useState(false)
//   const [subscription, setSubscription] = useState(null)
//   const [daysLeft, setDaysLeft] = useState(null)
//   const [selectedPlan, setSelectedPlan] = useState(null) // { price, planName, id } id: "monthly"|"yearly"
//   const [paymentLoading, setPaymentLoading] = useState(false)
//   const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
//   const [showSuccessModal, setShowSuccessModal] = useState(false)
//   const [showExpirationModal, setShowExpirationModal] = useState(false)

//   // load Razorpay script on mount
//   useEffect(() => {
//     const addScript = () => {
//       if (typeof window === "undefined") return
//       if (window.Razorpay) return // already loaded
//       const script = document.createElement("script")
//       script.src = "https://checkout.razorpay.com/v1/checkout.js"
//       script.async = true
//       document.body.appendChild(script)
//     }
//     addScript()
//   }, [])

//   // ---------------- Fetch subscription from backend ----------------
//   const fetchSubscription = async () => {
//     try {
//       const token = localStorage.getItem("token")
//       const id = localStorage.getItem("id")

//       if (!token || !id) {
//         const fallback = {
//           type: "null",
//           status: "none",
//           startDate: null,
//           endDate: null,
//           price: "0",
//           cabLimit: 0,
//         }
//         setSubscription(fallback)
//         return fallback
//       }

//       const res = await axios.get(`${baseURL}api/admin/getSubAdmin/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })

//       let sub = null
//       if (res?.data?.subAdmin?.subscription) {
//         sub = res.data.subAdmin.subscription
//       } else if (res?.data?.subscription) {
//         sub = res.data.subscription
//       }

//       if (!sub) {
//         sub = {
//           type: "null",
//           status: "none",
//           startDate: null,
//           endDate: null,
//           price: "0",
//           cabLimit: 0,
//         }
//       }

//       // ensure numeric price if present
//       if (sub.price && typeof sub.price === "string") {
//         const p = Number(sub.price)
//         if (!Number.isNaN(p)) sub.price = p
//       }

//       setSubscription(sub)

//       // if backend returns expired status or type expired, show expiration modal
//       if (sub.status === "expired" || sub.type === "expired") {
//         setShowExpirationModal(true)
//       } else {
//         // if endDate exists and passed, also show expiration modal (safety)
//         if (sub.endDate) {
//           const now = new Date()
//           const end = new Date(sub.endDate)
//           if (end <= now) {
//             setShowExpirationModal(true)
//           } else {
//             setShowExpirationModal(false)
//           }
//         } else {
//           setShowExpirationModal(false)
//         }
//       }

//       return sub
//     } catch (err) {
//       console.error("fetchSubscription error:", err)
//       const fallback = {
//         type: "null",
//         status: "none",
//         startDate: null,
//         endDate: null,
//         price: "0",
//         cabLimit: 0,
//       }
//       setSubscription(fallback)
//       return fallback
//     }
//   }

//   // initial fetch
//   useEffect(() => {
//     fetchSubscription()
//   }, [])

//   // daysLeft calculation
//   useEffect(() => {
//     const calc = () => {
//       if (!subscription || !subscription.endDate) {
//         setDaysLeft(null)
//         return
//       }
//       const now = new Date()
//       const end = new Date(subscription.endDate)
//       const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
//       setDaysLeft(Math.max(0, diff))
//     }

//     calc()
//     const iv = setInterval(calc, 1000 * 60 * 60) // hourly update
//     return () => clearInterval(iv)
//   }, [subscription])

//   // ---------------- Free trial start ----------------
//   const handleStartFreeTrial = async () => {
//     setLoading(true)
//     try {
//       const token = localStorage.getItem("token")
//       if (!token) {
//         toast.error("Not authenticated")
//         setLoading(false)
//         return
//       }

//       const res = await axios.post(
//         `${baseURL}api/email/startFreeTrial`,
//         {},
//         { headers: { Authorization: `Bearer ${token}` } },
//       )

//       if (res.data?.success) {
//         await fetchSubscription()
//         setShowSuccessModal(true)
//         toast.success("Free trial started successfully!")
//         setTimeout(() => router.push("/AdminDashboard"), 3000)
//       } else {
//         toast.error(res.data?.message || "Failed to start trial")
//       }
//     } catch (err) {
//       console.error("startFreeTrial error:", err)
//       toast.error("Failed to start free trial.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   // ---------------- Plan helpers ----------------
//   const isActivePlan = (plan) => {
//     if (!subscription || subscription.status !== "active") return false
//     // subscription.price may be number; plan.price is string in getAvailablePlans
//     return Number(subscription.price) === Number(plan.price)
//   }

//   const getAvailablePlans = () => [
//     {
//       id: "monthly",
//       name: "Standard",
//       price: "15000",
//       displayPrice: "₹15,000",
//       period: "per month",
//       planName: "Standard Monthly",
//       features: [
//         "✔ Track up to 20 Cabs",
//         "✔ Advanced Reporting",
//         "✔ Priority Email Support",
//         "✔ Job Market Access (10 posts/day)",
//       ],
//       buttonClass: "w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded-md font-medium",
//       popular: true,
//     },
//     {
//       id: "yearly",
//       name: "Premium",
//       price: "150000",
//       displayPrice: "₹1,50,000",
//       period: "per year",
//       planName: "Premium Yearly",
//       features: [
//         "✔ Track up to 30 Cabs",
//         "✔ Premium Reporting & Analytics",
//         "✔ 24/7 Phone Support",
//         "✔ Unlimited Job Market Access",
//         "✔ Predictive Maintenance AI",
//       ],
//       buttonClass: "w-full bg-gray-900 hover:bg-black text-white py-2 rounded-md font-medium",
//       popular: false,
//     },
//   ]

//   // ---------------- Razorpay integration ----------------
//   // create an order by calling backend
//   const createRazorpayOrder = async (amount) => {
//     try {
//       const token = localStorage.getItem("token")
//       if (!token) throw new Error("Not authenticated")

//       const res = await axios.post(
//         `${baseURL}api/payment/create-order`,
//         { amount, currency: "INR" },
//         { headers: { Authorization: `Bearer ${token}` } }
//       )

//       if (res.data?.success && res.data?.order) {
//         return res.data
//       } else {
//         console.error("create-order returned invalid data:", res.data)
//         throw new Error("Order creation failed")
//       }
//     } catch (err) {
//       console.error("createRazorpayOrder error:", err)
//       throw err
//     }
//   }

//   // open checkout using order from backend
//   const openRazorpay = async (planId, planPrice, planName) => {
//     setPaymentLoading(true)
//     try {
//       // amount in rupees (backend expects amount in rupees)
//       const amountNumber = Number(planPrice)
//       if (!amountNumber || Number.isNaN(amountNumber)) {
//         throw new Error("Invalid plan amount")
//       }

//       // create order on backend
//       const data = await createRazorpayOrder(amountNumber)

//       // ensure script loaded
//       if (typeof window === "undefined" || !window.Razorpay) {
//         throw new Error("Razorpay SDK not loaded")
//       }

//       const order = data.order
//       const key = data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

//       const options = {
//         key, // razorpay key id
//         amount: order.amount, // paise (backend already set paise conversion)
//         currency: order.currency || "INR",
//         name: "FleetView",
//         description: planName,
//         order_id: order.id,
//         handler: async function (response) {
//           // response contains razorpay_order_id, razorpay_payment_id, razorpay_signature
//           try {
//             setPaymentLoading(true)
//             const token = localStorage.getItem("token")
//             const verifyRes = await axios.post(
//               `${baseURL}api/payment/verify-payment`,
//               {
//                 razorpay_order_id: response.razorpay_order_id,
//                 razorpay_payment_id: response.razorpay_payment_id,
//                 razorpay_signature: response.razorpay_signature,
//                 plan: planId, // "monthly" or "yearly"
//               },
//               { headers: { Authorization: `Bearer ${token}` } }
//             )

//             if (verifyRes.data?.success) {
//               // fetch fresh subscription state from server (preferred)
//               await fetchSubscription()
//               setShowPaymentSuccess(true)
//               setSelectedPlan({ price: planPrice, planName, planId })
//               toast.success("Payment successful & subscription activated!")
//               // redirect after short delay
//               setTimeout(() => router.push("/AdminDashboard"), 2500)
//             } else {
//               toast.error(verifyRes.data?.message || "Verification failed")
//             }
//           } catch (err) {
//             console.error("verify-payment error:", err)
//             toast.error("Payment verification failed")
//           } finally {
//             setPaymentLoading(false)
//           }
//         },
//         prefill: {
//           // optionally fill email/phone from subscription or localStorage
//           name: "",
//           email: "",
//           contact: "",
//         },
//         notes: {
//           plan: planId,
//         },
//         theme: {
//           color: "#F59E0B", // matches yellow look
//         },
//       }

//       const rzp = new window.Razorpay(options)

//       // optional handlers
//       rzp.on("payment.failed", function (response) {
//         console.error("Razorpay payment.failed", response)
//         toast.error("Payment failed")
//       })

//       rzp.open()
//     } catch (err) {
//       console.error("openRazorpay error:", err)
//       toast.error(err.message || "Payment initialization failed")
//     } finally {
//       setPaymentLoading(false)
//     }
//   }

//   // wrapper called when user clicks Choose Plan
//   const handleChoosePlan = (price, planName, planId) => {
//     // planId param added; earlier you used handleChoosePlan(price, planName)
//     // keep backward compat: if planId not provided, infer by price
//     let pid = planId
//     if (!pid) {
//       pid = Number(price) === 15000 ? "monthly" : Number(price) === 150000 ? "yearly" : null
//     }
//     setSelectedPlan({ price, planName, planId: pid })
//     // immediately open Razorpay checkout
//     openRazorpay(pid, price, planName)
//   }

//   // ---------------- Deprecated "I've Completed Payment" flow removed; we now use Razorpay handler ----------------

//   // Close expired modal and view plans
//   const handleViewSubscriptionPlans = () => {
//     setShowExpirationModal(false)
//     router.push("/Subscription")
//   }

//   // ---------------- Render UI ----------------
//   return (
//     <div className="bg-gray-50 min-h-screen flex">
//       {/* Sidebar */}
//       <div className={showExpirationModal || showPaymentSuccess ? "pointer-events-none opacity-50" : ""}>
//         <Sidebar subscription={subscription} />
//       </div>

//       <div className="flex-1 lg:ml-64">
//         {/* Header */}
//         <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 lg:py-6">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//             <div>
//               <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
//                 <span>🏠</span>
//                 <span>›</span>
//                 <span>Subscription</span>
//               </nav>
//               <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Subscription Plans</h1>
//             </div>
//             <div className="flex items-center gap-3">
//               <Bell className="h-5 w-5 text-gray-600" />
//               <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
//                 <User className="h-4 w-4 text-gray-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6">
//           {/* Free trial available */}
//           {subscription?.status === "none" && (
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-900 mb-2">🚀 Start Your Free Trial Today!</h2>
//                 <p className="text-gray-600">Get full access to all features for 7 days free. No credit card required!</p>
//               </div>
//               <button
//                 onClick={handleStartFreeTrial}
//                 disabled={loading}
//                 className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium disabled:opacity-50"
//               >
//                 {loading ? "Starting Trial..." : "Start 7-Day Free Trial"}
//               </button>
//             </div>
//           )}

//           {/* Trial active */}
//           {subscription?.type === "trial" && subscription?.status === "active" && daysLeft > 0 && (
//             <div className="bg-yellow-50 border border-orange-200 rounded-lg p-6 mb-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">⏳ {daysLeft} Days Left in Your Free Trial!</h2>
//               <p className="text-gray-600">
//                 Trial ends on{" "}
//                 <span className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</span>
//                 <br />
//                 <span className="font-medium">Cab Limit: 50</span>
//               </p>
//             </div>
//           )}

//           {/* Paid active */}
//           {subscription?.type === "paid" && subscription?.status === "active" && (
//             <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
//               <h2 className="text-xl font-semibold text-green-700 mb-2">✅ Active Paid Subscription</h2>
//               <p className="text-gray-600">
//                 Valid until{" "}
//                 <span className="font-medium">
//                   {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : "—"}
//                 </span>
//                 <br />
//                 <span className="font-medium">Cab Limit: {subscription.cabLimit ?? subscription.subscriptionCabLimit ?? "—"}</span>
//               </p>
//             </div>
//           )}

//           {/* Plans */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//             {getAvailablePlans().map((plan) => {
//               const active = isActivePlan(plan)
//               return (
//                 <div key={plan.id} className="border rounded-lg shadow-sm border-gray-200 p-6 bg-white relative overflow-hidden">
//                   {active && (
//                     <div className="absolute top-4 -right-10 bg-green-500 text-white text-xs font-bold px-10 py-1 transform rotate-45 shadow-md">
//                       ACTIVE PLAN
//                     </div>
//                   )}

//                   {plan.popular && !active && (
//                     <div className="bg-yellow-100 text-center rounded-md py-1 font-semibold text-yellow-800 mb-4">
//                       MOST POPULAR
//                     </div>
//                   )}
//                   <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
//                   <p className="text-2xl font-bold text-gray-900 mb-4">
//                     {plan.displayPrice} <span className="text-sm font-normal text-gray-600">{plan.period}</span>
//                   </p>
//                   <ul className="space-y-2 text-gray-700 mb-4">
//                     {plan.features.map((f, i) => (
//                       <li key={i}>{f}</li>
//                     ))}
//                   </ul>
//                   <button
//                     onClick={() => handleChoosePlan(plan.price, plan.planName, plan.id)}
//                     className={plan.buttonClass}
//                     disabled={active || paymentLoading}
//                   >
//                     {active ? "Current Plan" : paymentLoading ? "Processing..." : "Choose Plan"}
//                   </button>
//                 </div>
//               )
//             })}
//           </div>
//         </div>
//       </div>

//       {/* Expiration Modal */}
//       <AnimatePresence>
//         {showExpirationModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.8, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.8, y: 20 }}
//               transition={{ duration: 0.3, type: "spring" }}
//               className="bg-white/95 backdrop-blur-lg p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 text-center relative border border-white/20"
//             >
//               <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <Lock className="w-8 h-8 text-red-500" />
//               </div>
//               <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Subscription Has Expired</h2>
//               <p className="text-gray-600 mb-8">Please subscribe to a plan to continue using FleetView and adding cabs.</p>
//               <button
//                 onClick={handleViewSubscriptionPlans}
//                 className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-lg font-medium"
//               >
//                 View Subscription Plans
//               </button>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>

//       {/* Success Modal */}
//       <AnimatePresence>
//         {(showSuccessModal || showPaymentSuccess) && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
//             <motion.div
//               initial={{ opacity: 0, scale: 0.8, y: 20 }}
//               animate={{ opacity: 1, scale: 1, y: 0 }}
//               exit={{ opacity: 0, scale: 0.8, y: 20 }}
//               transition={{ duration: 0.3, type: "spring" }}
//               className="bg-white/95 backdrop-blur-lg border border-gray-200/80 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 text-center"
//             >
//               <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
//                 <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//               <h2 className="text-2xl font-bold text-gray-900 mb-4">Congratulations!</h2>
//               {showPaymentSuccess ? (
//                 <>
//                   <p className="text-gray-600 mb-6">
//                     Your <span className="font-semibold text-green-600">{selectedPlan?.planName}</span> subscription has
//                     been activated successfully!
//                   </p>
//                   <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
//                     <p className="text-green-800 text-sm">
//                       Plan: <span className="font-medium">{selectedPlan?.planName}</span>
//                       <br />
//                       Amount: <span className="font-medium">₹{selectedPlan?.price}</span>
//                     </p>
//                   </div>
//                 </>
//               ) : (
//                 <>
//                   <p className="text-gray-600 mb-6">
//                     You are now on a <span className="font-semibold text-blue-600">7-day free trial</span>. Enjoy full
//                     access to all features!
//                   </p>
//                   <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
//                     <p className="text-blue-800 text-sm">
//                       Trial ends:{" "}
//                       <span className="font-medium">
//                         {subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : "—"}
//                       </span>
//                       <br />
//                       Cab Limit: <span className="font-medium">50</span>
//                     </p>
//                   </div>
//                 </>
//               )}
//               <p className="text-gray-500 text-sm">Redirecting to dashboard in 3 seconds...</p>
//             </motion.div>
//           </div>
//         )}
//       </AnimatePresence>
//     </div>
//   )
// }



"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import Sidebar from "../slidebar/page"
import { useRouter } from "next/navigation"
import { Bell, User, Lock } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-toastify"
import baseURL from "@/utils/api"

export default function SubscriptionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [daysLeft, setDaysLeft] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null) // { price, planName, id }
  const [processingPlan, setProcessingPlan] = useState(null) // <-- NEW: track plan id
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showExpirationModal, setShowExpirationModal] = useState(false)

  // load Razorpay script
  useEffect(() => {
    const addScript = () => {
      if (typeof window === "undefined") return
      if (window.Razorpay) return
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      document.body.appendChild(script)
    }
    addScript()
  }, [])

  // ---------------- Fetch subscription ----------------
  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("token")
      const id = localStorage.getItem("id")
      if (!token || !id) {
        const fallback = {
          type: "null",
          status: "none",
          startDate: null,
          endDate: null,
          price: "0",
          cabLimit: 0,
        }
        setSubscription(fallback)
        return fallback
      }

      const res = await axios.get(`${baseURL}api/admin/getSubAdmin/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      let sub = res?.data?.subAdmin?.subscription || res?.data?.subscription || {
        type: "null",
        status: "none",
        startDate: null,
        endDate: null,
        price: "0",
        cabLimit: 0,
      }

      if (sub.price && typeof sub.price === "string") {
        const p = Number(sub.price)
        if (!Number.isNaN(p)) sub.price = p
      }

      setSubscription(sub)

      if (sub.status === "expired" || sub.type === "expired") {
        setShowExpirationModal(true)
      } else if (sub.endDate) {
        const now = new Date()
        const end = new Date(sub.endDate)
        setShowExpirationModal(end <= now)
      } else {
        setShowExpirationModal(false)
      }

      return sub
    } catch (err) {
      console.error("fetchSubscription error:", err)
      const fallback = {
        type: "null",
        status: "none",
        startDate: null,
        endDate: null,
        price: "0",
        cabLimit: 0,
      }
      setSubscription(fallback)
      return fallback
    }
  }

  useEffect(() => {
    fetchSubscription()
  }, [])

  // calculate days left
  useEffect(() => {
    const calc = () => {
      if (!subscription?.endDate) {
        setDaysLeft(null)
        return
      }
      const now = new Date()
      const end = new Date(subscription.endDate)
      const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24))
      setDaysLeft(Math.max(0, diff))
    }
    calc()
    const iv = setInterval(calc, 1000 * 60 * 60)
    return () => clearInterval(iv)
  }, [subscription])

  // ---------------- Free trial ----------------
  const handleStartFreeTrial = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Not authenticated")
        setLoading(false)
        return
      }

      const res = await axios.post(
        `${baseURL}api/email/startFreeTrial`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (res.data?.success) {
        await fetchSubscription()
        setShowSuccessModal(true)
        toast.success("Free trial started successfully!")
        setTimeout(() => router.push("/AdminDashboard"), 3000)
      } else {
        toast.error(res.data?.message || "Failed to start trial")
      }
    } catch (err) {
      console.error("startFreeTrial error:", err)
      toast.error("Failed to start free trial.")
    } finally {
      setLoading(false)
    }
  }

  // ---------------- Plans ----------------
  const isActivePlan = (plan) =>
    subscription?.status === "active" && Number(subscription.price) === Number(plan.price)

  const getAvailablePlans = () => [
    {
      id: "monthly",
      name: "Standard",
      price: "15000",
      displayPrice: "₹15,000",
      period: "per month",
      planName: "Standard Monthly",
      features: [
        "✔ Track up to 20 Cabs",
        "✔ Advanced Reporting",
        "✔ Priority Email Support",
        "✔ Job Market Access (10 posts/day)",
      ],
      buttonClass: "w-full bg-yellow-400 hover:bg-yellow-500 text-black py-2 rounded-md font-medium",
      popular: true,
    },
    {
      id: "yearly",
      name: "Premium",
      price: "150000",
      displayPrice: "₹1,50,000",
      period: "per year",
      planName: "Premium Yearly",
      features: [
        "✔ Track up to 30 Cabs",
        "✔ Premium Reporting & Analytics",
        "✔ 24/7 Phone Support",
        "✔ Unlimited Job Market Access",
        "✔ Predictive Maintenance AI",
      ],
      buttonClass: "w-full bg-gray-900 hover:bg-black text-white py-2 rounded-md font-medium",
      popular: false,
    },
  ]

  // ---------------- Razorpay ----------------
  const createRazorpayOrder = async (amount) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) throw new Error("Not authenticated")
      const res = await axios.post(
        `${baseURL}api/payment/create-order`,
        { amount, currency: "INR" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (res.data?.success && res.data?.order) return res.data
      throw new Error("Order creation failed")
    } catch (err) {
      console.error("createRazorpayOrder error:", err)
      throw err
    }
  }

  const openRazorpay = async (planId, planPrice, planName) => {
    setProcessingPlan(planId) // only mark clicked plan as processing
    try {
      const amountNumber = Number(planPrice)
      if (!amountNumber || Number.isNaN(amountNumber)) throw new Error("Invalid plan amount")

      const data = await createRazorpayOrder(amountNumber)
      if (typeof window === "undefined" || !window.Razorpay) throw new Error("Razorpay SDK not loaded")

      const order = data.order
      const key = data.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

      const options = {
        key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "FleetView",
        description: planName,
        order_id: order.id,
        handler: async function (response) {
          try {
            const token = localStorage.getItem("token")
            const verifyRes = await axios.post(
              `${baseURL}api/payment/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan: planId,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            )

            if (verifyRes.data?.success) {
              await fetchSubscription()
              setShowPaymentSuccess(true)
              setSelectedPlan({ price: planPrice, planName, planId })
              toast.success("Payment successful & subscription activated!")
              setTimeout(() => router.push("/AdminDashboard"), 2500)
            } else {
              toast.error(verifyRes.data?.message || "Verification failed")
            }
          } catch (err) {
            console.error("verify-payment error:", err)
            toast.error("Payment verification failed")
          } finally {
            setProcessingPlan(null) // reset after completion
          }
        },
        theme: { color: "#F59E0B" },
      }

      const rzp = new window.Razorpay(options)
      rzp.on("payment.failed", (response) => {
        console.error("Razorpay payment.failed", response)
        toast.error("Payment failed")
        setProcessingPlan(null)
      })
      rzp.open()
    } catch (err) {
      console.error("openRazorpay error:", err)
      toast.error(err.message || "Payment initialization failed")
      setProcessingPlan(null)
    }
  }

  const handleChoosePlan = (price, planName, planId) => {
    setSelectedPlan({ price, planName, planId })
    openRazorpay(planId, price, planName)
  }

  const handleViewSubscriptionPlans = () => {
    setShowExpirationModal(false)
    router.push("/Subscription")
  }

  // ---------------- Render ----------------
  return (
    <div className="bg-gray-50 min-h-screen flex">
      {/* Sidebar */}
      <div className={showExpirationModal || showPaymentSuccess ? "pointer-events-none opacity-50" : ""}>
        <Sidebar subscription={subscription} />
      </div>

      <div className="flex-1 lg:ml-64">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <span>🏠</span>
                <span>›</span>
                <span>Subscription</span>
              </nav>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Subscription Plans</h1>
            </div>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-gray-600" />
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Free trial */}
          {subscription?.status === "none" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">🚀 Start Your Free Trial Today!</h2>
                <p className="text-gray-600">Get full access to all features for 7 days free. No credit card required!</p>
              </div>
              <button
                onClick={handleStartFreeTrial}
                disabled={loading}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium disabled:opacity-50"
              >
                {loading ? "Starting Trial..." : "Start 7-Day Free Trial"}
              </button>
            </div>
          )}

          {/* Trial active */}
          {subscription?.type === "trial" && subscription?.status === "active" && daysLeft > 0 && (
            <div className="bg-yellow-50 border border-orange-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">⏳ {daysLeft} Days Left in Your Free Trial!</h2>
              <p className="text-gray-600">
                Trial ends on{" "}
                <span className="font-medium">{new Date(subscription.endDate).toLocaleDateString()}</span>
                <br />
                <span className="font-medium">Cab Limit: 50</span>
              </p>
            </div>
          )}

          {/* Paid active */}
          {subscription?.type === "paid" && subscription?.status === "active" && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-green-700 mb-2">✅ Active Paid Subscription</h2>
              <p className="text-gray-600">
                Valid until{" "}
                <span className="font-medium">
                  {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : "—"}
                </span>
                <br />
                <span className="font-medium">Cab Limit: {subscription.cabLimit ?? "—"}</span>
              </p>
            </div>
          )}

          {/* Plans */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {getAvailablePlans().map((plan) => {
              const active = isActivePlan(plan)
              const isProcessing = processingPlan === plan.id
              return (
                <div key={plan.id} className="border rounded-lg shadow-sm border-gray-200 p-6 bg-white relative overflow-hidden">
                  {active && (
                    <div className="absolute top-4 -right-10 bg-green-500 text-white text-xs font-bold px-10 py-1 transform rotate-45 shadow-md">
                      ACTIVE PLAN
                    </div>
                  )}
                  {plan.popular && !active && (
                    <div className="bg-yellow-100 text-center rounded-md py-1 font-semibold text-yellow-800 mb-4">
                      MOST POPULAR
                    </div>
                  )}
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-2xl font-bold text-gray-900 mb-4">
                    {plan.displayPrice} <span className="text-sm font-normal text-gray-600">{plan.period}</span>
                  </p>
                  <ul className="space-y-2 text-gray-700 mb-4">
                    {plan.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleChoosePlan(plan.price, plan.planName, plan.id)}
                    className={plan.buttonClass}
                    disabled={active || isProcessing}
                  >
                    {active ? "Current Plan" : isProcessing ? "Processing..." : "Choose Plan"}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Expiration Modal */}
      <AnimatePresence>
        {showExpirationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="bg-white/95 backdrop-blur-lg p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 text-center relative border border-white/20"
            >
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Subscription Has Expired</h2>
              <p className="text-gray-600 mb-8">Please subscribe to a plan to continue using FleetView and adding cabs.</p>
              <button
                onClick={handleViewSubscriptionPlans}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-lg font-medium"
              >
                View Subscription Plans
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {(showSuccessModal || showPaymentSuccess) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="bg-white/95 backdrop-blur-lg border border-gray-200/80 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4 text-center"
            >
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Congratulations! 🎉</h2>
              <p className="text-gray-600 mb-8">
                {showSuccessModal
                  ? "Your free trial has started successfully!": `Your ${selectedPlan?.planName} plan has been activated successfully!`}
              </p>
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 2, ease: "linear" }}
                className="h-1 bg-yellow-500 rounded-full mb-4"
              />
              <p className="text-sm text-gray-500">Redirecting to Dashboard...</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

