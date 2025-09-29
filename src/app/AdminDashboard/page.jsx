
 "use client"
// import { useState, useEffect } from "react"
// import axios from "axios"
// import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
// import Sidebar from "../slidebar/page"
// import {
//   MdOutlineDirectionsCar,
//   MdOutlineAccountBalanceWallet,
//   MdPerson,
//   MdGpsFixed,
//   MdPayment,
//   MdWarning,
//   MdDescription,
//   MdClose,
// } from "react-icons/md"
// import { BsClipboardCheck } from "react-icons/bs"
// import { FaRocket, FaClock } from "react-icons/fa"
// import { motion, useAnimation } from "framer-motion"
// import { useInView } from "react-intersection-observer"
// import baseURL from "@/utils/api"
// import { useRouter } from "next/navigation"
// import { Bell, User } from "lucide-react"
// import AddDriver from "../DriverDetails/component/AddDriver"

// const AnimatedCounter = ({ value, prefix = "", suffix = "", duration = 1.5 }) => {
//   const controls = useAnimation()
//   const [count, setCount] = useState(0)
//   const [ref, inView] = useInView({ triggerOnce: true })

//   useEffect(() => {
//     if (inView) {
//       controls.start({
//         count: value,
//         transition: { duration },
//       })
//     }
//   }, [inView, value, controls, duration])

//   return (
//     <motion.span ref={ref} animate={controls} onUpdate={(latest) => setCount(Math.floor(latest.count))}>
//       {prefix}
//       {count}
//       {suffix}
//     </motion.span>
//   )
// }

// const AccessDeniedModal = () => {
//   const router = useRouter()
//   const handleClose = () => {
//     router.push("/")
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
//       <div className="bg-white text-gray-900 p-8 rounded-lg shadow-lg max-w-sm w-full">
//         <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
//         <p className="mb-6">Your access has been restricted. Please contact the administrator.</p>
//         <button onClick={handleClose} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
//           Close
//         </button>
//       </div>
//     </div>
//   )
// }

// const ComingSoonModal = ({ isOpen, onClose, featureName }) => {
//   if (!isOpen) return null

//   return (
//     <div className="fixed inset-0 z-50  bg-black/50 backdrop-blur-sm flex items-center justify-center  bg-opacity-70">
//       <motion.div
//         className="bg-white text-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4"
//         initial={{ opacity: 0, scale: 0.8, y: 20 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.8, y: 20 }}
//         transition={{ duration: 0.3 }}
//       >
//         <div className="text-center">
//           {/* Close button */}
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
//           >
//             <MdClose size={24} />
//           </button>

//           {/* Icon */}
//           <div className="mb-6">
//             <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
//               <FaRocket className="text-white text-2xl" />
//             </div>
//           </div>

//           {/* Title */}
//           <h2 className="text-2xl font-bold text-gray-900 mb-2">{featureName}</h2>

//           {/* Subtitle */}
//           <h3 className="text-lg font-semibold text-black-600 mb-4 flex items-center justify-center">
//             <FaClock className="mr-2" />
//             Coming Soon!
//           </h3>

//           {/* Description */}
//           <p className="text-gray-600 mb-6 leading-relaxed">
//             We're working hard to bring you this amazing feature. Stay tuned for updates and get ready for an enhanced
//             experience!
//           </p>

//           {/* Features list */}
//           <div className="bg-gray-50 rounded-lg p-4 mb-6">
//             <h4 className="font-semibold text-gray-800 mb-2">What to expect:</h4>
//             <ul className="text-sm text-gray-600 space-y-1">
//               <li>• Real-time monitoring and tracking</li>
//               <li>• Advanced analytics and reporting</li>
//               <li>• Seamless integration with existing systems</li>
//               <li>• User-friendly interface</li>
//             </ul>
//           </div>

//           {/* Action buttons */}
//           <div className="flex flex-col sm:flex-row gap-3">
//             <button
//               onClick={onClose}
//               className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105"
//             >
//               Got it!
//             </button>
//             <button
//               onClick={onClose}
//               className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
//             >
//               Back to Dashboard
//             </button>
//           </div>
//         </div>
//       </motion.div>
//     </div>
//   )
// }

// const AdminDashboard = () => {
//   const [stats, setStats] = useState({
//     totalDrivers: 0,
//     totalCabs: 0,
//     assignedCabs: 0,
//     totalExpenses: 0,
//     gpsTracking: 0,
//     fastTagPayments: 0,
//     eChallan: 0,
//     documentExpiry: 0,
//   })
//   const [expenseData, setExpenseData] = useState([])
//   const [expenseBreakdown, setExpenseBreakdown] = useState([])
//   const [documentExpiryData, setDocumentExpiryData] = useState([])
//   const [recentEChallans, setRecentEChallans] = useState([])
//   const [recentFastTagPayments, setRecentFastTagPayments] = useState([])
//   const [recentServicing, setRecentServicing] = useState([])
//   const [drivers, setDrivers] = useState([])
//   const [assignments, setAssignments] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const router = useRouter()
//   const [isDriverModel, setIsDriverModel] = useState(false)
//   const [showAccessDenied, setShowAccessDenied] = useState(false)
//   const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false)
//   const [subAdminData, setSubAdminData] = useState(null)
//   const [trialTimeRemaining, setTrialTimeRemaining] = useState({
//     days: 0,
//     hours: 0,
//     minutes: 0,
//     seconds: 0,
//     totalMs: 0,
//   })
//   const [showTrialCountdown, setShowTrialCountdown] = useState(false)

//   // Coming Soon Modal State
//   const [showComingSoonModal, setShowComingSoonModal] = useState(false)
//   const [selectedFeature, setSelectedFeature] = useState("")

//   useEffect(() => {
//     let interval = null

//     if (showTrialCountdown && subAdminData?.subscription?.endDate) {
//       interval = setInterval(() => {
//         const now = new Date().getTime()
//         const endTime = new Date(subAdminData.subscription.endDate).getTime()
//         const timeDiff = endTime - now

//         if (timeDiff > 0) {
//           const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
//           const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
//           const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
//           const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

//           setTrialTimeRemaining({
//             days,
//             hours,
//             minutes,
//             seconds,
//             totalMs: timeDiff,
//           })
//         } else {
//           // Subscription has ended
//           setTrialTimeRemaining({
//             days: 0,
//             hours: 0,
//             minutes: 0,
//             seconds: 0,
//             totalMs: 0,
//           })
//         }
//       }, 1000)
//     }

//     return () => {
//       if (interval) {
//         clearInterval(interval)
//       }
//     }
//   }, [showTrialCountdown, subAdminData?.subscription?.endDate])

//   useEffect(() => {
//     const checkUserStatusAndFetchData = async () => {
//       const token = localStorage.getItem("token")
//       const id = localStorage.getItem("id")
//       if (!token || !id) {
//         router.push("/login")
//         return
//       }

//       try {
//         const res = await axios.get(`${baseURL}api/admin/getSubAdmin/${id}`)

//         if (res.data?.subAdmin?.status === "Inactive") {
//           localStorage.clear()
//           setShowAccessDenied(true)
//           return
//         }

//         const responseData = res.data
//         setSubAdminData(responseData)

//         if (responseData.subscription && responseData.subscription.endDate) {
//           // Show countdown for both trial and paid subscriptions
//           if (
//             responseData.subAdmin?.subscriptionType === "trial" ||
//             responseData.subAdmin?.subscriptionType === "paid"
//           ) {
//             setShowTrialCountdown(true)

//             // Calculate initial time remaining
//             const now = new Date().getTime()
//             const endTime = new Date(responseData.subscription.endDate).getTime()
//             const timeDiff = endTime - now

//             if (timeDiff > 0) {
//               const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
//               const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
//               const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
//               const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

