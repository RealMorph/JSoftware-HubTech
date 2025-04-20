import React, { useState } from 'react';
import { useTheme } from '../../theme/ThemeContext';
import AnimatedAccordion from './AnimatedAccordion';

/**
 * Example component showing different ways to use the AnimatedAccordion
 */
const AccordionExample: React.FC = () => {
  const theme = useTheme();
  const [activeIndexes, setActiveIndexes] = useState<number[]>([0]);
  
  // Example data for accordion items
  const faqItems = [
    {
      title: 'What is this component?',
      children: (
        <div>
          <p>This is an animated accordion component that provides smooth expand/collapse transitions.</p>
          <p>It supports multiple styles, sizes, and configurations.</p>
        </div>
      )
    },
    {
      title: 'How do I use it?',
      children: (
        <div>
          <p>You can use it in two ways:</p>
          <ol>
            <li>Provide an array of items to the <code>items</code> prop</li>
            <li>Use it as a parent component with <code>AnimatedAccordion.Item</code> children</li>
          </ol>
        </div>
      )
    },
    {
      title: 'Can I have multiple items open at once?',
      children: (
        <p>Yes! Set the <code>allowMultiple</code> prop to true to allow multiple items to be open simultaneously.</p>
      )
    }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ marginBottom: theme.spacing.lg }}>Accordion Examples</h1>
      
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Basic Accordion</h2>
        <p style={{ marginBottom: theme.spacing.md }}>Default configuration with items provided as props:</p>
        
        <AnimatedAccordion 
          items={faqItems}
          defaultOpenIndexes={[0]}
        />
      </section>
      
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Bordered Variant</h2>
        <p style={{ marginBottom: theme.spacing.md }}>Using the bordered variant with a custom onChange handler:</p>
        
        <AnimatedAccordion 
          items={faqItems}
          variant="bordered"
          allowMultiple={true}
          defaultOpenIndexes={activeIndexes}
          onChange={(indexes) => setActiveIndexes(indexes)}
        />
        
        <div style={{ marginTop: theme.spacing.md }}>
          <p>Currently open: {activeIndexes.length > 0 ? activeIndexes.map(i => i + 1).join(', ') : 'None'}</p>
        </div>
      </section>
      
      <section style={{ marginBottom: theme.spacing.xl }}>
        <h2 style={{ marginBottom: theme.spacing.md }}>Filled Variant</h2>
        <p style={{ marginBottom: theme.spacing.md }}>Using the filled variant with larger size:</p>
        
        <AnimatedAccordion 
          variant="filled"
          size="large"
        >
          <AnimatedAccordion.Item title="First Item (Using Child Components)">
            <p>This example shows how to use the component with children instead of an items array.</p>
            <p>This approach gives you more control over each accordion item.</p>
          </AnimatedAccordion.Item>
          
          <AnimatedAccordion.Item title="Second Item">
            <p>You can mix and match different content inside each item.</p>
            <div style={{ 
              padding: theme.spacing.md,
              backgroundColor: theme.colors.background,
              borderRadius: theme.borderRadius.md,
              marginTop: theme.spacing.sm
            }}>
              <p>For example, you could include cards, tables, or other components.</p>
            </div>
          </AnimatedAccordion.Item>
          
          <AnimatedAccordion.Item title="Third Item" disabled>
            <p>This item is disabled and cannot be toggled.</p>
          </AnimatedAccordion.Item>
        </AnimatedAccordion>
      </section>
    </div>
  );
};

export default AccordionExample; 