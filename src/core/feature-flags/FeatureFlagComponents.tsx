import React from 'react';
import { useFeatureEnabled, useFeatureValue } from './useFeature';
import { JSONValue } from '@growthbook/growthbook-react';

// Interface for FeatureFlag component props
interface FeatureFlagProps {
  /** The key for the feature flag */
  featureKey: string;
  /** Default behavior if the feature flag is not defined */
  defaultEnabled?: boolean;
  /** Content to render when the feature is enabled */
  children: React.ReactNode;
  /** Optional content to render when the feature is disabled */
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders content based on a feature flag
 */
export const FeatureFlag: React.FC<FeatureFlagProps> = ({
  featureKey,
  defaultEnabled = false,
  children,
  fallback = null,
}) => {
  const isEnabled = useFeatureEnabled(featureKey, defaultEnabled);
  
  return <>{isEnabled ? children : fallback}</>;
};

// Interface for FeatureVariant component props
interface FeatureVariantProps<T extends JSONValue> {
  /** The key for the feature flag */
  featureKey: string;
  /** Default value if the feature is not defined */
  defaultValue: T;
  /** Function that renders content based on the feature value */
  children: (value: T) => React.ReactNode;
}

/**
 * Component that renders content based on a feature variant value
 */
export function FeatureVariant<T extends JSONValue>({
  featureKey,
  defaultValue,
  children,
}: FeatureVariantProps<T>): React.ReactElement {
  const value = useFeatureValue<T>(featureKey, defaultValue);
  
  return <>{children(value)}</>;
}

// Interface for ExperimentVariants component props
interface ExperimentVariantsProps {
  /** The key for the experiment */
  experimentKey: string;
  /** Object mapping variant values to components */
  variants: Record<string, React.ReactNode>;
  /** Default variant to show if the experiment is not running or has no value */
  defaultVariant: string;
}

/**
 * Component for displaying different variants based on an experiment
 */
export const ExperimentVariants: React.FC<ExperimentVariantsProps> = ({
  experimentKey,
  variants,
  defaultVariant,
}) => {
  const variant = useFeatureValue<string>(experimentKey, defaultVariant);
  
  // Show the selected variant or default
  return <>{variants[variant] || variants[defaultVariant]}</>;
}; 