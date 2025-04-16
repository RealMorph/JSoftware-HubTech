import React from 'react';
import { TabsDemo } from '../components/navigation/TabsDemo';

const TabsDemoPage: React.FC = () => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '32px' }}>Tabs Component Demo</h1>
      <TabsDemo />
    </div>
  );
};

export default TabsDemoPage; 