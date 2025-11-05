"use client"

import { useEffect, useMemo, useState } from "react"
import Sidebar from "../slidebar/page"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import baseURL from "@/utils/api"
import axios from "axios"
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi"

const AdvanceSalary = () => {
  const [drivers, setDrivers] = useState([])
  const [salaries, setSalaries] = useState([])
  const [attendanceSalaries, setAttendanceSalaries] = useState(new Map())
  const [deductions, setDeductions] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0,7)) // YYYY-MM
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editingDeduction, setEditingDeduction] = useState(null)
  const [selectedDriverAdvances, setSelectedDriverAdvances] = useState([])
  const [form, setForm] = useState({ driverId: "", amount: "", date: "", description: "" })
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
  const subAdminId = typeof window !== 'undefined' ? localStorage.getItem("id") : null

  const driverMap = useMemo(() => {
    const map = new Map()
    drivers.forEach(d => map.set(String(d.id), d))
    return map
  }, [drivers])

  const salaryMap = useMemo(() => {
    const map = new Map()
    salaries.forEach(s => map.set(String(s.driverId), s))
    return map
  }, [salaries])

  // Group advances by driver for selected month
  const driverAdvancesSummary = useMemo(() => {
    const summary = new Map()
    const monthStart = selectedMonth + '-01'
    const monthEnd = selectedMonth + '-31'
    
    deductions.forEach(d => {
      if (d.date >= monthStart && d.date <= monthEnd) {
        const dId = String(d.driverId)
        if (!summary.has(dId)) {
          summary.set(dId, { total: 0, records: [] })
        }
        const data = summary.get(dId)
        data.total += Number(d.amount)
        data.records.push(d)
      }
    })
    return summary
  }, [deductions, selectedMonth])

  // Get unique drivers who have salary records or advances
  const displayDrivers = useMemo(() => {
    const driverIds = new Set()
    salaries.forEach(s => driverIds.add(String(s.driverId)))
    driverAdvancesSummary.forEach((_, dId) => driverIds.add(dId))
    
    return Array.from(driverIds)
      .map(dId => driverMap.get(dId))
      .filter(d => d)
      .filter(d => {
        if (!query.trim()) return true
        return d.name?.toLowerCase().includes(query.toLowerCase())
      })
  }, [salaries, driverAdvancesSummary, driverMap, query])

  const fetchSalaries = async () => {
    try {
      const driverRes = await axios.get(`${baseURL}api/driver/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const driverList = driverRes.data || []
      setDrivers(driverList)
      
      // Fetch salary for each driver - silently handle 404s
      const salaryPromises = driverList.map(d =>
        axios.get(`${baseURL}api/salary/${subAdminId}/${d.id}`)
          .catch(err => {
            // Silent 404 handling for drivers without salary records
            if (err.response?.status === 404) {
              return { data: null }
            }
            console.warn(`Could not fetch salary for driver ${d.id}:`, err.response?.status)
            return { data: null }
          })
      )
      const salaryResults = await Promise.all(salaryPromises)
      setSalaries(salaryResults.map(r => r.data).filter(s => s))
    } catch (e) {
      console.warn('Failed to load driver salaries:', e.response?.status)
      setDrivers([])
      setSalaries([])
    }
  }

  const fetchDeductions = async () => {
    try {
      const res = await axios.get(`${baseURL}api/salary/subadmin/${subAdminId}/deductions`)
      setDeductions(res.data || [])
    } catch (e) {
      // Graceful fallback: show empty state instead of error toast
      console.warn('Could not load deductions:', e.response?.status)
      setDeductions([])
    }
  }

  const fetchAttendanceSalaries = async () => {
    try {
      const [year, month] = selectedMonth.split('-')
      const res = await axios.get(`${baseURL}api/salary/subadmin/${subAdminId}/attendance-salary?month=${month}&year=${year}`)
      
      // Create a map of driverId -> attendance salary data
      const salaryMap = new Map()
      if (res.data && res.data.drivers) {
        res.data.drivers.forEach(driver => {
          salaryMap.set(String(driver.driverId), driver)
        })
      }
      setAttendanceSalaries(salaryMap)
    } catch (e) {
      console.warn('Could not fetch attendance salaries:', e.response?.status)
      setAttendanceSalaries(new Map())
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchSalaries(), fetchDeductions(), fetchAttendanceSalaries()])
      setLoading(false)
    }
    if (token && subAdminId) init()
  }, [token, subAdminId, selectedMonth])

  const openAddModal = () => {
    setIsEdit(false)
    setEditingDeduction(null)
    setForm({ driverId: "", amount: "", date: selectedMonth + '-01', description: "" })
    setIsModalOpen(true)
  }

  const openEditModal = (driverId) => {
    const salary = salaryMap.get(String(driverId))
    if (!salary) {
      toast.error("Set base salary first")
      return
    }
    setIsEdit(true)
    setEditingDeduction({ driverId, salary })
    setForm({
      driverId: String(driverId),
      amount: String(salary.baseSalary || 0),
      date: "",
      description: ""
    })
    setIsModalOpen(true)
  }

  const openEditAdvanceModal = (advance) => {
    setIsEdit(true)
    setEditingDeduction(advance)
    setForm({
      driverId: String(advance.driverId),
      amount: String(advance.amount),
      date: advance.date,
      description: advance.description || ""
    })
    setIsDetailsModalOpen(false)
    setIsModalOpen(true)
  }

  const showAdvanceDetails = (driverId) => {
    const advances = driverAdvancesSummary.get(String(driverId))
    if (!advances || advances.records.length === 0) {
      toast.info("No advance records for this month")
      return
    }
    setSelectedDriverAdvances(advances.records)
    setIsDetailsModalOpen(true)
  }

  const handleDeleteAdvance = async (advanceId) => {
    if (!confirm("Delete this advance record?")) return
    try {
      await axios.delete(`${baseURL}api/salary/deductions/${advanceId}`)
      toast.success("Advance deleted")
      fetchDeductions()
      // Close details modal and refresh
      setIsDetailsModalOpen(false)
    } catch (e) {
      console.warn('Delete failed:', e.response?.status)
      toast.error("Delete failed")
    }
  }

  const openDeleteConfirmation = (driverId, driverName) => {
    setDeleteTarget({ driverId, driverName })
    setDeleteConfirmOpen(true)
  }

  const handleDeleteMonthAdvances = async () => {
    if (!deleteTarget) return
    
    try {
      const advances = driverAdvancesSummary.get(String(deleteTarget.driverId))
      if (!advances || advances.records.length === 0) {
        toast.info("No advances to delete")
        setDeleteConfirmOpen(false)
        return
      }

      // Delete all advance records for this driver in selected month
      const deletePromises = advances.records.map(adv =>
        axios.delete(`${baseURL}api/salary/deductions/${adv.id}`)
      )
      
      await Promise.all(deletePromises)
      toast.success(`All advances deleted for ${deleteTarget.driverName}`)
      fetchDeductions()
      setDeleteConfirmOpen(false)
      setDeleteTarget(null)
    } catch (e) {
      console.warn('Failed to delete advances:', e.response?.status)
      toast.error("Failed to delete advances")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.driverId || !form.amount || Number(form.amount) <= 0) {
      toast.error("Select driver and valid amount")
      return
    }
    try {
      if (isEdit && editingDeduction && editingDeduction.id) {
        // Update existing advance record
        await axios.put(`${baseURL}api/salary/deductions/${editingDeduction.id}`, {
          amount: Number(form.amount),
          description: form.description,
          date: form.date,
        })
        toast.success("Advance updated")
        fetchDeductions()
      } else if (isEdit && editingDeduction && editingDeduction.salary) {
        // Update base salary
        await axios.post(`${baseURL}api/salary/${subAdminId}/${form.driverId}/set`, {
          baseSalary: Number(form.amount),
        })
        toast.success("Salary updated")
        fetchSalaries()
      } else {
        // Add new advance deduction
        await axios.post(`${baseURL}api/salary/${subAdminId}/${form.driverId}/deduct`, {
          amount: Number(form.amount),
          description: form.description,
          date: form.date,
        })
        toast.success("Advance added")
        fetchDeductions()
      }
      setIsModalOpen(false)
    } catch (e) {
      console.warn('Save failed:', e.response?.status)
      toast.error("Save failed")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 md:ml-60 mt-20 sm:mt-0">
        <ToastContainer />
        <div className="mb-5">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-3">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">Advance Salary</h1>
              <p className="text-xs text-gray-500 mt-0.5">Manage driver salaries and advances</p>
            </div>
            <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg text-black font-medium shadow-sm hover:shadow transition-all">
              <FiPlus size={18} /> Add Advance
            </button>
          </div>
          <div className="flex flex-wrap gap-2 items-end">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                placeholder="Search driver..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-medium text-gray-600 mb-1">Month</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e)=>setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sr</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Driver</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Base Salary</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Days/Trips</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Earned</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Advance</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Remaining</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {displayDrivers.map((driver, idx) => {
                    const dId = String(driver.id)
                    const salary = salaryMap.get(dId)
                    const baseSalary = Number(salary?.baseSalary || 0)
                    const advances = driverAdvancesSummary.get(dId)
                    const totalAdvance = advances?.total || 0
                    
                    // Get attendance-based salary data
                    const attendanceData = attendanceSalaries.get(dId)
                    const earnedSalary = attendanceData?.earnedSalary || 0
                    const salaryType = attendanceData?.salaryType || 'fixed'
                    const daysPresent = attendanceData?.attendance?.daysPresent || 0
                    const daysAbsent = attendanceData?.attendance?.daysAbsent || 0
                    const daysHalfDay = attendanceData?.attendance?.daysHalfDay || 0
                    const totalDays = attendanceData?.attendance?.totalWorkingDays || 0
                    const totalTrips = attendanceData?.trips?.totalTrips || 0
                    const perTripRate = attendanceData?.perTripRate || 0
                    
                    // Calculate remaining based on earned salary (not base salary)
                    const remaining = earnedSalary - totalAdvance
                    
                    return (
                      <tr key={driver.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">{idx + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-semibold text-xs">
                              {driver.name?.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-sm text-gray-900">{driver.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            salaryType === 'fixed' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {salaryType === 'fixed' ? 'Fixed' : 'Per Trip'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold whitespace-nowrap">
                          {salaryType === 'fixed' ? (
                            <>₹ {baseSalary % 1 === 0 ? baseSalary : baseSalary.toFixed(2)}</>
                          ) : (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-500">Base: ₹{baseSalary % 1 === 0 ? baseSalary : baseSalary.toFixed(2)}</span>
                              <span className="text-xs text-purple-600 font-bold">Rate: ₹{perTripRate % 1 === 0 ? perTripRate : perTripRate.toFixed(2)}/trip</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {salaryType === 'fixed' ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-gray-600">{daysPresent}P</span>
                              </div>
                              {daysHalfDay > 0 && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                  <span className="text-gray-600">{daysHalfDay}H</span>
                                </div>
                              )}
                              {daysAbsent > 0 && (
                                <div className="flex items-center gap-1.5 text-xs">
                                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                  <span className="text-gray-600">{daysAbsent}A</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                              <span className="text-sm font-semibold text-gray-900">{totalTrips} trips</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-green-600 font-bold whitespace-nowrap">
                          ₹ {earnedSalary % 1 === 0 ? earnedSalary : earnedSalary.toFixed(2)}
                        </td>
                        <td 
                          className="px-4 py-3 text-sm text-blue-600 font-bold cursor-pointer hover:text-blue-700 hover:underline whitespace-nowrap"
                          onClick={() => showAdvanceDetails(dId)}
                          title="Click to view details"
                        >
                          ₹ {totalAdvance % 1 === 0 ? totalAdvance : totalAdvance.toFixed(2)}
                        </td>
                        <td className={`px-4 py-3 text-sm font-semibold whitespace-nowrap ${
                          remaining < 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          ₹ {remaining % 1 === 0 ? remaining : remaining.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={()=>openEditModal(dId)} 
                              className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" 
                              title="Edit Base Salary"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button 
                              onClick={()=>openDeleteConfirmation(dId, driver.name)} 
                              className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors" 
                              title="Delete All Advances"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {displayDrivers.length === 0 && (
                    <tr>
                      <td className="px-4 py-8 text-center text-gray-500 text-sm" colSpan={9}>
                        <FiSearch size={36} className="text-gray-300 mx-auto mb-2" />
                        <p className="font-medium">No records found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
              <div className="bg-yellow-400 px-5 py-4 rounded-t-lg relative">
                <button onClick={()=>setIsModalOpen(false)} className="absolute top-3 right-3 text-gray-700 hover:text-gray-900">
                  <FiX size={20} />
                </button>
                <h2 className="text-lg font-bold text-gray-900">
                  {isEdit && editingDeduction?.id ? 'Edit Advance' : isEdit ? 'Edit Base Salary' : 'Add Advance'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-gray-700">Driver</label>
                  <select
                    value={form.driverId}
                    onChange={(e)=>setForm({...form, driverId:e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                    disabled={isEdit}
                  >
                    <option value="">Select driver</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-gray-700">
                    {isEdit && editingDeduction?.salary ? 'Base Salary (₹)' : 'Advance Amount (₹)'}
                  </label>
                  <input type="number" min="0" step="0.01" value={form.amount} onChange={(e)=>setForm({...form, amount:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" placeholder="Enter amount" required />
                </div>
                {(!isEdit || (isEdit && editingDeduction?.id)) && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-gray-700">Date</label>
                      <input type="date" value={form.date} onChange={(e)=>setForm({...form, date:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400" required />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 text-gray-700">Description</label>
                      <textarea value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none" placeholder="Reason for advance" rows="2" />
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-2 pt-3">
                  <button type="button" onClick={()=>setIsModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg text-black text-sm font-semibold shadow-sm">
                    {isEdit && editingDeduction?.id ? 'Update' : isEdit ? 'Save' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <FiTrash2 size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Delete Advances</h2>
                    <p className="text-sm text-white/90">This action cannot be undone</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete <span className="font-bold">all advance records</span> for{' '}
                  <span className="font-bold text-gray-900">{deleteTarget?.driverName}</span> in{' '}
                  <span className="font-bold text-gray-900">
                    {new Date(selectedMonth + '-01').toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}
                  </span>?
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-800">
                    <strong>⚠️ Warning:</strong> This will delete {driverAdvancesSummary.get(String(deleteTarget?.driverId))?.records.length || 0} advance record(s).
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setDeleteConfirmOpen(false)
                      setDeleteTarget(null)
                    }} 
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteMonthAdvances} 
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    Yes, Delete All
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Advance Details Modal */}
        {isDetailsModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-5 py-3 rounded-t-lg">
                <button onClick={()=>setIsDetailsModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600">
                  <FiX size={20} />
                </button>
                <h2 className="text-lg font-bold text-gray-800">Advance Details</h2>
                <p className="text-xs text-gray-500 mt-0.5">{new Date(selectedMonth + '-01').toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}</p>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {selectedDriverAdvances.map((adv, idx) => (
                    <div key={adv.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <div>
                            <span className="text-xs text-gray-500 uppercase font-medium">Date</span>
                            <p className="text-sm font-semibold text-gray-900 mt-0.5">{new Date(adv.date).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase font-medium">Amount</span>
                            <p className="text-sm font-bold text-yellow-600 mt-0.5">₹ {Number(adv.amount).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500 uppercase font-medium">Driver</span>
                            <p className="text-sm font-semibold text-gray-900 mt-0.5">{driverMap.get(String(adv.driverId))?.name || 'N/A'}</p>
                          </div>
                          <div className="col-span-3">
                            <span className="text-xs text-gray-500 uppercase font-medium">Description</span>
                            <p className="text-sm text-gray-700 mt-0.5">{adv.description || '-'}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => openEditAdvanceModal(adv)} 
                            className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteAdvance(adv.id)} 
                            className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="sticky bottom-0 bg-yellow-50 border-t px-5 py-3 rounded-b-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700">Total Advances:</span>
                  <span className="text-lg font-bold text-yellow-600">
                    ₹ {selectedDriverAdvances.reduce((sum, a) => sum + Number(a.amount), 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvanceSalary
