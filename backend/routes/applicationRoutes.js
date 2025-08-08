const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
dotenv.config();

const Application = require('../models/DigitalCardProfile');

const { sendApplicationEmail, sendConfirmationEmail, testEmailConfig } = require('../Service/emailService');


// Validate required fields
function validateRequiredFields(data) {
  const required = ['fullName', 'businessName', 'email', 'phone', 'industry'];
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

// Prepare data for creation
function prepareApplicationData(formData) {
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
    industry: formData.industry,
    sectionsInclude: Array.isArray(formData.sectionsInclude) ? formData.sectionsInclude : [],
    servicesProducts: formData.servicesProducts?.trim() || '',
    achievements: formData.achievements?.trim() || '',
    primaryCta: formData.primaryCta || 'contact',
    customCta: formData.customCta?.trim() || '',
    downloadTitle: formData.downloadTitle?.trim() || '',
    selectedPlan: formData.selectedPlan || 'Starter Pack',
    selectedPrice: parseInt(formData.selectedPrice) || 699,
    price: parseFloat(formData.price) || 699,
    termsConsent: Boolean(formData.termsConsent),
    additionalNotes: formData.additionalNotes?.trim() || '',
    applicationDate: new Date(),
    status: 'pending', // match ENUM default
    paymentStatus: 'unpaid', // default
    razorpayOrderId: formData.razorpayOrderId || null,
    razorpayPaymentId: formData.razorpayPaymentId || null
  };
}

// Submit application
router.post('/submit', async (req, res) => {
  try {
    const formData = req.body;
    const validation = validateRequiredFields(formData);

    if (!validation.isValid) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: validation.errors });
    }

    const profileData = prepareApplicationData(formData);
    const savedApp = await Application.create(profileData);

    // Send emails in background
    Promise.allSettled([
      sendApplicationEmail(savedApp),
      sendConfirmationEmail(savedApp)
    ]).then(([adminRes, userRes]) => {
      if (adminRes.status !== 'fulfilled') console.error('Admin email failed:', adminRes.reason || adminRes.value?.error);
      if (userRes.status !== 'fulfilled') console.error('User email failed:', userRes.reason || userRes.value?.error);
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: savedApp.id,
        fullName: savedApp.fullName,
        businessName: savedApp.businessName,
        selectedPlan: savedApp.selectedPlan,
        selectedPrice: savedApp.selectedPrice,
        applicationDate: savedApp.applicationDate,
        status: savedApp.status,
        email: savedApp.email,
        phone: savedApp.phone
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, error: 'Server error', message: error.message });
  }
});


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
