const express = require('express');
const router = express.Router();
const q2Controller = require('../controller/q2Controller');
const q3Controller = require('../controller/q3Controller');
const q4Controller = require('../controller/q4Controller');

// Q2A - reCAPTCHA v2
router.get('/q2a', q2Controller.getIndexQ2A);
router.post('/q2a', q2Controller.postCreateAccount);

// Q2B - reCAPTCHA v3
router.get('/q2b', q2Controller.getIndexQ2B);
router.post('/q2b', q2Controller.postCreateAccountV3);

// Q3 Simple Multi-Factor Authentication
router.get('/q3', q3Controller.getIndexQ3);
router.post('/q3', q3Controller.postLogin);
router.get('/otpsent', q3Controller.getOTPSent); // Get OTP sent page
router.post('/otpsent', q3Controller.postOTPSent); // Handle OTP sent form submission

// Q4 Advanced Multi-Factor Authentication
router.get('/q4', q4Controller.getIndexQ4); //Get login page
router.post('/q4', q4Controller.postLogin); //Handle login form submission
router.get('/otp', q4Controller.getOTP); //Get OTP input page
router.post('/otp', q4Controller.postOTP); //Handle OTP form submission
router.get('/setup2fa', q4Controller.getsetup2FA); // Get 2FA setup page

module.exports = router;