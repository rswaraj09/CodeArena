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

  const passwordHash = request.password;
  const common = {
    name: request.name,
    email: request.email.toLowerCase().trim(),
    passwordHash,
    college: request.college || null,
    emailVerified: true,
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
}

async function login(request) {
  const user = await userService.getByEmail(request.email);

  const isPlaintextMatch = request.password === user.passwordHash;
  const isBcryptMatch = !isPlaintextMatch && user.passwordHash && user.passwordHash.startsWith('$2')
    ? await bcrypt.compare(request.password, user.passwordHash).catch(() => false)
    : false;

  if (!isPlaintextMatch && !isBcryptMatch) {
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

async function verifyOtp() {
  return { message: 'OTP verification is disabled.' };
}

async function forgotPassword() {
  return { message: 'Password reset request acknowledged.' };
}

async function resetPassword(request) {
  const user = await userService.getByEmail(request.email);
  user.passwordHash = request.newPassword;
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

module.exports = { register, login, refresh, logout, verifyOtp, forgotPassword, resetPassword };
