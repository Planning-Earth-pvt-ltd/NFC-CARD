const express = require('express');
const router = express.Router();

// FIXED: Pack prices configuration
const pack_price = {
    basic: 699,
    standard: 1499,
    premium: 0
};

// GET /api/packs - Fetch pack prices
router.get('/', async (req, res) => {
    try {
        console.log('>>> API /packs called');
        
        // For now, just return the static prices
        // Later you can fetch from database if needed
        res.json({
            success: true,
            message: 'Pack prices fetched successfully',
            pack_price,
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
                'Enterprise Pack': {
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
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;