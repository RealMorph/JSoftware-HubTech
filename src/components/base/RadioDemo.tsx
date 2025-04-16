import React, { useState } from 'react';
import { Radio } from './Radio';
import { Card, CardHeader, CardContent } from './Card';

export const RadioDemo: React.FC = () => {
  // State for basic radio examples
  const [selectedBasic, setSelectedBasic] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('medium');
  const [selectedColor, setSelectedColor] = useState<string>('primary');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  
  // Section title style
  const sectionStyle: React.CSSProperties = {
    marginBottom: '24px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    marginBottom: '12px',
    fontWeight: 'bold',
  };

  const radioGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>Radio Component Demo</h1>
      
      {/* Basic Radio Group */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Basic Radio Group</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Basic selection</p>
            <div style={radioGroupStyle}>
              <Radio
                label="Option One"
                name="basic-demo"
                value="one"
                checked={selectedBasic === 'one'}
                onChange={() => setSelectedBasic('one')}
              />
              <Radio
                label="Option Two"
                name="basic-demo"
                value="two"
                checked={selectedBasic === 'two'}
                onChange={() => setSelectedBasic('two')}
              />
              <Radio
                label="Option Three"
                name="basic-demo"
                value="three"
                checked={selectedBasic === 'three'}
                onChange={() => setSelectedBasic('three')}
              />
            </div>
            {selectedBasic && (
              <p style={{ marginTop: '16px' }}>
                Selected option: <strong>{selectedBasic}</strong>
              </p>
            )}
          </div>
          
          <div style={sectionStyle}>
            <p style={titleStyle}>With helper text</p>
            <div style={radioGroupStyle}>
              <Radio
                label="Standard delivery (Free)"
                helperText="Delivery within 5-7 business days"
                name="delivery"
                value="standard"
              />
              <Radio
                label="Express delivery ($9.99)"
                helperText="Delivery within 2-3 business days"
                name="delivery"
                value="express"
              />
              <Radio
                label="Next day delivery ($19.99)"
                helperText="Order before 4pm for next day delivery"
                name="delivery"
                value="next-day"
              />
            </div>
          </div>
          
          <div style={sectionStyle}>
            <p style={titleStyle}>Disabled state</p>
            <div style={radioGroupStyle}>
              <Radio
                label="Available option"
                name="disabled-demo"
                value="available"
              />
              <Radio
                label="Currently unavailable"
                name="disabled-demo"
                value="unavailable"
                disabled
              />
              <Radio
                label="Selected but disabled"
                name="disabled-demo"
                value="selected-disabled"
                checked
                disabled
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sizes */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Size Variations</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Different sizes</p>
            <div style={radioGroupStyle}>
              <Radio
                label="Small size"
                size="small"
                name="size-demo"
                value="small"
                checked={selectedSize === 'small'}
                onChange={() => setSelectedSize('small')}
              />
              <Radio
                label="Medium size (default)"
                size="medium"
                name="size-demo"
                value="medium"
                checked={selectedSize === 'medium'}
                onChange={() => setSelectedSize('medium')}
              />
              <Radio
                label="Large size"
                size="large"
                name="size-demo"
                value="large"
                checked={selectedSize === 'large'}
                onChange={() => setSelectedSize('large')}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Colors */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Color Variations</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Different colors</p>
            <div style={radioGroupStyle}>
              <Radio
                label="Primary color (default)"
                color="primary"
                name="color-demo"
                value="primary"
                checked={selectedColor === 'primary'}
                onChange={() => setSelectedColor('primary')}
              />
              <Radio
                label="Secondary color"
                color="secondary"
                name="color-demo"
                value="secondary"
                checked={selectedColor === 'secondary'}
                onChange={() => setSelectedColor('secondary')}
              />
              <Radio
                label="Success color"
                color="success"
                name="color-demo"
                value="success"
                checked={selectedColor === 'success'}
                onChange={() => setSelectedColor('success')}
              />
              <Radio
                label="Error color"
                color="error"
                name="color-demo"
                value="error"
                checked={selectedColor === 'error'}
                onChange={() => setSelectedColor('error')}
              />
              <Radio
                label="Warning color"
                color="warning"
                name="color-demo"
                value="warning"
                checked={selectedColor === 'warning'}
                onChange={() => setSelectedColor('warning')}
              />
              <Radio
                label="Info color"
                color="info"
                name="color-demo"
                value="info"
                checked={selectedColor === 'info'}
                onChange={() => setSelectedColor('info')}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Error State */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Error State</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Error indication</p>
            <div style={radioGroupStyle}>
              <Radio
                label="Option with error"
                error
                helperText="This field has an error"
                name="error-demo"
                value="error"
              />
              <Radio
                label="Normal option"
                name="error-demo"
                value="normal"
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
            <p style={titleStyle}>Subscription Plans</p>
            <div style={{ border: '1px solid #e0e0e0', padding: '16px', borderRadius: '4px' }}>
              <h3 style={{ marginBottom: '16px', fontSize: '16px' }}>Choose a Plan</h3>
              <div style={radioGroupStyle}>
                <Radio
                  label="Basic Plan - $9.99/month"
                  helperText="Access to basic features"
                  name="subscription-plan"
                  value="basic"
                  checked={selectedPlan === 'basic'}
                  onChange={() => setSelectedPlan('basic')}
                />
                <Radio
                  label="Pro Plan - $19.99/month"
                  helperText="Access to all features with priority support"
                  name="subscription-plan"
                  value="pro"
                  checked={selectedPlan === 'pro'}
                  onChange={() => setSelectedPlan('pro')}
                />
                <Radio
                  label="Enterprise Plan - $49.99/month"
                  helperText="Custom solutions for large organizations"
                  name="subscription-plan"
                  value="enterprise"
                  checked={selectedPlan === 'enterprise'}
                  onChange={() => setSelectedPlan('enterprise')}
                />
              </div>
              
              {selectedPlan && (
                <>
                  <h3 style={{ margin: '24px 0 16px', fontSize: '16px' }}>Payment Method</h3>
                  <div style={radioGroupStyle}>
                    <Radio
                      label="Credit Card"
                      name="payment-method"
                      value="credit-card"
                      checked={paymentMethod === 'credit-card'}
                      onChange={() => setPaymentMethod('credit-card')}
                    />
                    <Radio
                      label="PayPal"
                      name="payment-method"
                      value="paypal"
                      checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')}
                    />
                    <Radio
                      label="Bank Transfer"
                      name="payment-method"
                      value="bank-transfer"
                      checked={paymentMethod === 'bank-transfer'}
                      onChange={() => setPaymentMethod('bank-transfer')}
                    />
                  </div>
                </>
              )}
              
              <div style={{ marginTop: '24px' }}>
                <button 
                  style={{ 
                    padding: '8px 16px',
                    backgroundColor: '#0073ea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    opacity: selectedPlan && paymentMethod ? 1 : 0.5,
                  }}
                  disabled={!selectedPlan || !paymentMethod}
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Horizontal Layout */}
      <Card variant="elevation" style={{ marginBottom: '32px' }}>
        <CardHeader>
          <h2>Horizontal Layout</h2>
        </CardHeader>
        <CardContent>
          <div style={sectionStyle}>
            <p style={titleStyle}>Radio buttons in a row</p>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <Radio
                label="Option A"
                name="horizontal-demo"
                value="a"
              />
              <Radio
                label="Option B"
                name="horizontal-demo"
                value="b"
              />
              <Radio
                label="Option C"
                name="horizontal-demo"
                value="c"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RadioDemo; 