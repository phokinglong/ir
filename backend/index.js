require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db'); // Import MongoDB connection function
const authMiddleware = require('./middleware/authMiddleware'); // Import JWT middleware

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json()); // Parse JSON in request bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing

// Routes
app.use('/auth', require('./routes/authRoutes')); // Authentication routes

// Protected Route (Example for testing JWT middleware)
app.get('/protected', authMiddleware, (req, res) => {
    res.json({ message: `Welcome, user ${req.user.id}` });
});

// Test Route
app.get('/', (req, res) => {
    res.send('Investor Relations SaaS Backend Running 🚀');
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
