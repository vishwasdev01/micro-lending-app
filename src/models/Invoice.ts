import mongoose, { Document, Schema } from 'mongoose'

export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId
  invoiceNumber: string
  customerId: mongoose.Types.ObjectId
  createdById: mongoose.Types.ObjectId
  amount: number
  dueDate: Date
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  description?: string
  createdAt: Date
  updatedAt: Date
  customer?: any
  createdBy?: any
  payments?: any[]
}

const InvoiceSchema = new Schema<IInvoice>({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  createdById: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'PAID', 'OVERDUE', 'CANCELLED'],
    default: 'PENDING',
    index: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

export default mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema)
