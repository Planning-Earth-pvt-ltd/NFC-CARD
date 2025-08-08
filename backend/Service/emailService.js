const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,        // Your Gmail
    pass: process.env.ADMIN_EMAIL_PASS    // App password
  }
});
console.log(process.env.ADMIN_EMAIL)
console.log(process.env.ADMIN_EMAIL_PASS)

// 1. Send email to admin with full application data
const sendApplicationEmail = async (application) => {
  try {
    const subject = `📩 New Application from ${application.fullName}`;
    const recipient = process.env.ADMIN_EMAIL;

    const html = `
      <h2>📝 New Application Submitted</h2>
      <p><strong>Full Name:</strong> ${application.fullName}</p>
      <p><strong>Business Name:</strong> ${application.businessName}</p>
      <p><strong>Job Title:</strong> ${application.jobTitle}</p>
      <p><strong>Email:</strong> ${application.email}</p>
      <p><strong>Phone:</strong> ${application.phone}</p>
      <p><strong>Address:</strong> ${application.address}</p>
      <p><strong>Selected Plan:</strong> ${application.selectedPlan}</p>
      <p><strong>Price:</strong> ₹${application.price}</p>
      <p><strong>Application Date:</strong> ${application.applicationDate}</p>
      <p><strong>Bio:</strong> ${application.bio}</p>
      <p><strong>Sections Include:</strong> ${application.sectionsInclude?.join(', ')}</p>
    `;

    const mailOptions = {
      from: `"NFC Card Admin" <${process.env.ADMIN_EMAIL}>`,
      to: recipient,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending application email:', error);
    return { success: false, error: error.message };
  }
};

// 2. Send confirmation email to applicant
const sendConfirmationEmail = async (applicantEmail, fullName) => {
  try {
    const subject = `🎉 Thanks for your application, ${fullName}!`;

    const html = `
      <p>Hi ${fullName},</p>
      <p>Thank you for applying for the NFC Digital Business Card.</p>
      <p>Our team has received your information and will contact you shortly.</p>
      <p>— Team NFC Card</p>
    `;

    const mailOptions = {
      from: `"NFC Card Team" <${process.env.ADMIN_EMAIL}>`,
      to: applicantEmail,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// 3. Test function to verify transporter setup
const testEmailConfig = async () => {
  try {
    await transporter.verify();
    console.log('✅ Email transporter verified successfully');
    return true;
  } catch (error) {
    console.error('❌ Email transporter verification failed:', error);
    return false;
  }
};

// ✅ Export all functions
module.exports = {
  sendApplicationEmail,
  sendConfirmationEmail,
  testEmailConfig
};