//               setTrialTimeRemaining({
//                 days,
//                 hours,
//                 minutes,
//                 seconds,
//                 totalMs: timeDiff,
//               })
//             } else {
//               // Subscription has ended
//               setTrialTimeRemaining({
//                 days: 0,
//                 hours: 0,
//                 minutes: 0,
//                 seconds: 0,
//                 totalMs: 0,
//               })
//             }
//           } else {
//             setShowTrialCountdown(false)
//           }
//         } else {
//           // No subscription data found
//           setShowTrialCountdown(false)
//         }
//       } catch (err) {
//         console.error("Error checking user status:", err)
//         router.push("/login")
//       }
//     }

//     checkUserStatusAndFetchData()
//   }, [router])

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       setLoading(true)
//       setError(null)

//       try {
//         const token = localStorage.getItem("token")
//         if (!token) {
//           setError("Authentication token not found. Please log in again.")
//           return
//         }

//         const headers = { headers: { Authorization: `Bearer ${token}` } }

//         const [driversRes, cabsRes, assignedCabsRes, expensesRes, servicingRes] = await Promise.allSettled([
//           axios.get(`${baseURL}api/driver/profile`, headers),
//           axios.get(`${baseURL}api/cabDetails`, headers),
//           axios.get(`${baseURL}api/assigncab`, headers),
//           axios.get(`${baseURL}api/cabs/cabExpensive`, headers),
//           axios.get(`${baseURL}api/servicing`, headers),
//         ])

//         // Safe data extraction with proper error handling
//         const driversData =
//           driversRes.status === "fulfilled" && Array.isArray(driversRes.value.data) ? driversRes.value.data : []

//         const cabsData = cabsRes.status === "fulfilled" && Array.isArray(cabsRes.value.data) ? cabsRes.value.data : []

//         let assignedCabsData = []
//         if (assignedCabsRes.status === "fulfilled") {
//           const responseData = assignedCabsRes.value.data
//           if (Array.isArray(responseData)) {
//             assignedCabsData = responseData
//           } else if (responseData && Array.isArray(responseData.assignments)) {
//             assignedCabsData = responseData.assignments
//           } else if (responseData && Array.isArray(responseData.data)) {
//             assignedCabsData = responseData.data
//           }
//         }

//         const expensesData =
//           expensesRes.status === "fulfilled" &&
//           expensesRes.value.data?.data &&
//           Array.isArray(expensesRes.value.data.data)
//             ? expensesRes.value.data.data
//             : []

//         const servicingData =
//           servicingRes.status === "fulfilled" &&
//           servicingRes.value.data?.services &&
//           Array.isArray(servicingRes.value.data.services)
//             ? servicingRes.value.data.services
//             : []

//         // Store drivers and assignments for servicing data processing
//         setDrivers(driversData)
//         setAssignments(assignedCabsData)

//         const currentlyAssignedCabs = assignedCabsData.filter((cab) => {
//           const status = cab.status?.toLowerCase?.() || ""
//           return status === "assigned" || status === "active" || status === "in-use"
//         })

//         const totalExpenses = expensesData.reduce((acc, curr) => acc + (curr.totalExpense || 0), 0)

//         // Process servicing data to merge with driver and cab information
//         const processedServicing = servicingData.map((service) => {
//           const assignment = assignedCabsData.find((a) => a.cab?.id === service.cabId || a.cabId === service.cabId)

//           let serviceDriver = service.Driver
//           if (!serviceDriver || typeof serviceDriver === "string") {
//             const driverId = service.driver || service.driverId
//             serviceDriver = driversData.find((d) => d.id === driverId) || assignment?.driver
//           }
//           const serviceCab = service.CabDetail || assignment?.cab

//           return {
//             ...service,
//             cab: serviceCab,
//             driver: serviceDriver,
//           }
//         })

//         // Get only the 4 most recent servicing records
//         const recentServicingData = processedServicing
//           .sort((a, b) => new Date(b.serviceDate || b.createdAt) - new Date(a.serviceDate || a.createdAt))
//           .slice(0, 4)

//         setRecentServicing(recentServicingData)

//         // Mock data for new features
//         const gpsTrackingActive = Math.floor(cabsData.length * 0.85)
//         const fastTagPaymentsCount = Math.floor(Math.random() * 50) + 20
//         const eChallanCount = Math.floor(Math.random() * 15) + 5
//         const documentExpiryCount = Math.floor(Math.random() * 10) + 2

//         const monthlyExpenseData = expensesData.map((exp, index) => ({
//           month: exp.cabNumber || `Cab ${index + 1}`,
//           expense: exp.totalExpense || 0,
//         }))

//         const aggregatedBreakdown = expensesData.reduce((acc, exp) => {
//           const breakdown = exp.breakdown || {}
//           acc.fuel = (acc.fuel || 0) + (breakdown.fuel || 0)
//           acc.fasttag = (acc.fasttag || 0) + (breakdown.fastTag || breakdown.fasttag || 0)
//           acc.tyre = (acc.tyre || 0) + (breakdown.tyre || breakdown.tyrePuncture || 0)
//           acc.other = (acc.other || 0) + (breakdown.other || breakdown.otherProblems || 0)
//           return acc
//         }, {})

//         const formattedBreakdown = [
//           { name: "Fuel", value: aggregatedBreakdown.fuel || 0 },
//           { name: "FastTag", value: aggregatedBreakdown.fasttag || 0 },
//           { name: "TyrePuncture", value: aggregatedBreakdown.tyre || 0 },
//           { name: "OtherProblems", value: aggregatedBreakdown.other || 0 },
//         ]

//         // Mock data for document expiry
//         const mockDocumentExpiry = [
//           { document: "Insurance", expiring: 3, color: "#EF4444" },
//           { document: "RC", expiring: 1, color: "#F59E0B" },
//           { document: "Fitness", expiring: 5, color: "#10B981" },
//           { document: "Permit", expiring: 2, color: "#6366F1" },
//         ]

//         // Mock data for recent e-challans
//         const mockRecentEChallans = [
//           { cabNumber: "MH12AB1234", amount: 500, date: "2024-01-20", violation: "Speed Limit" },
//           { cabNumber: "MH14CD5678", amount: 1000, date: "2024-01-19", violation: "Signal Jump" },
//           { cabNumber: "MH09EF9012", amount: 200, date: "2024-01-18", violation: "Parking" },
//         ]

//         // Mock data for recent FastTag payments
//         const mockFastTagPayments = [
//           { cabNumber: "MH12AB1234", amount: 150, date: "2024-01-20", tollPlaza: "Mumbai-Pune Expressway" },
//           { cabNumber: "MH14CD5678", amount: 85, date: "2024-01-20", tollPlaza: "Bandra-Worli Sea Link" },
//           { cabNumber: "MH09EF9012", amount: 120, date: "2024-01-19", tollPlaza: "Eastern Express Highway" },
//         ]

//         setStats({
//           totalDrivers: driversData.length || 0,
//           totalCabs: cabsData.length || 0,
//           assignedCabs: currentlyAssignedCabs.length || 0,
//           totalExpenses: totalExpenses || 0,
//           gpsTracking: gpsTrackingActive,
//           fastTagPayments: fastTagPaymentsCount,
//           eChallan: eChallanCount,
//           documentExpiry: documentExpiryCount,
//         })

//         setExpenseData(monthlyExpenseData)
//         setExpenseBreakdown(formattedBreakdown)
//         setDocumentExpiryData(mockDocumentExpiry)
//         setRecentEChallans(mockRecentEChallans)
//         setRecentFastTagPayments(mockFastTagPayments)
//       } catch (error) {
//         console.error("Error fetching dashboard data:", error)
//         setError("Failed to fetch dashboard data. Please try again later.")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchDashboardData()
//   }, [])

  // Manual refresh for cash summary
  const refreshCashSummaryNow = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return
      const headers = { headers: { Authorization: `Bearer ${token}` } }
      const cashRes = await axios.get(`${baseURL}api/assigncab/cash/summary`, headers)
      if (cashRes?.data) {
        const { totalCashReceived = 0, cashWithDrivers = 0 } = cashRes.data
        const safeTotal = Math.max(0, Number(totalCashReceived) || 0)
        const safeWithDrivers = Math.max(0, Number(cashWithDrivers) || 0)
        setCashSummary({ totalCashReceived: safeTotal, cashWithDrivers: safeWithDrivers, drivers: [] })
      }
    } catch {}
  }

