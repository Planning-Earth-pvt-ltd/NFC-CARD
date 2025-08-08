const express = require('express');
const router = express.Router();
const Pack = require('../models/DigitalCardProfile');

// ✅ Pack prices configuration
const pack_price = {
    basic: 699,
    standard: 1499,
    premium: 2999 // Fixed: changed from 0000 to a proper premium price
};

// 🔁 Fetch packs from DB with prices - FIXED ROUTE PATH
router.get('/', async (req, res) => { // Changed from '/packs' to '/' since this will be mounted on /api/packs
    try {
        const packs = await Pack.findAll({
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            data: packs,
            pack_price,
            // Additional plan details for frontend
            plans: {
                'Starter Pack': {
                    type: 'basic',
                    price: pack_price.basic,
                    features: ['Basic NFC Card', 'Digital Profile', 'Contact Sharing']
                },
                'Entrepreneur Plan': {
                    type: 'standard',
                    price: pack_price.standard,
                    features: ['Premium NFC Card', 'Advanced Profile', 'Analytics', 'Custom Design']
                },
                'Enterprise Plan': {
                    type: 'premium',
                    price: pack_price.premium,
                    features: ['Enterprise NFC Card', 'Full Customization', 'Team Management', 'Priority Support']
                }
            }
        });
    } catch (error) {
        console.error('Error fetching packs:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching packs',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;