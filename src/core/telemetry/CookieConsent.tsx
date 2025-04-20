import React, { useState, useEffect } from 'react';
import { ConsentSettings } from './types';
import { useTelemetry } from './TelemetryProvider';
import { DEFAULT_CONSENT_SETTINGS, CONSENT_STORAGE_KEY } from './constants';
import styled from '@emotion/styled';
import { useTheme } from '../theme/ThemeContext';

// Helper functions to handle typography and color values safely
const getTypographyValue = (
  theme: any, 
  variant: string, 
  property: string, 
  fallback: string
): string => {
  // Try to access as if the variant exists in typography
  return theme.typography?.[variant]?.[property] || fallback;
};

const getColorValue = (
  theme: any, 
  colorPath: string, 
  property?: string, 
  fallback: string = '#000000'
): string => {
  const color = colorPath.split('.').reduce((obj, key) => obj?.[key], theme.colors);
  if (!property) return color || fallback;
  return typeof color === 'object' ? color?.[property] || fallback : color || fallback;
};

/**
 * Styled components for the cookie consent banner
 */
const ConsentBanner = styled.div<{ isOpen: boolean }>`
  position: fixed;
  bottom: ${({ isOpen }) => (isOpen ? '0' : '-100%')};
  left: 0;
  right: 0;
  background-color: ${({ theme }) => theme.colors.background};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding: 16px;
  z-index: ${({ theme }) => theme.zIndex.modal};
  transition: bottom 0.3s ease-in-out;
`;

const ConsentContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ConsentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ConsentTitle = styled.h3`
  margin: 0;
  font-size: ${({ theme }) => getTypographyValue(theme, 'h5', 'fontSize', '1.25rem')};
  font-weight: ${({ theme }) => getTypographyValue(theme, 'h5', 'fontWeight', '600')};
`;

const ConsentDescription = styled.p`
  margin: 0;
  font-size: ${({ theme }) => getTypographyValue(theme, 'body2', 'fontSize', '0.875rem')};
  color: ${({ theme }) => getColorValue(theme, 'text.secondary')};
`;

const ConsentOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
`;

const ConsentSettings = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
`;

const ConsentActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 16px;
  
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.input`
  cursor: pointer;
`;

const Label = styled.label`
  cursor: pointer;
  font-size: ${({ theme }) => getTypographyValue(theme, 'body2', 'fontSize', '0.875rem')};
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  border: 1px solid ${({ theme, primary }) => 
    primary ? getColorValue(theme, 'primary', 'main', theme.colors.primary) : theme.colors.border};
  background-color: ${({ theme, primary }) => 
    primary ? getColorValue(theme, 'primary', 'main', theme.colors.primary) : 'transparent'};
  color: ${({ theme, primary }) => 
    primary ? getColorValue(theme, 'primary', 'contrastText', '#FFFFFF') : getColorValue(theme, 'text.primary')};
  cursor: pointer;
  font-size: ${({ theme }) => getTypographyValue(theme, 'button', 'fontSize', '0.875rem')};
  font-weight: ${({ theme }) => getTypographyValue(theme, 'button', 'fontWeight', '500')};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${({ theme, primary }) => 
      primary ? getColorValue(theme, 'primary', 'dark', '#0056b3') : theme.colors.surface};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => getColorValue(theme, 'primary', 'light', '#66b0ff')};
  }
`;

interface CookieConsentProps {
  /**
   * How long (in days) the consent should be remembered
   */
  cookieExpiration?: number;
  
  /**
   * Privacy policy URL
   */
  privacyPolicyUrl?: string;
  
  /**
   * Whether to show advanced options
   */
  showAdvancedOptions?: boolean;
  
  /**
   * Whether to auto-hide banner after consent
   */
  autoHide?: boolean;
}

/**
 * Cookie Consent Banner Component
 * 
 * GDPR-compliant cookie consent banner that allows users to control
 * which types of data collection they consent to.
 */
