'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, Mail, Building, Phone, MessageSquare, Filter, Search } from 'lucide-react'

interface Demo {
  _id: string
  name: string
  email: string
  company: string
  phone: string
  preferredDate: string
  preferredTime: string
  message: string
  demoType: 'overview' | 'technical' | 'custom'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
}

interface DemoListProps {
  onRefresh?: () => void
}

export function DemoList({ onRefresh }: DemoListProps) {
  const [demos, setDemos] = useState<Demo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    fetchDemos()
  }, [])

  const fetchDemos = async () => {
    try {
      const response = await fetch('/api/demo/schedule')
      if (response.ok) {
        const data = await response.json()
        setDemos(data)
      }
    } catch (error) {
      console.error('Error fetching demos:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateDemoStatus = async (demoId: string, status: string) => {
    try {
      const response = await fetch(`/api/demo/schedule/${demoId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        fetchDemos()
        if (onRefresh) onRefresh()
      }
    } catch (error) {
      console.error('Error updating demo status:', error)
    }
  }

  const filteredDemos = demos.filter(demo => {
    const matchesSearch = demo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         demo.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         demo.company.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || demo.status === statusFilter
    
    const matchesDate = !dateFilter || new Date(demo.preferredDate).toDateString() === new Date(dateFilter).toDateString()
    
    return matchesSearch && matchesStatus && matchesDate
  })

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const getDemoTypeLabel = (type: string) => {
    const typeLabels = {
      overview: 'Product Overview',
      technical: 'Technical Deep Dive',
      custom: 'Custom Demo'
    }
    return typeLabels[type as keyof typeof typeLabels] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Scheduled Demos</h3>
            <p className="text-sm text-gray-600">Manage and track demo appointments</p>
          </div>
          <Button
            onClick={fetchDemos}
            variant="outline"
            size="sm"
            className="btn-secondary"
          >
            Refresh
          </Button>
        </div>

        {/* Filters */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search demos..."
              className="input-field pr-4 py-2 pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field"
            placeholder="Filter by date"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Demo Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDemos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No demos scheduled</p>
                  <p className="text-sm">Demos will appear here when customers schedule them.</p>
                </td>
              </tr>
            ) : (
              filteredDemos.map((demo) => (
                <tr key={demo._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {demo.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{demo.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {demo.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {demo.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      {demo.company}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        {new Date(demo.preferredDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center mb-1">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {demo.preferredTime}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getDemoTypeLabel(demo.demoType)}
                      </div>
                      {demo.message && (
                        <div className="flex items-start mt-1">
                          <MessageSquare className="w-3 h-3 mr-1 text-gray-400 mt-0.5" />
                          <span className="text-xs text-gray-500 line-clamp-2">
                            {demo.message}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(demo.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {demo.status === 'pending' && (
                        <>
                          <Button
                            onClick={() => updateDemoStatus(demo._id, 'confirmed')}
                            size="sm"
                            className="btn-primary text-xs"
                          >
                            Confirm
                          </Button>
                          <Button
                            onClick={() => updateDemoStatus(demo._id, 'cancelled')}
                            size="sm"
                            variant="outline"
                            className="btn-secondary text-xs"
                          >
                            Cancel
                          </Button>
                        </>
                      )}
                      {demo.status === 'confirmed' && (
                        <Button
                          onClick={() => updateDemoStatus(demo._id, 'completed')}
                          size="sm"
                          className="btn-primary text-xs"
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
