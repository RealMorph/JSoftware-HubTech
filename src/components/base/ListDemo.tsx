import React from 'react';
import { List, ListItem } from './List';
import { Button } from './Button';

export const ListDemo: React.FC = () => {
  const demoSectionStyle: React.CSSProperties = {
    marginBottom: '32px',
  };

  const demoTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '16px',
  };

  const demoRowStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '16px',
  };

  // Icons (using simple spans for demonstration)
  const UserIcon = <span style={{ fontSize: '16px' }}>👤</span>;
  const SettingsIcon = <span style={{ fontSize: '16px' }}>⚙️</span>;
  const InfoIcon = <span style={{ fontSize: '16px' }}>ℹ️</span>;
  const StarIcon = <span style={{ fontSize: '16px' }}>⭐</span>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>List Component Demo</h1>

      {/* List Variants */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>List Variants</h2>
        <div style={demoRowStyle}>
          <div style={{ width: '250px' }}>
            <h3>Default</h3>
            <List>
              <ListItem>Item 1</ListItem>
              <ListItem>Item 2</ListItem>
              <ListItem>Item 3</ListItem>
            </List>
          </div>

          <div style={{ width: '250px' }}>
            <h3>Bordered</h3>
            <List variant="bordered">
              <ListItem>Item 1</ListItem>
              <ListItem>Item 2</ListItem>
              <ListItem>Item 3</ListItem>
            </List>
          </div>

          <div style={{ width: '250px' }}>
            <h3>Divided</h3>
            <List variant="divided">
              <ListItem>Item 1</ListItem>
              <ListItem>Item 2</ListItem>
              <ListItem>Item 3</ListItem>
            </List>
          </div>
        </div>
      </div>

      {/* List Sizes */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>List Sizes</h2>
        <div style={demoRowStyle}>
          <div style={{ width: '250px' }}>
            <h3>Small</h3>
            <List variant="bordered" size="small">
              <ListItem>Small item 1</ListItem>
              <ListItem>Small item 2</ListItem>
              <ListItem>Small item 3</ListItem>
            </List>
          </div>

          <div style={{ width: '250px' }}>
            <h3>Medium (Default)</h3>
            <List variant="bordered" size="medium">
              <ListItem>Medium item 1</ListItem>
              <ListItem>Medium item 2</ListItem>
              <ListItem>Medium item 3</ListItem>
            </List>
          </div>

          <div style={{ width: '250px' }}>
            <h3>Large</h3>
            <List variant="bordered" size="large">
              <ListItem>Large item 1</ListItem>
              <ListItem>Large item 2</ListItem>
              <ListItem>Large item 3</ListItem>
            </List>
          </div>
        </div>
      </div>

      {/* Interactive List */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Interactive List</h2>
        <div style={demoRowStyle}>
          <div style={{ width: '300px' }}>
            <List variant="bordered" interactive>
              <ListItem>Clickable item 1</ListItem>
              <ListItem selected>Selected item</ListItem>
              <ListItem disabled>Disabled item</ListItem>
              <ListItem>Clickable item 4</ListItem>
            </List>
          </div>
        </div>
      </div>

      {/* List with Icons */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>List with Start Content</h2>
        <div style={demoRowStyle}>
          <div style={{ width: '300px' }}>
            <List variant="divided">
              <ListItem startContent={UserIcon}>Profile</ListItem>
              <ListItem startContent={SettingsIcon}>Settings</ListItem>
              <ListItem startContent={InfoIcon}>Help & Support</ListItem>
            </List>
          </div>
        </div>
      </div>

      {/* List with Actions */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>List with End Content</h2>
        <div style={demoRowStyle}>
          <div style={{ width: '350px' }}>
            <List variant="divided">
              <ListItem 
                endContent={<Button variant="primary" size="sm">View</Button>}
              >
                Item with action
              </ListItem>
              <ListItem 
                endContent={<Button variant="primary" size="sm">Download</Button>}
              >
                Another item with action
              </ListItem>
              <ListItem 
                endContent={StarIcon}
              >
                Item with icon
              </ListItem>
            </List>
          </div>
        </div>
      </div>

      {/* Complex List Item */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Complex List Items</h2>
        <div style={demoRowStyle}>
          <div style={{ width: '400px' }}>
            <List variant="divided">
              <ListItem 
                startContent={UserIcon} 
                endContent={<Button variant="primary" size="sm">Follow</Button>}
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>John Doe</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Software Engineer</div>
                </div>
              </ListItem>
              <ListItem 
                startContent={UserIcon} 
                endContent={<Button variant="primary" size="sm">Follow</Button>}
                selected
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>Jane Smith</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Product Designer</div>
                </div>
              </ListItem>
              <ListItem 
                startContent={UserIcon} 
                endContent={<Button variant="primary" size="sm">Follow</Button>}
                disabled
              >
                <div>
                  <div style={{ fontWeight: 'bold' }}>Bob Johnson</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Marketing Manager</div>
                </div>
              </ListItem>
            </List>
          </div>
        </div>
      </div>
    </div>
  );
}; 