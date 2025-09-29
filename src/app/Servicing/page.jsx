// "use client"
// import { useState, useEffect, useMemo, useCallback } from "react"
// import Sidebar from "../slidebar/page"
// import axios from "axios"
// import { motion } from "framer-motion"
// import baseURL from "@/utils/api"
// import { useRouter } from "next/navigation"

// const AccessDeniedModal = () => {
//   const router = useRouter()
//   const handleClose = () => {
//     router.push("/")
//   }
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
//       <div className="bg-white text-black p-8 rounded-lg shadow-lg max-w-sm w-full">
//         <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
//         <p className="mb-6">Your access has been restricted. Please contact the administrator.</p>
//         <button onClick={handleClose} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
//           Close
//         </button>
//       </div>
//     </div>
//   )
// }

// export default function CabService() {
//   const router = useRouter()
//   const [showAccessDenied, setShowAccessDenied] = useState(false)
//   const [drivers, setDrivers] = useState([])
//   const [assignments, setAssignments] = useState([])
//   const [services, setServices] = useState([])
//   const [selectedDriver, setSelectedDriver] = useState("")
//   const [selectedCab, setSelectedCab] = useState("")
//   const [receiptImage, setReceiptImage] = useState("")
//   const [showAssignModal, setShowAssignModal] = useState(false)
//   const [showReceiptModal, setShowReceiptModal] = useState(false)
//   const [loading, setLoading] = useState(false)

//   const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
//   const assignedBy = typeof window !== "undefined" ? localStorage.getItem("id") : null

//   const mergedServices = useMemo(() => {
//     return services.map((service) => {
//       const assignment = assignments.find((a) => a.cab?._id === service.cab?._id)
//       let serviceDriver = service.driver
//       if (!serviceDriver || typeof serviceDriver === "string") {
//         const driverId = service.driver || service.driverId
//         serviceDriver = drivers.find((d) => d._id === driverId) || assignment?.driver
//       }
//       return {
//         ...service,
//         cab: service.cab || assignment?.cab,
//         driver: serviceDriver,
//       }
//     })
//   }, [services, assignments, drivers])

//   const checkUserStatus = useCallback(async () => {
//     try {
//       const id = localStorage.getItem("id")
//       if (!id) return router.push("/")
//       const { data } = await axios.get(`${baseURL}api/admin/getAllSubAdmins`)
//       const loggedInUser = data.subAdmins.find((e) => e._id === id)
//       if (loggedInUser?.status === "Inactive") {
//         localStorage.clear()
//         setShowAccessDenied(true)
//       }
//     } catch (err) {
//       console.error("Error checking user status:", err)
//     }
//   }, [router])

//   useEffect(() => {
//     checkUserStatus()
//   }, [checkUserStatus])

//   const fetchInitialData = useCallback(async () => {
//     setLoading(true)
//     try {
//       const [driversRes, assignmentsRes, servicesRes] = await Promise.all([
//         axios.get(`${baseURL}api/driver/profile`, { headers: { Authorization: `Bearer ${token}` } }),
//         axios.get(`${baseURL}api/assigncab`, { headers: { Authorization: `Bearer ${token}` } }),
//         axios.get(`${baseURL}api/servicing`, { headers: { Authorization: `Bearer ${token}` } }),
//       ])
//       setDrivers(driversRes.data)
//       setAssignments(assignmentsRes.data)
//       setServices(servicesRes.data.services || [])
//     } catch (error) {
//       console.error("Error fetching:", error)
//     } finally {
//       setLoading(false)
//     }
//   }, [token])

//   useEffect(() => {
//     fetchInitialData()
//   }, [fetchInitialData])

//   const calculateKmTravelled = useCallback((assignment) => {
//     const meterReadings =
//       assignment?.tripDetails?.vehicleServicing?.meter || assignment?.vehicleServicing?.meter || assignment?.meter
//     if (!meterReadings || (Array.isArray(meterReadings) && meterReadings.length === 0)) return 0
//     if (Array.isArray(meterReadings)) {
//       return meterReadings.reduce((sum, val) => sum + (Number(val) || 0), 0)
//     }
//     return Number(meterReadings) || 0
//   }, [])

