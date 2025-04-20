// Export service and config
export { FeatureFlagService, type FeatureFlagConfig } from './FeatureFlagService';

// Export provider and hooks
export { FeatureFlagProvider, useFeatureFlagService } from './FeatureFlagProvider';
export { useFeatureEnabled, useFeatureValue } from './useFeature';

// Export components
export {
  FeatureFlag,
  FeatureVariant,
  ExperimentVariants
} from './FeatureFlagComponents'; 