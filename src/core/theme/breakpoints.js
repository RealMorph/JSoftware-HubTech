const breakpointValues = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  '2xl': 1400,
  '3xl': 1600,
  '4xl': 1800,
};
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
const breakpointsEm = {
  xs: '0em',
  sm: '36em',
  md: '48em',
  lg: '62em',
  xl: '75em',
  '2xl': '87.5em',
  '3xl': '100em',
  '4xl': '112.5em',
};
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
const containerMaxWidths = {
  sm: '540px',
  md: '720px',
  lg: '960px',
  xl: '1140px',
  '2xl': '1320px',
  '3xl': '1500px',
  '4xl': '1680px',
};
export const generateBreakpointVariables = () => {
  const variables = [
    ...Object.entries(breakpoints).map(([key, value]) => `--breakpoint-${key}: ${value};`),
    ...Object.entries(containerMaxWidths).map(([key, value]) => `--container-${key}: ${value};`),
  ];
  return variables.join('\n');
};
export const getBreakpoint = key => {
  return breakpoints[key];
};
export const getBreakpointEm = key => {
  return breakpointsEm[key];
};
export const getMediaQuery = key => {
  return mediaQueries[key];
};
export const getMediaQueryMax = key => {
  return mediaQueriesMax[key];
};
export const getMediaQueryBetween = key => {
  return mediaQueriesBetween[key];
};
export const getContainerMaxWidth = key => {
  return containerMaxWidths[key];
};
export {
  breakpointValues,
  breakpoints,
  breakpointsEm,
  mediaQueries,
  mediaQueriesMax,
  mediaQueriesBetween,
  containerMaxWidths,
};
