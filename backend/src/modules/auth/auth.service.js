const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Student = require('../../models/Student');
const Trainer = require('../../models/Trainer');
const RefreshToken = require('../../models/RefreshToken');
const userService = require('../user/user.service');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt');
const { sendOtp } = require('../../utils/email');
const {
  BadRequestException,
  DuplicateResourceException,
  ResourceNotFoundException,
  BadCredentialsException,
} = require('../../common/errors');
const env = require('../../config/env');

const OTP_VALIDITY_MS = 10 * 60 * 1000;

async function register(request) {
  if (await userService.existsByEmail(request.email)) {
    throw new DuplicateResourceException('An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(request.password, 10);
  const common = {
    name: request.name,
    email: request.email.toLowerCase().trim(),
    passwordHash,
    college: request.college || null,
    emailVerified: false,
    enabled: true,
    approved: true,
  };

  if (request.role === 'STUDENT') {
    await Student.create({ ...common, role: 'STUDENT' });
  } else if (request.role === 'TRAINER') {
    await Trainer.create({ ...common, role: 'TRAINER' });
  } else {
    throw new BadRequestException('Admin accounts cannot be self-registered.');
  }

  await issueOtp(request.email, 'Email Verification Code');
}

async function login(request) {
  const user = await userService.getByEmail(request.email);

  const matches = await bcrypt.compare(request.password, user.passwordHash);
  if (!matches) {
    throw new BadCredentialsException('Invalid email or password.');
  }
  if (!user.enabled) {
    throw new BadRequestException('Your account has been disabled. Please contact support.');
  }

  return issueTokenPair(user);
}

async function refresh(request) {
  const stored = await RefreshToken.findOne({ token: request.refreshToken });
  if (!stored) {
    throw new BadRequestException('Invalid refresh token.');
  }
  if (stored.revoked || stored.isExpired()) {
    throw new BadRequestException('Refresh token expired or revoked. Please sign in again.');
  }

  const user = await userService.getById(stored.userId);
  stored.revoked = true; // rotate on every use
  await stored.save();

  return issueTokenPair(user);
}

async function logout(userId) {
  await RefreshToken.deleteMany({ userId });
}

async function verifyOtp(request) {
  const user = await userService.getByEmail(request.email);
  validateOtp(user, request.code);

  user.emailVerified = true;
  user.otpCode = null;
  user.otpExpiresAt = null;
  await userService.save(user);
}

async function forgotPassword(request) {
  if (await userService.existsByEmail(request.email)) {
    await issueOtp(request.email, 'Password Reset Code');
  }
  // Silently no-op if the email doesn't exist — same as the Java service,
  // so the endpoint never leaks which emails are registered.
}

async function resetPassword(request) {
  const user = await userService.getByEmail(request.email);
  validateOtp(user, request.code);

  user.passwordHash = await bcrypt.hash(request.newPassword, 10);
  user.otpCode = null;
  user.otpExpiresAt = null;
  await userService.save(user);

  await RefreshToken.deleteMany({ userId: user.id });
}

// ---- helpers ----

async function issueTokenPair(user) {
  const accessToken = generateAccessToken(user);
  const refreshTokenValue = generateRefreshToken(user);

  await RefreshToken.create({
    token: refreshTokenValue,
    userId: user.id,
    expiresAt: new Date(Date.now() + env.jwt.refreshTokenExpiryMs),
  });

  return { accessToken, refreshToken: refreshTokenValue, user: userService.toResponse(user) };
}

async function issueOtp(email, purposeTitle) {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  const expiresAt = new Date(Date.now() + OTP_VALIDITY_MS);

  const user = await userService.getByEmail(email);
  user.otpCode = code;
  user.otpExpiresAt = expiresAt;
  await userService.save(user);

  await sendOtp(email, code, purposeTitle);
}

function validateOtp(user, suppliedCode) {
  if (!user.otpCode || !user.otpExpiresAt) {
    throw new ResourceNotFoundException('No pending verification code found for this account.');
  }
  if (user.otpExpiresAt.getTime() < Date.now()) {
    throw new BadRequestException('This code has expired. Please request a new one.');
  }
  if (user.otpCode !== suppliedCode) {
    throw new BadRequestException('Incorrect verification code.');
  }
}

module.exports = { register, login, refresh, logout, verifyOtp, forgotPassword, resetPassword };
