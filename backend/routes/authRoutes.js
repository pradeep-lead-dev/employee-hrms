const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config()

const router = express.Router();

// router.post('/signup', async (req, res, next) => {
//     // console.log('Requested Body:',req);
//     try {
//         const { email, password, name, roles,permissions } = req.body;
//         const user = await User.findOne({ email: req.body.email });

//         // Validate required fields
//         if (!email || !password) {
//             return res.status(400).json({
//                 status: 'fail',
//                 message: 'Email and password are required',
//             });
//         }

//         // Check if the user already exists
//         const existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ status: 'fail', message: 'User already exists!' });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 12);

//         console.log({
//             email,
//             password: hashedPassword,
//             name,
//             roles,
//             permissions,
//         });


//         // Create a new user with hashed password
//         const newUser = await User.create({
//             email,
//             password: hashedPassword,
//             name,
//             role,
//             permissions,
//         });

//         // Generate a JWT token
//         const token = jwt.sign({ _id: newUser._id,name: newUser.name,
//             email: newUser.email,
//             roles: newUser.roles,
//             permissions:newUser.permissions, }, 'secretKey123', { expiresIn: '10d' });

//         // Respond with success and token
//         res.status(201).json({
//             status: 'success',
//             message: 'User registered',
//             token,
//             // user: {
//             //     _id: newUser._id,
//             //     name: newUser.name,
//             //     email: newUser.email,
//             //     roles: newUser.roles,
//             //     permissions:newUser.permissions,
//             // },
//         });
//     } catch (error) {
//         next(error);
//     }
// });

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const collection = mongoose.connection.collection('users');

        // Find a single document by its ID
        const user = await collection.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "User not found!" });
        }

        // Check if password is valid
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        if (password != user.password) {
            return res.status(401).json({ error: 'Incorrect email or password' });
        }


        const permissions = new Set();
        const roleCollection = mongoose.connection.collection('roles');

        for (const role of user?.roles || []) {
            const currentRole = await roleCollection.findOne({ roleName: role });
            if (currentRole) {
                currentRole?.permissions.split(',').forEach(permission => permissions.add(permission));
            }
        }

        

        // Generate a JWT token
        const token = jwt.sign({
            _id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            permissions: Array.from(permissions)
        }, process.env.JWT_SECRET, { expiresIn: '4d' });

        res.status(200).json({
            status: 'success',
            message: 'User login successfully',
            token
        });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: 'Internal Server Error', error });
    }
});

router.get('/me', async (req, res, next) => {
    try {
        // Get the Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ success: false, error: 'Authorization header missing' });
        }

        // Extract the token (assuming it's in the format "Bearer <token>")
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ success: false, error: 'Token missing' });
        }

        // Decode and verify the token
        const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

        return res.status(200).json({ success: true });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ success: false, error: 'Token expired' });
        }

        return res.status(401).json({ success: false, error: 'Authorization failed', error });
    }


});

module.exports = router;