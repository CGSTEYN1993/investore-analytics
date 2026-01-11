# InvestOre Analytics - Authentication Security Implementation

## Overview

This document outlines the secure authentication system implemented for InvestOre Analytics, following industry best practices for credential storage, email verification, and data protection.

---

## 🔒 Security Architecture

### Password Security

| Feature | Implementation | Security Level |
|---------|---------------|----------------|
| **Hashing Algorithm** | bcrypt (via passlib) | Industry Standard |
| **Work Factor** | 12 rounds (default) | ~250ms per hash |
| **Salt** | Unique per password (automatic) | Prevents rainbow tables |
| **Comparison** | Constant-time | Prevents timing attacks |

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (!@#$%^&*(),.?":{}|<>)

### Token Security

| Token Type | Algorithm | Expiration | Purpose |
|------------|-----------|------------|---------|
| **Access Token** | HS256 (JWT) | 15 minutes | API authentication |
| **Refresh Token** | HS256 (JWT) | 7 days | Token renewal |
| **Email Verification** | URLSafeTimedSerializer | 24 hours | Email confirmation |
| **Password Reset** | URLSafeTimedSerializer | 1 hour | Password recovery |

---

## 📧 Email Verification Flow

```
┌──────────────────┐
│   User Register  │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Generate Token  │ ← URLSafeTimedSerializer with SECRET_KEY
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Send Email     │ ← Async via aiosmtplib (TLS encrypted)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  User Clicks     │ → https://investoreanalytics.com/auth/verify-email?token=xxx
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Verify Token    │ ← Check signature + expiration
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  Account Active  │ ← is_verified = True
└──────────────────┘
```

---

## 🛡️ Rate Limiting & Protection

### Login Attempts (by IP)
| Attempts | Action |
|----------|--------|
| 1-4 | Normal processing |
| 5-9 | 1 second delay |
| 10-19 | 5 second delay |
| 20+ | Block for 15 minutes |

### Account Lockout (by Email)
| Failed Attempts | Lockout Duration |
|-----------------|------------------|
| 5 | 5 minutes |
| 10+ | 30 minutes |

### Password Reset Requests
- Maximum 3 requests per 15 minutes per IP
- Generic response to prevent email enumeration

---

## 📁 File Structure

```
backend/
├── app/
│   ├── api/
│   │   └── auth_enhanced.py      # Enhanced auth endpoints
│   ├── core/
│   │   ├── config.py             # Settings (SMTP, JWT, etc.)
│   │   ├── security.py           # Password hashing, JWT
│   │   ├── email.py              # Email service
│   │   └── rate_limit.py         # Rate limiting
│   └── models/
│       └── models.py             # User model

frontend/
├── app/
│   └── auth/
│       ├── login/page.tsx        # Login page
│       ├── register/page.tsx     # Registration page
│       ├── forgot-password/page.tsx
│       ├── reset-password/page.tsx
│       └── verify-email/page.tsx
└── contexts/
    └── AuthContext.tsx           # Auth state management
```

---

## 🔧 Environment Variables Required

```env
# Security Keys (MUST be changed in production!)
SECRET_KEY=your-super-secret-key-min-32-characters

# JWT Configuration
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# SMTP Configuration (for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@investoreanalytics.com
SMTP_TLS=true

# Token Expiration
EMAIL_VERIFICATION_EXPIRE_HOURS=24
PASSWORD_RESET_EXPIRE_HOURS=1
```

---

## 🌐 API Endpoints

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new account |
| POST | `/auth/login` | Login & get tokens |
| POST | `/auth/verify-email` | Verify email address |
| POST | `/auth/resend-verification` | Resend verification email |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password with token |

### Protected Endpoints (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/me` | Get current user profile |
| POST | `/auth/refresh` | Refresh access token |
| POST | `/auth/change-password` | Change password |
| POST | `/auth/logout` | Logout (invalidate tokens) |

---

## 🔐 Data Protection Measures

### Personal Data Security

1. **Email Addresses**
   - Normalized to lowercase
   - Never exposed in error messages (prevents enumeration)
   - Encrypted at rest (database-level)

2. **Passwords**
   - Never stored in plain text
   - Never logged or displayed
   - Hashed with bcrypt before storage
   - Original password discarded immediately after hashing

3. **Tokens**
   - Signed with SECRET_KEY (HS256)
   - Time-limited expiration
   - Minimal claims (only user ID, email, role)

### GDPR Compliance Features

- ✅ Explicit consent checkbox at registration
- ✅ Terms of Service & Privacy Policy links
- ✅ Data minimization (only necessary fields)
- ✅ Secure transmission (TLS/HTTPS)
- ✅ Account deletion capability (to be implemented)

---

## 🚀 Production Recommendations

### Before Deployment

1. **Generate Strong SECRET_KEY**
   ```python
   import secrets
   print(secrets.token_urlsafe(64))
   ```

2. **Enable HTTPS Only**
   - Set cookies with `Secure` flag
   - Use HSTS headers

3. **Use Production SMTP**
   - SendGrid, AWS SES, or Mailgun
   - Monitor delivery rates

4. **Add Token Blacklist (Redis)**
   - Invalidate tokens on logout
   - Force logout on password change

5. **Enable Security Headers**
   ```
   X-Content-Type-Options: nosniff
   X-Frame-Options: DENY
   Content-Security-Policy: default-src 'self'
   ```

6. **Monitor Authentication Events**
   - Log failed login attempts
   - Alert on suspicious activity
   - Track password reset requests

---

## 📊 Security Checklist

- [x] Password hashing with bcrypt
- [x] JWT tokens with expiration
- [x] Email verification required
- [x] Password reset via email
- [x] Rate limiting on auth endpoints
- [x] Account lockout protection
- [x] Strong password requirements
- [x] Generic error messages (no enumeration)
- [x] HTTPS encryption (via Vercel)
- [x] Secure cookie storage option
- [ ] Token blacklist (Redis) - Recommended
- [ ] 2FA/MFA - Future enhancement
- [ ] OAuth providers - Future enhancement

---

## 📞 Support

For security concerns or questions:
- Email: security@investoreanalytics.com
- Documentation: https://docs.investoreanalytics.com
