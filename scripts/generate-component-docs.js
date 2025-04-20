#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create interface for command line interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Templates
const storiesTemplate = (componentName, componentPath) => `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from '${componentPath}';

/**
 * The ${componentName} component...
 * 
 * ## Design Guidelines
 * 
 * - Guideline 1
 * - Guideline 2
 * 
 * ## Accessibility
 * 
 * - Accessibility feature 1
 * - Accessibility feature 2
 */
const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  tags: ['autodocs'],
  argTypes: {
    // Document all props here
  },
};

export default meta;
type Story = StoryObj<typeof ${componentName}>;

/**
 * The default ${componentName} variant.
 */
export const Default: Story = {
  args: {
    // Default props
  },
};

// Add more variants as needed
`;

const mdxTemplate = (componentName, componentPath) => `import { Meta, Story, Canvas, ArgsTable } from '@storybook/addon-docs';
import { ${componentName} } from '${componentPath}';

<Meta title="Components/${componentName}/MDX" component={${componentName}} />

# ${componentName} Component

Description of the ${componentName} component...

<ArgsTable of={${componentName}} />

## Examples

<Canvas>
  <Story name="Default">
    <${componentName} />
  </Story>
</Canvas>

## Design Guidelines

- Guideline 1
- Guideline 2

## Accessibility

- Accessibility feature 1
- Accessibility feature 2

## Theme Integration

The ${componentName} component uses the following theme tokens:

- **Colors**: token1, token2
- **Typography**: token1, token2
- **Spacing**: token1, token2
- **BorderRadius**: token1, token2
`;

// Main function
function generateComponentDocs() {
  console.log('📚 Component Documentation Generator 📚\n');

  rl.question('Component name (e.g., Button): ', (componentName) => {
    rl.question('Component import path (e.g., ../components/base/Button): ', (componentPath) => {
      rl.question('Documentation type (tsx or mdx): ', (type) => {
        // Create the stories directory if it doesn't exist
        const storiesDir = path.join(process.cwd(), 'src', 'stories');
        if (!fs.existsSync(storiesDir)) {
          fs.mkdirSync(storiesDir, { recursive: true });
        }

        // Determine file extension and template
        const fileExtension = type.toLowerCase() === 'mdx' ? 'mdx' : 'tsx';
        const template = type.toLowerCase() === 'mdx' ? mdxTemplate : storiesTemplate;
        
        // Create the file
        const filePath = path.join(storiesDir, `${componentName}.stories.${fileExtension}`);
        const fileContent = template(componentName, componentPath);
        
        fs.writeFileSync(filePath, fileContent);
        
        console.log(`\n✅ Created ${filePath}`);
        console.log(`\nTo view this documentation in Storybook, run: npm run storybook`);
        
        rl.close();
      });
    });
  });
}

// Run the generator
generateComponentDocs(); 