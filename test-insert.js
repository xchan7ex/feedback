import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Feedback from './server/models/Feedback.js';

dotenv.config();

console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
.then(async () => {
    console.log('Successfully connected! Attempting to save...');
    try {
        const newFeedback = new Feedback({
            nickname: 'CLI_Test',
            review: 'Test insert',
            rating: 5,
        });
        await newFeedback.save();
        console.log('Successfully saved to MongoDB!');
        process.exit(0);
    } catch (err) {
        console.error('Save Failed:', err.message);
        process.exit(1);
    }
})
.catch((err) => {
    console.error('Connection Failed:', err.message);
    process.exit(1);
});
