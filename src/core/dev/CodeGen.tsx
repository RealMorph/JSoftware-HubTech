import React, { useState, useRef } from 'react';
import styled from '@emotion/styled';
import { useDevTools } from './DevToolsProvider';

/**
 * Template types
 */
type TemplateType = 'component' | 'hook' | 'context' | 'service' | 'test' | 'types';

/**
 * Template definition
 */
interface Template {
  name: string;
  type: TemplateType;
  description: string;
  fields: TemplateField[];
  generate: (values: Record<string, string>) => string;
}

/**
 * Template field definition
 */
interface TemplateField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox';
  defaultValue?: string;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  description?: string;
}

/**
 * Properties for CodeGen component
 */
interface CodeGenProps {
  onGenerate?: (code: string, filename: string) => void;
}

/**
 * CodeGen component
 * 
 * A utility to generate code from templates
 */
export const CodeGen: React.FC<CodeGenProps> = ({ onGenerate }) => {
  const { config, isEnabled } = useDevTools();
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const codeRef = useRef<HTMLTextAreaElement>(null);
  
  // Don't render anything if code generation is not enabled
  if (!isEnabled) {
    return null;
  }
  
  // Handle form field changes
  const handleFieldChange = (name: string, value: string) => {
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Auto-update filename based on name field
    if (name === 'name' && activeTemplate) {
      let extension = '.tsx';
      if (activeTemplate.type === 'hook') extension = '.ts';
      if (activeTemplate.type === 'service') extension = '.ts';
      if (activeTemplate.type === 'types') extension = '.ts';
      
      let prefix = '';
      if (activeTemplate.type === 'hook') prefix = 'use';
      
      const formattedName = value
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .toLowerCase();
      
      setFilename(`${prefix}${formattedName}${extension}`);
    }
  };
  
  // Generate code from template
  const handleGenerate = () => {
    if (!activeTemplate) return;
    
    const code = activeTemplate.generate(formValues);
    setGeneratedCode(code);
    
    // Call onGenerate callback if provided
    if (onGenerate) {
      onGenerate(code, filename);
    }
  };
  
  // Copy generated code to clipboard
  const handleCopyCode = () => {
    if (!generatedCode) return;
    
    if (codeRef.current) {
      codeRef.current.select();
      document.execCommand('copy');
    }
  };
  
  // Reset form
  const handleReset = () => {
    setFormValues({});
    setGeneratedCode('');
    setFilename('');
    setActiveTemplate(null);
  };
  
  // Predefined templates
  const templates: Template[] = [
    {
      name: 'React Functional Component',
      type: 'component',
      description: 'Creates a modern React functional component with TypeScript',
      fields: [
        {
          name: 'name',
          label: 'Component Name',
          type: 'text',
          placeholder: 'MyComponent',
          required: true,
          description: 'PascalCase component name'
        },
        {
          name: 'withProps',
          label: 'Include Props Interface',
          type: 'checkbox',
          defaultValue: 'true'
        },
        {
          name: 'withStyling',
          label: 'Include Emotion Styling',
          type: 'checkbox',
          defaultValue: 'true'
        },
        {
          name: 'withHooks',
          label: 'Include Hooks',
          type: 'select',
          options: ['None', 'useState', 'useState + useEffect', 'Custom Hook'],
          defaultValue: 'useState'
        }
      ],
      generate: (values) => {
        const { name, withProps, withStyling, withHooks } = values;
        let code = `import React`;
        
        // Add imports based on options
        if (withHooks === 'useState' || withHooks === 'useState + useEffect') {
          code += `, { useState }`;
        }
        if (withHooks === 'useState + useEffect') {
          code += `, useEffect`;
        }
        code += ` from 'react';\n`;
        
        if (withStyling === 'true') {
          code += `import styled from '@emotion/styled';\n`;
        }
        
        if (withHooks === 'Custom Hook') {
          code += `import { use${name}State } from '../hooks/use${name}State';\n`;
        }
        
        code += `\n`;
        
        // Add props interface if selected
        if (withProps === 'true') {
          code += `/**\n * Props for ${name} component\n */\nexport interface ${name}Props {\n  className?: string;\n  // Add more props here\n}\n\n`;
        }
        
        // Add styled components if selected
        if (withStyling === 'true') {
          code += `// Styled components\nconst Container = styled.div\`\n  // Add your styles here\n\`;\n\n`;
        }
        
        // Component declaration
        code += `/**\n * ${name} component\n *\n * @description Add description here\n */\nexport const ${name}: React.FC<${withProps === 'true' ? `${name}Props` : '{}'}>`;
        
        // Component implementation
        code += ` = (`;
        
        if (withProps === 'true') {
          code += `{\n  className,\n  // Destructure your props here\n}`;
        } else {
          code += `props`;
        }
        
        code += `) => {\n`;
        
        // Add state if selected
        if (withHooks === 'useState' || withHooks === 'useState + useEffect') {
          code += `  const [state, setState] = useState<string>('');\n\n`;
        } else if (withHooks === 'Custom Hook') {
          code += `  const { state, actions } = use${name}State();\n\n`;
        }
        
        // Add useEffect if selected
        if (withHooks === 'useState + useEffect') {
          code += `  useEffect(() => {\n    // Effect logic here\n    return () => {\n      // Cleanup logic here\n    };\n  }, []);\n\n`;
        }
        
        // Add render
        code += `  return (\n`;
        
        if (withStyling === 'true') {
          code += `    <Container className={className}>\n      ${name} content\n    </Container>\n`;
        } else {
          code += `    <div className={className}>\n      ${name} content\n    </div>\n`;
        }
        
        code += `  );\n};\n\nexport default ${name};\n`;
        
        return code;
      }
    },
    {
      name: 'Custom React Hook',
      type: 'hook',
      description: 'Creates a custom React hook with TypeScript',
      fields: [
        {
          name: 'name',
          label: 'Hook Name (without use prefix)',
          type: 'text',
          placeholder: 'WindowSize',
          required: true
        },
        {
          name: 'withState',
          label: 'Include State',
          type: 'checkbox',
          defaultValue: 'true'
        },
        {
          name: 'withEffect',
          label: 'Include Effect',
          type: 'checkbox',
          defaultValue: 'true'
        },
        {
          name: 'withCallback',
          label: 'Include Callback',
          type: 'checkbox',
          defaultValue: 'false'
        }
      ],
      generate: (values) => {
        const { name, withState, withEffect, withCallback } = values;
        const hookName = `use${name}`;
        
        let code = `import { `;
        const hooks: string[] = [];
        if (withState === 'true') hooks.push('useState');
        if (withEffect === 'true') hooks.push('useEffect');
        if (withCallback === 'true') hooks.push('useCallback');
        code += hooks.join(', ');
        code += ` } from 'react';\n\n`;
        
        // Add return type
        code += `/**\n * Return type for ${hookName} hook\n */\ninterface ${name}Return {\n`;
        if (withState === 'true') {
          code += `  // State values\n  value: string;\n  setValue: (value: string) => void;\n`;
        }
        if (withCallback === 'true') {
          code += `  // Callbacks\n  handleEvent: (event: React.SyntheticEvent) => void;\n`;
        }
        code += `}\n\n`;
        
        // Add hook parameters
        code += `/**\n * ${hookName} hook\n *\n * @description Add description here\n */\nexport const ${hookName} = (`;
        // Add parameters if needed
        code += `): ${name}Return => {\n`;
        
        // Add state if selected
        if (withState === 'true') {
          code += `  // State declarations\n  const [value, setValue] = useState('');\n\n`;
        }
        
        // Add callback if selected
        if (withCallback === 'true') {
          code += `  // Callback declarations\n  const handleEvent = useCallback((event: React.SyntheticEvent) => {\n    // Callback logic here\n  }, []);\n\n`;
        }
        
        // Add effect if selected
        if (withEffect === 'true') {
          code += `  // Effects\n  useEffect(() => {\n    // Effect logic here\n    \n    return () => {\n      // Cleanup logic here\n    };\n  }, []);\n\n`;
        }
        
        // Return statement
        code += `  return {\n`;
        if (withState === 'true') {
          code += `    value,\n    setValue,\n`;
        }
        if (withCallback === 'true') {
          code += `    handleEvent,\n`;
        }
        code += `  };\n};\n\nexport default ${hookName};\n`;
        
        return code;
      }
    },
    {
      name: 'Context Provider',
      type: 'context',
      description: 'Creates a React context provider with TypeScript',
      fields: [
        {
          name: 'name',
          label: 'Context Name',
          type: 'text',
          placeholder: 'Auth',
          required: true
        },
        {
          name: 'withState',
          label: 'State Type',
          type: 'select',
          options: ['None', 'Simple', 'Complex Object'],
          defaultValue: 'Simple'
        }
      ],
      generate: (values) => {
        const { name, withState } = values;
        const contextName = `${name}Context`;
        const providerName = `${name}Provider`;
        const hookName = `use${name}`;
        
        let code = `import React, { createContext, useContext, useState`;
        
        if (withState !== 'None') {
          code += `, useEffect`;
        }
        
        code += ` } from 'react';\n\n`;
        
        // Context value interface
        code += `/**\n * ${contextName} value interface\n */\ninterface ${name}ContextValue {\n`;
        
        if (withState === 'None') {
          code += `  // Add your context values here\n`;
        } else if (withState === 'Simple') {
          code += `  value: string;\n  setValue: (value: string) => void;\n`;
        } else if (withState === 'Complex Object') {
          code += `  state: {\n    isLoading: boolean;\n    data: any | null;\n    error: Error | null;\n  };\n  actions: {\n    loadData: () => Promise<void>;\n    clearData: () => void;\n  };\n`;
        }
        
        code += `}\n\n`;
        
        // Create initial state
        if (withState === 'Simple') {
          code += `// Initial context value\nconst initialContextValue: ${name}ContextValue = {\n  value: '',\n  setValue: () => {},\n};\n\n`;
        } else if (withState === 'Complex Object') {
          code += `// Initial context value\nconst initialContextValue: ${name}ContextValue = {\n  state: {\n    isLoading: false,\n    data: null,\n    error: null,\n  },\n  actions: {\n    loadData: async () => {},\n    clearData: () => {},\n  },\n};\n\n`;
        } else {
          code += `// Initial context value\nconst initialContextValue: ${name}ContextValue = {\n  // Add initial values here\n};\n\n`;
        }
        
        // Create context
        code += `// Create context\nconst ${contextName} = createContext<${name}ContextValue>(initialContextValue);\n\n`;
        
        // Provider props
        code += `/**\n * Props for ${providerName} component\n */\ninterface ${providerName}Props {\n  children: React.ReactNode;\n}\n\n`;
        
        // Provider component
        code += `/**\n * ${providerName} component\n */\nexport const ${providerName}: React.FC<${providerName}Props> = ({ children }) => {\n`;
        
        // Provider state
        if (withState === 'Simple') {
          code += `  const [value, setValue] = useState<string>('');\n\n`;
          code += `  const contextValue: ${name}ContextValue = {\n    value,\n    setValue,\n  };\n\n`;
        } else if (withState === 'Complex Object') {
          code += `  const [state, setState] = useState({\n    isLoading: false,\n    data: null as any | null,\n    error: null as Error | null,\n  });\n\n`;
          code += `  // Define actions\n  const actions = {\n    loadData: async () => {\n      try {\n        setState({ ...state, isLoading: true, error: null });\n        // Add data loading logic here\n        const data = {}; // Replace with actual data fetching\n        setState({ isLoading: false, data, error: null });\n      } catch (error) {\n        setState({ ...state, isLoading: false, error: error as Error });\n      }\n    },\n    clearData: () => {\n      setState({ ...state, data: null });\n    },\n  };\n\n`;
          code += `  const contextValue: ${name}ContextValue = {\n    state,\n    actions,\n  };\n\n`;
        } else {
          code += `  const contextValue: ${name}ContextValue = {\n    // Add your context logic here\n  };\n\n`;
        }
        
        // Provider return
        code += `  return (\n    <${contextName}.Provider value={contextValue}>\n      {children}\n    </${contextName}.Provider>\n  );\n};\n\n`;
        
        // Hook
        code += `/**\n * Hook to use the ${name} context\n */\nexport const ${hookName} = () => {\n  const context = useContext(${contextName});\n  \n  if (!context) {\n    throw new Error('${hookName} must be used within a ${providerName}');\n  }\n  \n  return context;\n};\n\nexport default ${providerName};\n`;
        
        return code;
      }
    }
  ];
  
  return (
    <CodeGenContainer>
      <Title>Code Generator</Title>
      
      {!activeTemplate ? (
        <TemplateGrid>
          {templates.map(template => (
            <TemplateCard 
              key={template.name} 
              onClick={() => {
                setActiveTemplate(template);
                // Initialize form values with defaults
                const initialValues: Record<string, string> = {};
                template.fields.forEach(field => {
                  if (field.defaultValue) {
                    initialValues[field.name] = field.defaultValue;
                  } else {
                    initialValues[field.name] = '';
                  }
                });
                setFormValues(initialValues);
              }}
            >
              <TemplateIcon>
                {template.type === 'component' && '🧩'}
                {template.type === 'hook' && '🎣'}
                {template.type === 'context' && '🌐'}
                {template.type === 'service' && '⚙️'}
                {template.type === 'test' && '🧪'}
                {template.type === 'types' && '📝'}
              </TemplateIcon>
              <TemplateName>{template.name}</TemplateName>
              <TemplateDescription>{template.description}</TemplateDescription>
            </TemplateCard>
          ))}
        </TemplateGrid>
      ) : (
        <TemplateForm>
          <FormHeader>
            <FormTitle>{activeTemplate.name}</FormTitle>
            <BackButton onClick={handleReset}>← Back</BackButton>
          </FormHeader>
          
          {activeTemplate.fields.map(field => (
            <FormField key={field.name}>
              <FieldLabel>
                {field.label}
                {field.required && <Required>*</Required>}
              </FieldLabel>
              
              {field.type === 'text' && (
                <TextInput
                  type="text"
                  placeholder={field.placeholder}
                  value={formValues[field.name] || ''}
                  onChange={e => handleFieldChange(field.name, e.target.value)}
                  required={field.required}
                />
              )}
              
              {field.type === 'textarea' && (
                <TextArea
                  placeholder={field.placeholder}
                  value={formValues[field.name] || ''}
                  onChange={e => handleFieldChange(field.name, e.target.value)}
                  required={field.required}
                />
              )}
              
              {field.type === 'select' && field.options && (
                <SelectInput
                  value={formValues[field.name] || field.defaultValue || ''}
                  onChange={e => handleFieldChange(field.name, e.target.value)}
                  required={field.required}
                >
                  {field.options.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectInput>
              )}
              
              {field.type === 'checkbox' && (
                <CheckboxContainer>
                  <CheckboxInput
                    type="checkbox"
                    checked={formValues[field.name] === 'true'}
                    onChange={e => handleFieldChange(field.name, e.target.checked ? 'true' : 'false')}
                  />
                  <CheckboxLabel>{field.description || ''}</CheckboxLabel>
                </CheckboxContainer>
              )}
              
              {field.description && field.type !== 'checkbox' && (
                <FieldDescription>{field.description}</FieldDescription>
              )}
            </FormField>
          ))}
          
          {activeTemplate.type === 'component' && (
            <FormField>
              <FieldLabel>Output Filename</FieldLabel>
              <TextInput
                type="text"
                value={filename}
                onChange={e => setFilename(e.target.value)}
                placeholder="MyComponent.tsx"
              />
            </FormField>
          )}
          
          <GenerateButton onClick={handleGenerate}>Generate Code</GenerateButton>
          
          {generatedCode && (
            <ResultSection>
              <ResultHeader>
                <ResultTitle>Generated Code</ResultTitle>
                <CopyButton onClick={handleCopyCode}>Copy to Clipboard</CopyButton>
              </ResultHeader>
              <CodeArea
                ref={codeRef}
                value={generatedCode}
                readOnly
              />
            </ResultSection>
          )}
        </TemplateForm>
      )}
    </CodeGenContainer>
  );
};

// Styled components
const CodeGenContainer = styled.div`
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  margin: 0 0 20px 0;
  color: #2c3e50;
  font-size: 24px;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
`;

const TemplateCard = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #eaecef;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: #d0d7de;
  }
