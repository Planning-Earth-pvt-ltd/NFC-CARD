const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');
const dotenv=require('dotenv')
dotenv.config();
// Enable CORS
app.use(cors({
    origin: ['https://www.planningearth.co.in', 'http://localhost:3000'],
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


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Your existing routes
const applicationRoutes = require('./routes/applicationRoutes');
const paymentRoutes = require('./routes/payments');
app.use('/api/payments', paymentRoutes);
app.use('/api/applications', applicationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});