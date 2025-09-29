'use client'

import { useEffect, useState } from 'react'
import Sidebar from '../slidebar/page'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import baseURL from '@/utils/api'
import { FiEdit, FiTrash2, FiMapPin } from 'react-icons/fi'
import Image from 'next/image'

const CabDetails = () => {
  // Prime from local cache for instant render
  const [cabs, setCabs] = useState(() => {
    try {
      const cached = localStorage.getItem('cache:cabDetails')
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })
  const [loading, setLoading] = useState(() => {
    try {
      return !localStorage.getItem('cache:cabDetails')
    } catch {
      return true
    }
  })
  const [selectedCab, setSelectedCab] = useState(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState({
    cabNumber: '',
    cabImage: '',
    insuranceNumber: '',
    registrationNumber: '',
    imei: '', // Added IMEI field
  })

  // Fetch cab list
  useEffect(() => {
    const fetchCabs = async () => {
      try {
        const token = localStorage.getItem('token')
        const res = await axios.get(`${baseURL}api/cabDetails`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        // Update state and cache for next instant load
        setCabs(res.data)
        try { localStorage.setItem('cache:cabDetails', JSON.stringify(res.data)) } catch {}
      } catch (error) {
        console.error('Error fetching cabs:', error)
        toast.error('Error loading cabs')
      } finally {
        setLoading(false)
      }
    }

    // Kick background revalidation regardless of having cache
    fetchCabs()
  }, [])

  // Delete cab
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this cab?')) return
    try {
      const token = localStorage.getItem('token')
      await axios.delete(`${baseURL}api/cabDetails/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCabs((prev) => prev.filter((cab) => cab.id !==id))
      toast.success('Cab deleted successfully')
    } catch (error) {
      toast.error('Failed to delete cab')
    }
  }

  // Start editing
  const handleEdit = (cab) => {
    setSelectedCab(cab)
    setEditFormData({
      cabNumber: cab.cabNumber,
      cabImage: cab.cabImage || '',
      insuranceNumber: cab.insuranceNumber,
      registrationNumber: cab.registrationNumber,
      imei: cab.imei || '', // 🆕 Include IMEI in edit form
    })
    setIsEditMode(true)
  }

  // Submit updated cab
  const handleEditSubmit = async () => {
    if (!selectedCab) return
    
    // 🆕 Validate IMEI
    if (!editFormData.imei.trim()) {
      toast.error('GPS IMEI is required')
      return
    }
    
    if (editFormData.imei.trim().length !== 15) {
      toast.error('IMEI must be exactly 15 digits')
      return
    }

    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      formData.append('cabNumber', editFormData.cabNumber)
      formData.append('insuranceNumber', editFormData.insuranceNumber)
      formData.append('registrationNumber', editFormData.registrationNumber)
      formData.append('imei', editFormData.imei) // 🆕 Include IMEI in form data
      
      if (editFormData.cabImage instanceof File) {
        formData.append('cabImage', editFormData.cabImage)
      }

      const res = await axios.put(`${baseURL}api/cabDetails/${selectedCab.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })

      setCabs((prev) =>
        prev.map((cab) => (cab.id === selectedCab.id ? res.data.cab : cab))
      )
      toast.success('Cab updated successfully')
      setIsEditMode(false)
    } catch (error) {
      console.error('Edit failed:', error)
      toast.error(error.response?.data?.message || 'Failed to update cab')
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-6 md:ml-60 mt-20 sm:mt-0 transition-all duration-300">
        <ToastContainer />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cab Details</h1>
          <p className="text-gray-600">Manage and view all cab information including GPS tracking</p>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white h-20 rounded-xl shadow-sm border border-gray-100"></div>
            ))}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cab Image</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Cab Number</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">GPS IMEI</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Insurance No</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Registration No</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cabs.map((cab) => (
                      <tr key={cab.id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden shadow-sm border border-gray-200">
                            <Image
                              src={cab.cabImage || '/images/default-cab.jpg'}
                              alt="Cab"
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900">{cab.cabNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FiMapPin className="text-green-500 mr-2" size={14} />
                            <span className="text-sm font-mono text-gray-700">
                              {cab.imei || 'Not Set'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{cab.insuranceNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-700">{cab.registrationNumber}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button 
                              onClick={() => handleEdit(cab)} 
                              className="p-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg transition-colors duration-200 shadow-sm"
                              title="Edit Cab"
                            >
                              <FiEdit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(cab.id)} 
                              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 shadow-sm"
                              title="Delete Cab"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {cabs.map((cab) => (
                <div key={cab.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden shadow-sm border border-gray-200 flex-shrink-0">
                      <Image
                        src={cab.cabImage || '/images/default-cab.jpg'}
                        alt="Cab"
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{cab.cabNumber}</h3>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center">
                          <FiMapPin className="text-green-500 mr-2" size={14} />
                          <span className="font-medium">GPS IMEI:</span> 
                          <span className="font-mono ml-1">{cab.imei || 'Not Set'}</span>
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Insurance:</span> {cab.insuranceNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Registration:</span> {cab.registrationNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-4 space-x-2">
                    <button 
                      onClick={() => handleEdit(cab)} 
                      className="p-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg transition-colors duration-200 shadow-sm"
                    >
                      <FiEdit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cab.id)} 
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 shadow-sm"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Edit Modal */}
        {isEditMode && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 w-full max-w-md relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-light"
                onClick={() => setIsEditMode(false)}
              >
                ×
              </button>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Cab Details</h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cab Number</label>
                  <input
                    type="text"
                    value={editFormData.cabNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, cabNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Enter cab number"
                  />
                </div>

                {/* 🆕 GPS IMEI Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <FiMapPin className="text-green-500 mr-2" size={16} />
                    GPS IMEI Number
                  </label>
                  <input
                    type="text"
                    value={editFormData.imei}
                    onChange={(e) => {
                      // Only allow digits and limit to 15 characters
                      const value = e.target.value.replace(/\D/g, '').slice(0, 15)
                      setEditFormData({ ...editFormData, imei: value })
                    }}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all duration-200 font-mono"
                    placeholder="Enter 15-digit IMEI number"
                    maxLength={15}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {editFormData.imei.length}/15 digits
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cab Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setEditFormData({ ...editFormData, cabImage: e.target.files[0] })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Insurance Number</label>
                  <input
                    type="text"
                    value={editFormData.insuranceNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, insuranceNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Enter insurance number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Registration Number</label>
                  <input
                    type="text"
                    value={editFormData.registrationNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, registrationNumber: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:border-transparent outline-none transition-all duration-200"
                    placeholder="Enter registration number"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSubmit}
                  className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-lg font-medium transition-colors duration-200 shadow-sm"
                >
                  Update Cab
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CabDetails