//   const getAvailableCabs = useCallback(() => {
//     const cabMap = new Map()
//     assignments.forEach((assignment) => {
//       if (assignment.cab && assignment.cab._id) {
//         const cabId = assignment.cab._id
//         const km = calculateKmTravelled(assignment)
//         if (km > 0 && (!cabMap.has(cabId) || cabMap.get(cabId).kmTravelled < km)) {
//           cabMap.set(cabId, { ...assignment.cab, kmTravelled: km })
//         }
//       }
//     })
//     return Array.from(cabMap.values()).filter(
//       (cab) => cab.kmTravelled > 10000 && !services.some((s) => s.cab?._id === cab._id && s.status !== "completed"),
//     )
//   }, [assignments, calculateKmTravelled, services])

//   const getAvailableDrivers = useCallback(() => {
//     const usedDriverIds = new Set(
//       services
//         .filter((s) => s.status !== "completed")
//         .map((s) => s.driver?._id || s.driver)
//         .filter(Boolean),
//     )
//     return drivers.filter((d) => !usedDriverIds.has(d._id))
//   }, [services, drivers])

//   const handleAssignServicing = async () => {
//     if (!selectedCab || !selectedDriver) return alert("Please select both cab and driver.")
//     setLoading(true)
//     try {
//       await axios.post(
//         `${baseURL}api/servicing/assign`,
//         {
//           cabId: selectedCab,
//           driverId: selectedDriver,
//           assignedBy,
//           serviceDate: new Date().toISOString(),
//         },
//         { headers: { Authorization: `Bearer ${token}` } },
//       )
//       alert("Servicing assigned successfully")
//       setShowAssignModal(false)
//       setSelectedCab("")
//       setSelectedDriver("")
//       await fetchInitialData()
//     } catch (err) {
//       console.error("Assign error:", err)
//       alert(err.response?.data?.error || "Failed to assign servicing.")
//     } finally {
//       setLoading(false)
//     }
//   }

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
//       <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.pending}`}>
//         {statusText[status] || "Upcoming"}
//       </span>
//     )
//   }

//   if (loading) {
//     return (
//       <div className="flex bg-gray-50 min-h-screen">
//         <Sidebar />
//         <div className="flex-1 p-6 mt-20 sm:mt-0 md:ml-60 flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
//             <p className="text-gray-600">Loading...</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="flex bg-gray-50 min-h-screen">
//       <Sidebar />
//       <div className="flex-1 p-6 mt-20 sm:mt-0 md:ml-60">
//         {showAccessDenied && <AccessDeniedModal />}

//         {/* Header */}
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Servicing Dashboard</h1>
//             <p className="text-gray-600 mt-1">Manage vehicle servicing assignments and track maintenance</p>
//           </div>
//           <button
//             onClick={() => setShowAssignModal(true)}
//             className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
//             disabled={loading}
//           >
//             Assign Servicing
//           </button>
//         </div>

//         {/* Statistics Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Total Servicings</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">{services.length}</p>
//               </div>
//               <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
//                 <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
//                   />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Pending</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {services.filter((s) => s.status !== "completed").length}
//                 </p>
//               </div>
//               <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
//                 <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//                   />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Completed</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">
//                   {services.filter((s) => s.status === "completed").length}
//                 </p>
//               </div>
//               <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
//                 <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                 </svg>
//               </div>
//             </div>
//           </div>

//           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-medium text-gray-600">Available Cabs</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">{getAvailableCabs().length}</p>
//               </div>
//               <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
//                 <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-2a2 2 0 00-2-2H8z"
//                   />
//                 </svg>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Recent Servicing Table */}
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//           <div className="px-6 py-4 border-b border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-900">Recent Servicing</h2>
//             <p className="text-sm text-gray-600 mt-1">A log of the most recent services for your fleet.</p>
//           </div>

