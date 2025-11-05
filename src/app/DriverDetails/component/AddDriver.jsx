import React from 'react'
import baseURL from "@/utils/api"
import { useState, useRef } from 'react'
import axios from "axios"
import { motion } from "framer-motion"
import { toast } from "react-toastify"
import {
  FiEdit,
  FiTrash2,
  FiUserPlus,
  FiUser,
  FiMail,
  FiPhone,
  FiCreditCard,
  FiFileText,
  FiImage,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi"

const AddDriver = ({ isOpen, onClose, onDriverAdded }) => {
  const [addDriverErrors, setAddDriverErrors] = useState({})
  const [addDriverFormData, setAddDriverFormData] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNo: "",
    adharNo: "",
    addedBy: "",
  })
  const [salary, setSalary] = useState("")
  const [salaryType, setSalaryType] = useState("fixed")
  const [perTripRate, setPerTripRate] = useState("")
  const [addDriverLoading, setAddDriverLoading] = useState(false)
  const [profileImageName, setProfileImageName] = useState('');
  const [profileImage, setProfileImage] = useState(null)
  const [licenseImage, setLicenseImage] = useState(null)
  const [adharImage, setAdharImage] = useState(null)
  const [licenseImageName, setLicenseImageName] = useState('');
  const [adharImageName, setAdharImageName] = useState('');

  // Create refs for file inputs
  const profileInputRef = useRef(null)
  const licenseInputRef = useRef(null)
  const adharInputRef = useRef(null)

  const handleAddDriverChange = (e) => {
    setAddDriverFormData({ ...addDriverFormData, [e.target.name]: e.target.value })
    setAddDriverErrors({ ...addDriverErrors, [e.target.name]: "" })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(e.target.files[0])
    setAddDriverErrors({ ...addDriverErrors, profileImage: "" })
    if (file) {
      setProfileImageName(file.name);
    }
  }

  const handleLicenseImageChange = (e) => {
    const file = e.target.files[0];
    setLicenseImage(e.target.files[0])
    setAddDriverErrors({ ...addDriverErrors, licenseImage: "" })
    if (file) setLicenseImageName(file.name);
  };

  const handleAdharImageChange = (e) => {
    const file = e.target.files[0];
    setAdharImage(e.target.files[0])
    setAddDriverErrors({ ...addDriverErrors, adharImage: "" })
    if (file) setAdharImageName(file.name);
  };

  const validateAddDriverForm = () => {
    const newErrors = {}
    if (!addDriverFormData.name.trim()) newErrors.name = "Name is required"
    if (!addDriverFormData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(addDriverFormData.email)) {
      newErrors.email = "Please Enter valid Gmail (e.g., user@gmail.com)";
    }
    if (!addDriverFormData.phone.trim()) newErrors.phone = "Phone is required"
    else if (!/^\d{10}$/.test(addDriverFormData.phone)) newErrors.phone = "Phone must be 10 digits"
    if (!addDriverFormData.licenseNo.trim()) newErrors.licenseNo = "License No is required";
    if (!addDriverFormData.adharNo.trim()) newErrors.adharNo = "Aadhar No is required"
    else if (!/^\d{12}$/.test(addDriverFormData.adharNo)) newErrors.adharNo = "Aadhar must be 12 digits"
    
    // Salary validation based on type
    if (salaryType === "fixed") {
      if (!salary || isNaN(Number(salary)) || Number(salary) <= 0) {
        newErrors.salary = "Fixed Monthly Salary must be greater than 0"
      }
    } else {
      // Per-trip type - only per trip rate is required
      if (!perTripRate || isNaN(Number(perTripRate)) || Number(perTripRate) <= 0) {
        newErrors.perTripRate = "Per Trip Rate must be greater than 0"
      }
    }
    // if (!profileImage) newErrors.profileImage = "Profile image is required"
    // if (!licenseImage) newErrors.licenseImage = "License image is required"
    // if (!adharImage) newErrors.adharImage = "Aadhar image is required"

    setAddDriverErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const resetForm = () => {
    setAddDriverFormData({
      name: "",
      email: "",
      phone: "",
      licenseNo: "",
      adharNo: "",
      addedBy: "",
    })
    setSalary("")
    setSalaryType("fixed")
    setPerTripRate("")
    setProfileImage(null)
    setLicenseImage(null)
    setAdharImage(null)
    setProfileImageName('')
    setLicenseImageName('')
    setAdharImageName('')
    setAddDriverErrors({})

    // Reset file input fields using refs
    if (profileInputRef.current) profileInputRef.current.value = ""
    if (licenseInputRef.current) licenseInputRef.current.value = ""
    if (adharInputRef.current) adharInputRef.current.value = ""
  }

  const handleAddDriverSubmit = async (e) => {
    e.preventDefault()

    if (!validateAddDriverForm()) return

    setAddDriverLoading(true)

    try {
      const formDataToSend = new FormData()

      const updatedFormData = {
        ...addDriverFormData,
        addedBy: localStorage.getItem("id") || "",
      }

      Object.keys(updatedFormData).forEach((key) => {
        formDataToSend.append(key, updatedFormData[key])
      })

      formDataToSend.append("profileImage", profileImage)
      formDataToSend.append("licenseNoImage", licenseImage)
      formDataToSend.append("adharNoImage", adharImage)

      const response = await fetch(`${baseURL}api/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formDataToSend,
      })

      const data = await response.json()
      console.log("Response Data:", data)

      if (response.ok) {
        const driverId = data?.driver?.id || data?.id || data?.driverId
        const subAdminId = localStorage.getItem("id") || ""
        if (driverId && subAdminId && (salary || perTripRate)) {
          try {
            const salaryPayload = {
              salaryType: salaryType
            }
            if (salaryType === "fixed" && salary) {
              salaryPayload.baseSalary = Number(salary)
            } else if (salaryType === "per-trip" && perTripRate) {
              salaryPayload.baseSalary = salary ? Number(salary) : 0
              salaryPayload.perTripRate = Number(perTripRate)
            }
            const res2 = await fetch(`${baseURL}api/salary/${subAdminId}/${driverId}/set`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(salaryPayload),
            })
            if (!res2.ok) {
              const err = await res2.json().catch(() => ({}))
              toast.warning(err?.message || "Salary set failed")
            } else {
              toast.success("Salary set successfully")
            }
          } catch (e) {
            toast.warning("Salary set failed")
          }
        }
        resetForm()
        onClose() // Close the modal
        onDriverAdded() // Refresh the driver list
        toast.success("Driver added successfully!")
      } else {
        setAddDriverErrors({ apiError: data.error || "❌ Something went wrong" })
      }
    } catch (error) {
      console.error("Fetch Error:", error)
      setAddDriverErrors({ apiError: "❌ Server error, try again later" })
    } finally {
      setAddDriverLoading(false)
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm bg-opacity-50 p-4">
      <motion.div
        className="bg-white rounded-lg w-full max-w-4xl shadow-xl max-h-[95vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900">Add New Driver</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-6">
          {addDriverErrors.apiError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {addDriverErrors.apiError}
            </div>
          )}

          <form onSubmit={handleAddDriverSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {[
              { name: "name", icon: FiUser, placeholder: "Full Name" },
              { name: "email", icon: FiMail, placeholder: "Email Address", type: "email" },
              { name: "phone", icon: FiPhone, placeholder: "Phone Number" },
              { name: "licenseNo", icon: FiCreditCard, placeholder: "License Number" },
              { name: "adharNo", icon: FiFileText, placeholder: "Aadhar Number (12 digits)" },
            ].map((field) => (
              <div key={field.name} className="relative">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  {field.placeholder}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <field.icon />
                  </span>
                  <input
                    type={field.type || "text"}
                    name={field.name}
                    placeholder={field.placeholder}
                    className="w-full p-3 pl-10 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    onChange={handleAddDriverChange}
                    value={addDriverFormData[field.name]}
                  />
                </div>
                {addDriverErrors[field.name] && (
                  <p className="text-red-500 text-sm mt-1">{addDriverErrors[field.name]}</p>
                )}
              </div>
            ))}

            <div className="relative">
              <label className="block text-sm font-medium mb-2 text-gray-700">Salary Type</label>
              <select
                className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                value={salaryType}
                onChange={(e) => setSalaryType(e.target.value)}
              >
                <option value="fixed">Fixed Monthly Salary</option>
                <option value="per-trip">Per Trip Salary</option>
              </select>
            </div>

            {salaryType === "fixed" ? (
              <div className="relative">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Fixed Monthly Salary
                </label>
                <input
                  type="number"
                  placeholder="Enter Fixed Monthly Salary"
                  className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  min="0"
                  step="0.01"
                />
                {addDriverErrors.salary && (
                  <p className="text-red-500 text-sm mt-1">{addDriverErrors.salary}</p>
                )}
              </div>
            ) : (
              <div className="relative">
                <label className="block text-sm font-medium mb-2 text-gray-700">Per Trip Rate</label>
                <input
                  type="number"
                  placeholder="Enter Per Trip Rate"
                  className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  value={perTripRate}
                  onChange={(e) => setPerTripRate(e.target.value)}
                  min="0"
                  step="0.01"
                />
                {addDriverErrors.perTripRate && (
                  <p className="text-red-500 text-sm mt-1">{addDriverErrors.perTripRate}</p>
                )}
              </div>
            )}

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Driver Profile Image
              </label>
              <label
                htmlFor="profileInput"
                className="flex items-center gap-3 w-full p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <FiImage className="text-xl text-gray-400" />
                <span className="text-gray-600">
                  {profileImageName || "Choose profile image"}
                </span>
              </label>
              <input
                type="file"
                id="profileInput"
                ref={profileInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {addDriverErrors.profileImage && (
                <p className="text-red-500 text-sm mt-1">{addDriverErrors.profileImage}</p>
              )}
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                License Image
              </label>
              <label
                htmlFor="licenseInput"
                className="flex items-center gap-3 w-full p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <FiImage className="text-xl text-gray-400" />
                <span className="text-gray-600">
                  {licenseImageName || "Choose license image"}
                </span>
              </label>
              <input
                type="file"
                id="licenseInput"
                ref={licenseInputRef}
                accept="image/*"
                onChange={handleLicenseImageChange}
                className="hidden"
              />
              {addDriverErrors.licenseImage && (
                <p className="text-red-500 text-sm mt-1">{addDriverErrors.licenseImage}</p>
              )}
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Aadhaar Image
              </label>
              <label
                htmlFor="adharInput"
                className="flex items-center gap-3 w-full p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <FiImage className="text-xl text-gray-400" />
                <span className="text-gray-600">
                  {adharImageName || "Choose Aadhaar image"}
                </span>
              </label>
              <input
                type="file"
                id="adharInput"
                ref={adharInputRef}
                accept="image/*"
                onChange={handleAdharImageChange}
                className="hidden"
              />
              {addDriverErrors.adharImage && (
                <p className="text-red-500 text-sm mt-1">{addDriverErrors.adharImage}</p>
              )}
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-end gap-3 mt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition-colors font-medium"
                disabled={addDriverLoading}
              >
                {addDriverLoading ? "Adding Driver..." : "Add Driver"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default AddDriver