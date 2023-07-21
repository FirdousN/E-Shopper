// File: models/invoiceModel.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  CompanyName: { type: String, required: true },
  qty: { type: Number, required: true },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true },
});

const invoiceSchema = new mongoose.Schema({
  logo: { type: String, required: true },
  name: { type: String, required: true },
  address: [{ type: String, required: true }],
//   address2: { type: String, required: true },
  orderId: { type: String, required: true },
  customerName: { type: String, required: true },
  date: { type: String, required: true },
  paymentTerms: { type: String, required: true },
  items: { type: [itemSchema], required: true },
  total: { type: Number, required: true },
  balanceDue: { type: Number, required: true },
  notes: { type: String, required: true },
  terms: { type: String, required: true },
});

module.exports = mongoose.model('Invoice', invoiceSchema);