//           <div className="overflow-x-auto">
//             {mergedServices.length === 0 ? (
//               <div className="text-center py-12">
//                 <svg
//                   className="w-12 h-12 text-gray-400 mx-auto mb-4"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
//                   />
//                 </svg>
//                 <p className="text-gray-500 font-medium">No servicing assignments found</p>
//                 <p className="text-gray-400 text-sm mt-1">Start by assigning a service to get started</p>
//               </div>
//             ) : (
//               <table className="w-full">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Cab ID
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Service
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Driver
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Date
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Cost
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Receipt
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {mergedServices.map((service, i) => (
//                     <tr key={service._id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {service.cab?.cabNumber || "N/A"}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {service.serviceType || "General Service"}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {service.driver?.name || "N/A"}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
//                         {service.serviceDate ? new Date(service.serviceDate).toLocaleDateString() : "N/A"}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {service.servicingAmount ? `₹${service.servicingAmount.toLocaleString()}` : "N/A"}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(service.status)}</td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm">
//                         {service.receiptImage ? (
//                           <button
//                             onClick={() => {
//                               setReceiptImage(service.receiptImage)
//                               setShowReceiptModal(true)
//                             }}
//                             className="text-blue-600 hover:text-blue-800 font-medium"
//                           >
//                             View Receipt
//                           </button>
//                         ) : (
//                           <span className="text-gray-400">No receipt</span>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>

//         {/* Assign Modal */}
//         {showAssignModal && (
//           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
//             <motion.div
//               className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl"
//               initial={{ opacity: 0, scale: 0.9 }}
//               animate={{ opacity: 1, scale: 1 }}
//             >
//               <h3 className="text-lg font-bold text-gray-900 mb-4">Assign Servicing</h3>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">Select Driver:</label>
//                   <select
//                     className="w-full p-3 rounded-lg border text-black border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
//                     value={selectedDriver}
//                     onChange={(e) => setSelectedDriver(e.target.value)}
//                   >
//                     <option value="">-- Select Driver --</option>
//                     {getAvailableDrivers().map((driver) => (
//                       <option key={driver._id} value={driver._id}>
//                         {driver.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block mb-2 text-sm font-medium text-gray-700">Select Cab:</label>
//                   <select
//                     className="w-full p-3 rounded-lg border text-black border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
//                     value={selectedCab}
//                     onChange={(e) => setSelectedCab(e.target.value)}
//                   >
//                     <option value="">-- Select Cab --</option>
//                     {getAvailableCabs().map((cab) => (
//                       <option key={cab._id} value={cab._id}>
//                         {cab.cabNumber} ({cab.kmTravelled.toLocaleString()} KM)
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//               <div className="flex justify-between gap-3 mt-6">
//                 <button
//                   onClick={handleAssignServicing}
//                   disabled={loading || !selectedCab || !selectedDriver}
//                   className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed w-full transition-colors"
//                 >
//                   {loading ? "Assigning..." : "Assign"}
//                 </button>
//                 <button
//                   onClick={() => {
//                     setShowAssignModal(false)
//                     setSelectedCab("")
//                     setSelectedDriver("")
//                   }}
//                   className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium w-full transition-colors"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </motion.div>
//           </div>
//         )}

//         {/* Receipt Modal */}
//         {showReceiptModal && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//             <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
//               <h3 className="text-xl font-semibold mb-4 text-gray-900">Receipt Image</h3>
//               <div className="flex justify-center mb-4">
//                 <img
//                   src={receiptImage || "/placeholder.svg"}
//                   alt="Receipt"
//                   className="max-w-full max-h-96 object-contain rounded-lg shadow-md border border-gray-200"
//                 />
//               </div>
//               <div className="flex justify-center">
//                 <button
//                   onClick={() => setShowReceiptModal(false)}
//                   className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
"use client"
import { useState, useEffect, useMemo, useCallback } from "react"
import Sidebar from "../slidebar/page"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import baseURL from "@/utils/api"
import { useRouter } from "next/navigation"

const AccessDeniedModal = () => {
  const router = useRouter()
  const handleClose = () => {
    router.push("/")
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white text-black p-8 rounded-lg shadow-lg max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">Access Denied</h2>
        <p className="mb-6">Your access has been restricted. Please contact the administrator.</p>
        <button onClick={handleClose} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition">
          Close
        </button>
      </div>
    </div>
  )
}

export default function CabService() {
  const router = useRouter()
  const [showAccessDenied, setShowAccessDenied] = useState(false)
  // Prime from cache for instant render
  const [drivers, setDrivers] = useState(() => {
    try {
      const d = localStorage.getItem("cache:drivers")
      return d ? JSON.parse(d) : []
    } catch { return [] }
  })
  const [assignments, setAssignments] = useState(() => {
    try {
      const a = localStorage.getItem("cache:assigncab")
      const parsed = a ? JSON.parse(a) : null
      if (Array.isArray(parsed?.assignments)) return parsed.assignments
      if (Array.isArray(parsed)) return parsed
      return []
    } catch { return [] }
  })
  const [services, setServices] = useState(() => {
    try {
      const s = localStorage.getItem("cache:servicing")
      const parsed = s ? JSON.parse(s) : null
      if (Array.isArray(parsed?.services)) return parsed.services
      if (Array.isArray(parsed)) return parsed
      return []
    } catch { return [] }
  })
  const [loading, setLoading] = useState(() => {
    try { return !localStorage.getItem("cache:servicing") } catch { return true }
  })

  const [selectedDriver, setSelectedDriver] = useState("")
  const [selectedCab, setSelectedCab] = useState("")
  const [receiptImage, setReceiptImage] = useState("")
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
  const assignedBy = typeof window !== "undefined" ? localStorage.getItem("id") : null

  const mergedServices = useMemo(() => {
    return services.map((service) => {
      const cabDetail = service.CabsDetail || {}
      const driverDetail = service.Driver || {}

      // Safely calculate servicing amount
      let totalAmount = 0
      if (Array.isArray(service.servicingAmount)) {
        totalAmount = service.servicingAmount.reduce((a, b) => a + b, 0)
      }

      return {
        ...service,
        cabNumber: cabDetail.cabNumber || "N/A",
        driverName: driverDetail.name || "N/A",
        serviceType: service.servicingDetails || "General Service",
        serviceDate: service.serviceDate || service.assignedAt,
        servicingAmount: service.servicingAmount || null,
        receiptImage: service.receiptImage || null
      }
    })
  }, [services])

  const checkUserStatus = useCallback(async () => {
    try {
      const id = localStorage.getItem("id")
      if (!id) return router.push("/")
      const { data } = await axios.get(`${baseURL}api/admin/getAllSubAdmins`)
      const loggedInUser = data.subAdmins.find((e) => e.id === id)
      if (loggedInUser?.status === "Inactive") {
        localStorage.clear()
        setShowAccessDenied(true)
      }
    } catch (err) {
      console.error("Error checking user status:", err)
    }
  }, [router])

  useEffect(() => {
    checkUserStatus()
  }, [checkUserStatus])

  const fetchInitialData = useCallback(async () => {
    setLoading(true)
    try {
      const [driversRes, assignmentsRes, servicesRes] = await Promise.all([
        axios.get(`${baseURL}api/driver/profile`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseURL}api/assigncab`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${baseURL}api/servicing`, { headers: { Authorization: `Bearer ${token}` } }),
      ])

      setDrivers(driversRes.data)
      const a = assignmentsRes.data?.assignments || assignmentsRes.data || []
      const s = servicesRes.data?.services || servicesRes.data || []
      setAssignments(a)
      setServices(s)
      // recache for next instant load
      try { localStorage.setItem("cache:drivers", JSON.stringify(driversRes.data)) } catch {}
      try { localStorage.setItem("cache:assigncab", JSON.stringify(assignmentsRes.data)) } catch {}
      try { localStorage.setItem("cache:servicing", JSON.stringify(servicesRes.data)) } catch {}
    } catch (error) {
      console.error("Error fetching:", error)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchInitialData()
  }, [fetchInitialData])

  const getAvailableCabs = useCallback(() => {
    const cabMap = new Map();
    assignments.forEach((assignment) => {
      const cabDetail = assignment.CabsDetail || {};
      if (cabDetail && cabDetail.id) {
        const cabId = cabDetail.id;

        // Use either servicingKmTravelled from assignment OR calculate from servicingMeter
        let kmForServiceCheck = assignment.servicingKmTravelled || 0;

        // If kmTravelled not set, calculate from meter readings
        if (!kmForServiceCheck && Array.isArray(assignment.servicingMeter) && assignment.servicingMeter.length > 1) {
          const sortedMeters = [...assignment.servicingMeter].sort((a, b) => a - b);
          kmForServiceCheck = sortedMeters[sortedMeters.length - 1] - sortedMeters[0];
        }

        // Check if cab is eligible for servicing
        if (
          (assignment.servicingRequired || kmForServiceCheck > 10000) &&
          !services.some((s) => s.cabId === cabId && s.status !== "completed")
        ) {
          cabMap.set(cabId, {
            ...cabDetail,
            id: cabId,
            cabNumber: cabDetail.cabNumber,
            kmTravelled: kmForServiceCheck,
            servicingRequired: assignment.servicingRequired,
          });
        }
      }
    });
    return Array.from(cabMap.values());
  }, [assignments, services]);
  const getAvailableDrivers = useCallback(() => {
    const usedDriverIds = new Set(
      services
        .filter((s) => s.status !== "completed")
        .map((s) => s.driverId || (s.Driver?.id))
        .filter(Boolean),
    )
    return drivers.filter((d) => !usedDriverIds.has(d.id))
  }, [services, drivers])

  const handleAssignServicing = async () => {
    if (!selectedCab || !selectedDriver) return alert("Please select both cab and driver.")
    setLoading(true)
    try {
      const res = await axios.post(
        `${baseURL}api/servicing/assign`,
        {
          cabId: selectedCab,
          driverId: selectedDriver,
          assignedBy,
          serviceDate: new Date().toISOString(),
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      alert("Servicing assigned successfully")
      setShowAssignModal(false)
      setSelectedCab("")
      setSelectedDriver("")
      await fetchInitialData()
    } catch (err) {
      console.error("Assign error:", err)
      alert(err.response?.data?.error || "Failed to assign servicing.")
    } finally {
      setLoading(false)
    }
  }

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
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.pending}`}>
        {statusText[status] || "Upcoming"}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        <Sidebar />
        <div className="flex-1 p-6 mt-20 sm:mt-0 md:ml-60 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-6 mt-20 sm:mt-0 md:ml-60">
        {showAccessDenied && <AccessDeniedModal />}
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Servicing Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage vehicle servicing assignments and track maintenance</p>
          </div>
          <button
            onClick={() => setShowAssignModal(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
            disabled={loading}
          >
            Assign Servicing
          </button>
        </div>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Servicings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{services.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {services.filter((s) => s.status !== "completed").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {services.filter((s) => s.status === "completed").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Cabs</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{getAvailableCabs().length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-2a2 2 0 00-2-2H8z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
        {/* Recent Servicing Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Servicing</h2>
            <p className="text-sm text-gray-600 mt-1">A log of the most recent services for your fleet.</p>
          </div>
          <div className="overflow-x-auto">
            {mergedServices.length === 0 ? (
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
                <p className="text-gray-500 font-medium">No servicing assignments found</p>
                <p className="text-gray-400 text-sm mt-1">Start by assigning a service to get started</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cab ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mergedServices.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.cabNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {service.serviceType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {service.driverName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {service.serviceDate ? new Date(service.serviceDate).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {service.servicingAmount ? `₹${service.servicingAmount.toLocaleString()}` : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(service.status)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {service.receiptImage ? (
                          <button
                            onClick={() => {
                              setReceiptImage(service.receiptImage)
                              setShowReceiptModal(true)
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View Receipt
                          </button>
                        ) : (
                          <span className="text-gray-400">No receipt</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
            <motion.div
              className="bg-white p-6 rounded-lg w-full max-w-md shadow-xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Assign Servicing</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Select Driver:</label>
                  <select
                    className="w-full p-3 rounded-lg border text-black border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                    value={selectedDriver}
                    onChange={(e) => setSelectedDriver(e.target.value)}
                  >
                    <option value="">-- Select Driver --</option>
                    {getAvailableDrivers().map((driver) => (
                      <option key={driver.id} value={driver.id}>
                        {driver.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-700">Select Cab:</label>
                  <select
                    className="w-full p-3 rounded-lg border text-black border-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 focus:outline-none"
                    value={selectedCab}
                    onChange={(e) => setSelectedCab(e.target.value)}
                  >
                    <option value="">-- Select Cab --</option>
                    {getAvailableCabs().map((cab) => (
                      <option key={cab.id} value={cab.id}>
                        {cab.cabNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-between gap-3 mt-6">
                <button
                  onClick={handleAssignServicing}
                  disabled={loading || !selectedCab || !selectedDriver}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed w-full transition-colors"
                >
                  {loading ? "Assigning..." : "Assign"}
                </button>
                <button
                  onClick={() => {
                    setShowAssignModal(false)
                    setSelectedCab("")
                    setSelectedDriver("")
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-medium w-full transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
        {/* Receipt Modal */}
        {showReceiptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-auto">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Receipt Image</h3>
              <div className="flex justify-center mb-4">
                <img
                  src={receiptImage || "/placeholder.svg"}
                  alt="Receipt"
                  className="max-w-full max-h-96 object-contain rounded-lg shadow-md border border-gray-200"
                />
              </div>
              <div className="flex justify-center">
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}