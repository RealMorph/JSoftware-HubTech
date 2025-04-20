export interface ThemeStyles {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    border: string;
    buttonBg: string;
    buttonHover: string;
    googleButton: string;
    text: {
      primary: string;
      secondary: string;
    };
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    input: string;
    button: string;
  };
} 