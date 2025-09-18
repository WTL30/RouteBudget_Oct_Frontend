
// "use client"
// import { useState, useEffect, useRef } from "react"
// import axios from "axios"
// import Sidebar from "../slidebar/page"
// import { motion } from "framer-motion"
// import {
//   FaCar,
//   FaClipboardList,
//   FaCalendarAlt,
//   FaUpload,
//   FaPlus,
//   FaUser,
//   FaMapMarkerAlt,
//   FaRoute,
//   FaTaxi,
//   FaClock,
//   FaRoad,
//   FaDollarSign,
//   FaStickyNote,
//   FaMobileAlt ,
// } from "react-icons/fa"
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

// export default function AssignCab() {
//   const router = useRouter()
//   const [showAccessDenied, setShowAccessDenied] = useState(false)
//   const [drivers, setDrivers] = useState([])
//   const [cabs, setCabs] = useState([])
//   const [selectedDriver, setSelectedDriver] = useState("")
//   const [selectedCab, setSelectedCab] = useState("")
//   const [message, setMessage] = useState("")
//   const [loading, setLoading] = useState(true)
//   const [showAddCabForm, setShowAddCabForm] = useState(false)

//   // Trip assignment fields with added city and state
//   const [tripData, setTripData] = useState({
//     customerName: "",
//     customerPhone: "",
//     pickupLocation: "",
//     pickupCity: "",
//     pickupState: "",
//     dropLocation: "",
//     dropCity: "",
//     dropState: "",
//     tripType: "One Way",
//     vehicleType: "Sedan",
//     scheduledPickupTime: "",
//     estimatedDistance: "",
//     estimatedFare: "",
//     specialInstructions: "",
//     duration: "",
//     adminNotes: "",
//   })

//   const [cabFormData, setCabFormData] = useState({
//     cabNumber: "",
//     insuranceNumber: "",
//     insuranceExpiry: "",
//     registrationNumber: "",
//     cabImage: null,
//     addedBy: "",
//   })

//   const [cabFormErrors, setCabFormErrors] = useState({})
//   const [cabFormSuccess, setCabFormSuccess] = useState("")

//   // Refs for Google Maps Autocomplete
//   const pickupInputRef = useRef(null)
//   const dropInputRef = useRef(null)
//   const [autocompleteLoaded, setAutocompleteLoaded] = useState(false)

//   // Load Google Maps script
//   useEffect(() => {
//     const loadGoogleMaps = () => {
//       if (window.google) {
//         console.log("✅ Google Maps script already loaded")
//         setAutocompleteLoaded(true)
//         return
//       }
//       const script = document.createElement("script")
//       script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAKjmBSUJ3XR8uD10vG2ptzqLJAZnOlzqI&libraries=places`
//       script.async = true
//       script.defer = true
//       script.onload = () => {
//         console.log("✅ Google Maps script loaded successfully")
//         setAutocompleteLoaded(true)
//       }
//       script.onerror = () => {
//         console.error("❌ Failed to load Google Maps script")
//         setMessage("Failed to load location services. Please try again.")
//       }
//       document.head.appendChild(script)
//     }
//     loadGoogleMaps()
//   }, [])

//   // Initialize Google Maps Autocomplete
//   useEffect(() => {
//     if (autocompleteLoaded && pickupInputRef.current && dropInputRef.current) {
//       const pickupAutocomplete = new window.google.maps.places.Autocomplete(pickupInputRef.current, {
//         types: ["geocode"], // Changed to geocode for broader suggestions
//         componentRestrictions: { country: "in" },
//       })
//       const dropAutocomplete = new window.google.maps.places.Autocomplete(dropInputRef.current, {
//         types: ["geocode"], // Changed to geocode for broader suggestions
//         componentRestrictions: { country: "in" },
//       })

//       pickupAutocomplete.addListener("place_changed", () => {
//         const place = pickupAutocomplete.getPlace()
//         console.log("📍 Pickup Place Response:", place)
//         if (place.formatted_address) {
//           const city = place.address_components?.find((comp) =>
//             comp.types.includes("locality") || comp.types.includes("administrative_area_level_2")
//           )?.long_name || ""
//           const state = place.address_components?.find((comp) =>
//             comp.types.includes("administrative_area_level_1")
//           )?.long_name || ""
//           setTripData((prev) => ({
//             ...prev,
//             pickupLocation: place.formatted_address,
//             pickupCity: city,
//             pickupState: state,
//           }))
//           console.log(`Pickup Location: ${place.formatted_address}, City: ${city}, State: ${state}`)
//         } else {
//           console.log("⚠️ No formatted address found for pickup location")
//         }
//       })

//       dropAutocomplete.addListener("place_changed", () => {
//         const place = dropAutocomplete.getPlace()
//         console.log("📍 Drop Place Response:", place)
//         if (place.formatted_address) {
//           const city = place.address_components?.find((comp) =>
//             comp.types.includes("locality") || comp.types.includes("administrative_area_level_2")
//           )?.long_name || ""
//           const state = place.address_components?.find((comp) =>
//             comp.types.includes("administrative_area_level_1")
//           )?.long_name || ""
//           setTripData((prev) => ({
//             ...prev,
//             dropLocation: place.formatted_address,
//             dropCity: city,
//             dropState: state,
//           }))
//           console.log(`Drop Location: ${place.formatted_address}, City: ${city}, State: ${state}`)
//         } else {
//           console.log("⚠️ No formatted address found for drop location")
//         }
//       })
//     }
//   }, [autocompleteLoaded])

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const addedBy = localStorage.getItem("id") || ""
//       setCabFormData((prev) => ({ ...prev, addedBy }))
//     }
//   }, [])

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true)
//         const token = localStorage.getItem("token")
//         if (!token) return

//         const res = await axios.get(`${baseURL}api/assigncab/freeCabsAndDrivers`, {
//           headers: { Authorization: `Bearer ${token}` },
//         })

//         console.log("📊 API Response:", res.data)
//         console.log("📊 Free Drivers:", res.data.freeDrivers)
//         console.log("📊 Free Cabs:", res.data.freeCabs)

//         setDrivers(res.data.freeDrivers || [])
//         setCabs(res.data.freeCabs || [])
//       } catch (error) {
//         console.error("Error fetching data:", error)
//         setMessage("Failed to load data.")
//       } finally {
//         setLoading(false)
//       }
//     }
//     fetchData()
//   }, [cabFormSuccess])

//   const handleAssign = async () => {
//     console.log("🚀 Starting cab assignment process...")
//     console.log("Selected Driver ID:", selectedDriver)
//     console.log("Selected Cab ID:", selectedCab)
//     console.log("Trip Data:", tripData)

//     // Enhanced validation
//     if (!selectedDriver || selectedDriver === "") {
//       console.log("❌ Validation failed: No driver selected")
//       setMessage("⚠️ Please select a driver.")
//       return
//     }

