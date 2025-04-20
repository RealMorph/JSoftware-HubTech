import React from 'react';
import { useNetworkStatus } from './NetworkStatusProvider';
import styled from 'styled-components';

// Styled components for the notification
const NotificationContainer = styled.div<{ show: boolean }>`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  z-index: 1000;
  transition: opacity 0.3s, transform 0.3s;
  opacity: ${props => (props.show ? 1 : 0)};
  transform: ${props => (props.show ? 'translate(-50%, 0)' : 'translate(-50%, 20px)')};
  pointer-events: ${props => (props.show ? 'all' : 'none')};
`;

const NotificationText = styled.div`
  font-size: 14px;
`;

const NotificationIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
`;

const Button = styled.button`
  background: none;
  border: none;
  color: #fff;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;
  font-size: 14px;
  &:hover {
    color: #f0f0f0;
  }
`;

// SVG icon for offline state
const OfflineIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M19.35 10.04C18.67 6.59 15.64 4 12 4C9.11 4 6.6 5.64 5.35 8.04C2.34 8.36 0 10.91 0 14C0 17.31 2.69 20 6 20H19C21.76 20 24 17.76 24 15C24 12.36 21.95 10.22 19.35 10.04ZM19 18H6C3.79 18 2 16.21 2 14C2 11.95 3.53 10.24 5.56 10.03L6.63 9.92L7.13 8.97C8.08 7.14 9.94 6 12 6C14.62 6 16.88 7.86 17.39 10.43L17.69 11.93L19.22 12.04C20.78 12.14 22 13.45 22 15C22 16.65 20.65 18 19 18ZM8 13H10.55V16H13.45V13H16L12 9L8 13Z"
      fill="currentColor"
    />
  </svg>
);

const OfflineNotification: React.FC = () => {
  const { isOnline, showOfflineNotification, hideOfflineNotification } = useNetworkStatus();

  // Don't render anything if online
  if (isOnline && !showOfflineNotification) {
    return null;
  }

  return (
    <NotificationContainer show={showOfflineNotification}>
      <NotificationIcon>
        <OfflineIcon />
      </NotificationIcon>
      <NotificationText>
        You're currently offline. Some features may be limited.
      </NotificationText>
      <Button onClick={hideOfflineNotification}>Dismiss</Button>
    </NotificationContainer>
  );
};

export default OfflineNotification; 