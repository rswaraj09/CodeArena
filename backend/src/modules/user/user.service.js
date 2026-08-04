const Student = require('../../models/Student');
const Trainer = require('../../models/Trainer');
const { ResourceNotFoundException } = require('../../common/errors');

/**
 * Mirrors UserService.java: Student and Trainer live in separate
 * collections (like Spring's two @Document classes), so every lookup by
 * id/email has to check both.
 */

async function getById(id) {
  if (!id) throw ResourceNotFoundException.of('User', 'id', id);
  const student = await Student.findById(id).catch(() => null);
  if (student) return student;
  const trainer = await Trainer.findById(id).catch(() => null);
  if (trainer) return trainer;
  throw ResourceNotFoundException.of('User', 'id', id);
}

async function getByEmail(email) {
  const normalized = email.toLowerCase().trim();
  const student = await Student.findOne({ email: normalized });
  if (student) return student;
  const trainer = await Trainer.findOne({ email: normalized });
  if (trainer) return trainer;
  throw ResourceNotFoundException.of('User', 'email', email);
}

async function existsByEmail(email) {
  const normalized = email.toLowerCase().trim();
  const [studentExists, trainerExists] = await Promise.all([
    Student.exists({ email: normalized }),
    Trainer.exists({ email: normalized }),
  ]);
  return Boolean(studentExists || trainerExists);
}

async function save(userDoc) {
  await userDoc.save();
  return userDoc;
}

function toResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    college: user.college,
    avatarUrl: user.avatarUrl,
    emailVerified: user.emailVerified,
    approved: user.approved,
  };
}

module.exports = { getById, getByEmail, existsByEmail, save, toResponse };