export const CookieConsent: React.FC<CookieConsentProps> = ({
  cookieExpiration = 365,
  privacyPolicyUrl = '/privacy-policy',
  showAdvancedOptions = true,
  autoHide = true
}) => {
  const theme = useTheme();
  const { consentSettings, updateConsent } = useTelemetry();
  const [isOpen, setIsOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localSettings, setLocalSettings] = useState<ConsentSettings>({...consentSettings});
  
  // Check if consent has been previously given
  useEffect(() => {
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!storedConsent) {
      setIsOpen(true);
    }
  }, []);
  
  // Update local settings when context settings change
  useEffect(() => {
    setLocalSettings({...consentSettings});
  }, [consentSettings]);
  
  const handleAcceptAll = () => {
    const allAccepted: ConsentSettings = {
      analytics: true,
      sessionRecording: true,
      errorReporting: true,
      featureUsage: true
    };
    updateConsent(allAccepted);
    if (autoHide) {
      setIsOpen(false);
    }
  };
  
  const handleRejectAll = () => {
    updateConsent({...DEFAULT_CONSENT_SETTINGS});
    if (autoHide) {
      setIsOpen(false);
    }
  };
  
  const handleSaveSettings = () => {
    updateConsent(localSettings);
    if (autoHide) {
      setIsOpen(false);
    }
  };
  
  const handleToggleSetting = (setting: keyof ConsentSettings) => {
    setLocalSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };
  
  const handleToggleSettings = () => {
    setShowSettings(prev => !prev);
  };
  
  return (
    <ConsentBanner isOpen={isOpen} theme={theme}>
      <ConsentContent>
        <ConsentHeader>
          <ConsentTitle theme={theme}>Cookie Consent</ConsentTitle>
          <Button theme={theme} onClick={() => setIsOpen(false)}>
            ✕
          </Button>
        </ConsentHeader>
        
        <ConsentDescription theme={theme}>
          We use cookies and similar technologies to enhance your experience, analyze traffic, and personalize content.
          By clicking "Accept All", you consent to our use of cookies. You can customize your preferences by clicking "Customize".
          View our <a href={privacyPolicyUrl}>Privacy Policy</a> for more information.
        </ConsentDescription>
        
        {showSettings && showAdvancedOptions && (
          <ConsentSettings>
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                id="analytics-consent"
                checked={localSettings.analytics}
                onChange={() => handleToggleSetting('analytics')}
              />
              <Label htmlFor="analytics-consent" theme={theme}>
                Analytics (help us understand how you use our application)
              </Label>
            </CheckboxWrapper>
            
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                id="session-consent"
                checked={localSettings.sessionRecording}
                onChange={() => handleToggleSetting('sessionRecording')}
              />
              <Label htmlFor="session-consent" theme={theme}>
                Session Recording (helps us understand how users interact with our app)
              </Label>
            </CheckboxWrapper>
            
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                id="error-consent"
                checked={localSettings.errorReporting}
                onChange={() => handleToggleSetting('errorReporting')}
              />
              <Label htmlFor="error-consent" theme={theme}>
                Error Reporting (helps us fix bugs and improve stability)
              </Label>
            </CheckboxWrapper>
            
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                id="feature-consent"
                checked={localSettings.featureUsage}
                onChange={() => handleToggleSetting('featureUsage')}
              />
              <Label htmlFor="feature-consent" theme={theme}>
                Feature Usage (helps us improve features you use most)
              </Label>
            </CheckboxWrapper>
          </ConsentSettings>
        )}
        
        <ConsentActions>
          {showAdvancedOptions && (
            <Button theme={theme} onClick={handleToggleSettings}>
              {showSettings ? 'Hide Options' : 'Customize'}
            </Button>
          )}
          
          <Button theme={theme} onClick={handleRejectAll}>
            Reject All
          </Button>
          
          {showSettings ? (
            <Button theme={theme} primary onClick={handleSaveSettings}>
              Save Settings
            </Button>
          ) : (
            <Button theme={theme} primary onClick={handleAcceptAll}>
              Accept All
            </Button>
          )}
        </ConsentActions>
      </ConsentContent>
    </ConsentBanner>
  );
};

export default CookieConsent; 