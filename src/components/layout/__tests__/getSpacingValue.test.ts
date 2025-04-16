import { getSpacingValue } from '../spacing-utils';

// Mock the getSpacing function
const mockGetSpacing = jest.fn((key: string, fallback?: string) => {
  // Return values that match what we expect from theme.getSpacing
  const themeValues: Record<string, string> = {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  };
  
  return themeValues[key] || fallback || '0';
});

describe('getSpacingValue', () => {
  beforeEach(() => {
    mockGetSpacing.mockClear();
  });
  
  test('returns default value when value is undefined', () => {
    expect(getSpacingValue(undefined, mockGetSpacing, '4px')).toBe('4px');
    expect(mockGetSpacing).not.toHaveBeenCalled();
  });
  
  test('returns pixel values for numbers', () => {
    expect(getSpacingValue(10, mockGetSpacing)).toBe('10px');
    expect(mockGetSpacing).not.toHaveBeenCalled();
  });
  
  test('uses theme for string values', () => {
    expect(getSpacingValue('md', mockGetSpacing)).toBe('1rem');
    expect(mockGetSpacing).toHaveBeenCalledWith('md', 'md');
  });
  
  test('uses fallback for unknown theme values', () => {
    expect(getSpacingValue('invalid', mockGetSpacing)).toBe('invalid');
    expect(mockGetSpacing).toHaveBeenCalledWith('invalid', 'invalid');
  });
  
  test('applies to shorthand values', () => {
    expect(getSpacingValue('lg', mockGetSpacing)).toBe('1.5rem');
    expect(mockGetSpacing).toHaveBeenCalledWith('lg', 'lg');
  });
  
  test('applies to direct CSS values', () => {
    expect(getSpacingValue('10px', mockGetSpacing)).toBe('10px');
    // The getSpacing will be called, but since 10px isn't in theme, it returns 10px
    expect(mockGetSpacing).toHaveBeenCalledWith('10px', '10px');
  });
}); 