`;

const TemplateIcon = styled.div`
  font-size: 24px;
  margin-bottom: 12px;
`;

const TemplateName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #1a202c;
`;

const TemplateDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #64748b;
`;

const TemplateForm = styled.div`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const FormTitle = styled.h3`
  margin: 0;
  color: #1a202c;
  font-size: 18px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #4a90e2;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const FormField = styled.div`
  margin-bottom: 16px;
`;

const FieldLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #3c4858;
  font-size: 14px;
`;

const Required = styled.span`
  color: #e53e3e;
  margin-left: 4px;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const SelectInput = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
`;

const CheckboxInput = styled.input`
  margin-right: 8px;
  width: 16px;
  height: 16px;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #3c4858;
`;

const FieldDescription = styled.p`
  margin: 4px 0 0 0;
  font-size: 12px;
  color: #718096;
  font-style: italic;
`;

const GenerateButton = styled.button`
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #3a7dcd;
  }
`;

const ResultSection = styled.div`
  margin-top: 20px;
  border-top: 1px solid #eaecef;
  padding-top: 20px;
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ResultTitle = styled.h4`
  margin: 0;
  color: #1a202c;
  font-size: 16px;
`;

const CopyButton = styled.button`
  background-color: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  
  &:hover {
    background-color: #e2e8f0;
  }
`;

const CodeArea = styled.textarea`
  width: 100%;
  padding: 12px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.4;
  min-height: 300px;
  resize: vertical;
  white-space: pre;
  overflow-x: auto;
  tab-size: 2;
`;

export default CodeGen; 