//   // Updated navigation handlers for the new cards
//   const handleFeatureClick = (featureName) => {
//     setSelectedFeature(featureName)
//     setShowComingSoonModal(true)
//   }

//   const handleCloseComingSoonModal = () => {
//     setShowComingSoonModal(false)
//     setSelectedFeature("")
//   }

//   // Function to get status badge for servicing
//   const getStatusBadge = (status) => {
//     const statusColors = {
//       pending: "bg-blue-50 text-blue-600 border border-blue-200",
//       completed: "bg-green-50 text-green-600 border border-green-200",
//       assigned: "bg-yellow-50 text-yellow-600 border border-yellow-200",
//     }
//     const statusText = {
//       pending: "Upcoming",
//       completed: "Completed",
//       assigned: "Assigned",
//     }
//     return (
//       <span
//         className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || statusColors.pending}`}
//       >
//         {statusText[status] || "Upcoming"}
//       </span>
//     )
//   }

//   const handleGPSLink = () => {
//     router.push("../GPSTracking")
//   }
//   const COLORS = ["#F59E0B", "#10B981", "#EF4444", "#6366F1", "#8B5CF6"]

//   return (
//     <div className="bg-gray-50 min-h-screen flex">
//       <Sidebar />
//       <div className="flex-1 lg:ml-64">
//         {showAccessDenied && <AccessDeniedModal />}

//         {/* Coming Soon Modal */}
//         <ComingSoonModal
//           isOpen={showComingSoonModal}
//           onClose={handleCloseComingSoonModal}
//           featureName={selectedFeature}
//         />

//         {/* Header */}
//         <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 lg:py-6">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//             <div>
//               <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
//                 <span>🏠</span>
//                 <span>›</span>
//                 <span>Dashboard</span>
//               </nav>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="flex items-center gap-2 ml-4">
//                 <Bell className="h-5 w-5 text-gray-600" />
//                 <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
//                   <User className="h-4 w-4 text-gray-600" />
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="p-4 lg:p-8">
//           {loading && <p className="text-center text-gray-600">Loading dashboard data...</p>}
//           {error && <p className="text-center text-red-500">{error}</p>}

//           {!loading && !error && (
//             <>
//               {showTrialCountdown && (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                   {/* Days Container */}
//                   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-1">Days Left</h3>
//                         <p className="text-sm text-gray-600">
//                           {subAdminData?.subAdmin?.subscriptionType === "trial"
//                             ? "Trial days remaining"
//                             : "Subscription days remaining"}
//                         </p>
//                       </div>
//                       <FaClock className="text-blue-500 text-2xl" />
//                     </div>
//                     <div className="mt-4">
//                       <div className="text-3xl font-bold text-blue-600">
//                         {trialTimeRemaining.days} <span className="text-lg font-medium">days</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Hours Container */}
//                   <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-1">Hours Left</h3>
//                         <p className="text-sm text-gray-600">
//                           {subAdminData?.subAdmin?.subscriptionType === "trial"
//                             ? "Trial hours remaining"
//                             : "Subscription hours remaining"}
//                         </p>
//                       </div>
//                       <FaClock className="text-indigo-500 text-2xl" />
//                     </div>
//                     <div className="mt-4">
//                       <div className="text-3xl font-bold text-indigo-600">
//                         {trialTimeRemaining.hours} <span className="text-lg font-medium">hours</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Minutes Container */}
//                   <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-1">Minutes Left</h3>
//                         <p className="text-sm text-gray-600">
//                           {subAdminData?.subAdmin?.subscriptionType === "trial"
//                             ? "Trial minutes remaining"
//                             : "Subscription minutes remaining"}
//                         </p>
//                       </div>
//                       <FaClock className="text-purple-500 text-2xl" />
//                     </div>
//                     <div className="mt-4">
//                       <div className="text-3xl font-bold text-purple-600">
//                         {trialTimeRemaining.minutes} <span className="text-lg font-medium">min</span>
//                       </div>
//                     </div>
//                   </div>

//                   {/* Seconds Container */}
//                   <div className="bg-gradient-to-r from-pink-50 to-red-50 border border-pink-200 rounded-lg p-4">
//                     <div className="flex items-center justify-between">
//                       <div>
//                         <h3 className="text-lg font-semibold text-gray-900 mb-1">Seconds Left</h3>
//                         <p className="text-sm text-gray-600">
//                           {subAdminData?.subAdmin?.subscriptionType === "trial"
//                             ? "Trial seconds remaining"
//                             : "Subscription seconds remaining"}
//                         </p>
//                       </div>
//                       <FaClock className="text-pink-500 text-2xl" />
//                     </div>
//                     <div className="mt-4">
//                       <div className="text-3xl font-bold text-pink-600">
//                         {trialTimeRemaining.seconds} <span className="text-lg font-medium">sec</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {subAdminData?.subAdmin?.subscriptionType !== "trial" &&
//                 subAdminData?.subAdmin?.subscriptionType !== "paid" && (
//                   <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6 lg:mb-8">
//                     <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//                       <div>
//                         <h2 className="text-xl font-semibold text-gray-900 mb-2">
//                           Welcome! Start your free trial today!
//                         </h2>
//                         <p className="text-gray-600">Explore all features for free for 7 days.</p>
//                       </div>
//                       <button
//                         onClick={() => router.push("/Subscription")}
//                         className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer hover:bg-yellow-600"
//                       >
//                         Start Free Trial
//                       </button>
//                     </div>
//                   </div>
//                 )}

