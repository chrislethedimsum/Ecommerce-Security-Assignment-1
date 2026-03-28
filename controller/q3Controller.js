require("dotenv").config();
const axios = require('axios');
const bcrypt = require('bcryptjs');
const pool = require('../utils/db');
const { BrevoClient } = require('@getbrevo/brevo');

// GET - Display login form
exports.getIndexQ3 = (req, res, next) => {
  res.render("q3/q3");
};

// POST - Handle login with reCAPTCHA verification
exports.postLogin = async (req, res, next) => {
  if(req.session.email){
    return res.redirect('getOTPSent');
  }
  try {
    const { email, password, remember } = req.body;
    console.log(req.body);
    // 1. Check email & password in database
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT id, password FROM users WHERE email = ?',
        [email]
      );

      if (rows.length === 0) {
        return res.send(`Invalid email or password! <a href="/q3">Retry</a>`);
      }

      const user = rows[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.send(`Invalid email or password! <a href="/q3">Retry</a>`);
      }

      // Create OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await pool.execute(
        "INSERT INTO user_otps (email, otp, expires_at) VALUES (?, ?, ?)",
        [email, otp, expiresAt]
      );

      //Send OTP
      const brevo = new BrevoClient({
        apiKey: process.env.BREVO_API_KEY,
      });

      const result = await brevo.transactionalEmails.sendTransacEmail({
        sender: { name: "Sender", email: "chrislethedimsum@gmail.com" },
        to: [{ email }],
        subject: "Your OTP Code",
        htmlContent: `<style>.box {padding:20px}</style>
        Your need provide the following code to login <br />
        <h2>Your verification code is: ${otp}</h2>`
      });
      req.session.email = email;
      req.session.userId = user.id;
      if(remember){
        req.session.remember = true;
      }
      return res.redirect('/otpsent')
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: "Server error. Try again!" });
  }
};

exports.getOTPSent = async (req, res, next) => {
  if(req.session.email === undefined){
    return res.redirect("/q3")
  }
  res.render("q3/otpsent");
};

exports.postOTPSent = async (req, res, next) => {
  try {
    const email = req.session.email;
    const otp = req.body.otp || req.body.OTP;

    if (!email) {
      return res.redirect('/q3');
    }

    if (!otp) {
      return res.status(400).send('OTP is required');
    }

    const [rows] = await pool.execute(
      "SELECT * FROM user_otps WHERE email = ? AND otp = ? ORDER BY created_at DESC LIMIT 1",
      [email, otp]
    );

    if (rows.length === 0) {
      return res.send(`<h2 style="padding: 20px;">You have entered Wrong 2FA secret code. Login Failed!</h2> <br />
        <a href="/otpsent">Retry</a>`);;
    }
    const otpRecord = rows[0];
    // check expired date
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.send("OTP expired");
    }
    // delete OTP after finish
    await pool.execute("DELETE FROM user_otps WHERE id = ?", [otpRecord.id]);
    // handle Remember Me (cookie)
    if (req.session.remember && req.session.userId) {
      res.cookie('rememberMe', req.session.userId, { maxAge: 7*24*60*60*1000, httpOnly: true }); // 7 ngày
    }
    return res.send(`<h2 style="padding: 20px;">You have entered 2FA secret code correctly. Login Successful!</h2>`);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
}

