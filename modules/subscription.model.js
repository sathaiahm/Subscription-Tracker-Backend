import mongoose from "mongoose";
import dayjs from "dayjs";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subscription name is required'],
        trim: true,
        minLength: 2,
        maxLength: 100
    },
    price: {
        type: Number,
        required: [true, 'Subscription price is required'],
        min: [0, 'Price must be greater than 0']
    },
    currency: {
        type: String,
        enum: ['USD', 'EUR', 'INR'],
        default: 'INR'
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        required: [true, 'Frequency is required']
    },
    category: {
        type: String,
        enum: ['sports', 'news', 'entertainment', 'lifestyle', 'technology', 'finance', 'politics', 'others'],
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ["active", "cancelled", "expired"],
        default: "active",
    },
    startDate: { // Fixed: lowercase convention
        type: Date,
        required: true,
        default: Date.now,
        validate: {
            validator: (value) => value <= new Date(), // Fixed: allow current date
            message: 'Start date cannot be in the future'
        }
    },
    renewalDate: { // Fixed: lowercase convention
        type: Date,
        // required: true,
        validate: {
            validator: function (value) {
                return value > this.startDate;
            },
            message: 'Renewal date must be after the start date'
        }
    },
    user: { // Fixed: lowercase convention
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Pre-save hook to calculate renewal date if not provided
subscriptionSchema.pre('save', function (next) {
    if (!this.renewalDate) {
        const renewalPeriod = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365
        };

        if (this.frequency === 'monthly') {
            this.renewalDate = dayjs(this.startDate).add(1, 'month').toDate();
        } else if (this.frequency === 'yearly') {
            this.renewalDate = dayjs(this.startDate).add(1, 'year').toDate();
        } else if (this.frequency === 'weekly') {
            this.renewalDate = dayjs(this.startDate).add(1, 'week').toDate();
        } else if (this.frequency === 'daily') {
            this.renewalDate = dayjs(this.startDate).add(1, 'day').toDate();
        }
    }

    // Check if subscription is expired
    if (this.renewalDate < new Date() && this.status === 'active') {
        this.status = 'expired'; // Fixed: typo 'expried'
    }

    next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;