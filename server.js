const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://payfud-landing.vercel.app'] // You'll update this with your frontend URL later
    : ['http://localhost:5173', 'http://localhost:3000']
}));
app.use(express.json());

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// API endpoint to handle form submissions
app.post('/api/leads', async (req, res) => {
  try {
    const {
      restaurantName,
      contactName,
      email,
      phone,
      website,
      city,
      state,
      submittedAt,
    } = req.body;

    // Email content
    const emailContent = `
      New Restaurant Registration - Payfud
      
      Restaurant Details:
      • Restaurant Name: ${restaurantName}
      • Contact Person: ${contactName}
      • Email: ${email}
      • Phone: ${phone || 'Not provided'}
      • Website: ${website || 'Not provided'}
      • Location: ${city}, ${state}
      • Submitted: ${new Date(submittedAt).toLocaleString()}
      
      Best regards,
      Payfud Registration System
    `;

    const htmlContent = `
      <h2>🍽️ New Restaurant Registration - Payfud</h2>
      
      <h3>Restaurant Details:</h3>
      <ul>
        <li><strong>Restaurant Name:</strong> ${restaurantName}</li>
        <li><strong>Contact Person:</strong> ${contactName}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone || 'Not provided'}</li>
        <li><strong>Website:</strong> ${website || 'Not provided'}</li>
        <li><strong>Location:</strong> ${city}, ${state}</li>
        <li><strong>Submitted:</strong> ${new Date(submittedAt).toLocaleString()}</li>
      </ul>
      
      <p><em>Best regards,<br>Payfud Registration System</em></p>
    `;

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'jonglatt@gmail.com',
      subject: `New Payfud Registration: ${restaurantName}`,
      text: emailContent,
      html: htmlContent,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully for:', restaurantName);
    res.status(200).json({ 
      success: true, 
      message: 'Registration submitted successfully!' 
    });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit registration. Please try again.' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Payfud Backend API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});