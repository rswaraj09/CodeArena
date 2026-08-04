const { z } = require('zod');

const questionSchema = z.object({
  questionText: z.string().min(1),
  options: z.array(z.string()).min(2),
  correctOptionIndex: z.number().int().nonnegative(),
  points: z.number().int().positive().optional().default(5),
});

const createQuizSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  startTime: z.coerce.date().optional().nullable(),
  endTime: z.coerce.date().optional().nullable(),
  durationMinutes: z.number().int().positive().optional().default(30),
  questions: z.array(questionSchema).min(1),
});

const submitQuizSchema = z.object({
  answers: z.record(z.string(), z.number().int()).optional().default({}),
});

module.exports = { createQuizSchema, submitQuizSchema };
