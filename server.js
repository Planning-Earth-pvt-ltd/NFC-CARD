const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const dotenv=require('dotenv')
dotenv.config();
// Enable CORS
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'https://www.planningearth.co.in',
            'https://nfc.planningearth.co.in',
            'http://80.65.208.109:4130'
        ];
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.get('/', (req, res) => {
    try {
        res.sendFile(path.join(__dirname, 'index.html'));
    } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(500).send('Error loading page');
    }
});

app.use(express.json());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Your existing routes
const applicationRoutes = require('./routes/applicationRoutes');
const paymentRoutes = require('./routes/payments');
const price = require('./routes/price');
app.use('/api/payments', paymentRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api',price);

const PORT = process.env.PORT || 4130;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