//     if (!selectedCab || selectedCab === "") {
//       console.log("❌ Validation failed: No cab selected")
//       setMessage("⚠️ Please select a cab.")
//       return
//     }

//     if (!tripData.customerName.trim()) {
//       console.log("❌ Validation failed: Missing customer name")
//       setMessage("⚠️ Please enter customer name.")
//       return
//     }

//     if (!tripData.customerPhone.trim()) {
//       console.log("❌ Validation failed: Missing customer phone")
//       setMessage("⚠️ Please enter customer phone number.")
//       return
//     }

//     if (!tripData.pickupLocation.trim()) {
//       console.log("❌ Validation failed: Missing pickup location")
//       setMessage("⚠️ Please enter pickup location.")
//       return
//     }

//     if (!tripData.dropLocation.trim()) {
//       console.log("❌ Validation failed: Missing drop location")
//       setMessage("⚠️ Please enter drop location.")
//       return
//     }

//     try {
//       const token = localStorage.getItem("token")
//       const assignedBy = localStorage.getItem("id")

//       console.log("🔐 Authentication check:")
//       console.log("Token exists:", !!token)
//       console.log("Assigned By ID:", assignedBy)

//       if (!token || !assignedBy) {
//         console.log("❌ Authentication failed")
//         setMessage("⚠️ Authentication failed. Please log in again.")
//         return
//       }

//       const selectedDriverObj = drivers.find((driver) => driver.id.toString() === selectedDriver.toString())
//       const selectedCabObj = cabs.find((cab) => cab.id.toString() === selectedCab.toString())

//       console.log("🔍 Selected Driver Object:", selectedDriverObj)
//       console.log("🔍 Selected Cab Object:", selectedCabObj)

//       if (!selectedDriverObj) {
//         console.log("❌ Driver object not found")
//         console.log(
//           "Available drivers:",
//           drivers.map((d) => ({ id: d.id, name: d.name })),
//         )
//         setMessage("⚠️ Selected driver not found. Please refresh and try again.")
//         return
//       }

//       if (!selectedCabObj) {
//         console.log("❌ Cab object not found")
//         console.log(
//           "Available cabs:",
//           cabs.map((c) => ({ id: c.id, cabNumber: c.cabNumber })),
//         )
//         setMessage("⚠️ Selected cab not found. Please refresh and try again.")
//         return
//       }

//       // Updated payload with city and state
//       const payload = {
//         driverId: selectedDriverObj.id,
//         cabNumber: selectedCabObj.cabNumber,
//         assignedBy: Number.parseInt(assignedBy),
//         customerName: tripData.customerName.trim(),
//         customerPhone: tripData.customerPhone.trim(),
//         pickupLocation: tripData.pickupLocation.trim(),
//         pickupCity: tripData.pickupCity.trim(),
//         pickupState: tripData.pickupState.trim(),
//         dropLocation: tripData.dropLocation.trim(),
//         dropCity: tripData.dropCity.trim(),
//         dropState: tripData.dropState.trim(),
//         tripType: tripData.tripType,
//         vehicleType: tripData.vehicleType,
//         duration: tripData.duration ? Number.parseFloat(tripData.duration) : 0,
//         estimatedDistance: tripData.estimatedDistance ? Number.parseFloat(tripData.estimatedDistance) : 0,
//         estimatedFare: tripData.estimatedFare ? Number.parseFloat(tripData.estimatedFare) : 0,
//         scheduledPickupTime: tripData.scheduledPickupTime
//           ? new Date(tripData.scheduledPickupTime).toISOString()
//           : new Date().toISOString(),
//         specialInstructions: tripData.specialInstructions.trim() || "",
//         adminNotes: tripData.adminNotes.trim() || "",
//       }

//       console.log("📤 FINAL Payload being sent:", payload)

//       // Additional validation
//       if (!payload.driverId) {
//         console.log("❌ Driver ID is still null/undefined")
//         setMessage("⚠️ Driver ID not found. Please refresh and try again.")
//         return
//       }

//       if (!payload.cabNumber) {
//         console.log("❌ Cab number is still empty")
//         setMessage("⚠️ Cab number not found. Please refresh and try again.")
//         return
//       }

//       console.log("📡 Sending request to:", `${baseURL}api/assigncab`)

//       const response = await axios.post(`${baseURL}api/assigncab`, payload, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })

//       console.log("✅ Assignment successful!", response.data)

//       setMessage("✅ Cab assigned successfully!")

//       // Reset form
//       setSelectedDriver("")
//       setSelectedCab("")
//       setTripData({
//         customerName: "",
//         customerPhone: "",
//         pickupLocation: "",
//         pickupCity: "",
//         pickupState: "",
//         dropLocation: "",
//         dropCity: "",
//         dropState: "",
//         tripType: "One Way",
//         vehicleType: "Sedan",
//         scheduledPickupTime: "",
//         estimatedDistance: "",
//         estimatedFare: "",
//         specialInstructions: "",
//         duration: "",
//         adminNotes: "",
//       })

//       console.log("🔄 Form reset completed")
//       setTimeout(() => setMessage(""), 3000)

//       // Refresh available drivers and cabs
//       const token2 = localStorage.getItem("token")
//       const res = await axios.get(`${baseURL}api/assigncab/freeCabsAndDrivers`, {
//         headers: { Authorization: `Bearer ${token2}` },
//       })
//       setDrivers(res.data.freeDrivers || [])
//       setCabs(res.data.freeCabs || [])
//     } catch (error) {
//       console.error("❌ Assignment failed:", error.response?.data || error.message)
//       const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error assigning cab."
//       setMessage(`❌ ${errorMessage}`)
//     }
//   }

//   const handleTripDataChange = (e) => {
//     const { name, value } = e.target
//     console.log(`📝 Trip data updated - ${name}:`, value)
//     // Prevent onChange from overriding Autocomplete input
//     // if (name === "pickupLocation" && !pickupInputRef.current?.value) return
//     // if (name === "dropLocation" && !dropInputRef.current?.value) return
//     setTripData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleCabFormChange = (e) => {
//     const { name, value, files } = e.target
//     const updatedValue = name === "cabImage" ? files[0] : value
//     setCabFormData({ ...cabFormData, [name]: updatedValue })
//     setCabFormErrors({ ...cabFormErrors, [name]: "" })
//   }

//   const validateCabForm = () => {
//     const errors = {}
//     const cabNumberTrimmed = cabFormData.cabNumber.replace(/\s/g, "")
//     if (!cabNumberTrimmed) errors.cabNumber = "Cab Number is required"
//     else if (cabNumberTrimmed.length < 6 || cabNumberTrimmed.length > 12) errors.cabNumber = "Invalid Cab Number"
//     if (!cabFormData.insuranceNumber.trim()) errors.insuranceNumber = "Insurance Number is required"
//     if (!cabFormData.insuranceExpiry.trim()) errors.insuranceExpiry = "Insurance Expiry is required"
//     if (!cabFormData.registrationNumber.trim()) errors.registrationNumber = "Registration Number is required"
//     if (!cabFormData.cabImage) errors.cabImage = "Cab image is required"
//     setCabFormErrors(errors)
//     return Object.keys(errors).length === 0
//   }

