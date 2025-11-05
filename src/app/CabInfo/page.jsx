"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Sidebar from "../slidebar/page"
import axios from "axios"
import { MapPin, X, Truck, ChevronLeft, ChevronRight } from "lucide-react"
import LeafletMap from "../components/LeafletMap"
import InvoiceButton from "../components/InvoiceButton"
import baseURL from "@/utils/api"
import Image from "next/image"
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

const CabSearch = () => {
  const router = useRouter()
  const [completingTrips, setCompletingTrips] = useState({})
  const [showAccessDenied, setShowAccessDenied] = useState(false)
  const [cabNumber, setCabNumber] = useState("")
  const [cabDetails, setCabDetails] = useState([])
  const [filteredCabs, setFilteredCabs] = useState([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [activeModal, setActiveModal] = useState("")
  const [selectedDetail, setSelectedDetail] = useState(null)
  const [companyLogo, setCompanyLogo] = useState("")
  const [signature, setSignature] = useState("")
  const [companyInfo, setCompanyInfo] = useState("")
  const [subCompanyName, setCompanyName] = useState("")
  const [wsConnected, setWsConnected] = useState(false)
  const wsRef = useRef(null)
  const adminId = useRef(`admin-${Date.now()}`)
  const [showMap, setShowMap] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [notification, setNotification] = useState("")
  const [routeCoordinates, setRouteCoordinates] = useState({})
  const [driverRoutes, setDriverRoutes] = useState({})
  const [mapLoaded, setMapLoaded] = useState(false)
  const [currentDistance, setCurrentDistance] = useState(0)
  const [remainingDistance, setRemainingDistance] = useState(0)
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState("")
  const [pagination, setPagination] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(10) // Fixed to 10 records per page

  const getFilteredCabs = useCallback(() => {
    let filtered = cabDetails
    if (statusFilter !== "all") {
      if (statusFilter === "untripAssignment") {
        filtered = filtered.filter(
          (item) =>
            (!item.locationFrom || item.locationFrom === "N/A") &&
            (!item.locationTo || item.locationTo === "N/A") &&
            (!item.customerName || item.customerName === "N/A"),
        )
      } else {
        filtered = filtered.filter((item) => item.status === statusFilter)
      }
    }

    if (cabNumber) {
      filtered = filtered.filter((item) => item.CabsDetail?.cabNumber?.toLowerCase().includes(cabNumber.toLowerCase()))
    }

    if (fromDate || toDate) {
      const startDate = fromDate || "1970-01-01"
      const endDate = toDate || "2100-01-01"
      filtered = filtered.filter((item) => {
        const assignedDate = new Date(item.assignedAt).toISOString().split("T")[0]
        return assignedDate >= startDate && assignedDate <= endDate
      })
    }

    return filtered
  }, [cabDetails, statusFilter, cabNumber, fromDate, toDate])

  const locationIntervalRef = useRef(null)

  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const routeLayerRef = useRef(null)
  const routeMarkersRef = useRef([])

  const showNotification = useCallback((msg) => {
    setNotification(msg)
    setTimeout(() => setNotification(""), 3000)
  }, [])

  useEffect(() => {
    setFilteredCabs(getFilteredCabs())
  }, [getFilteredCabs])

  const handleCompleteTrip = async (assignmentId) => {
    try {
      setCompletingTrips((prev) => ({ ...prev, [assignmentId]: true }))

      const token = localStorage.getItem("token")

      const response = await fetch(`${baseURL}api/assigncab/complete-by-admin/${assignmentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to complete trip")
      }

      const result = await response.json()

      // Update both cabDetails and filteredCabs with the new status
      setCabDetails((prevDetails) =>
        prevDetails.map((item) => 
          item.id === assignmentId 
            ? { ...item, status: 'completed' } 
            : item
        ),
      )

      setFilteredCabs((prevFiltered) =>
        prevFiltered.map((item) => 
          item.id === assignmentId 
            ? { ...item, status: 'completed' } 
            : item
        ),
      )

      setNotification("Trip completed successfully!")
      setTimeout(() => setNotification(""), 3000)
      
      // Refetch the current page to ensure data consistency
      setTimeout(() => {
        handlePageChange(currentPage)
      }, 500)
    } catch (error) {
      console.error("Error completing trip:", error)
      setError("Failed to complete trip. Please try again.")
      setTimeout(() => setError(null), 5000)
    } finally {
      setCompletingTrips((prev) => ({ ...prev, [assignmentId]: false }))
    }
  }

  useEffect(() => {
    if (selectedDriver) {
      console.log("Updated selectedDriver:", selectedDriver)
    }
  }, [selectedDriver])

  const cleanupMap = useCallback(() => {
    if (mapRef.current && typeof mapRef.current.remove === "function") {
      mapRef.current.remove()
    }
    mapRef.current = null
    markerRef.current = null
    if (routeLayerRef.current) {
      routeLayerRef.current = null
    }
    routeMarkersRef.current = []
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && !window.L) {
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)

      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
      script.async = true
      script.onload = () => {
        setMapLoaded(true)
        console.log("Leaflet loaded successfully")
      }
      document.body.appendChild(script)
    } else if (typeof window !== "undefined" && window.L) {
      setMapLoaded(true)
    }
  }, [])

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        if (typeof window === "undefined") return

        const id = localStorage.getItem("id")
        if (!id) {
          router.push("/login")
          return
        }

        console.log("Fetching admin data for ID:", id)

        const res = await axios.get(`${baseURL}api/admin/getAllSubAdmins`)
        const admin = res.data.subAdmins.find((el) => el.id.toString() === id.toString())

        if (admin) {
          setCompanyLogo(admin.companyLogo)
          setSignature(admin.signature)
          setCompanyName(admin.name)
          setCompanyInfo(admin.companyInfo)
        }
      } catch (err) {
        console.error("Failed to fetch admin data:", err)
        setError("Failed to load admin data. Please check your API connection.")
      }
    }

    fetchAdminData()
  }, [router])

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        if (typeof window === "undefined") return

        const id = localStorage.getItem("id")
        if (!id) {
          router.push("/login")
          return
        }

        const subAdminsRes = await axios.get(`${baseURL}api/admin/getAllSubAdmins`)
        const loggedInUser = subAdminsRes.data.subAdmins.find((e) => e.id.toString() === id.toString())

        if (loggedInUser?.status === "Inactive") {
          localStorage.clear()
          setShowAccessDenied(true)
          return
        }
      } catch (err) {
        console.error("User status check failed:", err)
        setError("Failed to verify user status")
      }
    }

    checkUserStatus()
  }, [router])

  const handlePageChange = async (page) => {
    if (page < 1 || (pagination && page > pagination.totalPages)) return

    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      // Explicitly pass limit=10 to ensure 10 records per page
      const res = await axios.get(`${baseURL}api/assigncab?page=${page}&limit=${recordsPerPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const assignments = Array.isArray(res.data.assignments) ? res.data.assignments : []
      setCabDetails(assignments)
      setFilteredCabs(assignments)
      setCurrentPage(page)

      if (res.data.pagination) {
        setPagination(res.data.pagination)
      }
    } catch (err) {
      console.error("Failed to fetch page:", err)
      setError("Failed to load page. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchAssignedCabs = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

        // Explicitly set limit to 10 records per page
        const res = await axios.get(`${baseURL}api/assigncab?page=1&limit=${recordsPerPage}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        console.log("API Response:", res.data)

        const assignments = Array.isArray(res.data.assignments) ? res.data.assignments : []
        console.log("assignment", assignments)
        setCabDetails(assignments)
        setFilteredCabs(assignments)
        setCurrentPage(1)

        if (res.data.pagination) {
          setPagination(res.data.pagination)
        }
      } catch (err) {
        console.error("Failed to fetch assigned cabs:", err)
        setError("Failed to load assigned cabs. Please check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchAssignedCabs()
  }, [recordsPerPage])

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const wsUrl = baseURL.replace("http", "ws").replace("https", "wss")
        wsRef.current = new WebSocket(`${wsUrl}ws`)

        wsRef.current.onopen = () => {
          console.log("WebSocket connected")
          setWsConnected(true)
          wsRef.current.send(
            JSON.stringify({
              type: "admin_connect",
              adminId: adminId.current,
            }),
          )
        }

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            console.log("WebSocket message:", data)

            if (data.type === "location_update" && data.driverId && data.location) {
              setCabDetails((prevCabs) =>
                prevCabs.map((cab) =>
                  cab.Driver?.id === data.driverId
                    ? { ...cab, Driver: { ...cab.Driver, location: data.location } }
                    : cab,
                ),
              )
            }
          } catch (err) {
            console.error("Error parsing WebSocket message:", err)
          }
        }

        wsRef.current.onclose = () => {
          console.log("WebSocket disconnected")
          setWsConnected(false)
          setTimeout(connectWebSocket, 5000)
        }

        wsRef.current.onerror = (error) => {
          console.error("WebSocket error:", error)
          setWsConnected(false)
        }
      } catch (err) {
        console.error("Failed to connect WebSocket:", err)
        setWsConnected(false)
      }
    }

    connectWebSocket()

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const handleSearch = async () => {
    if (!cabNumber.trim()) {
      setError("Please enter a cab number to search")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem("token")
      // Include limit in search as well
      const res = await axios.get(`${baseURL}api/assigncab?cabNumber=${encodeURIComponent(cabNumber)}&limit=${recordsPerPage}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const assignments = Array.isArray(res.data.assignments) ? res.data.assignments : Array.isArray(res.data) ? res.data : []
      setCabDetails(assignments)
      setFilteredCabs(assignments)

      // Update pagination if available
      if (res.data.pagination) {
        setPagination(res.data.pagination)
      }

      if (assignments.length === 0) {
        setError("No cabs found with the specified number")
      }
    } catch (err) {
      console.error("Search failed:", err)
      setError("Search failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDateFilter = () => {
    if (!fromDate && !toDate) {
      setError("Please select at least one date to filter")
      return
    }
    setError(null)
    // Reset to first page when filtering
    setCurrentPage(1)
  }

  const openModal = (type, detail, fullItem = null) => {
    setActiveModal(type)
    if (type === "customer") {
      setSelectedDetail({ type, data: fullItem })
    } else {
      setSelectedDetail({ type, data: detail })
    }
  }

  const closeModal = () => {
    setActiveModal("")
    setSelectedDetail(null)
  }

  const openImageModal = (imageUrl) => {
    setSelectedImage(imageUrl)
    setImageModalOpen(true)
  }

  const closeImageModal = () => {
    setImageModalOpen(false)
    setSelectedImage("")
  }

  const handleLocationClick = (item) => {
    if (!wsConnected) {
      showNotification("WebSocket not connected. Cannot track location.")
      return
    }

    const driverData = {
      driver: {
        id: item.Driver?.id,
        name: item.Driver?.name,
        location: item.Driver?.location || {
          latitude: 19.076,
          longitude: 72.8777,
          timestamp: new Date().toISOString(),
        },
      },
      cab: {
        cabNumber: item.CabsDetail?.cabNumber,
        location: {
          from: item.locationFrom || item.pickupLocation,
          to: item.locationTo || item.dropLocation,
          totalDistance: item.totalDistance || item.estimatedDistance,
        },
      },
    }

    setSelectedDriver(driverData)
    setShowMap(true)
  }

  const renderDetailContent = () => {
    if (!selectedDetail) return null

    const { type, data } = selectedDetail

    switch (type) {
      case "customer":
        return (
          <div className="space-y-3 ">
            <div>
              <label className="block text-sm font-medium text-gray-700">Customer Name</label>
              <p className="text-gray-900">{data?.customerName || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <p className="text-gray-900">{data?.customerPhone || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Pickup Location</label>
              <p className="text-gray-900">{data?.pickupLocation || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Drop Location</label>
              <p className="text-gray-900">{data?.dropLocation || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Trip Type</label>
              <p className="text-gray-900">{data?.tripType || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
              <p className="text-gray-900">{data?.vehicleType || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Fare</label>
              <p className="text-green-600 font-semibold">₹{data?.estimatedFare || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Special Instructions</label>
              <p className="text-gray-900">{data?.specialInstructions || "None"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
              <p className="text-gray-900">{data?.adminNotes || "None"}</p>
            </div>
          </div>
        )

      case "fuel":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
              <p className="text-gray-900">{data?.fuelType || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <div className="space-y-1">
                {data?.fuelAmount?.map((amount, index) => (
                  <p key={index} className="text-green-600 font-semibold">
                    ₹{amount}
                  </p>
                )) || <p className="text-gray-900">N/A</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Receipt Images</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {data?.fuelReceiptImage?.map((image, index) => (
                  <img
                    key={index}
                    src={image || "/placeholder.svg"}
                    alt={`Fuel receipt ${index + 1}`}
                    className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                    onClick={() => openImageModal(image)}
                  />
                )) || <p className="text-gray-500">No images</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Transaction Images</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {data?.fuelTransactionImage?.map((image, index) => (
                  <img
                    key={index}
                    src={image || "/placeholder.svg"}
                    alt={`Fuel transaction ${index + 1}`}
                    className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                    onClick={() => openImageModal(image)}
                  />
                )) || <p className="text-gray-500">No images</p>}
              </div>
            </div>
          </div>
        )

      case "fastTag":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Payment Mode</label>
              <p className="text-gray-900">{data?.fastTagPaymentMode || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <div className="space-y-1">
                {data?.fastTagAmount?.map((amount, index) => (
                  <p key={index} className="text-green-600 font-semibold">
                    ₹{amount}
                  </p>
                )) || <p className="text-gray-900">N/A</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Card Details</label>
              <p className="text-gray-900">{data?.fastTagCardDetails || "N/A"}</p>
            </div>
          </div>
        )

      case "tyrePuncture":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Repair Amount</label>
              <div className="space-y-1">
                {data?.tyreRepairAmount?.map((amount, index) => (
                  <p key={index} className="text-green-600 font-semibold">
                    ₹{amount}
                  </p>
                )) || <p className="text-gray-900">N/A</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Images</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {data?.tyreImage?.map((image, index) => (
                  <img
                    key={index}
                    src={image || "/placeholder.svg"}
                    alt={`Tyre repair ${index + 1}`}
                    className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                    onClick={() => openImageModal(image)}
                  />
                )) || <p className="text-gray-500">No images</p>}
              </div>
            </div>
          </div>
        )

      case "vehicleServicing":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Required Service</label>
              <p className="text-gray-900">{data?.servicingRequired ? "Yes" : "No"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Details</label>
              <p className="text-gray-900">{data?.servicingDetails || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <div className="space-y-1">
                {data?.servicingAmount?.map((amount, index) => (
                  <p key={index} className="text-green-600 font-semibold">
                    ₹{amount}
                  </p>
                )) || <p className="text-gray-900">N/A</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meter Reading</label>
              <div className="space-y-1">
                {data?.servicingMeter?.map((meter, index) => (
                  <p key={index} className="text-gray-900">
                    {meter} km
                  </p>
                )) || <p className="text-gray-900">N/A</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">KM Travelled</label>
              <p className="text-gray-900">{data?.servicingKmTravelled || "N/A"} km</p>
            </div>
          </div>
        )

      case "otherProblems":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Details</label>
              <p className="text-gray-900">{data?.otherDetails || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount</label>
              <div className="space-y-1">
                {data?.otherAmount?.map((amount, index) => (
                  <p key={index} className="text-green-600 font-semibold">
                    ₹{amount}
                  </p>
                )) || <p className="text-gray-900">N/A</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Images</label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {data?.otherImage?.map((image, index) => (
                  <img
                    key={index}
                    src={image || "/placeholder.svg"}
                    alt={`Other problem ${index + 1}`}
                    className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                    onClick={() => openImageModal(image)}
                  />
                )) || <p className="text-gray-500">No images</p>}
              </div>
            </div>
          </div>
        )

      default:
        return <p>No details available</p>
    }
  }

  if (loading && cabDetails.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 p-4 md:p-6 md:ml-60 mt-20 sm:mt-0 transition-all duration-300">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white h-16 rounded-lg shadow-sm"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-4 md:p-6 md:ml-60 mt-20 sm:mt-0 transition-all duration-300 max-w-full overflow-hidden">
        {showAccessDenied && <AccessDeniedModal />}

        {notification && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="bg-yellow-500 text-black px-6 py-3 rounded-md shadow-lg transition-all duration-300 animate-fadeIn">
              {notification}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-yellow-500 p-2 rounded-lg">
            <Truck className="h-6 w-6 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Cab Search</h1>
        </div>

        {pagination && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span>
                  Showing {(pagination.currentPage - 1) * recordsPerPage + 1} to{" "}
                  {Math.min(pagination.currentPage * recordsPerPage, pagination.totalCount)} of{" "}
                  {pagination.totalCount} assignments ({recordsPerPage} per page)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          pageNum === currentPage
                            ? "bg-yellow-500 text-black"
                            : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages || loading}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 mb-4">
          <div className={`h-3 w-3 rounded-full ${wsConnected ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className="text-sm text-gray-600">{wsConnected ? "Connected" : "Disconnected"}</span>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter Cab Number"
                value={cabNumber}
                onChange={(e) => setCabNumber(e.target.value)}
                className="border border-gray-300 p-3 text-black rounded-lg w-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg whitespace-nowrap transition-colors font-medium"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border border-gray-300 text-black p-3 rounded-lg w-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border border-gray-300 p-3 text-black rounded-lg w-full focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleDateFilter}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg whitespace-nowrap transition-colors font-medium"
              >
                Filter by Date
              </button>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">{error}</div>}

        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "all"
                ? "bg-yellow-500 text-black"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("assigned")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "assigned"
                ? "bg-red-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Assigned
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "completed"
                ? "bg-green-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setStatusFilter("untripAssignment")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              statusFilter === "untripAssignment"
                ? "bg-blue-500 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            Untrip Assignment
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white h-16 rounded-lg shadow-sm"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop Table with proper scrolling */}
            <div className="hidden lg:block bg-white shadow-sm rounded-lg border">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b sticky top-0">
                    <tr>
                      <th className="px-3 py-4 text-left text-sm font-semibold text-gray-900 min-w-[60px]">#</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold text-gray-900 min-w-[120px]">Cab No</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold text-gray-900 min-w-[120px]">Driver</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold text-gray-900 min-w-[160px]">Customer</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold text-gray-900 min-w-[100px]">Date</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold text-gray-900 min-w-[200px]">Pickup</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold text-gray-900 min-w-[200px]">Drop</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold text-gray-900 min-w-[100px]">Status</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold text-gray-900 min-w-[100px]">Trip</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold text-gray-900 min-w-[140px]">Details</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold text-gray-900 min-w-[80px]">Location</th>
                      <th className="px-3 py-4 text-left text-sm font-semibold text-gray-900 min-w-[120px]">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCabs.length > 0 ? (
                      filteredCabs.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {(currentPage - 1) * recordsPerPage + index + 1}
                          </td>
                          <td className="px-3 py-4 text-sm font-medium text-gray-900">
                            <div className="max-w-[120px] truncate" title={item.CabsDetail?.cabNumber || "N/A"}>
                              {item.CabsDetail?.cabNumber || "N/A"}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            <div className="max-w-[120px] truncate" title={item.Driver?.name || "N/A"}>
                              {item.Driver?.name || "N/A"}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            {item.customerName ? (
                              <div className="max-w-[160px]">
                                <div className="font-medium truncate" title={item.customerName}>
                                  {item.customerName}
                                </div>
                                <div className="text-gray-500 text-xs truncate" title={item.customerPhone}>
                                  {item.customerPhone}
                                </div>
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            <div className="max-w-[100px]">
                              {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString("en-GB") : "N/A"}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            <div className="max-w-[200px] truncate" title={item.locationFrom || item.pickupLocation || "N/A"}>
                              {item.locationFrom || item.pickupLocation || "N/A"}
                            </div>
                          </td>
                          <td className="px-3 py-4 text-sm text-gray-900">
                            <div className="max-w-[200px] truncate" title={item.locationTo || item.dropLocation || "N/A"}>
                              {item.locationTo || item.dropLocation || "N/A"}
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                item?.status === "assigned"
                                  ? "bg-red-100 text-red-800"
                                  : item?.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {item?.status}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            {item?.status === "completed" ? (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Done
                              </span>
                            ) : (
                              <button
                                onClick={() => handleCompleteTrip(item.id)}
                                disabled={completingTrips[item.id]}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-2 py-1 rounded text-xs font-medium transition-colors"
                              >
                                {completingTrips[item.id] ? "..." : "Complete"}
                              </button>
                            )}
                          </td>
                          <td className="px-3 py-4">
                            <select
                              className="border border-gray-300 text-black p-1 rounded text-xs focus:ring-2 focus:ring-yellow-500 focus:border-transparent min-w-[120px]"
                              onChange={(e) => {
                                if (e.target.value === "customer") {
                                  openModal("customer", null, item)
                                } else if (e.target.value) {
                                  openModal(e.target.value, item)
                                }
                              }}
                            >
                              <option value="">Select</option>
                              <option value="customer">Customer</option>
                              <option value="fuel">Fuel</option>
                              <option value="fastTag">FastTag</option>
                              <option value="tyrePuncture">Tyre</option>
                              <option value="vehicleServicing">Service</option>
                              <option value="otherProblems">Other</option>
                            </select>
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center justify-center">
                              <button
                                className={`text-green-600 transition-all duration-300 hover:scale-110 hover:shadow-md p-1 rounded ${
                                  item.Driver?.location ? "animate-pulse" : ""
                                }`}
                                onClick={() => handleLocationClick(item)}
                                title="Track Location"
                                disabled={!wsConnected}
                              >
                                <MapPin size={14} />
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="min-w-[120px]">
                              <InvoiceButton
                                item={item}
                                companyLogo={companyLogo}
                                signature={signature}
                                companyInfo={companyInfo}
                                subCompanyName={subCompanyName}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="12" className="px-6 py-8 text-center text-gray-500">
                          No results found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden space-y-4">
              {filteredCabs.length > 0 ? (
                filteredCabs.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Cab No</p>
                        <p className="font-medium text-gray-900">{item.CabsDetail?.cabNumber || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Driver</p>
                        <p className="text-gray-900">{item.Driver?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Customer</p>
                        <p className="text-gray-900">{item.customerName || "N/A"}</p>
                        {item.customerPhone && <p className="text-xs text-gray-500">{item.customerPhone}</p>}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Assigned Date</p>
                        <p className="text-gray-900">
                          {item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Distance</p>
                        <p className="text-gray-900">{item.totalDistance || item.estimatedDistance || "0"} KM</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Fare</p>
                        <p className="text-green-600 font-semibold">₹{item.estimatedFare || "N/A"}</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Pickup</p>
                      <p className="text-gray-900">{item.locationFrom || item.pickupLocation || "N/A"}</p>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Drop</p>
                      <p className="text-gray-900">{item.locationTo || item.dropLocation || "N/A"}</p>
                    </div>
                    <div className="mb-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item?.status === "assigned"
                            ? "bg-red-100 text-red-800"
                            : item?.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item?.status}
                      </span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <select
                        className="flex-1 border border-gray-300 p-2 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                        onChange={(e) => {
                          if (e.target.value === "customer") {
                            openModal("customer", null, item)
                          } else if (e.target.value) {
                            openModal(e.target.value, item)
                          }
                        }}
                      >
                        <option value="">View Details</option>
                        <option value="customer">Customer Details</option>
                        <option value="fuel">Fuel Details</option>
                        <option value="fastTag">FastTag Details</option>
                        <option value="tyrePuncture">Tyre Details</option>
                        <option value="vehicleServicing">Servicing Details</option>
                        <option value="otherProblems">Other Problems</option>
                      </select>
                      <button
                        className={`text-green-600 p-2 rounded-lg border border-gray-300 hover:bg-gray-50 ${
                          item.Driver?.location ? "animate-pulse" : ""
                        }`}
                        onClick={() => handleLocationClick(item)}
                        title="Track Location"
                        disabled={!wsConnected}
                      >
                        <MapPin size={16} />
                      </button>
                    </div>
                    <div className="mb-4">
                      {item?.status === "completed" ? (
                        <span className="inline-flex px-3 py-2 text-sm font-semibold rounded-full bg-green-100 text-green-800 w-full justify-center">
                          Trip Completed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteTrip(item.id)}
                          disabled={completingTrips[item.id]}
                          className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full"
                        >
                          {completingTrips[item.id] ? "Completing..." : "Complete Trip"}
                        </button>
                      )}
                    </div>
                    <InvoiceButton
                      item={item}
                      companyLogo={companyLogo}
                      signature={signature}
                      companyInfo={companyInfo}
                      subCompanyName={subCompanyName}
                    />
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-white rounded-lg shadow-sm border">
                  <p className="text-gray-500">No results found</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Bottom Pagination - Additional pagination controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm border p-4 mt-6">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage <= 1 || loading}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1 || loading}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(7, pagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (pagination.totalPages <= 7) {
                      pageNum = i + 1
                    } else if (currentPage <= 4) {
                      pageNum = i + 1
                    } else if (currentPage >= pagination.totalPages - 3) {
                      pageNum = pagination.totalPages - 6 + i
                    } else {
                      pageNum = currentPage - 3 + i
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          pageNum === currentPage
                            ? "bg-yellow-500 text-black"
                            : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= pagination.totalPages || loading}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={currentPage >= pagination.totalPages || loading}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            </div>
          </div>
        )}

        {activeModal && selectedDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold capitalize text-gray-900">{selectedDetail.type} Details</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              {renderDetailContent()}
              <button
                onClick={closeModal}
                className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-black py-3 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {imageModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 max-w-2xl w-full shadow-xl">
              <div className="flex justify-end mb-3">
                <button onClick={closeImageModal} className="text-gray-500 hover:text-gray-700 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <Image
                  src={selectedImage || "/placeholder.svg"}
                  alt="Preview"
                  width={200}
                  height={400}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              </div>
            </div>
          </div>
        )}

        {showMap && selectedDriver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
              <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedDriver.driver?.name || "Driver"} - {selectedDriver.cab?.cabNumber || "N/A"}
                </h2>
                <button onClick={() => setShowMap(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <div className="bg-gray-50 p-4 border-b">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">From: {selectedDriver.cab?.location?.from || "N/A"}</p>
                  </div>
                </div>
                <div className="h-6 border-l-2 border-dashed border-gray-400 ml-1.5"></div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">To: {selectedDriver.cab?.location?.to || "N/A"}</p>
                  </div>
                </div>
              </div>
              <div className="flex-1" style={{ height: "500px" }}>
                <LeafletMap
                  location={selectedDriver.driver?.location}
                  driverName={selectedDriver.driver?.name}
                  cabNumber={selectedDriver.cab?.cabNumber}
                  routeFrom={selectedDriver.cab?.location?.from}
                  routeTo={selectedDriver.cab?.location?.to}
                  onMapReady={(map) => {
                    console.log("Map is ready", map)
                    setTimeout(() => {
                      if (map) {
                        map.panTo({
                          lat: Number.parseFloat(selectedDriver.driver?.location?.latitude) || 16.705,
                          lng: Number.parseFloat(selectedDriver.driver?.location?.longitude) || 74.2433,
                        })
                      }
                    }, 100)
                  }}
                />
              </div>
              <div className="p-4 bg-gray-50 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Driver: {selectedDriver.driver?.name || "N/A"}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      Cab Number: {selectedDriver.cab?.cabNumber || "N/A"}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      Distance:{" "}
                      {selectedDriver.cab?.location?.totalDistance ||
                        driverRoutes[selectedDriver.driver?.id]?.totalDistance ||
                        "0"}{" "}
                      KM
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-900">
                      <strong>Current Location:</strong>{" "}
                      {selectedDriver.driver?.location?.latitude?.toFixed(6) || "N/A"},{" "}
                      {selectedDriver.driver?.location?.longitude?.toFixed(6) || "N/A"}
                    </p>
                    <p className="text-sm text-gray-900">
                      <strong>Last Updated:</strong>{" "}
                      {selectedDriver.driver?.location?.timestamp
                        ? new Date(selectedDriver.driver.location.timestamp).toLocaleTimeString()
                        : "N/A"}
                    </p>
                    <p className="text-sm text-gray-900">
                      <strong>Connection Status:</strong>{" "}
                      <span className={wsConnected ? "text-green-600" : "text-red-600"}>
                        {wsConnected ? "Connected" : "Disconnected"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CabSearch