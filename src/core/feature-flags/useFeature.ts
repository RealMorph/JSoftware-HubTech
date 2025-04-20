import { useFeature as useGrowthBookFeature, JSONValue } from '@growthbook/growthbook-react';
import { useFeatureFlagService } from './FeatureFlagProvider';

/**
 * Custom hook to check if a feature is enabled
 * @param featureKey The key of the feature to check
 * @param defaultValue Default value if the feature is not defined
 * @returns Boolean indicating if the feature is enabled
 */
export function useFeatureEnabled(featureKey: string, fallbackValue = false): boolean {
  const { service, isInitialized } = useFeatureFlagService();
  const feature = useGrowthBookFeature(featureKey);
  
  if (!isInitialized) {
    return fallbackValue;
  }
  
  return feature.on;
}

/**
 * Custom hook to get the value of a feature
 * @param featureKey The key of the feature to check
 * @param defaultValue Default value if the feature is not defined
 * @returns The value of the feature
 */
export function useFeatureValue<T extends JSONValue>(featureKey: string, defaultValue: T): T {
  const { service, isInitialized } = useFeatureFlagService();
  const feature = useGrowthBookFeature<T>(featureKey);
  
  if (!isInitialized || feature.value === undefined || feature.value === null) {
    return defaultValue;
  }
  
  return feature.value as T;
} 