import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Feedback from './models/Feedback.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('Error connecting to MongoDB:', err));

// Routes
// POST /api/feedback - Save new feedback
app.post('/api/feedback', async (req, res) => {
    try {
        console.log('API hit. Mongoose readyState:', mongoose.connection.readyState);
        console.log('Feedback model DB readyState:', Feedback.db.readyState);
        const { nickname, review, rating } = req.body;

        // Validation based on schema
        if (!nickname || !review || !rating) {
            return res.status(400).json({ message: 'Nickname, review, and rating are required.' });
        }

        const newFeedback = new Feedback({
            nickname,
            review,
            rating,
            timestamp: new Date()
        });

        const savedFeedback = await newFeedback.save();
        
        res.status(201).json({ 
            message: 'Feedback saved successfully',
            feedback: savedFeedback 
        });

    } catch (error) {
        console.error('Error saving feedback:', error);
        res.status(500).json({ 
            message: 'Internal server error while saving feedback.',
            error: error.message,
            stack: error.stack
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
