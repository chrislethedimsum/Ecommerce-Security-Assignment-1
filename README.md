# E-Commerce Security Assignment 1

This project is an e-commerce security assignment that demonstrates various authentication and security mechanisms including reCAPTCHA integration and multi-factor authentication (MFA).

## Features

### Question 2 (Q2): reCAPTCHA Integration
- **Q2A**: User registration with reCAPTCHA v2 verification
- **Q2B**: User registration with reCAPTCHA v3 verification
- Password strength validation
- Email uniqueness checking

### Question 3 (Q3): Simple Multi-Factor Authentication
- User login with email and password
- Email-based OTP (One-Time Password) verification
- Session management
- reCAPTCHA integration for login protection

### Question 4 (Q4): Advanced Multi-Factor Authentication
- User login with email and password
- TOTP (Time-based One-Time Password) using authenticator apps
- QR code generation for 2FA setup
- Session-based authentication flow

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Template Engine**: EJS
- **Security Libraries**:
  - bcryptjs for password hashing
  - speakeasy for TOTP generation
  - qrcode for QR code generation
  - @getbrevo/brevo for email services
- **Frontend**: HTML, CSS, JavaScript with EJS templates

## Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v14 or higher)
- MySQL Server
- npm or yarn package manager

## Installation

1. **Clone or download the project**
   ```bash
   cd /path/to/your/workspace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory with the following variables:
   ```env
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name

   # reCAPTCHA keys (get from Google reCAPTCHA admin console)
   RECAPTCHA_SECRET_KEY_V2=your_recaptcha_v2_secret
   RECAPTCHA_SITE_KEY_V2=your_recaptcha_v2_site_key
   RECAPTCHA_SECRET_KEY_V3=your_recaptcha_v3_secret
   RECAPTCHA_SITE_KEY_V3=your_recaptcha_v3_site_key

   # Brevo (Sendinblue) API key for email OTP
   BREVO_API_KEY=your_brevo_api_key
   BREVO_SENDER_EMAIL=your_sender_email@example.com
   ```

4. **Database Setup**

   Create a MySQL database and run the following SQL to create the required tables:

   ```sql
   CREATE DATABASE your_database_name;

   USE your_database_name;

   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) UNIQUE NOT NULL,
     password VARCHAR(255) NOT NULL,
     twofa_secret VARCHAR(255),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

## Running the Application

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Access the application**

   Open your browser and navigate to:
   - Main application: `http://localhost:3000`
   - Q2A (reCAPTCHA v2): `http://localhost:3000/q2a`
   - Q2B (reCAPTCHA v3): `http://localhost:3000/q2b`
   - Q3 (Simple MFA): `http://localhost:3000/q3`
   - Q4 (Advanced MFA): `http://localhost:3000/q4`

## Usage

### Q2A & Q2B: User Registration
1. Navigate to `/q2a` or `/q2b`
2. Fill in the registration form with email and password
3. Complete the reCAPTCHA challenge
4. Submit the form

### Q3: Simple MFA with Email OTP
1. Navigate to `/q3`
2. Enter your email and password
3. Complete reCAPTCHA verification
4. Check your email for the OTP
5. Enter the OTP to complete login

### Q4: Advanced MFA with TOTP
1. Navigate to `/q4`
2. Enter your email and password
3. If 2FA is not set up, you'll be redirected to setup
4. Scan the QR code with an authenticator app (Google Authenticator, Authy, etc.)
5. Enter the 6-digit code from your authenticator app

## API Keys Setup

### Google reCAPTCHA
1. Go to [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin)
2. Register a new site
3. Choose reCAPTCHA v2 or v3
4. Add your domain (localhost for development)
5. Copy the site key and secret key to your `.env` file

### Brevo (Sendinblue) for Email
1. Sign up at [Brevo](https://www.brevo.com/)
2. Get your API key from the dashboard
3. Verify your sender email
4. Add the API key and sender email to your `.env` file

## Development

- The application uses `nodemon` for automatic restarts during development
- Views are rendered using EJS templates located in the `views/` directory
- Controllers handle the business logic in the `controller/` directory
- Database utilities are in the `utils/` directory

## License

This project is for educational purposes as part of an e-commerce security assignment.