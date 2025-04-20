# Fixing Styled Components Transient Props

## Issue

React is warning about invalid DOM properties when using styled components with transient props (props starting with `$`).
The `$` prefix is used in styled-components and emotion to indicate props that should only be used for styling and not
passed down to the DOM elements, but this functionality requires proper configuration.

## Solution

A utility has been created in `src/core/styled-components/transient-props.tsx` to handle this issue.
This utility provides helper functions to filter out transient props before they reach the DOM elements.
While newer versions of styled-components and emotion handle this automatically, this solution works
reliably across different versions and configurations.

## How to Fix Components Using Transient Props

Follow this three-step process to fix any component using `$` prefixed props:

1. **Import the helper**:

```tsx
import { filterTransientProps } from '../../core/styled-components/transient-props';
```

2. **Create filtered base components**:

```tsx
const FilteredButton = filterTransientProps(styled.button``);
const FilteredDiv = filterTransientProps(styled.div``);
const FilteredSpan = filterTransientProps(styled.span``);
// ...add more as needed
```

3. **Use the filtered components in your styled components**:

Before:
```tsx
const StyledTab = styled.div<{ $active?: boolean }>`
  background-color: ${props => props.$active ? 'blue' : 'gray'};
  // ... other styles
`;
```

After:
```tsx
const StyledTab = styled(FilteredDiv)<{ $active?: boolean }>`
  background-color: ${props => props.$active ? 'blue' : 'gray'};
  // ... other styles
`;
```

## Files That Need Fixing

The following files contain styled components using transient props that need to be updated:

1. src/core/routing/Navigation.tsx
2. src/components/navigation/RadixSidebar.tsx
3. src/components/feature-flags/FeatureFlagDemo.tsx (✓ FIXED)
4. src/components/demos/CSVImportDemo.tsx
5. src/components/data-visualization/ScatterChart.tsx
6. src/components/data-visualization/examples/AnomalyDetectionDemo.tsx
7. src/components/data-visualization/examples/CorrelationAnalysisDemo.tsx
8. src/components/data-visualization/examples/AdvancedInteractivityDemo.tsx
9. src/core/tabs/theme/StyledTab.tsx

## Example Fix

An example implementation is available in `src/components/feature-flags/FeatureFlagDemo.tsx`.

## Notes

- This approach works reliably across different versions of styled-components and emotion
- It avoids React warnings about invalid DOM properties without changing the styled component API
- The solution is type-safe and maintains all TypeScript type checking
- When the project upgrades to newer versions of styled libraries, this solution will still work 