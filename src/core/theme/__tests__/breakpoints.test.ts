import {
  breakpointValues,
  breakpoints,
  breakpointsEm,
  mediaQueries,
  mediaQueriesMax,
  mediaQueriesBetween,
  containerMaxWidths,
  getBreakpoint,
  getBreakpointEm,
  getMediaQuery,
  getMediaQueryMax,
  getMediaQueryBetween,
  getContainerMaxWidth,
  generateBreakpointVariables,
} from '../breakpoints';

describe('Breakpoint System', () => {
  describe('Breakpoint Values', () => {
    it('should have correct pixel values', () => {
      expect(breakpointValues.xs).toBe(0);
      expect(breakpointValues.sm).toBe(576);
      expect(breakpointValues.md).toBe(768);
      expect(breakpointValues.lg).toBe(992);
      expect(breakpointValues.xl).toBe(1200);
      expect(breakpointValues['2xl']).toBe(1400);
      expect(breakpointValues['3xl']).toBe(1600);
      expect(breakpointValues['4xl']).toBe(1800);
    });

    it('should have correct px string values', () => {
      expect(breakpoints.xs).toBe('0px');
      expect(breakpoints.sm).toBe('576px');
      expect(breakpoints.md).toBe('768px');
      expect(breakpoints.lg).toBe('992px');
      expect(breakpoints.xl).toBe('1200px');
      expect(breakpoints['2xl']).toBe('1400px');
      expect(breakpoints['3xl']).toBe('1600px');
      expect(breakpoints['4xl']).toBe('1800px');
    });

    it('should have correct em values', () => {
      expect(breakpointsEm.xs).toBe('0em');
      expect(breakpointsEm.sm).toBe('36em');
      expect(breakpointsEm.md).toBe('48em');
      expect(breakpointsEm.lg).toBe('62em');
      expect(breakpointsEm.xl).toBe('75em');
      expect(breakpointsEm['2xl']).toBe('87.5em');
      expect(breakpointsEm['3xl']).toBe('100em');
      expect(breakpointsEm['4xl']).toBe('112.5em');
    });
  });

  describe('Media Queries', () => {
    it('should have correct min-width media queries', () => {
      expect(mediaQueries.xs).toBe('(min-width: 0px)');
      expect(mediaQueries.sm).toBe('(min-width: 576px)');
      expect(mediaQueries.md).toBe('(min-width: 768px)');
      expect(mediaQueries.lg).toBe('(min-width: 992px)');
      expect(mediaQueries.xl).toBe('(min-width: 1200px)');
      expect(mediaQueries['2xl']).toBe('(min-width: 1400px)');
      expect(mediaQueries['3xl']).toBe('(min-width: 1600px)');
      expect(mediaQueries['4xl']).toBe('(min-width: 1800px)');
    });

    it('should have correct max-width media queries', () => {
      expect(mediaQueriesMax.xs).toBe('(max-width: 575.98px)');
      expect(mediaQueriesMax.sm).toBe('(max-width: 767.98px)');
      expect(mediaQueriesMax.md).toBe('(max-width: 991.98px)');
      expect(mediaQueriesMax.lg).toBe('(max-width: 1199.98px)');
      expect(mediaQueriesMax.xl).toBe('(max-width: 1399.98px)');
      expect(mediaQueriesMax['2xl']).toBe('(max-width: 1599.98px)');
      expect(mediaQueriesMax['3xl']).toBe('(max-width: 1799.98px)');
      expect(mediaQueriesMax['4xl']).toBe('(max-width: 9999.98px)');
    });

    it('should have correct between breakpoint media queries', () => {
      expect(mediaQueriesBetween['xs-sm']).toBe('(min-width: 0px) and (max-width: 575.98px)');
      expect(mediaQueriesBetween['sm-md']).toBe('(min-width: 576px) and (max-width: 767.98px)');
      expect(mediaQueriesBetween['md-lg']).toBe('(min-width: 768px) and (max-width: 991.98px)');
      expect(mediaQueriesBetween['lg-xl']).toBe('(min-width: 992px) and (max-width: 1199.98px)');
      expect(mediaQueriesBetween['xl-2xl']).toBe('(min-width: 1200px) and (max-width: 1399.98px)');
      expect(mediaQueriesBetween['2xl-3xl']).toBe('(min-width: 1400px) and (max-width: 1599.98px)');
      expect(mediaQueriesBetween['3xl-4xl']).toBe('(min-width: 1600px) and (max-width: 1799.98px)');
      expect(mediaQueriesBetween['4xl-up']).toBe('(min-width: 1800px)');
    });
  });

  describe('Container Max Widths', () => {
    it('should have correct container max widths', () => {
      expect(containerMaxWidths.sm).toBe('540px');
      expect(containerMaxWidths.md).toBe('720px');
      expect(containerMaxWidths.lg).toBe('960px');
      expect(containerMaxWidths.xl).toBe('1140px');
      expect(containerMaxWidths['2xl']).toBe('1320px');
      expect(containerMaxWidths['3xl']).toBe('1500px');
      expect(containerMaxWidths['4xl']).toBe('1680px');
    });
  });

  describe('Breakpoint Functions', () => {
    it('should get breakpoint value', () => {
      expect(getBreakpoint('sm')).toBe('576px');
      expect(getBreakpoint('md')).toBe('768px');
      expect(getBreakpoint('lg')).toBe('992px');
    });

    it('should get breakpoint value in em', () => {
      expect(getBreakpointEm('sm')).toBe('36em');
      expect(getBreakpointEm('md')).toBe('48em');
      expect(getBreakpointEm('lg')).toBe('62em');
    });

    it('should get media query for min-width', () => {
      expect(getMediaQuery('sm')).toBe('(min-width: 576px)');
      expect(getMediaQuery('md')).toBe('(min-width: 768px)');
      expect(getMediaQuery('lg')).toBe('(min-width: 992px)');
    });

    it('should get media query for max-width', () => {
      expect(getMediaQueryMax('sm')).toBe('(max-width: 767.98px)');
      expect(getMediaQueryMax('md')).toBe('(max-width: 991.98px)');
      expect(getMediaQueryMax('lg')).toBe('(max-width: 1199.98px)');
    });

    it('should get media query for between breakpoints', () => {
      expect(getMediaQueryBetween('sm-md')).toBe('(min-width: 576px) and (max-width: 767.98px)');
      expect(getMediaQueryBetween('md-lg')).toBe('(min-width: 768px) and (max-width: 991.98px)');
      expect(getMediaQueryBetween('lg-xl')).toBe('(min-width: 992px) and (max-width: 1199.98px)');
    });

    it('should get container max width', () => {
      expect(getContainerMaxWidth('sm')).toBe('540px');
      expect(getContainerMaxWidth('md')).toBe('720px');
      expect(getContainerMaxWidth('lg')).toBe('960px');
    });
  });

  describe('Breakpoint Variables Generation', () => {
    it('should generate breakpoint variables', () => {
      const variables = generateBreakpointVariables();
      expect(variables).toContain('--breakpoint-sm: 576px;');
      expect(variables).toContain('--breakpoint-md: 768px;');
      expect(variables).toContain('--breakpoint-lg: 992px;');
    });

    it('should generate container max width variables', () => {
      const variables = generateBreakpointVariables();
      expect(variables).toContain('--container-sm: 540px;');
      expect(variables).toContain('--container-md: 720px;');
      expect(variables).toContain('--container-lg: 960px;');
    });
  });
});
