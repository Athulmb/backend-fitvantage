const router = require('express').Router();
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Middleware: Verify JWT
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
    }
};

// Middleware: Check Admin role
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
};

// Helper function to validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function to validate password strength
const isValidPassword = (password) => {
    // At least 6 characters long
    return password && password.length >= 6;
};

// ✅ Register
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword, agreeToTerms } = req.body;

        // Validation
        if (!fullName || !email || !password || !confirmPassword) {
            return res.status(400).json({ 
                message: 'All fields are required',
                missingFields: {
                    fullName: !fullName,
                    email: !email,
                    password: !password,
                    confirmPassword: !confirmPassword
                }
            });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Check terms agreement
        if (!agreeToTerms) {
            return res.status(400).json({ message: 'You must agree to the terms and conditions' });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        // Validate password strength
        if (!isValidPassword(password)) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Trim and normalize inputs
        const trimmedEmail = email.trim().toLowerCase();
        const trimmedFullName = fullName.trim();

        // Check if user already exists
        const existingUser = await User.findOne({ email: trimmedEmail });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already irukk' });
        }

        // Create new user
        const newUser = new User({
            fullName: trimmedFullName,
            email: trimmedEmail,
            password: password, // Will be hashed by pre-save middleware
            role: 'User', // Default role
            isActive: true,
            emailVerified: false // You might want to implement email verification later
        });

        // Save user to database
        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: newUser._id, 
                role: newUser.role,
                email: newUser.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Send response (password is automatically excluded by the model's toJSON transform)
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                isActive: newUser.isActive,
                createdAt: newUser.createdAt
            }
        });

    } catch (error) {
        console.error('Registration error:', error);

        // Handle mongoose validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: validationErrors
            });
        }

       // Handle duplicate key error (email already exists)
if (error.code === 11000) {
    const duplicateField = Object.keys(error.keyValue)[0];
    const duplicateValue = error.keyValue[duplicateField];
    return res.status(400).json({
        success: false,
        message: `Duplicate value found for '${duplicateField}': '${duplicateValue}'`,
        field: duplicateField,
        value: duplicateValue
    });
}


        res.status(500).json({ 
            message: 'Internal server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

// ✅ Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Find user by email
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(400).json({ message: 'Account has been deactivated. Please contact support.' });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Update last login
        await user.updateLastLogin();

        // Generate JWT token
        const token = user.generateAuthToken();

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            message: 'Internal server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

// ✅ Get current user profile (protected route)
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            user: user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

// ✅ Update user profile (protected route)
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const allowedUpdates = ['fullName', 'phoneNumber', 'dateOfBirth', 'address', 'preferences'];
        const updates = Object.keys(req.body);
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates. Only profile information can be updated.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        updates.forEach(update => {
            user[update] = req.body[update];
        });

        await user.save();

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: user
        });

    } catch (error) {
        console.error('Update profile error:', error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed',
                errors: validationErrors
            });
        }

        res.status(500).json({ 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

// ✅ Change password (protected route)
router.put('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ message: 'All password fields are required' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: 'New passwords do not match' });
        }

        if (!isValidPassword(newPassword)) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isCurrentPasswordValid = await user.comparePassword(currentPassword);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword; // Will be hashed by pre-save middleware
        await user.save();

        res.json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

// ✅ Admin: Get all users
router.get('/users', verifyToken, isAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 10, role, isActive, search } = req.query;
        
        // Build query
        let query = {};
        
        if (role && role !== 'all') {
            query.role = role;
        }
        
        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }
        
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            select: '-password'
        };

        const users = await User.find(query)
            .select('-password')
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            users,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / parseInt(limit)),
                totalUsers: total,
                hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
                hasPrev: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

// ✅ Admin: Update user status
router.put('/users/:userId/status', verifyToken, isAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ message: 'isActive must be a boolean value' });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { isActive },
            { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });

    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
});

// ✅ Logout (optional - mainly for client-side token cleanup)
router.post('/logout', verifyToken, (req, res) => {
    // Since we're using stateless JWT, logout is mainly handled on client-side
    // by removing the token from storage
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;