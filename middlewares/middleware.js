const validateApplicationData = (req, res, next) => {
    const { fullName, businessName, jobTitle, bio, email, phone, industry, termsConsent } = req.body;
    
    const errors = [];
    
    if (!fullName || fullName.trim().length < 2) {
        errors.push('Full name is required and must be at least 2 characters');
    }
    
    if (!businessName || businessName.trim().length < 2) {
        errors.push('Business name is required and must be at least 2 characters');
    }
    
    if (!jobTitle || jobTitle.trim().length < 2) {
        errors.push('Job title is required');
    }
    
    if (!bio || bio.trim().length < 10) {
        errors.push('Bio is required and must be at least 10 characters');
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Valid email is required');
    }
    
    if (!phone || phone.trim().length < 10) {
        errors.push('Valid phone number is required');
    }
    
    if (!industry) {
        errors.push('Industry selection is required');
    }
    
    if (!termsConsent) {
        errors.push('Terms consent is required');
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors
        });
    }
    
    next();
};

module.exports = { validateApplicationData };