//   const handleAddCabSubmit = async (e) => {
//     e.preventDefault()
//     if (!validateCabForm()) return

//     setLoading(true)
//     setCabFormSuccess("")

//     try {
//       const token = localStorage.getItem("token")
//       const formData = new FormData()
//       Object.entries(cabFormData).forEach(([key, value]) => {
//         formData.append(key, value)
//       })

//       const res = await fetch(`${baseURL}api/cabDetails/add`, {
//         method: "PATCH",
//         headers: { Authorization: `Bearer ${token}` },
//         body: formData,
//       })

//       const data = await res.json()
//       if (res.ok) {
//         setCabFormSuccess("Cab added successfully!")
//         setCabFormData({
//           cabNumber: "",
//           imei: "",  
//           insuranceNumber: "",
//           insuranceExpiry: "",
//           registrationNumber: "",
//           cabImage: null,
//           addedBy: localStorage.getItem("id") || "",
//         })
//         setTimeout(() => setShowAddCabForm(false), 1500)
//       } else {
//         setCabFormErrors({ apiError: data.error || "Cab Already Exists" })
//       }
//     } catch (error) {
//       setCabFormErrors({ apiError: "Server error, try again later" })
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     const checkUserStatus = async () => {
//       try {
//         const id = localStorage.getItem("id")
//         if (!id) return router.push("/")

//         const res = await axios.get(`${baseURL}api/admin/getAllSubAdmins`)
//         const user = res.data.subAdmins.find((e) => e._id === id)
//         if (user?.status === "Inactive") {
//           localStorage.clear()
//           setShowAccessDenied(true)
//         }
//       } catch (err) {
//         console.error("Error checking user status:", err)
//       }
//     }
//     checkUserStatus()
//   }, [router])

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
//     <motion.div
//       className="flex min-h-screen bg-gray-50"
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       transition={{ duration: 0.8 }}
//     >
//       <Sidebar />
//       <div className="flex-1 p-4 md:p-6 md:mt-0 md:ml-60 mt-20 sm:mt-0 transition-all duration-300">
//         {showAccessDenied && <AccessDeniedModal />}

//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Assign Cab</h1>
//           <p className="text-gray-600">Assign drivers to cabs and manage trip details</p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Trip Assignment Form */}
//           <motion.div
//             className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
//             initial={{ y: -50, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.8 }}
//           >
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-xl font-semibold text-gray-900">Trip Assignment</h2>
//               <button
//                 onClick={() => setShowAddCabForm(true)}
//                 className="flex items-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg transition-colors"
//               >
//                 <FaPlus className="mr-2" /> Add New Cab
//               </button>
//             </div>

//             {loading ? (
//               <div className="flex justify-center py-8">
//                 <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {/* Customer Details */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <FaUser className="inline mr-2" />
//                       Customer Name *
//                     </label>
//                     <input
//                       type="text"
//                       name="customerName"
//                       value={tripData.customerName}
//                       onChange={handleTripDataChange}
//                       className="w-full border border-gray-300 rounded-lg px-3 text-black py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                       placeholder="Enter customer name"
//                       required
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone *</label>
//                     <input
//                       type="tel"
//                       name="customerPhone"
//                       value={tripData.customerPhone}
//                       onChange={handleTripDataChange}
//                       className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                       placeholder="Enter phone number"
//                       required
//                     />
//                   </div>
//                 </div>

//                 {/* Location Details */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <FaMapMarkerAlt className="inline mr-2 text-green-500" />
//                       Pickup Location *
//                     </label>
//                     <input
//                       type="text"
//                       name="pickupLocation"
//                       ref={pickupInputRef}
//                       value={tripData.pickupLocation}
//                       onChange={handleTripDataChange}
//                       className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                       placeholder={autocompleteLoaded ? "Enter pickup location" : "Loading location services..."}
//                       disabled={!autocompleteLoaded}
//                       required
//                     />
//                     {tripData.pickupCity && tripData.pickupState && (
//                       <p className="text-xs text-gray-500 mt-1">
//                         City: {tripData.pickupCity}, State: {tripData.pickupState}
//                       </p>
//                     )}
//                     {!autocompleteLoaded && <p className="text-xs text-yellow-600 mt-1">Loading location suggestions...</p>}
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <FaMapMarkerAlt className="inline mr-2 text-red-500" />
//                       Drop Location *
//                     </label>
//                     <input
//                       type="text"
//                       name="dropLocation"
//                       ref={dropInputRef}
//                       value={tripData.dropLocation}
//                       onChange={handleTripDataChange}
//                       className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                       placeholder={autocompleteLoaded ? "Enter drop location" : "Loading location services..."}
//                       disabled={!autocompleteLoaded}
//                       required
//                     />
//                     {tripData.dropCity && tripData.dropState && (
//                       <p className="text-xs text-gray-500 mt-1">
//                         City: {tripData.dropCity}, State: {tripData.dropState}
//                       </p>
//                     )}
//                     {!autocompleteLoaded && <p className="text-xs text-yellow-600 mt-1">Loading location suggestions...</p>}
//                   </div>
//                 </div>

//                 {/* Trip Type and Vehicle Type */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <FaRoute className="inline mr-2" />
//                       Trip Type
//                     </label>
//                     <select
//                       name="tripType"
//                       value={tripData.tripType}
//                       onChange={handleTripDataChange}
//                       className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                     >
//                       <option value="One Way">One Way</option>
//                       <option value="Round Trip">Round Trip</option>
//                       <option value="Hourly">Hourly</option>
//                       <option value="Daily">Daily</option>
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <FaTaxi className="inline mr-2" />
//                       Vehicle Type
//                     </label>
//                     <select
//                       name="vehicleType"
//                       value={tripData.vehicleType}
//                       onChange={handleTripDataChange}
//                       className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                     >
//                       <option value="Sedan">Sedan</option>
//                       <option value="SUV">SUV</option>
//                       <option value="Hatchback">Hatchback</option>
//                       <option value="Luxury">Luxury</option>
//                     </select>
//                   </div>
//                 </div>

//                 {/* Scheduled Time and Trip Details */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <FaClock className="inline mr-2" />
//                       Scheduled Pickup Time
//                     </label>
//                     <input
//                       type="datetime-local"
//                       name="scheduledPickupTime"
//                       value={tripData.scheduledPickupTime}
//                       onChange={handleTripDataChange}
//                       className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <FaRoad className="inline mr-2" />
//                       Estimated Distance (km)
//                     </label>
//                     <input
//                       type="number"
//                       name="estimatedDistance"
//                       value={tripData.estimatedDistance}
//                       onChange={handleTripDataChange}
//                       className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                       placeholder="Enter distance in km"
//                       min="0"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <FaDollarSign className="inline mr-2" />
//                       Estimated Fare
//                     </label>
//                     <input
//                       type="number"
//                       name="estimatedFare"
//                       value={tripData.estimatedFare}
//                       onChange={handleTripDataChange}
//                       className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                       placeholder="Enter estimated fare"
//                       min="0"
//                       step="0.01"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <FaClock className="inline mr-2" />
//                       Duration (hours)
//                     </label>
//                     <input
//                       type="number"
//                       name="duration"
//                       value={tripData.duration}
//                       onChange={handleTripDataChange}
//                       className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                       placeholder="Enter trip duration in hours"
//                       min="0"
//                     />
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <FaStickyNote className="inline mr-2" />
//                       Special Instructions
//                     </label>
//                     <input
//                       type="text"
//                       name="specialInstructions"
//                       value={tripData.specialInstructions}
//                       onChange={handleTripDataChange}
//                       className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                       placeholder="Any special instructions"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                       <FaStickyNote className="inline mr-2" />
//                       Admin Notes
//                     </label>
//                     <input
//                       type="text"
//                       name="adminNotes"
//                       value={tripData.adminNotes}
//                       onChange={handleTripDataChange}
//                       className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                       placeholder="Admin notes (optional)"
//                     />
//                   </div>
//                 </div>

//                 {/* Driver and Cab Selection */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Select Driver *</label>
//                     <select
//                       className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                       value={selectedDriver}
//                       onChange={(e) => {
//                         const driverId = e.target.value
//                         console.log("🚗 Driver selected - Raw value:", driverId)
//                         const driverObj = drivers.find((driver) => driver.id.toString() === driverId.toString())
//                         console.log("🚗 Driver object found:", driverObj)
//                         setSelectedDriver(driverId)
//                       }}
//                       required
//                     >
//                       <option value="">Choose a driver</option>
//                       {drivers.length > 0 ? (
//                         drivers.map((driver) => (
//                           <option key={driver.id} value={driver.id}>
//                             {driver.name} - {driver.licenseNumber}
//                           </option>
//                         ))
//                       ) : (
//                         <option disabled>No drivers available</option>
//                       )}
//                     </select>
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Select Cab *</label>
//                     <select
//                       className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                       value={selectedCab}
//                       onChange={(e) => {
//                         const cabId = e.target.value
//                         console.log("🚕 Cab selected - Raw value:", cabId)
//                         const cabObj = cabs.find((cab) => cab.id.toString() === cabId.toString())
//                         console.log("🚕 Cab object found:", cabObj)
//                         setSelectedCab(cabId)
//                       }}
//                       required
//                     >
//                       <option value="">Choose a cab</option>
//                       {cabs.length > 0 ? (
//                         cabs.map((cab) => (
//                           <option key={cab.id} value={cab.id}>
//                             {cab.cabNumber} - {cab.model || ""}
//                           </option>
//                         ))
//                       ) : (
//                         <option disabled>No cabs available</option>
//                       )}
//                     </select>
//                   </div>
//                 </div>

//                 <button
//                   onClick={handleAssign}
//                   className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-300 font-medium"
//                 >
//                   Assign Cab & Create Trip
//                 </button>

//                 {message && (
//                   <motion.p
//                     className={`mt-4 text-center font-medium text-sm md:text-base ${
//                       message.startsWith("✅")
//                         ? "text-green-600"
//                         : message.startsWith("⚠️")
//                           ? "text-yellow-600"
//                           : "text-red-600"
//                     }`}
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                   >
//                     {message}
//                   </motion.p>
//                 )}
//               </div>
//             )}
//           </motion.div>

//           {/* Quick Stats */}
//           <motion.div
//             className="space-y-4"
//             initial={{ y: -50, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ duration: 0.8, delay: 0.2 }}
//           >
//             <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Resources</h3>
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-yellow-600">{drivers.length}</div>
//                   <div className="text-sm text-gray-600">Free Drivers</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-yellow-600">{cabs.length}</div>
//                   <div className="text-sm text-gray-600">Free Cabs</div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Types</h3>
//               <div className="space-y-2 text-sm text-gray-600">
//                 <div className="flex justify-between">
//                   <span>One Way</span>
//                   <span>Single destination</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Round Trip</span>
//                   <span>Return journey</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Hourly</span>
//                   <span>Time-based booking</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Daily</span>
//                   <span>Full day rental</span>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         </div>
//       </div>

//       {/* Add Cab Modal */}
//       {showAddCabForm && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <motion.div
//             className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
//             initial={{ scale: 0.9, opacity: 0 }}
//             animate={{ scale: 1, opacity: 1 }}
//             exit={{ scale: 0.9, opacity: 0 }}
//           >
//             <div className="flex justify-between items-center mb-4">
//               <h3 className="text-xl font-bold text-gray-900">Add New Cab</h3>
//               <button
//                 onClick={() => {
//                   setShowAddCabForm(false)
//                   setCabFormErrors({})
//                   setCabFormSuccess("")
//                 }}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 ✕
//               </button>
//             </div>

//             {cabFormSuccess && <p className="text-green-600 text-center mb-4">{cabFormSuccess}</p>}

//             <form onSubmit={handleAddCabSubmit} encType="multipart/form-data">
//               {[
//                 { name: "cabNumber", icon: <FaCar />, placeholder: "Cab Number" },
//                 { name: "imei", icon: <FaMobileAlt />, placeholder: "IMEI Number" },   // <-- NEW
//                 { name: "insuranceNumber", icon: <FaClipboardList />, placeholder: "Insurance Number" },
//                 {name: "insuranceExpiry",icon: <FaCalendarAlt />,placeholder: "Insurance Expiry Date",type: "date",},
//                 { name: "registrationNumber", icon: <FaClipboardList />, placeholder: "Registration Number" },
//               ].map(({ name, icon, placeholder, type = "text" }, index) => (
//                 <div key={index} className="relative mt-4">
//                   <div className="absolute left-3 top-3 text-gray-400">{icon}</div>
//                   <input
//                     type={type}
//                     name={name}
//                     placeholder={placeholder}
//                     min={name === "insuranceExpiry" ? new Date().toISOString().split("T")[0] : undefined}
//                     className="w-full bg-gray-50 text-gray-900 pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                     onChange={handleCabFormChange}
//                     value={cabFormData[name]}
//                   />
//                   {cabFormErrors[name] && <p className="text-red-500 text-sm mt-1">{cabFormErrors[name]}</p>}
//                 </div>
//               ))}

//               <div className="relative mt-4">
//                 <FaUpload className="absolute left-3 top-3 text-gray-400" />
//                 <input
//                   type="file"
//                   name="cabImage"
//                   accept="image/*"
//                   className="w-full bg-gray-50 text-gray-900 p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
//                   onChange={handleCabFormChange}
//                 />
//                 {cabFormErrors.cabImage && <p className="text-red-500 text-sm mt-1">{cabFormErrors.cabImage}</p>}
//               </div>

//               {cabFormErrors.apiError && <p className="text-red-500 text-sm mt-4">{cabFormErrors.apiError}</p>}

//               <button
//                 type="submit"
//                 className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg mt-4 font-medium transition-colors"
//                 disabled={loading}
//               >
//                 {loading ? "Adding..." : "Add Cab"}
//               </button>
//             </form>
//           </motion.div>
//         </div>
//       )}
//     </motion.div>
//   )
// }




"use client"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import Sidebar from "../slidebar/page"
import { motion } from "framer-motion"
import {
  FaCar,
  FaClipboardList,
  FaCalendarAlt,
  FaUpload,
  FaPlus,
  FaUser,
  FaMapMarkerAlt,
  FaRoute,
  FaTaxi,
  FaClock,
  FaRoad,
  FaDollarSign,
  FaStickyNote,
  FaMobileAlt,
} from "react-icons/fa"
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

export default function AssignCab() {
  const router = useRouter()
  const [showAccessDenied, setShowAccessDenied] = useState(false)
  const [drivers, setDrivers] = useState([])
  const [cabs, setCabs] = useState([])
  const [selectedDriver, setSelectedDriver] = useState("")
  const [selectedCab, setSelectedCab] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [showAddCabForm, setShowAddCabForm] = useState(false)

  // Trip assignment fields with added city and state
  const [tripData, setTripData] = useState({
    customerName: "",
    customerPhone: "",
    pickupLocation: "",
    pickupCity: "",
    pickupState: "",
    dropLocation: "",
    dropCity: "",
    dropState: "",
    tripType: "One Way",
    vehicleType: "Sedan",
    scheduledPickupTime: "",
    estimatedDistance: "",
    estimatedFare: "",
    specialInstructions: "",
    duration: "",
    adminNotes: "",
  })

  const [cabFormData, setCabFormData] = useState({
    cabNumber: "",
    insuranceNumber: "",
    insuranceExpiry: "",
    registrationNumber: "",
    cabImage: null,
    addedBy: "",
  })

  const [cabFormErrors, setCabFormErrors] = useState({})
  const [cabFormSuccess, setCabFormSuccess] = useState("")

  // Refs for Google Maps Autocomplete
  const pickupInputRef = useRef(null)
  const dropInputRef = useRef(null)
  const [autocompleteLoaded, setAutocompleteLoaded] = useState(false)

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        console.log("✅ Google Maps script already loaded")
        setAutocompleteLoaded(true)
        return
      }
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAKjmBSUJ3XR8uD10vG2ptzqLJAZnOlzqI&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        console.log("✅ Google Maps script loaded successfully")
        setAutocompleteLoaded(true)
      }
      script.onerror = () => {
        console.error("❌ Failed to load Google Maps script")
        setMessage("Failed to load location services. Please try again.")
      }
      document.head.appendChild(script)
    }
    loadGoogleMaps()
  }, [])

  // Initialize Google Maps Autocomplete
  useEffect(() => {
    if (autocompleteLoaded && pickupInputRef.current && dropInputRef.current) {
      const pickupAutocomplete = new window.google.maps.places.Autocomplete(pickupInputRef.current, {
        types: ["geocode"], // Changed to geocode for broader suggestions
        componentRestrictions: { country: "in" },
      })
      const dropAutocomplete = new window.google.maps.places.Autocomplete(dropInputRef.current, {
        types: ["geocode"], // Changed to geocode for broader suggestions
        componentRestrictions: { country: "in" },
      })

      pickupAutocomplete.addListener("place_changed", () => {
        const place = pickupAutocomplete.getPlace()
        console.log("📍 Pickup Place Response:", place)
        if (place.formatted_address) {
          const city = place.address_components?.find((comp) =>
            comp.types.includes("locality") || comp.types.includes("administrative_area_level_2")
          )?.long_name || ""
          const state = place.address_components?.find((comp) =>
            comp.types.includes("administrative_area_level_1")
          )?.long_name || ""
          setTripData((prev) => ({
            ...prev,
            pickupLocation: place.formatted_address,
            pickupCity: city,
            pickupState: state,
          }))
          console.log(`Pickup Location: ${place.formatted_address}, City: ${city}, State: ${state}`)
        } else {
          console.log("⚠️ No formatted address found for pickup location")
        }
      })

      dropAutocomplete.addListener("place_changed", () => {
        const place = dropAutocomplete.getPlace()
        console.log("📍 Drop Place Response:", place)
        if (place.formatted_address) {
          const city = place.address_components?.find((comp) =>
            comp.types.includes("locality") || comp.types.includes("administrative_area_level_2")
          )?.long_name || ""
          const state = place.address_components?.find((comp) =>
            comp.types.includes("administrative_area_level_1")
          )?.long_name || ""
          setTripData((prev) => ({
            ...prev,
            dropLocation: place.formatted_address,
            dropCity: city,
            dropState: state,
          }))
          console.log(`Drop Location: ${place.formatted_address}, City: ${city}, State: ${state}`)
        } else {
          console.log("⚠️ No formatted address found for drop location")
        }
      })
    }
  }, [autocompleteLoaded])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const addedBy = localStorage.getItem("id") || ""
      setCabFormData((prev) => ({ ...prev, addedBy }))
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        if (!token) return

        const res = await axios.get(`${baseURL}api/assigncab/freeCabsAndDrivers`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log("📊 API Response:", res.data)
        console.log("📊 Free Drivers:", res.data.freeDrivers)
        console.log("📊 Free Cabs:", res.data.freeCabs)

        setDrivers(res.data.freeDrivers || [])
        setCabs(res.data.freeCabs || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        setMessage("Failed to load data.")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [cabFormSuccess])

  const handleAssign = async () => {
    console.log("🚀 Starting cab assignment process...")
    console.log("Selected Driver ID:", selectedDriver)
    console.log("Selected Cab ID:", selectedCab)
    console.log("Trip Data:", tripData)

    // Enhanced validation
    if (!selectedDriver || selectedDriver === "") {
      console.log("❌ Validation failed: No driver selected")
      setMessage("⚠️ Please select a driver.")
      return
    }

    if (!selectedCab || selectedCab === "") {
      console.log("❌ Validation failed: No cab selected")
      setMessage("⚠️ Please select a cab.")
      return
    }

    if (!tripData.customerName.trim()) {
      console.log("❌ Validation failed: Missing customer name")
      setMessage("⚠️ Please enter customer name.")
      return
    }

    if (!tripData.customerPhone.trim()) {
      console.log("❌ Validation failed: Missing customer phone")
      setMessage("⚠️ Please enter customer phone number.")
      return
    }

    if (!tripData.pickupLocation.trim()) {
      console.log("❌ Validation failed: Missing pickup location")
      setMessage("⚠️ Please enter pickup location.")
      return
    }

    if (!tripData.dropLocation.trim()) {
      console.log("❌ Validation failed: Missing drop location")
      setMessage("⚠️ Please enter drop location.")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const assignedBy = localStorage.getItem("id")

      console.log("🔐 Authentication check:")
      console.log("Token exists:", !!token)
      console.log("Assigned By ID:", assignedBy)

      if (!token || !assignedBy) {
        console.log("❌ Authentication failed")
        setMessage("⚠️ Authentication failed. Please log in again.")
        return
      }

      const selectedDriverObj = drivers.find((driver) => driver.id.toString() === selectedDriver.toString())
      const selectedCabObj = cabs.find((cab) => cab.id.toString() === selectedCab.toString())

      console.log("🔍 Selected Driver Object:", selectedDriverObj)
      console.log("🔍 Selected Cab Object:", selectedCabObj)

      if (!selectedDriverObj) {
        console.log("❌ Driver object not found")
        console.log(
          "Available drivers:",
          drivers.map((d) => ({ id: d.id, name: d.name })),
        )
        setMessage("⚠️ Selected driver not found. Please refresh and try again.")
        return
      }

      if (!selectedCabObj) {
        console.log("❌ Cab object not found")
        console.log(
          "Available cabs:",
          cabs.map((c) => ({ id: c.id, cabNumber: c.cabNumber })),
        )
        setMessage("⚠️ Selected cab not found. Please refresh and try again.")
        return
      }

      // Updated payload with city and state
      const payload = {
        driverId: selectedDriverObj.id,
        cabNumber: selectedCabObj.cabNumber,
        assignedBy: Number.parseInt(assignedBy),
        customerName: tripData.customerName.trim(),
        customerPhone: tripData.customerPhone.trim(),
        pickupLocation: tripData.pickupLocation.trim(),
        pickupCity: tripData.pickupCity.trim(),
        pickupState: tripData.pickupState.trim(),
        dropLocation: tripData.dropLocation.trim(),
        dropCity: tripData.dropCity.trim(),
        dropState: tripData.dropState.trim(),
        tripType: tripData.tripType,
        vehicleType: tripData.vehicleType,
        duration: tripData.duration ? Number.parseFloat(tripData.duration) : 0,
        estimatedDistance: tripData.estimatedDistance ? Number.parseFloat(tripData.estimatedDistance) : 0,
        estimatedFare: tripData.estimatedFare ? Number.parseFloat(tripData.estimatedFare) : 0,
        scheduledPickupTime: tripData.scheduledPickupTime
          ? new Date(tripData.scheduledPickupTime).toISOString()
          : new Date().toISOString(),
        specialInstructions: tripData.specialInstructions.trim() || "",
        adminNotes: tripData.adminNotes.trim() || "",
      }

      console.log("📤 FINAL Payload being sent:", payload)

      // Additional validation
      if (!payload.driverId) {
        console.log("❌ Driver ID is still null/undefined")
        setMessage("⚠️ Driver ID not found. Please refresh and try again.")
        return
      }

      if (!payload.cabNumber) {
        console.log("❌ Cab number is still empty")
        setMessage("⚠️ Cab number not found. Please refresh and try again.")
        return
      }

      console.log("📡 Sending request to:", `${baseURL}api/assigncab`)

      const response = await axios.post(`${baseURL}api/assigncab`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("✅ Assignment successful!", response.data)

      setMessage("✅ Cab assigned successfully!")

      // Reset form
      setSelectedDriver("")
      setSelectedCab("")
      setTripData({
        customerName: "",
        customerPhone: "",
        pickupLocation: "",
        pickupCity: "",
        pickupState: "",
        dropLocation: "",
        dropCity: "",
        dropState: "",
        tripType: "One Way",
        vehicleType: "Sedan",
        scheduledPickupTime: "",
        estimatedDistance: "",
        estimatedFare: "",
        specialInstructions: "",
        duration: "",
        adminNotes: "",
      })

      console.log("🔄 Form reset completed")
      setTimeout(() => setMessage(""), 3000)

      // Refresh available drivers and cabs
      const token2 = localStorage.getItem("token")
      const res = await axios.get(`${baseURL}api/assigncab/freeCabsAndDrivers`, {
        headers: { Authorization: `Bearer ${token2}` },
      })
      setDrivers(res.data.freeDrivers || [])
      setCabs(res.data.freeCabs || [])
    } catch (error) {
      console.error("❌ Assignment failed:", error.response?.data || error.message)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || "Error assigning cab."
      setMessage(`❌ ${errorMessage}`)
    }
  }

  const handleTripDataChange = (e) => {
    const { name, value } = e.target
    console.log(`📝 Trip data updated - ${name}:`, value)
    // Prevent onChange from overriding Autocomplete input
    // if (name === "pickupLocation" && !pickupInputRef.current?.value) return
    // if (name === "dropLocation" && !dropInputRef.current?.value) return
    setTripData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCabFormChange = (e) => {
    const { name, value, files } = e.target
    const updatedValue = name === "cabImage" ? files[0] : value
    setCabFormData({ ...cabFormData, [name]: updatedValue })
    setCabFormErrors({ ...cabFormErrors, [name]: "" })
  }

  const validateCabForm = () => {
    const errors = {}
    const cabNumberTrimmed = cabFormData.cabNumber.replace(/\s/g, "")
    if (!cabNumberTrimmed) errors.cabNumber = "Cab Number is required"
    else if (cabNumberTrimmed.length < 6 || cabNumberTrimmed.length > 12) errors.cabNumber = "Invalid Cab Number"
    if (!cabFormData.insuranceNumber.trim()) errors.insuranceNumber = "Insurance Number is required"
    if (!cabFormData.insuranceExpiry.trim()) errors.insuranceExpiry = "Insurance Expiry is required"
    if (!cabFormData.registrationNumber.trim()) errors.registrationNumber = "Registration Number is required"
    if (!cabFormData.cabImage) errors.cabImage = "Cab image is required"
    setCabFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // const handleAddCabSubmit = async (e) => {
  //   e.preventDefault()
  //   if (!validateCabForm()) return

  //   setLoading(true)
  //   setCabFormSuccess("")

  //   try {
  //     const token = localStorage.getItem("token")
  //     const formData = new FormData()
  //     Object.entries(cabFormData).forEach(([key, value]) => {
  //       formData.append(key, value)
  //     })

  //     const res = await fetch(`${baseURL}api/cabDetails/add`, {
  //       method: "PATCH",
  //       headers: { Authorization: `Bearer ${token}` },
  //       body: formData,
  //     })

  //     const data = await res.json()
  //     if (res.ok) {
  //       setCabFormSuccess("Cab added successfully!")
  //       setCabFormData({
  //         cabNumber: "",
  //         imei: "",  
  //         insuranceNumber: "",
  //         insuranceExpiry: "",
  //         registrationNumber: "",
  //         cabImage: null,
  //         addedBy: localStorage.getItem("id") || "",
  //       })
  //       setTimeout(() => setShowAddCabForm(false), 1500)
  //     } else {
  //       setCabFormErrors({ apiError: data.error || "Cab Already Exists" })
  //     }
  //   } catch (error) {
  //     setCabFormErrors({ apiError: "Server error, try again later" })
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const handleAddCabSubmit = async (e) => {
    e.preventDefault();
    if (!validateCabForm()) return;

    setLoading(true);
    setCabFormSuccess("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      Object.entries(cabFormData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const res = await fetch(`${baseURL}api/cabDetails/add`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setCabFormSuccess("Cab added successfully!");
        setCabFormData({
          cabNumber: "",
          imei: "",
          insuranceNumber: "",
          insuranceExpiry: "",
          registrationNumber: "",
          cabImage: null,
          addedBy: localStorage.getItem("id") || "",
        });
        setTimeout(() => setShowAddCabForm(false), 1500);
      } else {
        // Handle specific error cases from backend
        if (res.status === 403) {
          // Show the exact error message from backend
          setCabFormErrors({ apiError: data.message || "Access denied" });
        } else if (res.status === 400) {
          setCabFormErrors({ apiError: data.message || "Cab Already Exists" });
        } else {
          setCabFormErrors({ apiError: data.error || "Failed to add cab" });
        }
      }
    } catch (error) {
      setCabFormErrors({ apiError: "Server error, try again later" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const id = localStorage.getItem("id")
        if (!id) return router.push("/")

        const res = await axios.get(`${baseURL}api/admin/getAllSubAdmins`)
        const user = res.data.subAdmins.find((e) => e._id === id)
        if (user?.status === "Inactive") {
          localStorage.clear()
          setShowAccessDenied(true)
        }
      } catch (err) {
        console.error("Error checking user status:", err)
      }
    }
    checkUserStatus()
  }, [router])

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
    <motion.div
      className="flex min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 md:mt-0 md:ml-60 mt-20 sm:mt-0 transition-all duration-300">
        {showAccessDenied && <AccessDeniedModal />}

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Assign Cab</h1>
          <p className="text-gray-600">Assign drivers to cabs and manage trip details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trip Assignment Form */}
          <motion.div
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Trip Assignment</h2>
              <button
                onClick={() => setShowAddCabForm(true)}
                className="flex items-center text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <FaPlus className="mr-2" /> Add New Cab
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaUser className="inline mr-2" />
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={tripData.customerName}
                      onChange={handleTripDataChange}
                      className="w-full border border-gray-300 rounded-lg px-3 text-black py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Enter customer name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone *</label>
                    <input
                      type="tel"
                      name="customerPhone"
                      value={tripData.customerPhone}
                      onChange={handleTripDataChange}
                      className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>
                </div>

                {/* Location Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline mr-2 text-green-500" />
                      Pickup Location *
                    </label>
                    <input
                      type="text"
                      name="pickupLocation"
                      ref={pickupInputRef}
                      value={tripData.pickupLocation}
                      onChange={handleTripDataChange}
                      className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder={autocompleteLoaded ? "Enter pickup location" : "Loading location services..."}
                      disabled={!autocompleteLoaded}
                      required
                    />
                    {tripData.pickupCity && tripData.pickupState && (
                      <p className="text-xs text-gray-500 mt-1">
                        City: {tripData.pickupCity}, State: {tripData.pickupState}
                      </p>
                    )}
                    {!autocompleteLoaded && <p className="text-xs text-yellow-600 mt-1">Loading location suggestions...</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaMapMarkerAlt className="inline mr-2 text-red-500" />
                      Drop Location *
                    </label>
                    <input
                      type="text"
                      name="dropLocation"
                      ref={dropInputRef}
                      value={tripData.dropLocation}
                      onChange={handleTripDataChange}
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder={autocompleteLoaded ? "Enter drop location" : "Loading location services..."}
                      disabled={!autocompleteLoaded}
                      required
                    />
                    {tripData.dropCity && tripData.dropState && (
                      <p className="text-xs text-gray-500 mt-1">
                        City: {tripData.dropCity}, State: {tripData.dropState}
                      </p>
                    )}
                    {!autocompleteLoaded && <p className="text-xs text-yellow-600 mt-1">Loading location suggestions...</p>}
                  </div>
                </div>

                {/* Trip Type and Vehicle Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaRoute className="inline mr-2" />
                      Trip Type
                    </label>
                    <select
                      name="tripType"
                      value={tripData.tripType}
                      onChange={handleTripDataChange}
                      className="w-full border text-black border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value="One Way">One Way</option>
                      <option value="Round Trip">Round Trip</option>
                      <option value="Hourly">Hourly</option>
                      <option value="Daily">Daily</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaTaxi className="inline mr-2" />
                      Vehicle Type
                    </label>
                    <select
                      name="vehicleType"
                      value={tripData.vehicleType}
                      onChange={handleTripDataChange}
                      className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    >
                      <option value="Sedan">Sedan</option>
                      <option value="SUV">SUV</option>
                      <option value="Hatchback">Hatchback</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                  </div>
                </div>

                {/* Scheduled Time and Trip Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaClock className="inline mr-2" />
                      Scheduled Pickup Time
                    </label>
                    <input
                      type="datetime-local"
                      name="scheduledPickupTime"
                      value={tripData.scheduledPickupTime}
                      onChange={handleTripDataChange}
                      className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaRoad className="inline mr-2" />
                      Estimated Distance (km)
                    </label>
                    <input
                      type="number"
                      name="estimatedDistance"
                      value={tripData.estimatedDistance}
                      onChange={handleTripDataChange}
                      className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Enter distance in km"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaDollarSign className="inline mr-2" />
                      Estimated Fare
                    </label>
                    <input
                      type="number"
                      name="estimatedFare"
                      value={tripData.estimatedFare}
                      onChange={handleTripDataChange}
                      className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Enter estimated fare"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaClock className="inline mr-2" />
                      Duration (hours)
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={tripData.duration}
                      onChange={handleTripDataChange}
                      className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Enter trip duration in hours"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaStickyNote className="inline mr-2" />
                      Special Instructions
                    </label>
                    <input
                      type="text"
                      name="specialInstructions"
                      value={tripData.specialInstructions}
                      onChange={handleTripDataChange}
                      className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Any special instructions"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaStickyNote className="inline mr-2" />
                      Admin Notes
                    </label>
                    <input
                      type="text"
                      name="adminNotes"
                      value={tripData.adminNotes}
                      onChange={handleTripDataChange}
                      className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      placeholder="Admin notes (optional)"
                    />
                  </div>
                </div>

                {/* Driver and Cab Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Driver *</label>
                    <select
                      className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={selectedDriver}
                      onChange={(e) => {
                        const driverId = e.target.value
                        console.log("🚗 Driver selected - Raw value:", driverId)
                        const driverObj = drivers.find((driver) => driver.id.toString() === driverId.toString())
                        console.log("🚗 Driver object found:", driverObj)
                        setSelectedDriver(driverId)
                      }}
                      required
                    >
                      <option value="">Choose a driver</option>
                      {drivers.length > 0 ? (
                        drivers.map((driver) => (
                          <option key={driver.id} value={driver.id}>
                            {driver.name} - {driver.licenseNumber}
                          </option>
                        ))
                      ) : (
                        <option disabled>No drivers available</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Cab *</label>
                    <select
                      className="w-full border border-gray-300 text-black rounded-lg px-3 py-2 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      value={selectedCab}
                      onChange={(e) => {
                        const cabId = e.target.value
                        console.log("🚕 Cab selected - Raw value:", cabId)
                        const cabObj = cabs.find((cab) => cab.id.toString() === cabId.toString())
                        console.log("🚕 Cab object found:", cabObj)
                        setSelectedCab(cabId)
                      }}
                      required
                    >
                      <option value="">Choose a cab</option>
                      {cabs.length > 0 ? (
                        cabs.map((cab) => (
                          <option key={cab.id} value={cab.id}>
                            {cab.cabNumber} - {cab.model || ""}
                          </option>
                        ))
                      ) : (
                        <option disabled>No cabs available</option>
                      )}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleAssign}
                  className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-300 font-medium"
                >
                  Assign Cab & Create Trip
                </button>

                {message && (
                  <motion.p
                    className={`mt-4 text-center font-medium text-sm md:text-base ${message.startsWith("✅")
                        ? "text-green-600"
                        : message.startsWith("⚠️")
                          ? "text-yellow-600"
                          : "text-red-600"
                      }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {message}
                  </motion.p>
                )}
              </div>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            className="space-y-4"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Resources</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{drivers.length}</div>
                  <div className="text-sm text-gray-600">Free Drivers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{cabs.length}</div>
                  <div className="text-sm text-gray-600">Free Cabs</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Types</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>One Way</span>
                  <span>Single destination</span>
                </div>
                <div className="flex justify-between">
                  <span>Round Trip</span>
                  <span>Return journey</span>
                </div>
                <div className="flex justify-between">
                  <span>Hourly</span>
                  <span>Time-based booking</span>
                </div>
                <div className="flex justify-between">
                  <span>Daily</span>
                  <span>Full day rental</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Add Cab Modal */}
      {showAddCabForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add New Cab</h3>
              <button
                onClick={() => {
                  setShowAddCabForm(false)
                  setCabFormErrors({})
                  setCabFormSuccess("")
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {cabFormSuccess && <p className="text-green-600 text-center mb-4">{cabFormSuccess}</p>}

            {/* <form onSubmit={handleAddCabSubmit} encType="multipart/form-data">
              {[
                { name: "cabNumber", icon: <FaCar />, placeholder: "Cab Number" },
                { name: "imei", icon: <FaMobileAlt />, placeholder: "IMEI Number" },   // <-- NEW
                { name: "insuranceNumber", icon: <FaClipboardList />, placeholder: "Insurance Number" },
                {name: "insuranceExpiry",icon: <FaCalendarAlt />,placeholder: "Insurance Expiry Date",type: "date",},
                { name: "registrationNumber", icon: <FaClipboardList />, placeholder: "Registration Number" },
              ].map(({ name, icon, placeholder, type = "text" }, index) => (
                <div key={index} className="relative mt-4">
                  <div className="absolute left-3 top-3 text-gray-400">{icon}</div>
                  <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    min={name === "insuranceExpiry" ? new Date().toISOString().split("T")[0] : undefined}
                    className="w-full bg-gray-50 text-gray-900 pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    onChange={handleCabFormChange}
                    value={cabFormData[name]}
                  />
                  {cabFormErrors[name] && <p className="text-red-500 text-sm mt-1">{cabFormErrors[name]}</p>}
                </div>
              ))}

              <div className="relative mt-4">
                <FaUpload className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="file"
                  name="cabImage"
                  accept="image/*"
                  className="w-full bg-gray-50 text-gray-900 p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  onChange={handleCabFormChange}
                />
                {cabFormErrors.cabImage && <p className="text-red-500 text-sm mt-1">{cabFormErrors.cabImage}</p>}
              </div>

              {cabFormErrors.apiError && <p className="text-red-500 text-sm mt-4">{cabFormErrors.apiError}</p>}

              <button
                type="submit"
                className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg mt-4 font-medium transition-colors"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Cab"}
              </button>
            </form> */}

            <form onSubmit={handleAddCabSubmit} encType="multipart/form-data">
              {[
                { name: "cabNumber", icon: <FaCar />, placeholder: "Cab Number" },
                { name: "imei", icon: <FaMobileAlt />, placeholder: "IMEI Number" },
                { name: "insuranceNumber", icon: <FaClipboardList />, placeholder: "Insurance Number" },
                { name: "insuranceExpiry", icon: <FaCalendarAlt />, placeholder: "Insurance Expiry Date", type: "date" },
                { name: "registrationNumber", icon: <FaClipboardList />, placeholder: "Registration Number" },
              ].map(({ name, icon, placeholder, type = "text" }, index) => (
                <div key={index} className="relative mt-4">
                  <div className="absolute left-3 top-3 text-gray-400">{icon}</div>
                  <input
                    type={type}
                    name={name}
                    placeholder={placeholder}
                    min={name === "insuranceExpiry" ? new Date().toISOString().split("T")[0] : undefined}
                    className="w-full bg-gray-50 text-gray-900 pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                    onChange={handleCabFormChange}
                    value={cabFormData[name]}
                  />
                  {cabFormErrors[name] && <p className="text-red-500 text-sm mt-1">{cabFormErrors[name]}</p>}
                </div>
              ))}

              <div className="relative mt-4">
                <FaUpload className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="file"
                  name="cabImage"
                  accept="image/*"
                  className="w-full bg-gray-50 text-gray-900 p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                  onChange={handleCabFormChange}
                />
                {cabFormErrors.cabImage && <p className="text-red-500 text-sm mt-1">{cabFormErrors.cabImage}</p>}
              </div>

              {/* Keep apiError here ONLY ONCE - after all fields */}
              {cabFormErrors.apiError && <p className="text-red-500 text-sm mt-4">{cabFormErrors.apiError}</p>}

              <button
                type="submit"
                className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg mt-4 font-medium transition-colors"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Cab"}
              </button>
            </form>

          </motion.div>
        </div>
      )}
    </motion.div>
  )
}