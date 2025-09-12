const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const upload = require('../middlewares/upload');
dotenv.config();

const Application = require('../models/DigitalCardProfile');
const { sendApplicationEmail, sendConfirmationEmail, testEmailConfig } = require('../Service/emailService');

// FIXED: Pack prices mapping for proper price calculation
const PACK_PRICES = {
  'Starter Pack': 699,
  'Entrepreneur Plan': 1499,
  'Enterprise Pack': 0
};

// GET /api/applications/packs - New route to get pack prices
router.get('/packs', async (req, res) => {
  try {
    res.json({
      success: true,
      pack_price: {
        basic: PACK_PRICES['Starter Pack'],
        standard: PACK_PRICES['Entrepreneur Plan'],
        premium: PACK_PRICES['Enterprise Pack']
      }
    });
  } catch (error) {
    console.error('Error fetching pack prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pack prices',
      message: error.message
    });
  }
});

// ✅ FIXED: Validate required fields (industry removed)
function validateRequiredFields(data) {
  const required = ['fullName', 'businessName', 'email', 'phone'];
  const missing = required.filter(field => !data[field] || !data[field].toString().trim());

  if (missing.length > 0) {
    return { isValid: false, errors: missing.map(field => `${field} is required`) };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email.trim())) {
    return { isValid: false, errors: ['Valid email address is required'] };
  }

  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  if (!phoneRegex.test(data.phone.replace(/[\s\-\(\)]/g, ''))) {
    return { isValid: false, errors: ['Valid phone number is required'] };
  }

  return { isValid: true };
}

// FIXED: Single function to prepare application data
function prepareApplicationData(formData, files = {}) {
  console.log('>>> PREPARING DATA WITH:', {
    selectedPlan: formData.selectedPlan,
    selectedPrice: formData.selectedPrice,
    typeof_price: typeof formData.selectedPrice
  });

  // FIXED: Determine correct price
  let finalPrice = formData.selectedPrice;

  if (!finalPrice || isNaN(parseFloat(finalPrice))) {
    finalPrice = PACK_PRICES[formData.selectedPlan] || PACK_PRICES['Starter Pack'];
    console.log('>>> MAPPED PRICE FROM PLAN:', finalPrice);
  } else {
    finalPrice = parseFloat(finalPrice);
  }

  const validPlans = Object.keys(PACK_PRICES);
  const selectedPlan = validPlans.includes(formData.selectedPlan) 
    ? formData.selectedPlan 
    : 'Starter Pack';

  console.log('>>> FINAL PRICE:', finalPrice, 'FINAL PLAN:', selectedPlan);

  return {
    fullName: formData.fullName.trim(),
    businessName: formData.businessName.trim(),
    jobTitle: formData.jobTitle?.trim() || '',
    tagline: formData.tagline?.trim() || '',
    bio: formData.bio?.trim() || '',
    address: formData.address?.trim() || '',
    email: formData.email.trim().toLowerCase(),
    phone: formData.phone.trim(),
    whatsappEnabled: Boolean(formData.whatsappEnabled),
    altPhone: formData.altPhone?.trim() || '',
    website: formData.website?.trim() || '',
    linkedin: formData.linkedin?.trim() || '',
    instagram: formData.instagram?.trim() || '',
    facebook: formData.facebook?.trim() || '',
    twitter: formData.twitter?.trim() || '',
    youtube: formData.youtube?.trim() || '',
    otherSocialName: formData.otherSocialName?.trim() || '',
    otherSocialUrl: formData.otherSocialUrl?.trim() || '',
    primaryColor: formData.primaryColor || '#1e88e5',
    secondaryColor: formData.secondaryColor || '#69db7c',
    designPreference: formData.designPreference || 'modern',
    industry: formData.industry || null, 
    sectionsInclude: Array.isArray(formData.sectionsInclude) ? formData.sectionsInclude : [],
    servicesProducts: formData.servicesProducts?.trim() || '',
    achievements: formData.achievements?.trim() || '',
    primaryCta: formData.primaryCta || 'contact',
    customCta: formData.customCta?.trim() || '',
    downloadTitle: formData.downloadTitle?.trim() || '',
    selectedPlan: selectedPlan,
    price: finalPrice,
    termsConsent: Boolean(formData.termsConsent),
    additionalNotes: formData.additionalNotes?.trim() || '',
    applicationDate: new Date(),
    status: 'pending',
    paymentStatus: 'unpaid',
    razorpayOrderId: formData.razorpayOrderId || null,
    razorpayPaymentId: formData.razorpayPaymentId || null,
    imagePath: files?.image && files.image[0] ? files.image[0].path : null,
    documentPath: files?.document && files.document[0] ? files.document[0].path : null
  };
}

