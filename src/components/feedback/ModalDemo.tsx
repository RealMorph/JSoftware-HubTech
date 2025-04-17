import React, { useState } from 'react';
import styled from '@emotion/styled';
import { useDirectTheme } from '../../core/theme/DirectThemeProvider';

// Define theme style interface
interface ThemeStyles {
  backgroundColor: string;
  textColor: string;
  textSecondaryColor: string;
  primaryColor: string;
  borderColor: string;
  shadowColor: string;
  overlayColor: string;
}

// Function to create ThemeStyles from DirectThemeProvider
function createThemeStyles(themeContext: ReturnType<typeof useDirectTheme>): ThemeStyles {
  const { getColor, getShadow } = themeContext;

  return {
    backgroundColor: getColor('background', '#ffffff'),
    textColor: getColor('text.primary', '#333333'),
    textSecondaryColor: getColor('text.secondary', '#666666'),
    primaryColor: getColor('primary', '#3366CC'),
    borderColor: getColor('border', '#e0e0e0'),
    shadowColor: getShadow('md', '0 4px 6px rgba(0, 0, 0, 0.1)'),
    overlayColor: 'rgba(0, 0, 0, 0.5)',
  };
}

// Styled components
const DemoContainer = styled.div<{ $themeStyles: ThemeStyles }>`
  padding: 1rem;
  background-color: ${props => props.$themeStyles.backgroundColor};
  color: ${props => props.$themeStyles.textColor};
  border: 1px solid ${props => props.$themeStyles.borderColor};
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const Title = styled.h3<{ $themeStyles: ThemeStyles }>`
  color: ${props => props.$themeStyles.textColor};
  margin-top: 0;
  margin-bottom: 1rem;
`;

const Button = styled.button<{ primary?: boolean; $themeStyles: ThemeStyles }>`
  background-color: ${props =>
    props.primary ? props.$themeStyles.primaryColor : props.$themeStyles.backgroundColor};
  color: ${props => (props.primary ? '#ffffff' : props.$themeStyles.textColor)};
  border: 1px solid
    ${props => (props.primary ? props.$themeStyles.primaryColor : props.$themeStyles.borderColor)};
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-right: 8px;
  transition: all 0.2s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const ButtonGroup = styled.div`
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const ModalOverlay = styled.div<{ $themeStyles: ThemeStyles }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.$themeStyles.overlayColor};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div<{ $themeStyles: ThemeStyles }>`
  background-color: ${props => props.$themeStyles.backgroundColor};
  border-radius: 4px;
  padding: 1.5rem;
  width: 90%;
  max-width: 500px;
  box-shadow: ${props => props.$themeStyles.shadowColor};
`;

const ModalHeader = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${props => props.$themeStyles.borderColor};
`;

const ModalTitle = styled.h4<{ $themeStyles: ThemeStyles }>`
  margin: 0;
  color: ${props => props.$themeStyles.textColor};
`;

const CloseButton = styled.button<{ $themeStyles: ThemeStyles }>`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.$themeStyles.textSecondaryColor};
  line-height: 1;
`;

const ModalBody = styled.div<{ $themeStyles: ThemeStyles }>`
  margin-bottom: 1rem;
  color: ${props => props.$themeStyles.textColor};
`;

const ModalFooter = styled.div<{ $themeStyles: ThemeStyles }>`
  display: flex;
  justify-content: flex-end;
  padding-top: 0.5rem;
  border-top: 1px solid ${props => props.$themeStyles.borderColor};
`;

interface ModalDemoProps {
  title?: string;
}

// Export the ModalDemo component
export const ModalDemo: React.FC<ModalDemoProps> = ({ title = 'Modal Demo' }) => {
  const themeContext = useDirectTheme();
  const themeStyles = createThemeStyles(themeContext);

  const [isBasicModalOpen, setIsBasicModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  return (
    <DemoContainer $themeStyles={themeStyles}>
      <Title $themeStyles={themeStyles}>{title}</Title>

      <ButtonGroup>
        <Button $themeStyles={themeStyles} primary onClick={() => setIsBasicModalOpen(true)}>
          Open Basic Modal
        </Button>
        <Button $themeStyles={themeStyles} onClick={() => setIsConfirmModalOpen(true)}>
          Open Confirmation Modal
        </Button>
      </ButtonGroup>

      {/* Basic Modal */}
      {isBasicModalOpen && (
        <ModalOverlay $themeStyles={themeStyles}>
          <ModalContent $themeStyles={themeStyles}>
            <ModalHeader $themeStyles={themeStyles}>
              <ModalTitle $themeStyles={themeStyles}>Basic Modal</ModalTitle>
              <CloseButton $themeStyles={themeStyles} onClick={() => setIsBasicModalOpen(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody $themeStyles={themeStyles}>
              <p>This is a basic modal dialog using DirectThemeProvider for styling.</p>
            </ModalBody>
            <ModalFooter $themeStyles={themeStyles}>
              <Button $themeStyles={themeStyles} onClick={() => setIsBasicModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* Confirmation Modal */}
      {isConfirmModalOpen && (
        <ModalOverlay $themeStyles={themeStyles}>
          <ModalContent $themeStyles={themeStyles}>
            <ModalHeader $themeStyles={themeStyles}>
              <ModalTitle $themeStyles={themeStyles}>Confirmation</ModalTitle>
              <CloseButton $themeStyles={themeStyles} onClick={() => setIsConfirmModalOpen(false)}>
                ×
              </CloseButton>
            </ModalHeader>
            <ModalBody $themeStyles={themeStyles}>
              <p>Are you sure you want to perform this action?</p>
            </ModalBody>
            <ModalFooter $themeStyles={themeStyles}>
              <Button $themeStyles={themeStyles} onClick={() => setIsConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button
                $themeStyles={themeStyles}
                primary
                onClick={() => {
                  window.alert('Action confirmed!');
                  setIsConfirmModalOpen(false);
                }}
              >
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </DemoContainer>
  );
};

// Add default export
export default ModalDemo;

              <Button $themeStyles={themeStyles} onClick={() => setIsConfirmModalOpen(false)}>
                Cancel
              </Button>
              <Button
                $themeStyles={themeStyles}
                primary
                onClick={() => {
                  window.alert('Action confirmed!');
                  setIsConfirmModalOpen(false);
                }}
              >
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </DemoContainer>
  );
};

// Add default export
export default ModalDemo;
