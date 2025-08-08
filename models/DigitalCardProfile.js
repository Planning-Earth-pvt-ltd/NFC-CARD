const { DataTypes } = require('sequelize');
const sequelize = require('../config/DB');
sequelize.sync({ alter: true })  // Automatically updates schema
  

const DigitalCardProfile = sequelize.define('digital_card_profiles', {
  fullName: { type: DataTypes.STRING, allowNull: false },
  businessName: { type: DataTypes.STRING, allowNull: false },
  jobTitle: DataTypes.STRING,
  tagline: DataTypes.STRING,
  bio: DataTypes.TEXT,
  address: DataTypes.TEXT,
  email: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  whatsappEnabled: { type: DataTypes.BOOLEAN, defaultValue: false },
  altPhone: DataTypes.STRING,
  website: DataTypes.STRING,
  linkedin: DataTypes.STRING,
  instagram: DataTypes.STRING,
  facebook: DataTypes.STRING,
  twitter: DataTypes.STRING,
  youtube: DataTypes.STRING,
  otherSocialName: DataTypes.STRING,
  otherSocialUrl: DataTypes.STRING,
  primaryColor: { type: DataTypes.STRING, defaultValue: '#1e88e5' },
  secondaryColor: { type: DataTypes.STRING, defaultValue: '#69db7c' },
  designPreference: { type: DataTypes.STRING, defaultValue: 'modern' },
  industry: DataTypes.STRING,
  sectionsInclude: { type: DataTypes.JSON, defaultValue: [] },
  servicesProducts: DataTypes.TEXT,
  achievements: DataTypes.TEXT,
  primaryCta: { type: DataTypes.STRING, defaultValue: 'contact' },
  customCta: DataTypes.STRING,
  downloadTitle: DataTypes.STRING,
  selectedPlan: { type: DataTypes.STRING, defaultValue: 'Starter Pack' },
  selectedPrice: { type: DataTypes.INTEGER,},
  termsConsent: { type: DataTypes.BOOLEAN, defaultValue: false },
  additionalNotes: DataTypes.TEXT,
  applicationDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  status: { type: DataTypes.ENUM('pending', 'approved', 'rejected'), defaultValue: 'pending' },

  
  paymentStatus: {
    type: DataTypes.STRING,
    defaultValue: 'unpaid'
  },
  pack_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  packprice: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  price: {
    type: DataTypes.FLOAT, 
    allowNull: true,
  },
  razorpayOrderId: DataTypes.STRING,
  razorpayPaymentId: DataTypes.STRING
},
 {
  timestamps: true,
  tableName: 'digital_card_profiles'
});


module.exports = DigitalCardProfile;
