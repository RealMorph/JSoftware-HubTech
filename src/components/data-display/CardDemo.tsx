import React from 'react';
import { Card } from './Card';

/**
 * CardDemo component showcasing different variations of the Card component
 */
export const CardDemo: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Basic Cards */}
      <section>
        <h2>Basic Cards</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Card title="Simple Card" style={{ width: '300px' }}>
            <p>This is a simple card with only a title and content.</p>
          </Card>
          
          <Card 
            title="Card with Subtitle" 
            subtitle="Supporting information"
            style={{ width: '300px' }}
          >
            <p>This card has both a title and a subtitle.</p>
          </Card>
          
          <Card 
            style={{ width: '300px' }}
            header={
              <div style={{ padding: '1rem', textAlign: 'center' }}>
                <h3 style={{ margin: 0 }}>Custom Header</h3>
                <div>With custom formatting</div>
              </div>
            }
          >
            <p>This card has a custom header instead of the standard title/subtitle.</p>
          </Card>
        </div>
      </section>
      
      {/* Cards with Footer */}
      <section>
        <h2>Cards with Footer</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Card 
            title="Card with Footer" 
            style={{ width: '300px' }}
            footer={
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button>Cancel</button>
                <button>Save</button>
              </div>
            }
          >
            <p>This card has a footer with action buttons.</p>
          </Card>
          
          <Card 
            title="Informational Card" 
            style={{ width: '300px' }}
            footer={
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                Last updated: April 8, 2023
              </div>
            }
          >
            <p>This card has an informational footer.</p>
          </Card>
        </div>
      </section>
      
      {/* Cards with Images */}
      <section>
        <h2>Cards with Images</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Card 
            title="Mountain View" 
            coverImage="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&auto=format&fit=crop"
            coverImageAlt="Mountain landscape"
            style={{ width: '300px' }}
          >
            <p>A beautiful mountain landscape view.</p>
          </Card>
          
          <Card 
            title="Ocean Sunset" 
            subtitle="Peaceful evening by the sea"
            coverImage="https://images.unsplash.com/photo-1503803548695-c2a7b4a5b875?w=600&auto=format&fit=crop"
            coverImageAlt="Ocean sunset"
            style={{ width: '300px' }}
          >
            <p>Watch the sun set over the ocean horizon.</p>
          </Card>
        </div>
      </section>
      
      {/* Elevation Variations */}
      <section>
        <h2>Elevation Variations</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Card 
            title="No Elevation" 
            subtitle="elevation={0}"
            elevation={0}
            style={{ width: '200px' }}
          >
            <p>Card with no shadow.</p>
          </Card>
          
          <Card 
            title="Light Elevation" 
            subtitle="elevation={1}"
            elevation={1}
            style={{ width: '200px' }}
          >
            <p>Card with light shadow.</p>
          </Card>
          
          <Card 
            title="Medium Elevation" 
            subtitle="elevation={2}"
            elevation={2}
            style={{ width: '200px' }}
          >
            <p>Card with medium shadow.</p>
          </Card>
          
          <Card 
            title="Heavy Elevation" 
            subtitle="elevation={3}"
            elevation={3}
            style={{ width: '200px' }}
          >
            <p>Card with heavy shadow.</p>
          </Card>
        </div>
      </section>
      
      {/* Variant Colors */}
      <section>
        <h2>Color Variants</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Card 
            title="Default Variant" 
            variant="default"
            style={{ width: '200px' }}
          >
            <p>Standard card styling.</p>
          </Card>
          
          <Card 
            title="Primary Variant" 
            variant="primary"
            style={{ width: '200px' }}
          >
            <p>Primary colored card.</p>
          </Card>
          
          <Card 
            title="Secondary Variant" 
            variant="secondary"
            style={{ width: '200px' }}
          >
            <p>Secondary colored card.</p>
          </Card>
          
          <Card 
            title="Accent Variant" 
            variant="accent"
            style={{ width: '200px' }}
          >
            <p>Accent colored card.</p>
          </Card>
        </div>
      </section>
      
      {/* Interactive Cards */}
      <section>
        <h2>Interactive Cards</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Card 
            title="Clickable Card" 
            clickable
            onClick={() => alert('Card clicked!')}
            style={{ width: '300px' }}
          >
            <p>Click me! I'm an interactive card.</p>
            <p>Cards can be made clickable for navigation or to trigger actions.</p>
          </Card>
          
          <Card 
            title="Hover Effects" 
            subtitle="With elevation change"
            clickable
            elevation={1}
            style={{ width: '300px' }}
          >
            <p>Hover over me to see the elevation change effect.</p>
            <p>Clickable cards have subtle animations on hover and click.</p>
          </Card>
        </div>
      </section>
      
      {/* Complex Card Examples */}
      <section>
        <h2>Complex Card Examples</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Card 
            title="User Profile" 
            subtitle="Account details"
            elevation={2}
            style={{ width: '350px' }}
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button>Edit Profile</button>
                <button>View Activity</button>
              </div>
            }
          >
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ 
                width: '80px', 
                height: '80px', 
                borderRadius: '50%', 
                backgroundColor: '#e0e0e0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem'
              }}>
                JD
              </div>
              <div>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>John Doe</h3>
                <div>john.doe@example.com</div>
                <div>Account Manager</div>
                <div style={{ 
                  marginTop: '0.5rem',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  borderRadius: '4px',
                  display: 'inline-block',
                  fontSize: '0.8rem'
                }}>
                  Active
                </div>
              </div>
            </div>
          </Card>
          
          <Card 
            coverImage="https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=600&auto=format&fit=crop"
            coverImageAlt="Dashboard analytics"
            title="Analytics Dashboard"
            elevation={2}
            style={{ width: '350px' }}
            footer={
              <div style={{ fontSize: '0.8rem', textAlign: 'right' }}>
                Updated 5 minutes ago
              </div>
            }
          >
            <div>
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Monthly Visitors</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>12,354</span>
                  <span style={{ color: '#4caf50' }}>↑ 12%</span>
                </div>
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0' }}>Conversion Rate</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>3.2%</span>
                  <span style={{ color: '#f44336' }}>↓ 0.8%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}; 