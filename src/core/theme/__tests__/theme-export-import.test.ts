import { exportTheme, importTheme } from '../theme-export-import';
import { ThemeConfig } from '../theme-persistence';

// Mock the URL.createObjectURL and URL.revokeObjectURL functions
const mockCreateObjectURL = jest.fn().mockReturnValue('mock-url');
const mockRevokeObjectURL = jest.fn();

// Mock the document.createElement and appendChild/removeChild functions
const mockCreateElement = jest.fn().mockReturnValue({
  href: '',
  download: '',
  click: jest.fn(),
});
const mockAppendChild = jest.fn();
const mockRemoveChild = jest.fn();

// Mock the FileReader
class MockFileReader {
  onload: ((event: any) => void) | null = null;
  onerror: (() => void) | null = null;
  readAsText = jest.fn().mockImplementation(() => {
    if (this.onload) {
      this.onload({ target: { result: JSON.stringify(mockThemeData) } });
    }
  });
}

// Mock theme data
const mockThemeData = {
  name: 'Test Theme',
  description: 'A test theme',
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#8B5CF6',
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#1F2937',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',
  },
  typography: {
    scale: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
    },
    weights: {
      normal: '400',
      bold: '700',
    },
    lineHeights: {
      normal: '1.5',
      tight: '1.25',
    },
    letterSpacing: {
      normal: '0',
    },
    family: {
      sans: 'ui-sans-serif, system-ui, sans-serif',
    },
  },
  spacing: {
    '0': '0',
    '1': '0.25rem',
    '2': '0.5rem',
    semantic: {
      container: '1rem',
    },
  },
  breakpoints: {
    xs: 0,
    sm: 640,
    md: 768,
    containers: {
      sm: '640px',
    },
  },
};

// Mock theme
const mockTheme: ThemeConfig = {
  id: 'test-theme',
  name: 'Test Theme',
  description: 'A test theme',
  colors: mockThemeData.colors as any,
  typography: mockThemeData.typography as any,
  spacing: mockThemeData.spacing as any,
  breakpoints: mockThemeData.breakpoints as any,
  isDefault: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Theme Export/Import', () => {
  beforeEach(() => {
    // Setup global mocks
    global.URL.createObjectURL = mockCreateObjectURL;
    global.URL.revokeObjectURL = mockRevokeObjectURL;
    global.document.createElement = mockCreateElement as any;
    global.document.body.appendChild = mockAppendChild;
    global.document.body.removeChild = mockRemoveChild;
    global.FileReader = MockFileReader as any;

    // Clear mocks
    jest.clearAllMocks();
  });

  describe('exportTheme', () => {
    it('should create a download link with the correct filename', () => {
      exportTheme(mockTheme);

      expect(mockCreateElement).toHaveBeenCalledWith('a');
      expect(mockCreateElement().download).toBe('test-theme.json');
    });

    it('should use a custom filename if provided', () => {
      exportTheme(mockTheme, 'custom-theme.json');

      expect(mockCreateElement().download).toBe('custom-theme.json');
    });

    it('should trigger the download', () => {
      exportTheme(mockTheme);

      expect(mockAppendChild).toHaveBeenCalledWith(mockCreateElement());
      expect(mockCreateElement().click).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockCreateElement());
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('mock-url');
    });
  });

  describe('importTheme', () => {
    it('should return a promise that resolves with the imported theme', async () => {
      const file = new File([''], 'test-theme.json', { type: 'application/json' });

      const result = await importTheme(file);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name', mockThemeData.name);
      expect(result).toHaveProperty('description', mockThemeData.description);
      expect(result).toHaveProperty('colors');
      expect(result).toHaveProperty('typography');
      expect(result).toHaveProperty('spacing');
      expect(result).toHaveProperty('breakpoints');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should reject with an error if the file cannot be read', async () => {
      // Override the FileReader mock for this test
      class ErrorFileReader extends MockFileReader {
        readAsText = jest.fn().mockImplementation(() => {
          if (this.onerror) {
            this.onerror();
          }
        });
      }
      global.FileReader = ErrorFileReader as any;

      const file = new File([''], 'test-theme.json', { type: 'application/json' });

      await expect(importTheme(file)).rejects.toThrow('Failed to read file');
    });

    it('should reject with an error if the theme data is invalid', async () => {
      // Override the FileReader mock for this test
      class InvalidDataFileReader extends MockFileReader {
        readAsText = jest.fn().mockImplementation(() => {
          if (this.onload) {
            this.onload({ target: { result: JSON.stringify({ name: 'Invalid Theme' }) } });
          }
        });
      }
      global.FileReader = InvalidDataFileReader as any;

      const file = new File([''], 'test-theme.json', { type: 'application/json' });

      await expect(importTheme(file)).rejects.toThrow('Invalid theme data format');
    });
  });
});
