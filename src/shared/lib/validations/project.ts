import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  country: z.string().min(1, 'Country is required'),
  projectType: z.string().min(1, 'Project type is required'),
  investmentType: z.string().optional().or(z.null()),
  projectValue: z.coerce.number().positive('Project value must be positive'),
  investmentCosts: z.coerce.number().nonnegative().optional().or(z.null()),
  status: z.enum(['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().or(z.null()),
  description: z.string().min(1, 'Description is required'),
  note: z.string().optional().or(z.null()),
  projectManager: z.string().optional().or(z.null()),
  contact: z.string().email().optional().or(z.literal('')).or(z.null()),
  projectWebsite: z.string().url().optional().or(z.literal('')).or(z.null()),
  program: z.string().optional().or(z.null()),
  targetGroup: z.array(z.string()).optional().default([]),
  impact: z.array(z.string()).optional().default([]),
  organization: z.string().optional().or(z.null()),
});

export const kpiSchema = z.object({
  indicatorName: z.string().min(1, 'Indicator name is required'),
  targetValue: z.coerce.number(),
  valueAchieved: z.coerce.number(),
  unit: z.string().min(1, 'Unit is required'),
  updated: z.string().optional().nullable(),
  decimals: z.boolean().default(false),
  thousandSeparators: z.boolean().default(true),
  isPrimary: z.boolean().default(false),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
export type KpiFormData = z.infer<typeof kpiSchema>;
