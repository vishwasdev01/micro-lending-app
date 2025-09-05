'use client'

import { useState } from 'react'
import { Invoice } from '@/types'
import { Button } from '@/components/ui/button'
import { Eye, Link as LinkIcon, Search, Filter, FileText } from 'lucide-react'

interface InvoiceListProps {
  invoices: Invoice[]
  onRefresh: () => void
}

export function InvoiceList({ invoices, onRefresh }: InvoiceListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || invoice.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const generatePaymentLink = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/payment-link`, {
        method: 'POST',
      })
      
      if (response.ok) {
        const data = await response.json()
        // Copy to clipboard
        await navigator.clipboard.writeText(data.paymentLink)
        alert('Payment link copied to clipboard!')
      } else {
        alert('Failed to generate payment link')
      }
    } catch (error) {
      console.error('Error generating payment link:', error)
      alert('Error generating payment link')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending'
      case 'PAID':
        return 'status-paid'
      case 'OVERDUE':
        return 'status-overdue'
      case 'CANCELLED':
        return 'status-cancelled'
      default:
        return 'status-cancelled'
    }
  }

  return (
    <div className="card">
      <div className="table-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Invoices</h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search invoices..."
                className="input-field pr-4 py-2 pl-12"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Invoice #
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredInvoices.map((invoice) => (
              <tr key={invoice._id} className="table-row">
                <td className="table-cell font-medium text-gray-900">
                  {invoice.invoiceNumber}
                </td>
                <td className="table-cell">
                  <div>
                    <div className="font-medium text-gray-900">{invoice.customer?.name}</div>
                    <div className="text-gray-500 text-sm">{invoice.customer?.email}</div>
                  </div>
                </td>
                <td className="table-cell font-semibold text-gray-900">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(invoice.amount)}
                </td>
                <td className="table-cell text-gray-900">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </td>
                <td className="table-cell">
                  <span className={`status-badge ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex space-x-2">
                    {invoice.status !== 'PAID' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generatePaymentLink(invoice._id)}
                        className="btn-secondary text-xs px-3 py-1"
                      >
                        <LinkIcon className="w-3 h-3 mr-1" />
                        Payment Link
                      </Button>
                    ) : null}
                    <Button
                      variant="outline"
                      size="sm"
                      className="btn-secondary text-xs px-3 py-1"
                      onClick={() => window.location.href = `/payment/${invoice._id}`}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500">Get started by creating your first invoice.</p>
          </div>
        )}
      </div>
    </div>
  )
}