// FIXED: Submit application
router.post(
  '/submit',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'document', maxCount: 1 }
  ]),
  async (req, res) => {
    console.log('>>> RECEIVED BODY:', JSON.stringify(req.body, null, 2));
    console.log('>>> RECEIVED FILES:', req.files);

    try {
      const formData = req.body;
      const validation = validateRequiredFields(formData);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
      }

      const profileData = prepareApplicationData(formData, req.files);

      console.log('>>> SAVING TO DB:', {
        selectedPlan: profileData.selectedPlan,
        price: profileData.price,
        fullName: profileData.fullName,
        email: profileData.email
      });

      const savedApp = await Application.create(profileData);

      console.log('>>> SAVED APPLICATION:', {
        id: savedApp.id,
        price: savedApp.price,
        selectedPlan: savedApp.selectedPlan
      });

      // Send emails async
      Promise.allSettled([
        sendApplicationEmail(savedApp),
        sendConfirmationEmail(savedApp)
      ]).then(([adminRes, userRes]) => {
        if (adminRes.status !== 'fulfilled') {
          console.error('Admin email failed:', adminRes.reason || adminRes.value?.error);
        }
        if (userRes.status !== 'fulfilled') {
          console.error('User email failed:', userRes.reason || userRes.value?.error);
        }
      });

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: {
          id: savedApp.id,
          fullName: savedApp.fullName,
          businessName: savedApp.businessName,
          selectedPlan: savedApp.selectedPlan,
          price: savedApp.price,
          applicationDate: savedApp.applicationDate,
          status: savedApp.status,
          email: savedApp.email,
          phone: savedApp.phone
        }
      });
    } catch (error) {
      console.error('>>> ERROR SUBMITTING APPLICATION:', error);
      res.status(500).json({
        success: false,
        error: 'Server error',
        message: error.message
      });
    }
  }
);

// GET /api/applications
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Application.findAndCountAll({
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Fetch error', message: err.message });
  }
});

// GET /api/applications/:id
router.get('/:id', async (req, res) => {
  try {
    const app = await Application.findByPk(req.params.id);
    if (!app) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/applications/:id/status
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status', validStatuses });
    }

    const app = await Application.findByPk(req.params.id);
    if (!app) return res.status(404).json({ success: false, error: 'Not found' });

    app.status = status;
    await app.save();

    res.json({ success: true, message: 'Status updated', data: { id: app.id, status: app.status } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/applications/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Application.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/applications/:id/resend-emails
router.post('/:id/resend-emails', async (req, res) => {
  try {
    const app = await Application.findByPk(req.params.id);
    if (!app) return res.status(404).json({ success: false, error: 'Not found' });

    const [adminEmail, confirmationEmail] = await Promise.allSettled([
      sendApplicationEmail(app),
      sendConfirmationEmail(app)
    ]);

    res.json({
      success: true,
      data: {
        adminEmail: adminEmail.status === 'fulfilled' && adminEmail.value.success,
        confirmationEmail: confirmationEmail.status === 'fulfilled' && confirmationEmail.value.success
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/applications/test-email
router.get('/test-email', async (req, res) => {
  try {
    const result = await testEmailConfig();
    res.json({
      success: result.success,
      message: result.success ? 'Email working' : 'Email failed',
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;