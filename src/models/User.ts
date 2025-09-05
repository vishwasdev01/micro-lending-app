import mongoose, { Document, Schema } from 'mongoose'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  password: string
  name: string
  role: 'FINANCE_MANAGER' | 'CUSTOMER'
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['FINANCE_MANAGER', 'CUSTOMER'],
    required: true,
    index: true
  }
}, {
  timestamps: true
})

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
