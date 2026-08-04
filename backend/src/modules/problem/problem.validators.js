const { z } = require('zod');

const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  hidden: z.boolean().default(true),
  weight: z.number().int().positive().optional(),
});

const createProblemSchema = z.object({
  title: z.string().min(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  description: z.string(),
  constraints: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  hints: z.array(z.string()).optional().default([]),
  timeLimitMs: z.number().int().positive().optional(),
  memoryLimitMb: z.number().int().positive().optional(),
  testCases: z.array(testCaseSchema).min(1),
});

const runSchema = z.object({
  language: z.enum(['JAVA', 'PYTHON', 'CPP', 'C', 'JAVASCRIPT']),
  code: z.string().min(1),
  customInput: z.string().optional().nullable(),
});

const submitSchema = z.object({
  language: z.enum(['JAVA', 'PYTHON', 'CPP', 'C', 'JAVASCRIPT']),
  code: z.string().min(1),
});

module.exports = { createProblemSchema, runSchema, submitSchema };