//               {/* Quick Actions Above Stats */}
              <div className="flex justify-end mb-2">
                <button
                  onClick={refreshCashSummaryNow}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50"
                >
                  Refresh Cash
                </button>
              </div>

              {/* Stats Cards */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
//                 {[
//                   {
//                     label: "Total Drivers",
//                     value: stats.totalDrivers,
//                     icon: <MdPerson size={20} className="text-gray-600" />,
//                     bgColor: "bg-white",
//                   },
//                   {
//                     label: "Total Vehicles",
//                     value: stats.totalCabs,
//                     icon: <MdOutlineDirectionsCar size={20} className="text-gray-600" />,
//                     bgColor: "bg-white",
//                   },
//                   {
//                     label: "Assigned Vehicles",
//                     value: stats.assignedCabs,
//                     icon: <BsClipboardCheck size={20} className="text-gray-600" />,
//                     bgColor: "bg-white",
//                   },
//                   {
//                     label: "Total Expenses",
//                     value: stats.totalExpenses,
//                     icon: <MdOutlineAccountBalanceWallet size={20} className="text-gray-600" />,
//                     prefix: "₹",
//                     bgColor: "bg-white",
//                   },
//                 ].map((card, index) => (
//                   <motion.div
//                     key={index}
//                     className={`${card.bgColor} p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow`}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, delay: index * 0.1 }}
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="text-gray-600 text-xs lg:text-sm font-medium">{card.label}</div>
//                       {card.icon}
//                     </div>
//                     <div className="text-2xl lg:text-3xl font-bold text-gray-900">
//                       <AnimatedCounter value={card.value} prefix={card.prefix || ""} />
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>

//               {/* Main Content Grid */}
//               <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
//                 {/* Recent Servicing Table - Now Dynamic */}
//                 <div className="xl:col-span-2">
//                   <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
//                     <div className="p-4 lg:p-6 border-b border-gray-200">
//                       <h3 className="text-lg font-semibold text-gray-900">Recent Servicing</h3>
//                       <p className="text-sm text-gray-600 mt-1">A log of the most recent services for your fleet.</p>
//                     </div>
//                     {recentServicing.length === 0 ? (
//                       <div className="text-center py-12">
//                         <svg
//                           className="w-12 h-12 text-gray-400 mx-auto mb-4"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
//                           />
//                         </svg>
//                         <p className="text-gray-500 font-medium">No recent servicing found</p>
//                         <p className="text-gray-400 text-sm mt-1">Servicing records will appear here once available</p>
//                       </div>
//                     ) : (
//                       <div className="overflow-x-auto">
//                         <table className="w-full">
//                           <thead className="bg-gray-50">
//                             <tr>
//                               <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Cab ID
//                               </th>
//                               <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Service
//                               </th>
//                               <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Driver
//                               </th>
//                               <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Date
//                               </th>
//                               <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Cost
//                               </th>
//                               <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                 Status
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody className="bg-white divide-y divide-gray-200">
//                             {recentServicing.map((service, index) => (
//                               <tr key={service._id || index} className="hover:bg-gray-50">
//                                 <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                                   {service.CabsDetail?.cabNumber || "N/A"}
//                                 </td>
//                                 <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                                   {service.serviceType || "General Service"}
//                                 </td>
//                                 <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                                   {service.driver?.name || "N/A"}
//                                 </td>
//                                 <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                                   {service.serviceDate
//                                     ? new Date(service.serviceDate).toLocaleDateString()
//                                     : service.createdAt
//                                       ? new Date(service.createdAt).toLocaleDateString()
//                                       : "N/A"}
//                                 </td>
//                                 <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                                   {service.servicingAmount ? `₹${service.servicingAmount.toLocaleString()}` : "N/A"}
//                                 </td>
//                                 <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
//                                   {getStatusBadge(service.status)}
//                                 </td>
//                               </tr>
//                             ))}
//                             {/* Add empty rows to fill space when there are fewer than 4 records */}
//                             {recentServicing.length < 4 &&
//                               Array.from({ length: 4 - recentServicing.length }).map((_, index) => (
//                                 <tr key={`empty-${index}`} className="bg-gray-50/30">
//                                   <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
//                                   <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
//                                   <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
//                                   <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
//                                   <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
//                                   <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
//                                 </tr>
//                               ))}
//                           </tbody>
//                         </table>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 {/* Charts Column */}
//                 <div className="space-y-6 lg:space-y-8">
//                   {/* Expense by Category */}
//                   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
//                     <h3 className="text-lg font-semibold text-gray-900 mb-2">Expense by Category</h3>
//                     <p className="text-sm text-gray-600 mb-4">A donut chart showing the breakdown of expenses.</p>
//                     <ResponsiveContainer width="100%" height={200}>
//                       <PieChart>
//                         <Pie data={expenseData} cx="50%" cy="50%" outerRadius={80} paddingAngle={5} dataKey="expense">
//                           {expenseData.map((entry, index) => (
//                             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                           ))}
//                         </Pie>
//                         <Tooltip
//                           contentStyle={{
//                             backgroundColor: "white",
//                             border: "1px solid #e5e7eb",
//                             borderRadius: "8px",
//                             boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
//                           }}
//                         />
//                       </PieChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>
//               </div>

//               {/* Additional Features Row */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-6 lg:mt-8">
//                 {[
//                   {
//                     label: "GPS Tracking",
//                     value: stats.gpsTracking,
//                     icon: <MdGpsFixed size={20} className="text-purple-600" />,
//                     suffix: " Active",
//                     onClick: () => handleGPSLink(),
//                     bgColor: "bg-purple-50",
//                     borderColor: "border-purple-200",
//                   },
//                   {
//                     label: "FastTag Payments",
//                     value: stats.fastTagPayments,
//                     icon: <MdPayment size={20} className="text-indigo-600" />,
//                     suffix: " Today",
//                     onClick: () => handleFeatureClick("FastTag Payments"),
//                     bgColor: "bg-indigo-50",
//                     borderColor: "border-indigo-200",
//                   },
//                   {
//                     label: "E-Challan (M-Parivahan)",
//                     value: stats.eChallan,
//                     icon: <MdWarning size={20} className="text-orange-600" />,
//                     suffix: " Pending",
//                     onClick: () => handleFeatureClick("E-Challan Management"),
//                     bgColor: "bg-orange-50",
//                     borderColor: "border-orange-200",
//                   },
//                   {
//                     label: "Document Expiry",
//                     value: stats.documentExpiry,
//                     icon: <MdDescription size={20} className="text-teal-600" />,
//                     suffix: " Expiring",
//                     onClick: () => handleFeatureClick("Document Expiry Tracking"),
//                     bgColor: "bg-teal-50",
//                     borderColor: "border-teal-200",
//                   },
//                 ].map((card, index) => (
//                   <motion.div
//                     key={index}
//                     className={`${card.bgColor} ${card.borderColor} p-4 lg:p-6 rounded-lg border hover:shadow-md transition-all cursor-pointer transform hover:scale-105`}
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, delay: index * 0.1 }}
//                     onClick={card.onClick}
//                   >
//                     <div className="flex items-center justify-between mb-2">
//                       <div className="text-gray-700 text-xs lg:text-sm font-medium">{card.label}</div>
//                       {card.icon}
//                     </div>
//                     <div className="text-xl lg:text-2xl font-bold text-gray-900">
//                       <AnimatedCounter value={card.value} suffix={card.suffix || ""} />
//                     </div>
//                   </motion.div>
//                 ))}
//               </div>

