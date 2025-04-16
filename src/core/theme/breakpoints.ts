// Breakpoint values in pixels
const breakpointValues = {
  xs: 0, // Extra small devices (phones)
  sm: 576, // Small devices (large phones)
  md: 768, // Medium devices (tablets)
  lg: 992, // Large devices (desktops)
  xl: 1200, // Extra large devices (large desktops)
  '2xl': 1400, // 2X large devices (extra large desktops)
  '3xl': 1600, // 3X large devices (ultra large desktops)
  '4xl': 1800, // 4X large devices (ultra wide desktops)
};

// Breakpoint values with 'px' suffix for CSS
const breakpoints = {
  xs: '0px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  '2xl': '1400px',
  '3xl': '1600px',
  '4xl': '1800px',
};

// Breakpoint values with 'em' suffix for responsive typography
const breakpointsEm = {
  xs: '0em',
  sm: '36em', // 576px / 16px
  md: '48em', // 768px / 16px
  lg: '62em', // 992px / 16px
  xl: '75em', // 1200px / 16px
  '2xl': '87.5em', // 1400px / 16px
  '3xl': '100em', // 1600px / 16px
  '4xl': '112.5em', // 1800px / 16px
};

// Media query strings for min-width
const mediaQueries = {
  xs: '(min-width: 0px)',
  sm: '(min-width: 576px)',
  md: '(min-width: 768px)',
  lg: '(min-width: 992px)',
  xl: '(min-width: 1200px)',
  '2xl': '(min-width: 1400px)',
  '3xl': '(min-width: 1600px)',
  '4xl': '(min-width: 1800px)',
};

// Media query strings for max-width
const mediaQueriesMax = {
  xs: '(max-width: 575.98px)',
  sm: '(max-width: 767.98px)',
  md: '(max-width: 991.98px)',
  lg: '(max-width: 1199.98px)',
  xl: '(max-width: 1399.98px)',
  '2xl': '(max-width: 1599.98px)',
  '3xl': '(max-width: 1799.98px)',
  '4xl': '(max-width: 9999.98px)',
};

// Media query strings for between breakpoints
const mediaQueriesBetween = {
  'xs-sm': '(min-width: 0px) and (max-width: 575.98px)',
  'sm-md': '(min-width: 576px) and (max-width: 767.98px)',
  'md-lg': '(min-width: 768px) and (max-width: 991.98px)',
  'lg-xl': '(min-width: 992px) and (max-width: 1199.98px)',
  'xl-2xl': '(min-width: 1200px) and (max-width: 1399.98px)',
  '2xl-3xl': '(min-width: 1400px) and (max-width: 1599.98px)',
  '3xl-4xl': '(min-width: 1600px) and (max-width: 1799.98px)',
  '4xl-up': '(min-width: 1800px)',
};

// Container max widths for each breakpoint
const containerMaxWidths = {
  sm: '540px',
  md: '720px',
  lg: '960px',
  xl: '1140px',
  '2xl': '1320px',
  '3xl': '1500px',
  '4xl': '1680px',
};

// Function to generate CSS variables for breakpoints
export const generateBreakpointVariables = (): string => {
  const variables = [
    // Breakpoint values
    ...Object.entries(breakpoints).map(([key, value]) => `--breakpoint-${key}: ${value};`),
    // Container max widths
    ...Object.entries(containerMaxWidths).map(([key, value]) => `--container-${key}: ${value};`),
  ];

  return variables.join('\n');
};

// Function to get breakpoint value
export const getBreakpoint = (key: keyof typeof breakpoints): string => {
  return breakpoints[key];
};

// Function to get breakpoint value in em
export const getBreakpointEm = (key: keyof typeof breakpointsEm): string => {
  return breakpointsEm[key];
};

// Function to get media query for min-width
export const getMediaQuery = (key: keyof typeof mediaQueries): string => {
  return mediaQueries[key];
};

// Function to get media query for max-width
export const getMediaQueryMax = (key: keyof typeof mediaQueriesMax): string => {
  return mediaQueriesMax[key];
};

// Function to get media query for between breakpoints
export const getMediaQueryBetween = (key: keyof typeof mediaQueriesBetween): string => {
  return mediaQueriesBetween[key];
};

// Function to get container max width
export const getContainerMaxWidth = (key: keyof typeof containerMaxWidths): string => {
  return containerMaxWidths[key];
};

// Export all breakpoint-related constants and functions
export {
  breakpointValues,
  breakpoints,
  breakpointsEm,
  mediaQueries,
  mediaQueriesMax,
  mediaQueriesBetween,
  containerMaxWidths,
};
