"use client"

import { useEffect, useMemo, useState } from "react"
import Sidebar from "../slidebar/page"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import baseURL from "@/utils/api"
import axios from "axios"
import { FiSearch, FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi"

const Attendance = () => {
  const [drivers, setDrivers] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [editingRec, setEditingRec] = useState(null)
  const [form, setForm] = useState({ driverId: "", date: "", punchIn: "", punchOut: "", notes: "", status: "Present" })

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null
  const subAdminId = typeof window !== 'undefined' ? localStorage.getItem("id") : null

  const driverMap = useMemo(() => {
    const map = new Map()
    drivers.forEach(d => map.set(String(d.id), d))
    return map
  }, [drivers])

  const filtered = useMemo(() => {
    let result = records
    
    // Filter by driver name
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(r => {
        const name = driverMap.get(String(r.driverId))?.name?.toLowerCase() || ""
        return name.includes(q)
      })
    }
    
    // Filter by date range
    if (dateFrom) {
      result = result.filter(r => r.date >= dateFrom)
    }
    if (dateTo) {
      result = result.filter(r => r.date <= dateTo)
    }
    
    return result
  }, [records, query, dateFrom, dateTo, driverMap])

  const fetchDrivers = async () => {
    try {
      const res = await axios.get(`${baseURL}api/driver/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDrivers(res.data || [])
    } catch (e) {
      // Silently handle error, don't show toast for missing auth
      console.warn('Could not load drivers:', e.response?.status)
      setDrivers([])
    }
  }

  const fetchAttendance = async () => {
    try {
      const res = await axios.get(`${baseURL}api/attendance/subadmin/${subAdminId}`)
      setRecords(res.data || [])
    } catch (e) {
      // Silently handle error, don't show toast
      console.warn('Could not load attendance:', e.response?.status)
      setRecords([])
    }
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchDrivers(), fetchAttendance()])
      setLoading(false)
    }
    if (token && subAdminId) init()
  }, [token, subAdminId])

  const openAddModal = () => {
    setIsEdit(false)
    setEditingRec(null)
    const today = new Date()
    const dateStr = today.toISOString().slice(0,10)
    const timeStr = today.toTimeString().slice(0,5) // HH:mm format
    setForm({
      driverId: "",
      date: dateStr,
      punchIn: timeStr,
      punchOut: "",
      notes: "",
      status: "Present"
    })
    setIsModalOpen(true)
  }

  const openEditModal = (row) => {
    setIsEdit(true)
    setEditingRec(row)
    
    setForm({
      driverId: String(row.driverId),
      date: row.date,
      punchIn: row.punchIn || "",
      punchOut: row.punchOut || "",
      notes: row.notes || "",
      status: row.status || "Present"
    })
    setIsModalOpen(true)
  }

  const handleDelete = async (row) => {
    if (!confirm("Delete this attendance?")) return
    try {
      await axios.delete(`${baseURL}api/attendance/${row.id}`)
      toast.success("Deleted")
      fetchAttendance()
    } catch (e) {
      console.warn('Delete failed:', e.response?.status)
      toast.error("Delete failed")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.driverId || !form.date || !form.punchIn) {
      toast.error("Select driver, date and punch in")
      return
    }
    try {
      if (isEdit && editingRec) {
        await axios.put(`${baseURL}api/attendance/${editingRec.id}`, {
          date: form.date,
          punchIn: form.punchIn,
          punchOut: form.punchOut,
          notes: form.notes,
          status: form.status,
        })
        toast.success("Updated")
      } else {
        await axios.post(`${baseURL}api/attendance/${subAdminId}/${form.driverId}`, {
          date: form.date,
          punchIn: form.punchIn,
          punchOut: form.punchOut,
          notes: form.notes,
          status: form.status,
        })
        toast.success("Attendance added")
      }
      setIsModalOpen(false)
      fetchAttendance()
    } catch (e) {
      console.warn('Save failed:', e.response?.status, e.response?.data)
      toast.error("Save failed")
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4 md:p-6 md:ml-60 mt-20 sm:mt-0">
        <ToastContainer />
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800">Attendance</h1>
            <button onClick={openAddModal} className="flex items-center gap-2 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg text-black">
              <FiPlus /> Add Attendance
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 items-end">
            <div className="relative flex-1 min-w-[200px]">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e)=>setQuery(e.target.value)}
                placeholder="Search driver..."
                className="w-full pl-9 pr-3 py-2 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e)=>setDateFrom(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e)=>setDateTo(e.target.value)}
                className="px-3 py-2 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); }}
                className="px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Clear Dates
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-6 bg-white rounded-lg shadow-sm border">Loading...</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Sr No</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Driver Name</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Punch In</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Punch Out</th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="p-3 text-gray-900">{idx + 1}</td>
                    <td className="p-3 text-gray-900">{driverMap.get(String(row.driverId))?.name || '-'}</td>
                    <td className="p-3 text-gray-900">{row.date}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        row.status === 'Present' ? 'bg-green-100 text-green-700' :
                        row.status === 'Absent' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {row.status || 'Present'}
                      </span>
                    </td>
                    <td className="p-3 text-gray-900">{row.punchIn || '-'}</td>
                    <td className="p-3 text-gray-900">{row.punchOut || '-'}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={()=>openEditModal(row)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><FiEdit2/></button>
                        <button onClick={()=>handleDelete(row)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><FiTrash2/></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td className="p-4 text-center text-gray-500" colSpan={7}>No records</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative shadow-xl">
              <button onClick={()=>setIsModalOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><FiX size={22}/></button>
              <h2 className="text-xl font-bold mb-4 text-gray-900">{isEdit ? 'Edit Attendance' : 'Add Attendance'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Driver</label>
                  <select
                    value={form.driverId}
                    onChange={(e)=>setForm({...form, driverId:e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900"
                    disabled={isEdit}
                  >
                    <option value="">Select driver</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Status</label>
                  <select
                    value={form.status}
                    onChange={(e)=>setForm({...form, status:e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Half-Day">Half-Day</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Date</label>
                  <input type="date" value={form.date} onChange={(e)=>setForm({...form, date:e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Punch In Time</label>
                  <input type="time" value={form.punchIn} onChange={(e)=>setForm({...form, punchIn:e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Punch Out Time</label>
                  <input type="time" value={form.punchOut} onChange={(e)=>setForm({...form, punchOut:e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-700">Notes</label>
                  <input type="text" value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} className="w-full border rounded-lg px-3 py-2 bg-white text-gray-900" placeholder="Notes (optional)" />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button type="button" onClick={()=>setIsModalOpen(false)} className="px-5 py-2 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2 bg-yellow-400 hover:bg-yellow-500 rounded-lg text-black font-semibold shadow-sm transition-colors">{isEdit ? 'Save' : 'Add'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Attendance