//               {/* Upcoming Features Section - Fixed */}
//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8">
//                 {/* Recent E-Challans - Coming Soon Feature */}
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//                   <div className="p-4 lg:p-6 border-b border-gray-200">
//                     <div className="flex items-center justify-between">
//                       <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//                         <MdWarning className="mr-2 text-orange-500" /> Recent E-Challans
//                       </h3>
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                         <FaClock className="mr-1" size={10} />
//                         Coming Soon
//                       </span>
//                     </div>
//                     <p className="text-sm text-gray-600 mt-1">Track and manage e-challans from M-Parivahan system</p>
//                   </div>
//                   <div className="p-4 lg:p-6">
//                     <div className="text-center py-8">
//                       <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-4">
//                         <MdWarning className="text-orange-600 text-2xl" />
//                       </div>
//                       <h4 className="text-lg font-semibold text-gray-900 mb-2">E-Challan Integration</h4>
//                       <p className="text-gray-600 text-sm mb-4">
//                         Automatically fetch and track e-challans from the M-Parivahan system for all your vehicles.
//                       </p>
//                       <button
//                         onClick={() => handleFeatureClick("E-Challan Management")}
//                         className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
//                       >
//                         Learn More
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Recent FastTag Payments - Coming Soon Feature */}
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//                   <div className="p-4 lg:p-6 border-b border-gray-200">
//                     <div className="flex items-center justify-between">
//                       <h3 className="text-lg font-semibold text-gray-900 flex items-center">
//                         <MdPayment className="mr-2 text-indigo-500" /> Recent FastTag Payments
//                       </h3>
//                       <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
//                         <FaClock className="mr-1" size={10} />
//                         Coming Soon
//                       </span>
//                     </div>
//                     <p className="text-sm text-gray-600 mt-1">Monitor FastTag transactions and toll payments</p>
//                   </div>
//                   <div className="p-4 lg:p-6">
//                     <div className="text-center py-8">
//                       <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mb-4">
//                         <MdPayment className="text-indigo-600 text-2xl" />
//                       </div>
//                       <h4 className="text-lg font-semibold text-gray-900 mb-2">FastTag Integration</h4>
//                       <p className="text-gray-600 text-sm mb-4">
//                         Real-time tracking of FastTag payments and toll transactions across all your vehicles.
//                       </p>
//                       <button
//                         onClick={() => handleFeatureClick("FastTag Payments")}
//                         className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
//                       >
//                         Learn More
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {isDriverModel && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
//             <button
//               onClick={() => setIsDriverModel(false)}
//               className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
//             >
//               ✕
//             </button>
//             <AddDriver isOpen={isAddDriverModalOpen} onClose={() => setIsAddDriverModalOpen(false)} />
//           </div>
//         </div>
//       )}
//     </div>
//   )
// }

// export default AdminDashboard





// moved "use client" to top of file



import { useState, useEffect } from "react"
import axios from "axios"
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import Sidebar from "../slidebar/page"
import {
  MdOutlineDirectionsCar,
  MdOutlineAccountBalanceWallet,
  MdPerson,
  MdGpsFixed,
  MdPayment,
  MdWarning,
  MdDescription,
  MdClose,
  MdNotifications,
  MdNotificationsNone,
} from "react-icons/md"
import { BsClipboardCheck } from "react-icons/bs"
import { FaRocket, FaClock } from "react-icons/fa"
import { motion, useAnimation, AnimatePresence } from "framer-motion"
import { useInView } from "react-intersection-observer"
import baseURL from "@/utils/api"
import { useRouter } from "next/navigation"
import { Bell, User, X } from "lucide-react"
import AddDriver from "../DriverDetails/component/AddDriver"

const AnimatedCounter = ({ value, prefix = "", suffix = "", duration = 1.5 }) => {
  const controls = useAnimation()
  const [count, setCount] = useState(0)
  const [ref, inView] = useInView({ triggerOnce: true })

  useEffect(() => {
    if (inView) {
      controls.start({
        count: value,
        transition: { duration },
      })
    }
  }, [inView, value, controls, duration])

  return (
    <motion.span ref={ref} animate={controls} onUpdate={(latest) => setCount(Math.floor(latest.count))}>
      {prefix}
      {count}
      {suffix}
    </motion.span>
  )
}

const AccessDeniedModal = () => {
  const router = useRouter()
  const handleClose = () => {
    router.push("/")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white text-gray-900 p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
        <p className="mb-6">Your access has been restricted. Please contact the administrator.</p>
        <button onClick={handleClose} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
          Close
        </button>
      </div>
    </div>
  )
}

const ComingSoonModal = ({ isOpen, onClose, featureName }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50  bg-black/50 backdrop-blur-sm flex items-center justify-center  bg-opacity-70">
      <motion.div
        className="bg-white text-gray-900 p-8 rounded-xl shadow-2xl max-w-md w-full mx-4"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 20 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <MdClose size={24} />
          </button>

          {/* Icon */}
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
              <FaRocket className="text-white text-2xl" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{featureName}</h2>

          {/* Subtitle */}
          <h3 className="text-lg font-semibold text-black-600 mb-4 flex items-center justify-center">
            <FaClock className="mr-2" />
            Coming Soon!
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            We're working hard to bring you this amazing feature. Stay tuned for updates and get ready for an enhanced
            experience!
          </p>

          {/* Features list */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-800 mb-2">What to expect:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Real-time monitoring and tracking</li>
              <li>• Advanced analytics and reporting</li>
              <li>• Seamless integration with existing systems</li>
              <li>• User-friendly interface</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-lg font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105"
            >
              Got it!
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Notification Panel Component
const NotificationPanel = ({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead, loading }) => {
  if (!isOpen) return null

  const unreadCount = notifications?.filter(notification => !notification.isRead)?.length || 0

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >

        <motion.div
          className="absolute right-4 top-16 w-80 max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-hidden"
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.8, x: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MdNotifications className="text-yellow-500" size={20} />
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            {notifications?.length > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-sm text-yellow-500 hover:text-yellow-600 mt-2 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Content */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading notifications...</p>
              </div>
            ) : notifications?.length === 0 ? (
              <div className="p-6 text-center">
                <MdNotificationsNone className="mx-auto text-yellow-400 mb-3" size={48} />
                <p className="text-gray-500 font-medium">No notifications</p>
                <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications?.map((notification) => (
                  <motion.div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${!notification.isRead ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                      }`}
                    onClick={() => onMarkAsRead(notification.id)}
                    whileHover={{ x: 2 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* <h4 className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notification.title}
                        </h4> */}
                        <p className={`text-sm mt-1 ${!notification.isRead ? 'text-gray-700' : 'text-gray-500'}`}>
                          {notification.message}
                        </p>
                        {/* <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p> */}
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 ml-2"></div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

const AdminDashboard = () => {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalDrivers: 0,
    totalCabs: 0,
    assignedCabs: 0,
    totalExpenses: 0,
    gpsTracking: 0,
    fastTagPayments: 0,
    eChallan: 0,
    documentExpiry: 0,
  })
  const [expenseData, setExpenseData] = useState([])
  const [expenseBreakdown, setExpenseBreakdown] = useState([])
  const [documentExpiryData, setDocumentExpiryData] = useState([])
  const [recentEChallans, setRecentEChallans] = useState([])
  const [recentFastTagPayments, setRecentFastTagPayments] = useState([])
  const [recentServicing, setRecentServicing] = useState([])
  const [drivers, setDrivers] = useState([])
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cashSummary, setCashSummary] = useState({
    totalCashReceived: 0,
    cashWithDrivers: 0,
    drivers: []
  })
  const [trialTimeRemaining, setTrialTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 0,
  })
  const [showTrialCountdown, setShowTrialCountdown] = useState(false)
  const [subAdminData, setSubAdminData] = useState(null)
  const [isDriverModel, setIsDriverModel] = useState(false)
  const [showAccessDenied, setShowAccessDenied] = useState(false)
  const [isAddDriverModalOpen, setIsAddDriverModalOpen] = useState(false)
  const [showComingSoonModal, setShowComingSoonModal] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState("")
  const [notifications, setNotifications] = useState([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // Fast-response: prime from localStorage cache for instant render
  useEffect(() => {
    try {
      const dRaw = localStorage.getItem("cache:drivers")
      const cRaw = localStorage.getItem("cache:cabDetails")
      const aRaw = localStorage.getItem("cache:assigncab")
      const eRaw = localStorage.getItem("cache:expenses")

      const driversData = dRaw ? JSON.parse(dRaw) : []
      const cabsData = cRaw ? JSON.parse(cRaw) : []
      let assignedCabsData = []
      if (aRaw) {
        const parsed = JSON.parse(aRaw)
        if (Array.isArray(parsed)) assignedCabsData = parsed
        else if (Array.isArray(parsed?.assignments)) assignedCabsData = parsed.assignments
        else if (Array.isArray(parsed?.data)) assignedCabsData = parsed.data
      }
      const expensesData = Array.isArray(eRaw ? JSON.parse(eRaw) : null) ? JSON.parse(eRaw) : []

      if (driversData.length || cabsData.length || assignedCabsData.length || expensesData.length) {
        const currentlyAssignedCabs = assignedCabsData.filter((cab) => {
          const status = cab.status?.toLowerCase?.() || ""
          return status === "assigned" || status === "active" || status === "in-use"
        })
        const totalExpenses = expensesData.reduce((acc, curr) => acc + (curr.totalExpense || 0), 0)

        // Basic stats
        setStats((prev) => ({
          ...prev,
          totalDrivers: Array.isArray(driversData) ? driversData.length : 0,
          totalCabs: Array.isArray(cabsData) ? cabsData.length : 0,
          assignedCabs: currentlyAssignedCabs.length || 0,
          totalExpenses: totalExpenses || 0,
          // Keep other derived stats from server fetch later
        }))

        // Initialize cash summary with defaults
        setCashSummary({ totalCashReceived: 0, cashWithDrivers: 0, drivers: [] })

        // Expense chart data (simple per-cab total)
        const monthlyExpenseData = expensesData.map((exp, index) => ({
          month: exp.cabNumber || `Cab ${index + 1}`,
          expense: exp.totalExpense || 0,
        }))
        setExpenseData(monthlyExpenseData)

        // Set loading false to allow UI render while background fetch runs
        setLoading(false)
      }
    } catch {}
  }, [])

  // Fetch notifications
  const fetchNotifications = async () => {
    setNotificationLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await axios.get(`${baseURL}api/notifications/list`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.success) {
        setNotifications(response.data.notifications || [])
        // Calculate unread count
        const unread = response.data.notifications?.filter(notification => !notification.isRead)?.length || 0
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setNotificationLoading(false)
    }
  }

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // Update local state immediately
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      )

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1))

      // Make API call to mark as read on backend (if you have this endpoint)
      // await axios.patch(`${baseURL}api/notifications/${notificationId}/read`, {}, {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
    } catch (error) {
      console.error("Error marking notification as read:", error)
      // Revert local state if API call fails
      fetchNotifications()
    }
  }

  // Mark all notifications as read
  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      // Update local state immediately
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, isRead: true }))
      )
      setUnreadCount(0)

      // Make API call to mark all as read on backend (if you have this endpoint)
      // await axios.patch(`${baseURL}api/notifications/mark-all-read`, {}, {
      //   headers: { Authorization: `Bearer ${token}` }
      // })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      // Revert local state if API call fails
      fetchNotifications()
    }
  }

  // Handle notification bell click
  const handleNotificationClick = () => {
    setShowNotifications(true)
    if (notifications.length === 0) {
      fetchNotifications()
    }
  }

  useEffect(() => {
    let interval = null

    if (showTrialCountdown && subAdminData?.subscription?.endDate) {
      interval = setInterval(() => {
        const now = new Date().getTime()
        const endTime = new Date(subAdminData.subscription.endDate).getTime()
        const timeDiff = endTime - now

        if (timeDiff > 0) {
          const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

          setTrialTimeRemaining({
            days,
            hours,
            minutes,
            seconds,
            totalMs: timeDiff,
          })
        } else {
          // Subscription has ended
          setTrialTimeRemaining({
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            totalMs: 0,
          })
        }
      }, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [showTrialCountdown, subAdminData?.subscription?.endDate])

  useEffect(() => {
    const checkUserStatusAndFetchData = async () => {
      const token = localStorage.getItem("token")
      const id = localStorage.getItem("id")
      if (!token || !id) {
        router.push("/login")
        return
      }

      try {
        const res = await axios.get(`${baseURL}api/admin/getSubAdmin/${id}`)

        if (res.data?.subAdmin?.status === "Inactive") {
          localStorage.clear()
          setShowAccessDenied(true)
          return
        }

        const responseData = res.data
        setSubAdminData(responseData)

        // Fetch notifications when component mounts
        fetchNotifications()

        if (responseData.subscription && responseData.subscription.endDate) {
          // Show countdown for both trial and paid subscriptions
          if (
            responseData.subAdmin?.subscriptionType === "trial" ||
            responseData.subAdmin?.subscriptionType === "paid"
          ) {
            setShowTrialCountdown(true)

            // Calculate initial time remaining
            const now = new Date().getTime()
            const endTime = new Date(responseData.subscription.endDate).getTime()
            const timeDiff = endTime - now

            if (timeDiff > 0) {
              const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
              const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
              const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
              const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

              setTrialTimeRemaining({
                days,
                hours,
                minutes,
                seconds,
                totalMs: timeDiff,
              })
            } else {
              // Subscription has ended
              setTrialTimeRemaining({
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
                totalMs: 0,
              })
            }
          } else {
            setShowTrialCountdown(false)
          }
        } else {
          // No subscription data found
          setShowTrialCountdown(false)
        }
      } catch (err) {
        console.error("Error checking user status:", err)
        router.push("/login")
      }
    }

    checkUserStatusAndFetchData()
  }, [router])

  // Periodic notification refresh (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchDashboardData = async () => {
      setError(null)

      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Authentication token not found. Please log in again.")
          return
        }

        const headers = { headers: { Authorization: `Bearer ${token}` } }

        const [driversRes, cabsRes, assignedCabsRes, expensesRes, servicingRes] = await Promise.allSettled([
          axios.get(`${baseURL}api/driver/profile`, headers),
          axios.get(`${baseURL}api/cabDetails`, headers),
          axios.get(`${baseURL}api/assigncab`, headers),
          axios.get(`${baseURL}api/cabs/cabExpensive`, headers),
          axios.get(`${baseURL}api/servicing`, headers),
        ])

        // Safe data extraction with proper error handling
        const driversData =
          driversRes.status === "fulfilled" && Array.isArray(driversRes.value.data) ? driversRes.value.data : []

        const cabsData = cabsRes.status === "fulfilled" && Array.isArray(cabsRes.value.data) ? cabsRes.value.data : []

        let assignedCabsData = []
        if (assignedCabsRes.status === "fulfilled") {
          const responseData = assignedCabsRes.value.data
          if (Array.isArray(responseData)) {
            assignedCabsData = responseData
          } else if (responseData && Array.isArray(responseData.assignments)) {
            assignedCabsData = responseData.assignments
          } else if (responseData && Array.isArray(responseData.data)) {
            assignedCabsData = responseData.data
          }
        }

        const expensesData =
          expensesRes.status === "fulfilled" &&
            expensesRes.value.data?.data &&
            Array.isArray(expensesRes.value.data.data)
            ? expensesRes.value.data.data
            : []

        const servicingData =
          servicingRes.status === "fulfilled" &&
            servicingRes.value.data?.services &&
            Array.isArray(servicingRes.value.data.services)
            ? servicingRes.value.data.services
            : []

        // Store drivers and assignments for servicing data processing
        setDrivers(driversData)
        setAssignments(assignedCabsData)

        const currentlyAssignedCabs = assignedCabsData.filter((cab) => {
          const status = cab.status?.toLowerCase?.() || ""
          return status === "assigned" || status === "active" || status === "in-use"
        })

        const totalExpenses = expensesData.reduce((acc, curr) => acc + (curr.totalExpense || 0), 0)

        // Process servicing data to merge with driver and cab information
        const processedServicing = servicingData.map((service) => {
          const assignment = assignedCabsData.find((a) => a.cab?.id === service.cabId || a.cabId === service.cabId)

          let serviceDriver = service.Driver
          if (!serviceDriver || typeof serviceDriver === "string") {
            const driverId = service.driver || service.driverId
            serviceDriver = driversData.find((d) => d.id === driverId) || assignment?.driver
          }
          const serviceCab = service.CabDetail || assignment?.cab

          return {
            ...service,
            cab: serviceCab,
            driver: serviceDriver,
          }
        })

        // Get only the 4 most recent servicing records
        const recentServicingData = processedServicing
          .sort((a, b) => new Date(b.serviceDate || b.createdAt) - new Date(a.serviceDate || a.createdAt))
          .slice(0, 4)

        setRecentServicing(recentServicingData)

        // Mock data for new features
        const gpsTrackingActive = Math.floor(cabsData.length * 0.85)
        const fastTagPaymentsCount = Math.floor(Math.random() * 50) + 20
        const eChallanCount = Math.floor(Math.random() * 15) + 5
        const documentExpiryCount = Math.floor(Math.random() * 10) + 2

        const monthlyExpenseData = expensesData.map((exp, index) => ({
          month: exp.cabNumber || `Cab ${index + 1}`,
          expense: exp.totalExpense || 0,
        }))

        const aggregatedBreakdown = expensesData.reduce((acc, exp) => {
          const breakdown = exp.breakdown || {}
          acc.fuel = (acc.fuel || 0) + (breakdown.fuel || 0)
          acc.fasttag = (acc.fasttag || 0) + (breakdown.fastTag || breakdown.fasttag || 0)
          acc.tyre = (acc.tyre || 0) + (breakdown.tyre || breakdown.tyrePuncture || 0)
          acc.other = (acc.other || 0) + (breakdown.other || breakdown.otherProblems || 0)
          return acc
        }, {})

        const formattedBreakdown = [
          { name: "Fuel", value: aggregatedBreakdown.fuel || 0 },
          { name: "FastTag", value: aggregatedBreakdown.fasttag || 0 },
          { name: "TyrePuncture", value: aggregatedBreakdown.tyre || 0 },
          { name: "OtherProblems", value: aggregatedBreakdown.other || 0 },
        ]

        // Mock data for document expiry
        const mockDocumentExpiry = [
          { document: "Insurance", expiring: 3, color: "#EF4444" },
          { document: "RC", expiring: 1, color: "#F59E0B" },
          { document: "Fitness", expiring: 5, color: "#10B981" },
          { document: "Permit", expiring: 2, color: "#6366F1" },
        ]

        // Mock data for recent e-challans
        const mockRecentEChallans = [
          { cabNumber: "MH12AB1234", amount: 500, date: "2024-01-20", violation: "Speed Limit" },
          { cabNumber: "MH14CD5678", amount: 1000, date: "2024-01-19", violation: "Signal Jump" },
          { cabNumber: "MH09EF9012", amount: 200, date: "2024-01-18", violation: "Parking" },
        ]

        // Mock data for recent FastTag payments
        const mockFastTagPayments = [
          { cabNumber: "MH12AB1234", amount: 150, date: "2024-01-20", tollPlaza: "Mumbai-Pune Expressway" },
          { cabNumber: "MH14CD5678", amount: 85, date: "2024-01-20", tollPlaza: "Bandra-Worli Sea Link" },
          { cabNumber: "MH09EF9012", amount: 120, date: "2024-01-19", tollPlaza: "Eastern Express Highway" },
        ]

        setStats({
          totalDrivers: driversData.length || 0,
          totalCabs: cabsData.length || 0,
          assignedCabs: currentlyAssignedCabs.length || 0,
          totalExpenses: totalExpenses || 0,
          gpsTracking: gpsTrackingActive,
          fastTagPayments: fastTagPaymentsCount,
          eChallan: eChallanCount,
          documentExpiry: documentExpiryCount,
        })

        setExpenseData(monthlyExpenseData)
        setExpenseBreakdown(formattedBreakdown)
        setDocumentExpiryData(mockDocumentExpiry)
        setRecentEChallans(mockRecentEChallans)
        setRecentFastTagPayments(mockFastTagPayments)

        // Fetch cash summary for cards
        try {
          const cashRes = await axios.get(`${baseURL}api/assigncab/cash/summary`, headers)
          if (cashRes?.data) {
            const { totalCashReceived = 0, cashWithDrivers = 0 } = cashRes.data
            const safeTotal = Math.max(0, Number(totalCashReceived) || 0)
            const safeWithDrivers = Math.max(0, Number(cashWithDrivers) || 0)
            setCashSummary({ totalCashReceived: safeTotal, cashWithDrivers: safeWithDrivers, drivers: [] })
          }
        } catch (e) {
          console.warn("Cash summary fetch failed", e)
          // Set default values if API fails
          setCashSummary({ totalCashReceived: 0, cashWithDrivers: 0, drivers: [] })
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        setError("Failed to fetch dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Periodically refresh cash summary and on tab focus
  useEffect(() => {
    const fetchCashSummary = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return
        const headers = { headers: { Authorization: `Bearer ${token}` } }
        const cashRes = await axios.get(`${baseURL}api/assigncab/cash/summary`, headers)
        if (cashRes?.data) {
          const { totalCashReceived = 0, cashWithDrivers = 0 } = cashRes.data
          const safeTotal = Math.max(0, Number(totalCashReceived) || 0)
          const safeWithDrivers = Math.max(0, Number(cashWithDrivers) || 0)
          setCashSummary({ totalCashReceived: safeTotal, cashWithDrivers: safeWithDrivers, drivers: [] })
        }
      } catch (e) {
        // do not surface error to UI; keep last known values
      }
    }

    // refresh every 10s
    const interval = setInterval(fetchCashSummary, 10000)

    // refresh when page becomes visible again
    const onVisibility = () => {
      if (!document.hidden) fetchCashSummary()
    }
    document.addEventListener("visibilitychange", onVisibility)

    // initial quick refresh after mount
    fetchCashSummary()

    return () => {
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  // Updated navigation handlers for the new cards
  const handleFeatureClick = (featureName) => {
    setSelectedFeature(featureName)
    setShowComingSoonModal(true)
  }

  const handleCloseComingSoonModal = () => {
    setShowComingSoonModal(false)
    setSelectedFeature("")
  }

  // Function to get status badge for servicing
  const getStatusBadge = (status) => {
    const statusColors = {
      pending: "bg-blue-50 text-blue-600 border border-blue-200",
      completed: "bg-green-50 text-green-600 border border-green-200",
      assigned: "bg-yellow-50 text-yellow-600 border border-yellow-200",
    }
    const statusText = {
      pending: "Upcoming",
      completed: "Completed",
      assigned: "Assigned",
    }
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || statusColors.pending}`}
      >
        {statusText[status] || "Upcoming"}
      </span>
    )
  }

  const handleGPSLink = () => {
    router.push("../GPSTracking")
  }
  const COLORS = ["#F59E0B", "#10B981", "#EF4444", "#6366F1", "#8B5CF6"]

  return (
    <div className="bg-gray-50 min-h-screen flex">
      <Sidebar />
      <div className="flex-1 lg:ml-64">
        {showAccessDenied && <AccessDeniedModal />}

        {/* Coming Soon Modal */}
        <ComingSoonModal
          isOpen={showComingSoonModal}
          onClose={handleCloseComingSoonModal}
          featureName={selectedFeature}
        />

        {/* Notification Panel */}
        <NotificationPanel
          isOpen={showNotifications}
          onClose={() => setShowNotifications(false)}
          notifications={notifications}
          onMarkAsRead={markNotificationAsRead}
          onMarkAllAsRead={markAllNotificationsAsRead}
          loading={notificationLoading}
        />

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                <span>🏠</span>
                <span>›</span>
                <span>Dashboard</span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={handleNotificationClick}
                  className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <motion.span
                      className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </motion.span>
                  )}
                </button>
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 lg:p-8">
          {loading && <p className="text-center text-gray-600">Loading dashboard data...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}

          {!loading && !error && (
            <>
              {showTrialCountdown && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Days Container */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Days Left</h3>
                        <p className="text-sm text-gray-600">
                          {subAdminData?.subAdmin?.subscriptionType === "trial"
                            ? "Trial days remaining"
                            : "Subscription days remaining"}
                        </p>
                      </div>
                      <FaClock className="text-blue-500 text-2xl" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-bold text-blue-600">
                        {trialTimeRemaining.days} <span className="text-lg font-medium">days</span>
                      </div>
                    </div>
                  </div>

                  {/* Hours Container */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Hours Left</h3>
                        <p className="text-sm text-gray-600">
                          {subAdminData?.subAdmin?.subscriptionType === "trial"
                            ? "Trial hours remaining"
                            : "Subscription hours remaining"}
                        </p>
                      </div>
                      <FaClock className="text-indigo-500 text-2xl" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-bold text-indigo-600">
                        {trialTimeRemaining.hours} <span className="text-lg font-medium">hours</span>
                      </div>
                    </div>
                  </div>

                  {/* Minutes Container */}
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Minutes Left</h3>
                        <p className="text-sm text-gray-600">
                          {subAdminData?.subAdmin?.subscriptionType === "trial"
                            ? "Trial minutes remaining"
                            : "Subscription minutes remaining"}
                        </p>
                      </div>
                      <FaClock className="text-purple-500 text-2xl" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-bold text-purple-600">
                        {trialTimeRemaining.minutes} <span className="text-lg font-medium">min</span>
                      </div>
                    </div>
                  </div>

                  {/* Seconds Container */}
                  <div className="bg-gradient-to-r from-pink-50 to-red-50 border border-pink-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Seconds Left</h3>
                        <p className="text-sm text-gray-600">
                          {subAdminData?.subAdmin?.subscriptionType === "trial"
                            ? "Trial seconds remaining"
                            : "Subscription seconds remaining"}
                        </p>
                      </div>
                      <FaClock className="text-pink-500 text-2xl" />
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-bold text-pink-600">
                        {trialTimeRemaining.seconds} <span className="text-lg font-medium">sec</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {subAdminData?.subAdmin?.subscriptionType !== "trial" &&
                subAdminData?.subAdmin?.subscriptionType !== "paid" && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6 lg:mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          Welcome! Start your free trial today!
                        </h2>
                        <p className="text-gray-600">Explore all features for free for 7 days.</p>
                      </div>
                      <button
                        onClick={() => router.push("/Subscription")}
                        className="bg-yellow-500 text-black px-6 py-2 rounded-lg font-medium transition-colors whitespace-nowrap cursor-pointer hover:bg-yellow-600"
                      >
                        Start Free Trial
                      </button>
                    </div>
                  </div>
                )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
                {[
                  {
                    label: "Total Drivers",
                    value: stats.totalDrivers,
                    icon: <MdPerson size={20} className="text-gray-600" />,
                    bgColor: "bg-white",
                  },
                  {
                    label: "Total Vehicles",
                    value: stats.totalCabs,
                    icon: <MdOutlineDirectionsCar size={20} className="text-gray-600" />,
                    bgColor: "bg-white",
                  },
                  {
                    label: "Assigned Vehicles",
                    value: stats.assignedCabs,
                    icon: <BsClipboardCheck size={20} className="text-gray-600" />,
                    bgColor: "bg-white",
                  },
                  {
                    label: "Total Expenses",
                    value: stats.totalExpenses,
                    icon: <MdOutlineAccountBalanceWallet size={20} className="text-gray-600" />,
                    prefix: "₹",
                    bgColor: "bg-white",
                  },
                  // New cash summary cards
                  {
                    label: "Total Cash Received",
                    value: Math.max(0, Number(cashSummary?.totalCashReceived) || 0),
                    icon: <MdOutlineAccountBalanceWallet size={20} className="text-green-600" />,
                    prefix: "₹",
                    bgColor: "bg-white",
                  },
                  {
                    label: "Cash With Drivers",
                    value: Math.max(0, Number(cashSummary?.cashWithDrivers) || 0),
                    icon: <MdOutlineAccountBalanceWallet size={20} className="text-yellow-600" />,
                    prefix: "₹",
                    bgColor: "bg-white",
                  },
                ].map((card, index) => (
                  <motion.div
                    key={index}
                    className={`${card.bgColor} p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-600 text-xs lg:text-sm font-medium">{card.label}</div>
                      {card.icon}
                    </div>
                    <div className="text-2xl lg:text-3xl font-bold text-gray-900">
                      <AnimatedCounter value={card.value} prefix={card.prefix || ""} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
                {/* Recent Servicing Table - Now Dynamic */}
                <div className="xl:col-span-2">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
                    <div className="p-4 lg:p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Recent Servicing</h3>
                      <p className="text-sm text-gray-600 mt-1">A log of the most recent services for your fleet.</p>
                    </div>
                    {recentServicing.length === 0 ? (
                      <div className="text-center py-12">
                        <svg
                          className="w-12 h-12 text-gray-400 mx-auto mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                        <p className="text-gray-500 font-medium">No recent servicing found</p>
                        <p className="text-gray-400 text-sm mt-1">Servicing records will appear here once available</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cab ID
                              </th>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Service
                              </th>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Driver
                              </th>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Cost
                              </th>
                              <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {recentServicing.map((service, index) => (
                              <tr key={service._id || index} className="hover:bg-gray-50">
                                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {service.CabsDetail?.cabNumber || "N/A"}
                                </td>
                                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {service.serviceType || "General Service"}
                                </td>
                                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {service.driver?.name || "N/A"}
                                </td>
                                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {service.serviceDate
                                    ? new Date(service.serviceDate).toLocaleDateString()
                                    : service.createdAt
                                      ? new Date(service.createdAt).toLocaleDateString()
                                      : "N/A"}
                                </td>
                                <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {service.servicingAmount ? `₹${service.servicingAmount.toLocaleString()}` : "N/A"}
                                </td>
                                <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                                  {getStatusBadge(service.status)}
                                </td>
                              </tr>
                            ))}
                            {/* Add empty rows to fill space when there are fewer than 4 records */}
                            {recentServicing.length < 4 &&
                              Array.from({ length: 4 - recentServicing.length }).map((_, index) => (
                                <tr key={`empty-${index}`} className="bg-gray-50/30">
                                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-400">-</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Charts Column */}
                <div className="space-y-6 lg:space-y-8">
                  {/* Expense by Category */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Expense by Category</h3>
                    <p className="text-sm text-gray-600 mb-4">A donut chart showing the breakdown of expenses.</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={expenseData} cx="50%" cy="50%" outerRadius={80} paddingAngle={5} dataKey="expense">
                          {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Additional Features Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mt-6 lg:mt-8">
                {[
                  {
                    label: "GPS Tracking",
                    value: stats.gpsTracking,
                    icon: <MdGpsFixed size={20} className="text-purple-600" />,
                    suffix: " Active",
                    onClick: () => handleGPSLink(),
                    bgColor: "bg-purple-50",
                    borderColor: "border-purple-200",
                  },
                  {
                    label: "FastTag Payments",
                    value: stats.fastTagPayments,
                    icon: <MdPayment size={20} className="text-indigo-600" />,
                    suffix: " Today",
                    onClick: () => handleFeatureClick("FastTag Payments"),
                    bgColor: "bg-indigo-50",
                    borderColor: "border-indigo-200",
                  },
                  {
                    label: "E-Challan (M-Parivahan)",
                    value: stats.eChallan,
                    icon: <MdWarning size={20} className="text-orange-600" />,
                    suffix: " Pending",
                    onClick: () => handleFeatureClick("E-Challan Management"),
                    bgColor: "bg-orange-50",
                    borderColor: "border-orange-200",
                  },
                  {
                    label: "Document Expiry",
                    value: stats.documentExpiry,
                    icon: <MdDescription size={20} className="text-teal-600" />,
                    suffix: " Expiring",
                    onClick: () => handleFeatureClick("Document Expiry Tracking"),
                    bgColor: "bg-teal-50",
                    borderColor: "border-teal-200",
                  },
                ].map((card, index) => (
                  <motion.div
                    key={index}
                    className={`${card.bgColor} ${card.borderColor} p-4 lg:p-6 rounded-lg border hover:shadow-md transition-all cursor-pointer transform hover:scale-105`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    onClick={card.onClick}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-gray-700 text-xs lg:text-sm font-medium">{card.label}</div>
                      {card.icon}
                    </div>
                    <div className="text-xl lg:text-2xl font-bold text-gray-900">
                      <AnimatedCounter value={card.value} suffix={card.suffix || ""} />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Upcoming Features Section - Fixed */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mt-6 lg:mt-8">
                {/* Recent E-Challans - Coming Soon Feature */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 lg:p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <MdWarning className="mr-2 text-orange-500" /> Recent E-Challans
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <FaClock className="mr-1" size={10} />
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Track and manage e-challans from M-Parivahan system</p>
                  </div>
                  <div className="p-4 lg:p-6">
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center mb-4">
                        <MdWarning className="text-orange-600 text-2xl" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">E-Challan Integration</h4>
                      <p className="text-gray-600 text-sm mb-4">
                        Automatically fetch and track e-challans from the M-Parivahan system for all your vehicles.
                      </p>
                      <button
                        onClick={() => handleFeatureClick("E-Challan Management")}
                        className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>

                {/* Recent FastTag Payments - Coming Soon Feature */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-4 lg:p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <MdPayment className="mr-2 text-indigo-500" /> Recent FastTag Payments
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <FaClock className="mr-1" size={10} />
                        Coming Soon
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Monitor FastTag transactions and toll payments</p>
                  </div>
                  <div className="p-4 lg:p-6">
                    <div className="text-center py-8">
                      <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center mb-4">
                        <MdPayment className="text-indigo-600 text-2xl" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">FastTag Integration</h4>
                      <p className="text-gray-600 text-sm mb-4">
                        Real-time tracking of FastTag payments and toll transactions across all your vehicles.
                      </p>
                      <button
                        onClick={() => handleFeatureClick("FastTag Payments")}
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {isDriverModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              onClick={() => setIsDriverModel(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <AddDriver isOpen={isAddDriverModalOpen} onClose={() => setIsAddDriverModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard