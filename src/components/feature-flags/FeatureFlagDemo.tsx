import React, { useState } from 'react';
import styled from '@emotion/styled';
import { 
  FeatureFlag, 
  FeatureVariant, 
  ExperimentVariants,
  useFeatureEnabled,
  useFeatureValue 
} from '../../core/feature-flags';
import { useDirectTheme, DirectThemeContextType } from '../../core/theme/DirectThemeProvider';
import { filterTransientProps } from '../../core/styled-components/transient-props';

// Styled components
const DemoContainer = styled.div`
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
`;

// Use functions for theme-related color values
const createStyles = (theme: DirectThemeContextType) => {
  return {
    sectionBackground: theme.getColor('colors.surface', '#ffffff'),
    sectionShadow: theme.getShadow('sm', '0 1px 3px rgba(0,0,0,0.12)'),
    textPrimary: theme.getColor('colors.text.primary', '#333333'),
    textSecondary: theme.getColor('colors.text.secondary', '#666666'),
    successLight: theme.getColor('colors.success.light', '#e8f5e9'),
    successMain: theme.getColor('colors.success.main', '#4caf50'),
    errorLight: theme.getColor('colors.error.light', '#ffebee'),
    errorMain: theme.getColor('colors.error.main', '#f44336'),
    greyLight: theme.getColor('colors.grey.light', '#f5f5f5'),
    greyMain: theme.getColor('colors.grey.main', '#9e9e9e'),
    primaryLight: theme.getColor('colors.primary.light', '#e3f2fd'),
    primaryMain: theme.getColor('colors.primary.main', '#2196f3'),
    primaryDark: theme.getColor('colors.primary.dark', '#1976d2'),
    secondaryLight: theme.getColor('colors.secondary.light', '#f3e5f5'),
    secondaryMain: theme.getColor('colors.secondary.main', '#9c27b0')
  };
};

const Section = styled.section`
  margin-bottom: 32px;
  padding: 24px;
  border-radius: 8px;
  background-color: #ffffff; /* Will be set dynamically */
  box-shadow: 0 1px 3px rgba(0,0,0,0.12); /* Will be set dynamically */
`;

const SectionTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 20px;
  color: #333333; /* Will be set dynamically */
`;

const SectionDescription = styled.p`
  margin-bottom: 24px;
  color: #666666; /* Will be set dynamically */
`;

// Create filtered base components
const FilteredButton = filterTransientProps(styled.button``);
const FilteredDiv = filterTransientProps(styled.div``);
const FilteredSpan = filterTransientProps(styled.span``);

// Use filtered components for all styled components with transient props
const FeatureToggle = styled(FilteredButton)<{ $active?: boolean }>`
  background-color: ${props => props.$active ? '#2196f3' : '#f5f5f5'}; /* Will be set dynamically */
  color: ${props => props.$active ? 'white' : '#333333'}; /* Will be set dynamically */
  border: 1px solid ${props => props.$active ? '#2196f3' : '#9e9e9e'}; /* Will be set dynamically */
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  margin-right: 8px;
  
  &:hover {
    background-color: ${props => props.$active ? '#1976d2' : '#9e9e9e'}; /* Will be set dynamically */
    color: white;
  }
`;

const FeatureCard = styled(FilteredDiv)<{ $enabled?: boolean }>`
  padding: 16px;
  margin-bottom: 16px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background-color: ${props => props.$enabled ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)'};
`;

const FeatureTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const FeatureStatus = styled(FilteredSpan)<{ $enabled?: boolean }>`
  display: inline-block;
  padding: 4px 8px;
  margin-left: 8px;
  font-size: 0.8rem;
  border-radius: 4px;
  background-color: ${props => props.$enabled ? '#2ecc71' : '#e74c3c'};
  color: white;
`;

const VariantDisplay = styled(FilteredDiv)<{ $variant: string }>`
  padding: 16px;
  border-radius: 6px;
  background-color: rgba(46, 204, 113, 0.1);
  border: 1px solid #ddd;
  margin-bottom: 12px;
