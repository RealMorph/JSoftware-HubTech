import 'styled-components';

// Define color object structure
interface ColorObject {
  light: string;
  main: string;
  dark: string;
}

// Extend the DefaultTheme interface from styled-components
declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      primary?: ColorObject;
      secondary?: ColorObject;
      success?: ColorObject;
      error?: ColorObject;
      warning?: ColorObject;
      info?: ColorObject;
      [key: string]: ColorObject | undefined;
    };
    
    spacing: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      [key: string]: string;
    };
    
    borderRadius: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      [key: string]: string;
    };
    
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
      [key: string]: string;
    };
    
    fontWeight: {
      light: number;
      regular: number;
      medium: number;
      bold: number;
      [key: string]: number;
    };
  }
} 