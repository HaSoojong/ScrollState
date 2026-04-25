'use strict';

const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/orchestrai';
  await mongoose.connect(uri);
  isConnected = true;
  console.log('✅ Connected to MongoDB:', uri);
}

module.exports = { connectDB, mongoose };
