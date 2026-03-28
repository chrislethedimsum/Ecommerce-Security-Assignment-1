const axios = require('axios');
const pool = require('../utils/db');
const bcrypt = require("bcryptjs");
require("dotenv").config();

// GET - Display registration form
exports.getIndexQ2A = (req, res, next) => {
  res.render("q2/q2a");
};

// POST - Handle form submission with reCAPTCHA verification
exports.postCreateAccount = async (req, res, next) => {
  try {
    const { email, password, confirm_password, 'g-recaptcha-response': recaptchaToken } = req.body;

    // Validate password match
    if (password !== confirm_password) {
      return res.status(400).json({ success: false, message: "Passwords do not match!" });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 10 characters with uppercase, lowercase, and number!" 
      });
    }

    // Verify reCAPTCHA token with Google
    try {
      const secretKey = process.env.SECRET_KEY_v2;
      const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';
      if (!recaptchaToken) {
        return res.status(400).json({ 
          success: false, 
          message: "reCAPTCHA token is missing. Please complete the reCAPTCHA verification." 
        });
      }
      
      // Send as form data (application/x-www-form-urlencoded)
      const response = await axios.post(
        verificationURL,
        `secret=${secretKey}&response=${recaptchaToken}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      console.log(response.data);

      // Check if reCAPTCHA verification was successful
      if (!response.data.success) {
        return res.status(400).json({ 
          success: false, 
          message: "reCAPTCHA verification failed. Please try again!" 
        });
      }

    } catch (captchaError) {
      return res.status(500).json({ 
        success: false, 
        message: "Error verifying reCAPTCHA. Please try again!" 
      });
    }

    // Check if email already exists
    const connection = await pool.getConnection();
    try {
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser.length > 0) {
        return res.status(409).json({ 
          success: false, 
          message: "Email already registered!" 
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // 5. Create user account
      await connection.execute(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [email, hashedPassword]
      );
      
      return res.status(201).json({ 
        success: true, 
        message: "Account created successfully!" 
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error creating account:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again!" 
    });
  }
};

// GET - Display registration form with reCAPTCHA v3
exports.getIndexQ2B = (req, res, next) => {
  res.render("q2/q2b");
};

// POST - Handle form submission with reCAPTCHA v3 verification
exports.postCreateAccountV3 = async (req, res, next) => {
  try {
    const { username, password, confirm_password, recaptcha_token } = req.body;

    // Check if reCAPTCHA token exists
    if (!recaptcha_token) {
      return res.status(400).json({ 
        success: false, 
        message: "reCAPTCHA token is missing!" 
      });
    }
    let response;
    // Verify reCAPTCHA v3 token with Google
    try {
      const secretKey = process.env.SECRET_KEY_v3;
      const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';

      response = await axios.post(
        verificationURL,
        `secret=${secretKey}&response=${recaptcha_token}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      // Check if verification was successful
      if (!response.data.success) {
        return res.status(400).json({ 
          success: false, 
          message: "reCAPTCHA verification failed. Please try again!" 
        });
      }

      // Check reCAPTCHA v3 score (0.0 to 1.0)
      // score > 0.9 = very likely legitimate
      // score > 0.5 = likely legitimate
      // score < 0.5 = suspicious
      const score = response.data.score;

      // Adjust this threshold based on your security needs
      const SCORE_THRESHOLD = 0.5;

      if (score < SCORE_THRESHOLD) {
        return res.status(400).json({ 
          success: false, 
          message: `Suspicious activity detected (Score: ${score.toFixed(2)}). Please try again later.` 
        });
      }

    } catch (captchaError) {
      return res.status(500).json({ 
        success: false, 
        message: "Error verifying reCAPTCHA. Please try again!" 
      });
    }

    // Validate password match
    if (password !== confirm_password) {
      return res.status(400).json({ 
        success: false, 
        message: "Passwords do not match!" 
      });
    }


    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{10,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        success: false, 
        message: "Password must be at least 10 characters with uppercase, lowercase, and number!" 
      });
    }

    // Check if username already exists
    const connection = await pool.getConnection();
    try {
      const [existingUser] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [username]
      );

      if (existingUser.length > 0) {
        return res.status(409).json({ 
          success: false, 
          message: "Username already registered!" 
        });
      }

      // Create user account with reCAPTCHA v3 metadata
      const recaptchaV3Metadata = JSON.stringify({
        score: response.data.score,
        action: response.data.action,
        challenge_ts: response.data.challenge_ts,
        verified_at: new Date().toISOString()
      });

      const hashedPassword = await bcrypt.hash(password, 10);

      await connection.execute(
        'INSERT INTO users (email, password) VALUES (?, ?)',
        [username, hashedPassword]
      );
      
      return res.status(201).json({ 
        success: true, 
        message: "Account created successfully!", 
        score: response.data.score
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: "Server error. Please try again!" 
    });
  }
};