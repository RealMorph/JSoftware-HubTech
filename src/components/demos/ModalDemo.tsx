import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DialogDemo from '../feedback/DialogDemo';

const ModalDemo: React.FC = () => {
  const location = useLocation();
  const [demoType, setDemoType] = useState<string>('default');

  // Determine which specific dialog demo to render based on the URL path
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/form-dialog')) {
      setDemoType('form');
    } else if (path.includes('/confirmation-dialog')) {
      setDemoType('confirmation');
    } else if (path.includes('/dialog')) {
      setDemoType('dialog');
    }
  }, [location]);

  // Return the appropriate demo based on the URL
  return (
    <div>
      {demoType === 'default' && (
        <>
          <h1>Modal Demo</h1>
          <p>Please select a specific dialog demo from the menu.</p>
        </>
      )}
      
      {/* Use the DialogDemo component for all dialog types */}
      {(demoType === 'form' || demoType === 'confirmation' || demoType === 'dialog') && (
        <DialogDemo />
      )}
    </div>
  );
};

export default ModalDemo; 