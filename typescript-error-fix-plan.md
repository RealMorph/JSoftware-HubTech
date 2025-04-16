# TypeScript Error Fix Plan

## Progress Report
- **Initial Error Count**: 191
- **Current Error Count**: 118
- **Reduction**: 73 errors (38% reduction)

## Summary of Remaining Errors
- **Most Common Error Types**:
  - TS2322: Type assignment errors
  - TS2345: Argument type errors
  - TS2305: Missing module exports
  - TS2739: Missing properties in type

## Files with Most Errors
1. `src/core/theme/components/__tests__/ThemeManager.test.tsx` (25 errors)
2. `src/core/theme/components/CustomThemeEditor.tsx` (13 errors)
3. `src/core/theme/services/ThemeService.ts` (6 errors)
4. `src/core/theme/components/ThemeEditor.tsx` (5 errors)
5. `src/core/theme/theme-manager.ts` (4 errors)

## Completed Fixes
1. ✅ Updated `types.ts` to ensure `ThemeConfig` interface includes all required properties
2. ✅ Fixed typography-related interfaces with missing properties (added `family`, `letterSpacing`, etc.)
3. ✅ Established proper relationship between `Theme` and `ThemeConfig` interfaces

## Next Steps

### Phase 1: Fix Test Files

1. Fix `src/core/theme/components/__tests__/ThemeManager.test.tsx` (25 errors):
   - Update imports to use correct `ThemeConfig` definition
   - Update test data to include required properties (`borderRadius`, `transitions`)

### Phase 2: Fix Theme Services and Managers

1. Fix `src/core/theme/services/ThemeService.ts` (6 errors):
   - Update service classes to work with new `ThemeConfig` interface

2. Fix `src/core/theme/theme-manager.ts` (4 errors):
   - Update implementations to work with the updated types

### Phase 3: Fix Custom Theme Editors

1. Continue fixing `src/core/theme/components/CustomThemeEditor.tsx` (13 errors):
   - Fix event handler typings for `TextField` components
   - Fix compatibility between `Theme` and `ThemeVisualConfig`

2. Fix `src/core/theme/components/ThemeEditor.tsx` (5 errors):
   - Similar issues to `CustomThemeEditor.tsx`

### Phase 4: Resolve Remaining Miscellaneous Issues

1. Fix `src/core/app.ts` argument error (Expected 1 argument, got 0)
2. Fix `DebugPanel` performance.memory issue
3. Fix `ErrorBoundary` type compatibility issues
4. Fix tab-manager exports ambiguity

## Implementation Strategy

1. Focus on test files first, as they have the most errors
2. Then fix core service classes and managers
3. Finally address editor components
4. Run TypeScript type checks frequently to ensure progress

## Known Challenges

1. Event handler type mismatches in form components:
   - Many components expect `(value: string, event: ChangeEvent<HTMLInputElement>) => void` 
   - but are receiving `(e: ChangeEvent<HTMLInputElement>) => void`

2. Styled component theme prop type mismatches:
   - Components expect `Theme` but receive `ThemeVisualConfig` 