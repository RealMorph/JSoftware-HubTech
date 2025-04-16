import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from './Card';
import { Button } from './Button';

export const CardDemo: React.FC = () => {
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

  const cardContentStyle: React.CSSProperties = {
    padding: '16px',
    minHeight: '80px',
  };

  const cardHeaderStyle: React.CSSProperties = {
    fontWeight: 'bold',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Card Component Demo</h1>

      {/* Card Variants */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Card Variants</h2>
        <div style={demoRowStyle}>
          <Card variant="elevation" style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <h3 style={cardHeaderStyle}>Elevation</h3>
              <p>Card with shadow elevation</p>
            </CardContent>
          </Card>

          <Card variant="outlined" style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <h3 style={cardHeaderStyle}>Outlined</h3>
              <p>Card with outline border</p>
            </CardContent>
          </Card>

          <Card variant="flat" style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <h3 style={cardHeaderStyle}>Flat</h3>
              <p>Card without shadow or border</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Padding Options */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Padding Options</h2>
        <div style={demoRowStyle}>
          <Card padding="small" style={{ width: '200px' }}>
            <CardContent>
              <h3 style={cardHeaderStyle}>Small Padding</h3>
              <p>Card with small padding</p>
            </CardContent>
          </Card>

          <Card padding="medium" style={{ width: '200px' }}>
            <CardContent>
              <h3 style={cardHeaderStyle}>Medium Padding</h3>
              <p>Card with medium padding</p>
            </CardContent>
          </Card>

          <Card padding="large" style={{ width: '200px' }}>
            <CardContent>
              <h3 style={cardHeaderStyle}>Large Padding</h3>
              <p>Card with large padding</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Interactive Card */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Interactive Card</h2>
        <div style={demoRowStyle}>
          <Card interactive style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <h3 style={cardHeaderStyle}>Interactive</h3>
              <p>Hover over me!</p>
            </CardContent>
          </Card>

          <Card variant="outlined" interactive style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <h3 style={cardHeaderStyle}>Interactive Outlined</h3>
              <p>Hover over me!</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Full Width Card */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Full Width Card</h2>
        <Card fullWidth>
          <CardContent style={cardContentStyle}>
            <h3 style={cardHeaderStyle}>Full Width</h3>
            <p>This card takes up the full width of its container</p>
          </CardContent>
        </Card>
      </div>

      {/* Card with Header and Footer */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Card with Header and Footer</h2>
        <div style={demoRowStyle}>
          <Card style={{ width: '300px' }}>
            <CardHeader>
              <h3 style={cardHeaderStyle}>Card Title</h3>
            </CardHeader>
            <CardContent style={cardContentStyle}>
              <p>This card has a header and footer</p>
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="outlined" style={{ width: '300px' }}>
            <CardHeader>
              <h3 style={cardHeaderStyle}>Outlined Card</h3>
            </CardHeader>
            <CardContent style={cardContentStyle}>
              <p>This outlined card has a header and footer</p>
            </CardContent>
            <CardFooter>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <Button variant="ghost" size="sm">Cancel</Button>
                <Button variant="primary" size="sm">Save</Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Custom Color Card */}
      <div style={demoSectionStyle}>
        <h2 style={demoTitleStyle}>Custom Color Card</h2>
        <div style={demoRowStyle}>
          <Card bgColor="primary.50" borderColor="primary.200" style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <h3 style={cardHeaderStyle}>Primary Theme</h3>
              <p>Card with primary theme colors</p>
            </CardContent>
          </Card>

          <Card bgColor="gray.50" borderColor="gray.300" style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <h3 style={cardHeaderStyle}>Gray Theme</h3>
              <p>Card with gray theme colors</p>
            </CardContent>
          </Card>

          <Card bgColor="#f0fdf4" borderColor="#86efac" style={{ width: '200px' }}>
            <CardContent style={cardContentStyle}>
              <h3 style={cardHeaderStyle}>Custom Color</h3>
              <p>Card with custom color values</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}; 