`;

// Manual override for demo purposes
const localFeatureFlags: Record<string, any> = {
  'demo.newFeature': false,
  'demo.buttonColor': 'primary',
  'demo.experiment': 'control'
};

// Demo component
export const FeatureFlagDemo: React.FC = () => {
  const theme = useDirectTheme();
  const styles = createStyles(theme);
  
  // State for local feature flag override
  const [localFlags, setLocalFlags] = useState(localFeatureFlags);
  
  // Helper to toggle feature flags locally for the demo
  const toggleFeature = (key: string) => {
    if (typeof localFlags[key] === 'boolean') {
      setLocalFlags({
        ...localFlags,
        [key]: !localFlags[key]
      });
    }
  };
  
  // Helper to cycle through feature variant values
  const cycleVariant = (key: string, values: string[]) => {
    const currentIndex = values.indexOf(localFlags[key]);
    const nextIndex = (currentIndex + 1) % values.length;
    
    setLocalFlags({
      ...localFlags,
      [key]: values[nextIndex]
    });
  };
  
  // Example feature flag check
  const isNewFeatureEnabled = localFlags['demo.newFeature'];
  
  // Example feature variant
  const buttonColorVariant = localFlags['demo.buttonColor'];
  
  // Example experiment variant
  const experimentVariant = localFlags['demo.experiment'];

  // Get background and border colors for variant displays
  const getVariantStyles = (variant: string) => {
    switch(variant) {
      case 'control':
        return {
          background: styles.greyLight,
          border: styles.greyMain
        };
      case 'variantA':
        return {
          background: styles.primaryLight,
          border: styles.primaryMain
        };
      case 'variantB':
        return {
          background: styles.secondaryLight,
          border: styles.secondaryMain
        };
      default:
        return {
          background: styles.greyLight,
          border: styles.greyMain
        };
    }
  };
  
  // Custom styles for feature cards
  const getCardStyles = (enabled: boolean) => {
    return {
      backgroundColor: enabled ? styles.successLight : styles.errorLight,
      borderColor: enabled ? styles.successMain : styles.errorMain
    };
  };
  
  // Custom styles for feature status
  const getStatusStyles = (enabled: boolean) => {
    return {
      backgroundColor: enabled ? styles.successMain : styles.errorMain
    };
  };
  
  // Custom styles for feature toggles
  const getToggleStyles = (active: boolean) => {
    return {
      backgroundColor: active ? styles.primaryMain : styles.greyLight,
      color: active ? 'white' : styles.textPrimary,
      borderColor: active ? styles.primaryMain : styles.greyMain,
      hoverBg: active ? styles.primaryDark : styles.greyMain
    };
  };
  
  return (
    <DemoContainer>
      <h1>Feature Flag Demo</h1>
      
      <Section style={{ backgroundColor: styles.sectionBackground, boxShadow: styles.sectionShadow }}>
        <SectionTitle style={{ color: styles.textPrimary }}>Feature Flag Overview</SectionTitle>
        <SectionDescription style={{ color: styles.textSecondary }}>
          This demo showcases how feature flags can be used in the application.
          For demonstration purposes, the flags are controlled locally, but in a real application,
          they would be fetched from the GrowthBook API.
        </SectionDescription>
        
        <div>
          <h3>Demo Controls</h3>
          <div style={{ marginBottom: '20px' }}>
            <FeatureToggle 
              $active={isNewFeatureEnabled} 
              onClick={() => toggleFeature('demo.newFeature')}
              style={getToggleStyles(isNewFeatureEnabled)}
            >
              {isNewFeatureEnabled ? 'Disable New Feature' : 'Enable New Feature'}
            </FeatureToggle>
            
            <FeatureToggle 
              onClick={() => cycleVariant('demo.buttonColor', ['primary', 'secondary', 'success'])}
              style={getToggleStyles(false)}
            >
              Cycle Button Color ({buttonColorVariant})
            </FeatureToggle>
            
            <FeatureToggle 
              onClick={() => cycleVariant('demo.experiment', ['control', 'variantA', 'variantB'])}
              style={getToggleStyles(false)}
            >
              Cycle Experiment ({experimentVariant})
            </FeatureToggle>
          </div>
        </div>
      </Section>
      
      <Section style={{ backgroundColor: styles.sectionBackground, boxShadow: styles.sectionShadow }}>
        <SectionTitle style={{ color: styles.textPrimary }}>Simple Feature Flag</SectionTitle>
        <SectionDescription style={{ color: styles.textSecondary }}>
          The FeatureFlag component conditionally renders content based on a boolean flag.
        </SectionDescription>
        
        <FeatureCard 
          $enabled={isNewFeatureEnabled} 
          style={getCardStyles(isNewFeatureEnabled)}
        >
          <FeatureTitle>
            New Feature 
            <FeatureStatus 
              $enabled={isNewFeatureEnabled}
              style={getStatusStyles(isNewFeatureEnabled)}
            >
              {isNewFeatureEnabled ? 'Enabled' : 'Disabled'}
            </FeatureStatus>
          </FeatureTitle>
          
          <FeatureFlag 
            featureKey="demo.newFeature" 
            defaultEnabled={isNewFeatureEnabled}
            fallback={<p>This feature is currently disabled. Toggle the switch to enable it.</p>}
          >
            <p>🎉 Congratulations! You've unlocked the new feature. This content is only visible when the feature flag is enabled.</p>
            <button style={{ 
              backgroundColor: styles.primaryMain,
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              border: 'none'
            }}>
              New Feature Button
            </button>
          </FeatureFlag>
        </FeatureCard>
      </Section>
      
      <Section style={{ backgroundColor: styles.sectionBackground, boxShadow: styles.sectionShadow }}>
        <SectionTitle style={{ color: styles.textPrimary }}>Feature Variants</SectionTitle>
        <SectionDescription style={{ color: styles.textSecondary }}>
          The FeatureVariant component renders content based on a string, number, or boolean value.
        </SectionDescription>
        
        <FeatureCard 
          $enabled={true}
          style={getCardStyles(true)}
        >
          <FeatureTitle>
            Button Color Variant
            <FeatureStatus 
              $enabled={true}
              style={getStatusStyles(true)}
            >
              {buttonColorVariant}
            </FeatureStatus>
          </FeatureTitle>
          
          <FeatureVariant
            featureKey="demo.buttonColor"
            defaultValue={buttonColorVariant}
            children={(value) => {
              switch(value) {
                case 'primary':
                  return (
                    <div>
                      <p>This uses the primary button style:</p>
                      <button style={{ backgroundColor: styles.primaryMain, color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none' }}>
                        Primary Button
                      </button>
                    </div>
                  );
                case 'secondary':
                  return (
                    <div>
                      <p>This uses the secondary button style:</p>
                      <button style={{ backgroundColor: styles.secondaryMain, color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none' }}>
                        Secondary Button
                      </button>
                    </div>
                  );
                case 'success':
                  return (
                    <div>
                      <p>This uses the success button style:</p>
                      <button style={{ backgroundColor: styles.successMain, color: 'white', padding: '8px 16px', borderRadius: '4px', border: 'none' }}>
                        Success Button
                      </button>
                    </div>
                  );
                default:
                  return <p>Unknown button variant</p>;
              }
            }}
          />
        </FeatureCard>
      </Section>
      
      <Section style={{ backgroundColor: styles.sectionBackground, boxShadow: styles.sectionShadow }}>
        <SectionTitle style={{ color: styles.textPrimary }}>A/B Testing Experiments</SectionTitle>
        <SectionDescription style={{ color: styles.textSecondary }}>
          The ExperimentVariants component displays different content based on experiment assignments.
        </SectionDescription>
        
        <FeatureCard 
          $enabled={true}
          style={getCardStyles(true)}
        >
          <FeatureTitle>
            Experiment Variant
            <FeatureStatus 
              $enabled={true}
              style={getStatusStyles(true)}
            >
              {experimentVariant}
            </FeatureStatus>
          </FeatureTitle>
          
          <ExperimentVariants
            experimentKey="demo.experiment"
            defaultVariant={experimentVariant}
            variants={{
              'control': (
                <VariantDisplay 
                  $variant="control"
                  style={getVariantStyles('control')}
                >
                  <h4>Control Variant</h4>
                  <p>This is the control version that users normally see.</p>
                </VariantDisplay>
              ),
              'variantA': (
                <VariantDisplay 
                  $variant="variantA"
                  style={getVariantStyles('variantA')}
                >
                  <h4>Variant A</h4>
                  <p>This is variant A of the experiment with a different design.</p>
                </VariantDisplay>
              ),
              'variantB': (
                <VariantDisplay 
                  $variant="variantB"
                  style={getVariantStyles('variantB')}
                >
                  <h4>Variant B</h4>
                  <p>This is variant B of the experiment with yet another design.</p>
                </VariantDisplay>
              )
            }}
          />
        </FeatureCard>
      </Section>
    </DemoContainer>
  );
}; 