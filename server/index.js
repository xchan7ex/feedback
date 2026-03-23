import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Feedback from './models/Feedback.js';
import PricingEntry from './models/PricingEntry.js';
import Contact from './models/Contact.js';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((err) => console.error('Error connecting to MongoDB:', err));


// Basic route to check if server is running
app.get('/', (req, res) => {
    res.send('Universe3D API is running...');
});

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

// POST /api/pricing - Save pricing inquiry
app.post('/api/pricing', async (req, res) => {
    try {
        const { plan, name, email, phone, company, message } = req.body;

        if (!plan || !name || !email || !phone) {
            return res.status(400).json({ message: 'Plan, name, email, and phone are required.' });
        }

        const newPricingEntry = new PricingEntry({
            plan,
            name,
            email,
            phone,
            company,
            message,
            timestamp: new Date()
        });

        const savedEntry = await newPricingEntry.save();

        res.status(201).json({
            message: 'Pricing inquiry saved successfully',
            entry: savedEntry
        });

    } catch (error) {
        console.error('Error saving pricing inquiry:', error);
        res.status(500).json({
            message: 'Internal server error while saving pricing inquiry.',
            error: error.message,
            stack: error.stack
        });
    }
});

// POST /api/contact - Save contact inquiry
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, phone, interest, message } = req.body;

        if (!name || !email || !interest) {
            return res.status(400).json({ message: 'Name, email, and interest are required.' });
        }

        const newContact = new Contact({
            name,
            email,
            phone,
            interest,
            message,
            timestamp: new Date()
        });

        const savedContact = await newContact.save();

        res.status(201).json({
            message: 'Contact message saved successfully',
            contact: savedContact
        });

    } catch (error) {
        console.error('Error saving contact message:', error);
        res.status(500).json({
            message: 'Internal server error while saving contact message.',
            error: error.message,
            stack: error.stack
        });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
