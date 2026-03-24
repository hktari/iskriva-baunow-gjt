import { describe, it, expect } from 'vitest';
import { projectSchema, kpiSchema } from './project';

describe('Validation Schemas', () => {
  describe('projectSchema', () => {
    it('validates required fields', () => {
      const result = projectSchema.safeParse({
        name: 'Test Project',
        country: 'Germany',
        projectType: 'Research',
        projectValue: 1000000,
        status: 'IN_PROGRESS',
        startDate: '2024-01-01',
        description: 'Test description',
        targetGroup: [],
        impact: [],
      });

      expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
      const result = projectSchema.safeParse({
        name: 'Test Project',
        // missing country, projectType, etc.
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
      }
    });

    it('accepts null for optional fields', () => {
      const result = projectSchema.safeParse({
        name: 'Test Project',
        country: 'Germany',
        projectType: 'Research',
        projectValue: 1000000,
        status: 'IN_PROGRESS',
        startDate: '2024-01-01',
        description: 'Test description',
        targetGroup: [],
        impact: [],
        investmentType: null,
        investmentCosts: null,
        endDate: null,
        note: null,
      });

      expect(result.success).toBe(true);
    });

    it('validates projectValue must be positive', () => {
      const result = projectSchema.safeParse({
        name: 'Test Project',
        country: 'Germany',
        projectType: 'Research',
        projectValue: -100,
        status: 'IN_PROGRESS',
        startDate: '2024-01-01',
        description: 'Test description',
        targetGroup: [],
        impact: [],
      });

      expect(result.success).toBe(false);
    });

    it('validates status enum', () => {
      const validStatuses = ['PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'];
      
      validStatuses.forEach(status => {
        const result = projectSchema.safeParse({
          name: 'Test Project',
          country: 'Germany',
          projectType: 'Research',
          projectValue: 1000000,
          status,
          startDate: '2024-01-01',
          description: 'Test description',
          targetGroup: [],
          impact: [],
        });
        expect(result.success).toBe(true);
      });
    });

    it('rejects invalid status', () => {
      const result = projectSchema.safeParse({
        name: 'Test Project',
        country: 'Germany',
        projectType: 'Research',
        projectValue: 1000000,
        status: 'INVALID_STATUS',
        startDate: '2024-01-01',
        description: 'Test description',
        targetGroup: [],
        impact: [],
      });

      expect(result.success).toBe(false);
    });

    it('validates email format for contact', () => {
      const result = projectSchema.safeParse({
        name: 'Test Project',
        country: 'Germany',
        projectType: 'Research',
        projectValue: 1000000,
        status: 'IN_PROGRESS',
        startDate: '2024-01-01',
        description: 'Test description',
        targetGroup: [],
        impact: [],
        contact: 'invalid-email',
      });

      expect(result.success).toBe(false);
    });

    it('accepts valid email for contact', () => {
      const result = projectSchema.safeParse({
        name: 'Test Project',
        country: 'Germany',
        projectType: 'Research',
        projectValue: 1000000,
        status: 'IN_PROGRESS',
        startDate: '2024-01-01',
        description: 'Test description',
        targetGroup: [],
        impact: [],
        contact: 'valid@example.com',
      });

      expect(result.success).toBe(true);
    });

    it('accepts empty string for contact', () => {
      const result = projectSchema.safeParse({
        name: 'Test Project',
        country: 'Germany',
        projectType: 'Research',
        projectValue: 1000000,
        status: 'IN_PROGRESS',
        startDate: '2024-01-01',
        description: 'Test description',
        targetGroup: [],
        impact: [],
        contact: '',
      });

      expect(result.success).toBe(true);
    });
  });

  describe('kpiSchema', () => {
    it('validates required fields', () => {
      const result = kpiSchema.safeParse({
        indicatorName: 'Number of beneficiaries',
        targetValue: 1000,
        valueAchieved: 750,
        unit: 'people',
      });

      expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
      const result = kpiSchema.safeParse({
        indicatorName: 'Test KPI',
        // missing targetValue, valueAchieved, unit
      });

      expect(result.success).toBe(false);
    });

    it('applies default values', () => {
      const result = kpiSchema.safeParse({
        indicatorName: 'Test KPI',
        targetValue: 1000,
        valueAchieved: 500,
        unit: 'EUR',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.decimals).toBe(false);
        expect(result.data.thousandSeparators).toBe(true);
        expect(result.data.isPrimary).toBe(false);
      }
    });

    it('accepts null for updated field', () => {
      const result = kpiSchema.safeParse({
        indicatorName: 'Test KPI',
        targetValue: 1000,
        valueAchieved: 500,
        unit: 'EUR',
        updated: null,
      });

      expect(result.success).toBe(true);
    });

    it('coerces numeric values', () => {
      const result = kpiSchema.safeParse({
        indicatorName: 'Test KPI',
        targetValue: '1000',
        valueAchieved: '500',
        unit: 'EUR',
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.targetValue).toBe('number');
        expect(typeof result.data.valueAchieved).toBe('number');
      }
    });
  });
});
