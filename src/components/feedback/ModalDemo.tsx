import React, { useState } from 'react';
import styled from '@emotion/styled';
import { Button } from '../base/Button';
import { Modal } from './Modal';

const DemoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const ModalContent = styled.div`
  padding: 16px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid #e0e0e0;
`;

const ModalDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalSize, setModalSize] = useState<'small' | 'medium' | 'large' | 'full'>('medium');
  const [modalPosition, setModalPosition] = useState<'center' | 'top' | 'right' | 'bottom' | 'left'>('center');
  const [modalAnimation, setModalAnimation] = useState<'fade' | 'slide' | 'scale' | 'none'>('fade');

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  return (
    <DemoContainer>
      <h2>Modal Component Demo</h2>
      
      <Section>
        <h3>Modal Size</h3>
        <ButtonGroup>
          <Button 
            variant={modalSize === 'small' ? 'primary' : 'secondary'} 
            onClick={() => setModalSize('small')}
          >
            Small
          </Button>
          <Button 
            variant={modalSize === 'medium' ? 'primary' : 'secondary'} 
            onClick={() => setModalSize('medium')}
          >
            Medium
          </Button>
          <Button 
            variant={modalSize === 'large' ? 'primary' : 'secondary'} 
            onClick={() => setModalSize('large')}
          >
            Large
          </Button>
          <Button 
            variant={modalSize === 'full' ? 'primary' : 'secondary'} 
            onClick={() => setModalSize('full')}
          >
            Full
          </Button>
        </ButtonGroup>
      </Section>
      
      <Section>
        <h3>Modal Position</h3>
        <ButtonGroup>
          <Button 
            variant={modalPosition === 'center' ? 'primary' : 'secondary'} 
            onClick={() => setModalPosition('center')}
          >
            Center
          </Button>
          <Button 
            variant={modalPosition === 'top' ? 'primary' : 'secondary'} 
            onClick={() => setModalPosition('top')}
          >
            Top
          </Button>
          <Button 
            variant={modalPosition === 'right' ? 'primary' : 'secondary'} 
            onClick={() => setModalPosition('right')}
          >
            Right
          </Button>
          <Button 
            variant={modalPosition === 'bottom' ? 'primary' : 'secondary'} 
            onClick={() => setModalPosition('bottom')}
          >
            Bottom
          </Button>
          <Button 
            variant={modalPosition === 'left' ? 'primary' : 'secondary'} 
            onClick={() => setModalPosition('left')}
          >
            Left
          </Button>
        </ButtonGroup>
      </Section>
      
      <Section>
        <h3>Modal Animation</h3>
        <ButtonGroup>
          <Button 
            variant={modalAnimation === 'fade' ? 'primary' : 'secondary'} 
            onClick={() => setModalAnimation('fade')}
          >
            Fade
          </Button>
          <Button 
            variant={modalAnimation === 'slide' ? 'primary' : 'secondary'} 
            onClick={() => setModalAnimation('slide')}
          >
            Slide
          </Button>
          <Button 
            variant={modalAnimation === 'scale' ? 'primary' : 'secondary'} 
            onClick={() => setModalAnimation('scale')}
          >
            Scale
          </Button>
          <Button 
            variant={modalAnimation === 'none' ? 'primary' : 'secondary'} 
            onClick={() => setModalAnimation('none')}
          >
            None
          </Button>
        </ButtonGroup>
      </Section>
      
      <ButtonGroup>
        <Button variant="primary" onClick={handleOpenModal}>
          Open Modal
        </Button>
      </ButtonGroup>
      
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        title="Modal Demo"
        size={modalSize}
        position={modalPosition}
        animation={modalAnimation}
      >
        <ModalContent>
          <p>This is a demo of the Modal component with various configurations.</p>
          <p>Current settings:</p>
          <ul>
            <li>Size: {modalSize}</li>
            <li>Position: {modalPosition}</li>
            <li>Animation: {modalAnimation}</li>
          </ul>
          <p>You can change these settings using the buttons above and then open the modal to see the changes.</p>
        </ModalContent>
        <ModalFooter>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCloseModal}>
            Confirm
          </Button>
        </ModalFooter>
      </Modal>
    </DemoContainer>
  );
};

export default ModalDemo; 