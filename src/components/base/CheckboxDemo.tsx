import React, { useState } from 'react';
import { Checkbox } from './Checkbox';
import { Card, CardHeader, CardContent } from './Card';

export const CheckboxDemo: React.FC = () => {
  // State for basic checkbox examples
  const [basicChecked, setBasicChecked] = useState(false);
  const [withLabelChecked, setWithLabelChecked] = useState(false);
  const [withHelperChecked, setWithHelperChecked] = useState(false);
  const [disabledChecked, setDisabledChecked] = useState(true);
  const [errorChecked, setErrorChecked] = useState(false);

  // State for indeterminate example
  const [parent, setParent] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);
  const [child1, setChild1] = useState(true);
  const [child2, setChild2] = useState(false);
  const [child3, setChild3] = useState(true);

  // Update parent state based on children
  React.useEffect(() => {
    const allChecked = child1 && child2 && child3;
    const someChecked = child1 || child2 || child3;
    
    setParent(allChecked);
    setIndeterminate(someChecked && !allChecked);
  }, [child1, child2, child3]);

  // Handle parent checkbox change
  const handleParentChange = (checked: boolean) => {
    setParent(checked);
    setChild1(checked);
    setChild2(checked);
    setChild3(checked);
    setIndeterminate(false);
  };

  // State for color examples
  const [primaryChecked, setPrimaryChecked] = useState(true);
  const [secondaryChecked, setSecondaryChecked] = useState(true);
  const [successChecked, setSuccessChecked] = useState(true);
  const [errorColorChecked, setErrorColorChecked] = useState(true);
  const [warningChecked, setWarningChecked] = useState(true);
  const [infoChecked, setInfoChecked] = useState(true);

  // State for size examples
  const [smallChecked, setSmallChecked] = useState(true);
  const [mediumChecked, setMediumChecked] = useState(true);
  const [largeChecked, setLargeChecked] = useState(true);

  // Section title style
  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    marginBottom: '12px',
    fontWeight: 'bold',
  };

  const checkboxGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Checkbox Component Demo</h1>
      
      {/* Basic Examples */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Basic Checkboxes</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Simple checkbox without label</p>
            <Checkbox
              checked={basicChecked}
              onChange={(checked) => setBasicChecked(checked)}
            />
          </div>
          
          <div style={sectionStyle}>
            <p style={titleStyle}>With label</p>
            <Checkbox
              label="Accept terms and conditions"
              checked={withLabelChecked}
              onChange={(checked) => setWithLabelChecked(checked)}
            />
          </div>
          
          <div style={sectionStyle}>
            <p style={titleStyle}>With helper text</p>
            <Checkbox
              label="Send me email updates"
              helperText="We'll only send important updates"
              checked={withHelperChecked}
              onChange={(checked) => setWithHelperChecked(checked)}
            />
          </div>
          
          <div style={sectionStyle}>
            <p style={titleStyle}>Disabled state</p>
            <Checkbox
              label="Disabled checkbox (checked)"
              checked={disabledChecked}
              onChange={(checked) => setDisabledChecked(checked)}
              disabled
            />
            <div style={{ marginTop: '8px' }}>
              <Checkbox
                label="Disabled checkbox (unchecked)"
                disabled
              />
            </div>
          </div>
          
          <div style={sectionStyle}>
            <p style={titleStyle}>Error state</p>
            <Checkbox
              label="Required checkbox"
              error={!errorChecked}
              helperText={!errorChecked ? "This field is required" : ""}
              checked={errorChecked}
              onChange={(checked) => setErrorChecked(checked)}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Indeterminate State */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Indeterminate State</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Parent-Child Relationship</p>
            <div style={checkboxGroupStyle}>
              <Checkbox
                label="Select All"
                checked={parent}
                indeterminate={indeterminate}
                onChange={handleParentChange}
              />
              <div style={{ marginLeft: '28px' }}>
                <Checkbox
                  label="Option 1"
                  checked={child1}
                  onChange={(checked) => setChild1(checked)}
                />
                <div style={{ marginTop: '8px' }}>
                  <Checkbox
                    label="Option 2"
                    checked={child2}
                    onChange={(checked) => setChild2(checked)}
                  />
                </div>
                <div style={{ marginTop: '8px' }}>
                  <Checkbox
                    label="Option 3"
                    checked={child3}
                    onChange={(checked) => setChild3(checked)}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Color Variations */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Color Variations</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Different Colors</p>
            <div style={checkboxGroupStyle}>
              <Checkbox
                label="Primary color (default)"
                color="primary"
                checked={primaryChecked}
                onChange={(checked) => setPrimaryChecked(checked)}
              />
              <Checkbox
                label="Secondary color"
                color="secondary"
                checked={secondaryChecked}
                onChange={(checked) => setSecondaryChecked(checked)}
              />
              <Checkbox
                label="Success color"
                color="success"
                checked={successChecked}
                onChange={(checked) => setSuccessChecked(checked)}
              />
              <Checkbox
                label="Error color"
                color="error"
                checked={errorColorChecked}
                onChange={(checked) => setErrorColorChecked(checked)}
              />
              <Checkbox
                label="Warning color"
                color="warning"
                checked={warningChecked}
                onChange={(checked) => setWarningChecked(checked)}
              />
              <Checkbox
                label="Info color"
                color="info"
                checked={infoChecked}
                onChange={(checked) => setInfoChecked(checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Size Variations */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Size Variations</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Different Sizes</p>
            <div style={checkboxGroupStyle}>
              <Checkbox
                label="Small size"
                size="small"
                checked={smallChecked}
                onChange={(checked) => setSmallChecked(checked)}
              />
              <Checkbox
                label="Medium size (default)"
                size="medium"
                checked={mediumChecked}
                onChange={(checked) => setMediumChecked(checked)}
              />
              <Checkbox
                label="Large size"
                size="large"
                checked={largeChecked}
                onChange={(checked) => setLargeChecked(checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Form Integration */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Form Integration Example</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Form with checkboxes</p>
            <div style={{ border: '1px solid #e0e0e0', padding: '16px', borderRadius: '4px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Newsletter Preferences</h3>
              <div style={checkboxGroupStyle}>
                <Checkbox label="Weekly newsletter" />
                <Checkbox label="Product updates" />
                <Checkbox label="Blog posts" />
                <Checkbox label="Special offers and promotions" />
              </div>
              <div style={{ marginTop: '16px' }}>
                <button 
                  style={{ 
                    padding: '8px 16px',
                    backgroundColor: '#0073ea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckboxDemo; 