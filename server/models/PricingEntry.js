import mongoose from 'mongoose';

const pricingEntrySchema = new mongoose.Schema({
    plan: {
        type: String,
        required: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    }
});

const PricingEntry = mongoose.models.PricingEntry || mongoose.model('PricingEntry', pricingEntrySchema);

export default PricingEntry;
