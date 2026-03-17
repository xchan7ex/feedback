import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
    nickname: {
        type: String,
        required: true,
        trim: true
    },
    review: {
        type: String,
        required: true,
        trim: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    }
});

// Use the existing model if it exists, otherwise create a new one
const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

export default Feedback;
