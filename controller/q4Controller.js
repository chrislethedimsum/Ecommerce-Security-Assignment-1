require("dotenv").config();
const pool = require('../utils/db');
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const bcrypt = require("bcryptjs");

exports.getsetup2FA = async (req, res, next) => {
  if(!req.session.email) return res.redirect('/q4');

  // Get current user data
  const [userRows] = await pool.execute(
    "SELECT twofa_secret FROM users WHERE email = ?",
    [req.session.email]
  );

  let secret;
  if (userRows.length > 0 && userRows[0].twofa_secret) {
    // Use existing secret
    secret = {
      base32: userRows[0].twofa_secret,
      otpauth_url: `otpauth://totp/Alice E-Commerce?secret=${userRows[0].twofa_secret}`
    };
  } else {
    // Generate new secret
    secret = speakeasy.generateSecret({
      length: 20,
      name: "Alice E-Commerce"
    });

    // Save secret into DB
    await pool.execute(
      "UPDATE users SET twofa_secret = ? , twofa_enabled = true WHERE email = ?",
      [secret.base32, req.session.email]
    );
  }
  console.log("Secret for user:", secret);
  // Create QR code
  const qr = await QRCode.toDataURL(secret.otpauth_url);

  res.render("q4/otpsetup", { qr, secret });
};

exports.getIndexQ4 = (req, res, next) => {
  res.render("q4/q4");
};

exports.postLogin = async (req, res, next) => {
    if (req.session.email) {
      return res.redirect('getOTPSent');
    }
    try {
      const { email, password, remember } = req.body;
      // 1. Check email & password in database
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute(
          'SELECT id, password, twofa_enabled FROM users WHERE email = ?',
          [email]
        );

        if (rows.length === 0) {
          return res.send("Invalid email or password!");
        }

        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
          return res.send("Invalid email or password!");
        }

        req.session.email = email;
        req.session.userId = user.id;
        if (remember) {
          req.session.remember = true;
        }
        console.log(user);
        console.log(user.twofa_enabled);
        if (user.twofa_enabled === 0 || user.twofa_enabled === undefined || user.twofa_enabled === null) {
          return res.redirect("/setup2fa");
        }
        return res.redirect("/otp");
      } finally {
        connection.release();
      }

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, message: "Server error. Try again!" });
    }
  };

exports.getOTP = async (req, res, next) => {
  res.render('q4/otp');
};

exports.postOTP = async (req, res, next) => {
const { otp } = req.body;
  const [rows] = await pool.execute(
    "SELECT twofa_secret FROM users WHERE id = ?",
    [req.session.userId]
  );
  const secret = rows[0].twofa_secret;

  const verified = speakeasy.totp.verify({
    secret: secret.trim(),
    encoding: "base32",
    token: otp,
    window: 2
  });

  if (verified) {
    res.send("<h1>You have entered 2FA secret code correctly. Login successful!</h1>");
  } else {
    res.send("<h1>You have entered Wrong 2FA secret code. Login failed!");
  }
};

exports.test = async (req,res, next) =>{
  const token = speakeasy.totp({
      secret: "PBHDQ23ILVOXIZLEJBGTEKKWJEUS6ZDU",
      encoding: "base32"
  });
  res.send(token);
};