import mongoose, { Document, Schema } from 'mongoose'

export interface IPayment extends Document {
  _id: mongoose.Types.ObjectId
  invoiceId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  amount: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  paymentMethod?: string
  transactionId?: string
  createdAt: Date
  updatedAt: Date
  invoice?: any
  user?: any
}

const PaymentSchema = new Schema<IPayment>({
  invoiceId: {
    type: Schema.Types.ObjectId,
    ref: 'Invoice',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  transactionId: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  }
}, {
  timestamps: true
})

// Create indexes
PaymentSchema.index({ invoiceId: 1 })
PaymentSchema.index({ userId: 1 })
PaymentSchema.index({ status: 1 })
PaymentSchema.index({ transactionId: 1 })

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema)
