import { describe, expect, it } from '@jest/globals';
import {
  spacingScale,
  semanticSpacing,
  getSpacing,
  getSemanticSpacing,
  generateSpacingVariables,
} from '../spacing';

describe('Spacing System', () => {
  describe('Spacing Scale', () => {
    it('should have correct base unit', () => {
      expect(spacingScale['1']).toBe('4px');
    });

    it('should have a complete scale from 0 to 96', () => {
      expect(spacingScale['0']).toBe('0px');
      expect(spacingScale['96']).toBe('384px');
    });

    it('should have micro spacing values', () => {
      expect(spacingScale['0.5']).toBe('2px');
      expect(spacingScale['1.5']).toBe('6px');
      expect(spacingScale['2.5']).toBe('10px');
      expect(spacingScale['3.5']).toBe('14px');
    });
  });

  describe('Semantic Spacing', () => {
    it('should have component spacing', () => {
      expect(semanticSpacing.component.gap).toBe('8px');
      expect(semanticSpacing.component.padding).toBe('16px');
      expect(semanticSpacing.component.margin).toBe('0px');
    });

    it('should have layout spacing', () => {
      expect(semanticSpacing.layout.gap).toBe('16px');
      expect(semanticSpacing.layout.padding).toBe('24px');
      expect(semanticSpacing.layout.margin).toBe('0px');
    });

    it('should have section spacing', () => {
      expect(semanticSpacing.section.gap).toBe('24px');
      expect(semanticSpacing.section.padding).toBe('32px');
      expect(semanticSpacing.section.margin).toBe('0px');
    });

    it('should have container spacing', () => {
      expect(semanticSpacing.container.padding).toBe('16px');
      expect(semanticSpacing.container.maxWidth).toBe('100%');
    });

    it('should have form spacing', () => {
      expect(semanticSpacing.form.labelGap).toBe('8px');
      expect(semanticSpacing.form.inputGap).toBe('16px');
      expect(semanticSpacing.form.groupGap).toBe('24px');
    });

    it('should have list spacing', () => {
      expect(semanticSpacing.list.itemGap).toBe('8px');
      expect(semanticSpacing.list.listGap).toBe('16px');
    });

    it('should have card spacing', () => {
      expect(semanticSpacing.card.gap).toBe('16px');
      expect(semanticSpacing.card.padding).toBe('16px');
    });

    it('should have modal spacing', () => {
      expect(semanticSpacing.modal.padding).toBe('24px');
      expect(semanticSpacing.modal.gap).toBe('16px');
    });

    it('should have button spacing', () => {
      expect(semanticSpacing.button.paddingX).toBe('16px');
      expect(semanticSpacing.button.paddingY).toBe('8px');
      expect(semanticSpacing.button.gap).toBe('8px');
    });

    it('should have icon spacing', () => {
      expect(semanticSpacing.icon.gap).toBe('8px');
      expect(semanticSpacing.icon.size).toBe('16px');
    });
  });

  describe('Spacing Functions', () => {
    it('should get spacing value', () => {
      expect(getSpacing('4')).toBe('16px');
      expect(getSpacing('8')).toBe('32px');
      expect(getSpacing('16')).toBe('64px');
    });

    it('should get semantic spacing value', () => {
      expect(getSemanticSpacing('component', 'gap')).toBe('8px');
      expect(getSemanticSpacing('layout', 'gap')).toBe('16px');
      expect(getSemanticSpacing('section', 'gap')).toBe('24px');
    });
  });

  describe('Spacing Variables Generation', () => {
    it('should generate spacing scale variables', () => {
      const variables = generateSpacingVariables();
      expect(variables).toContain('--spacing-1: 4px;');
      expect(variables).toContain('--spacing-4: 16px;');
      expect(variables).toContain('--spacing-8: 32px;');
    });

    it('should generate semantic spacing variables', () => {
      const variables = generateSpacingVariables();
      expect(variables).toContain('--spacing-component-gap: 8px;');
      expect(variables).toContain('--spacing-layout-gap: 16px;');
      expect(variables).toContain('--spacing-section-gap: 24px;');
    });
  });
});
