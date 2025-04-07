import express from "express";
import mongoose from "mongoose";
import nodemailer from "nodemailer";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log("database connected"))
.catch(err => console.error("database connection error:", err));

const PORT = process.env.PORT || 2000
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
})

// Email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  // Contact Form Route
  app.post('/api/contact', async (req, res) => {
    const { name, email, message } = req.body;
  
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }
  
    try {
      // Send email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Sends to yourself
        subject: `New message from ${name} (Portfolio Contact)`,
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
      });
  
      res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
      console.error('Email error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // Newsletter Schema
const subscriberSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
  });
  const Subscriber = mongoose.model('Subscriber', subscriberSchema);
  
  // Newsletter Route
  app.post('/api/newsletter', async (req, res) => {
    const { email } = req.body;
  
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
  
    try {
      // Check if email already exists
      const existingSub = await Subscriber.findOne({ email });
      if (existingSub) {
        return res.status(400).json({ error: 'Email already subscribed' });
      }
  
      // Save to database
      const newSub = new Subscriber({ email });
      await newSub.save();
  
      // Send confirmation email (optional)
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Thanks for subscribing!',
        text: 'You\'ve successfully subscribed to my newsletter.'
      });
  
      res.status(201).json({ message: 'Subscription successful!' });
    } catch (error) {
      console.error('Subscription error:', error);
      res.status(500).json({ error: 'Failed to subscribe' });
    }
  });
