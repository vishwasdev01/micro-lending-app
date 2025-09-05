const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/micro-lending');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Invoice schema
const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  customerId: mongoose.Schema.Types.ObjectId,
  createdById: mongoose.Schema.Types.ObjectId,
  amount: Number,
  dueDate: Date,
  status: String,
  description: String
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', InvoiceSchema);

async function fixSmallAmounts() {
  try {
    await connectDB();
    
    // Find invoices with amount less than 0.50
    const smallInvoices = await Invoice.find({ amount: { $lt: 0.50 } });
    
    console.log(`Found ${smallInvoices.length} invoices with amounts less than $0.50`);
    
    if (smallInvoices.length > 0) {
      console.log('Small invoices:');
      smallInvoices.forEach(invoice => {
        console.log(`- ${invoice.invoiceNumber}: $${invoice.amount}`);
      });
      
      // Update all small amounts to $10.00
      const result = await Invoice.updateMany(
        { amount: { $lt: 0.50 } },
        { $set: { amount: 10.00 } }
      );
      
      console.log(`Updated ${result.modifiedCount} invoices to $10.00`);
    }
    
    // Show all current invoices
    const allInvoices = await Invoice.find({}).sort({ createdAt: -1 });
    console.log('\nAll invoices:');
    allInvoices.forEach(invoice => {
      console.log(`- ${invoice.invoiceNumber}: $${invoice.amount} (${invoice.status})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixSmallAmounts();
