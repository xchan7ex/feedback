import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
.then(() => {
    console.log('Successfully connected!');
    process.exit(0);
})
.catch((err) => {
    console.error('Connection Failed:', err.message);
    process.exit(1);
});
