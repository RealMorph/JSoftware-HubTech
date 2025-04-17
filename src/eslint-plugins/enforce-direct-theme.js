/**
 * Custom ESLint rule to enforce consistent DirectTheme patterns.
 * This rule ensures components are using the DirectTheme pattern correctly.
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce consistent DirectTheme patterns across components',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    // Track component state across the file
    const state = {
      hasThemeStylesInterface: false,
      hasCreateThemeStylesFunction: false,
      usesDirectThemeHook: false,
      styledComponentsWithThemeStyles: new Set(),
      allStyledComponents: new Set(),
      importedUseDirectTheme: false,
    };

    return {
      // Check for proper imports
      ImportDeclaration(node) {
        const source = node.source.value;
        
        // Check for DirectThemeProvider import
        if (source.includes('DirectThemeProvider') || 
            source.includes('core/theme/direct-theme') || 
            source.includes('theme-context')) {
          
          node.specifiers.forEach(specifier => {
            if (specifier.type === 'ImportSpecifier' && 
                specifier.imported && 
                specifier.imported.name === 'useDirectTheme') {
              state.importedUseDirectTheme = true;
            }
          });
        }
        
        // Check for incorrect theme imports
        if (source.includes('styled-components') && !source.includes('test')) {
          context.report({
            node,
            message: 'Use @emotion/styled instead of styled-components for consistent theme styling.'
          });
        }
      },
      
      // Check for ThemeStyles interface declaration
      TSInterfaceDeclaration(node) {
        if (node.id && node.id.name === 'ThemeStyles') {
          state.hasThemeStylesInterface = true;
        }
      },
      
      // Check for createThemeStyles function
      FunctionDeclaration(node) {
        if (node.id && node.id.name === 'createThemeStyles') {
          state.hasCreateThemeStylesFunction = true;
        }
      },
      
      // Also check for arrow function expressions that might define createThemeStyles
      VariableDeclarator(node) {
        if (node.id && node.id.name === 'createThemeStyles') {
          state.hasCreateThemeStylesFunction = true;
        }
      },
      
      // Check for styled component declarations
      CallExpression(node) {
        // Check for styled components with proper props
        if (node.callee && 
            node.callee.object && 
            node.callee.object.name === 'styled') {
          
          const componentName = node.callee.property ? node.callee.property.name : '';
          if (componentName) {
            state.allStyledComponents.add(componentName);
            
            // Look for $themeStyles in props
            const hasThemeStylesProp = node.arguments && 
              node.arguments[0] && 
              node.arguments[0].type === 'TemplateLiteral' && 
              node.arguments[0].quasis && 
              node.arguments[0].quasis.some(quasi => 
                quasi.value.raw.includes('$themeStyles') || 
                quasi.value.cooked.includes('$themeStyles')
              );
            
            if (hasThemeStylesProp) {
              state.styledComponentsWithThemeStyles.add(componentName);
            }
          }
        }
        
        // Check for useDirectTheme hook usage
        if (node.callee && 
            node.callee.type === 'Identifier' && 
            node.callee.name === 'useDirectTheme') {
          state.usesDirectThemeHook = true;
        }
      },
      
      // Final validation at the end of the file
      'Program:exit'() {
        // Only apply checks to component files (not tests, utils, etc.)
        const filename = context.getFilename();
        if (filename.includes('test') || 
            filename.includes('utils') || 
            filename.includes('eslint-plugins')) {
          return;
        }
        
        // Check for component files that should use DirectTheme
        if (filename.includes('components') || filename.includes('core/theme')) {
          // 1. Check if the file imports useDirectTheme
          if (!state.importedUseDirectTheme && state.allStyledComponents.size > 0) {
            context.report({
              loc: { line: 1, column: 0 },
              message: 'Components should import useDirectTheme from DirectThemeProvider.'
            });
          }
          
          // 2. Check for ThemeStyles interface if component has styled components
          if (!state.hasThemeStylesInterface && state.allStyledComponents.size > 0) {
            context.report({
              loc: { line: 1, column: 0 },
              message: 'Components using styled components should define a ThemeStyles interface.'
            });
          }
          
          // 3. Check for createThemeStyles function
          if (!state.hasCreateThemeStylesFunction && state.allStyledComponents.size > 0) {
            context.report({
              loc: { line: 1, column: 0 },
              message: 'Components using styled components should implement a createThemeStyles function.'
            });
          }
          
          // 4. Check if all styled components use $themeStyles prop
          if (state.allStyledComponents.size > 0 && 
              state.styledComponentsWithThemeStyles.size < state.allStyledComponents.size) {
            
            const missingComponents = [...state.allStyledComponents].filter(
              comp => !state.styledComponentsWithThemeStyles.has(comp)
            );
            
            if (missingComponents.length > 0) {
              context.report({
                loc: { line: 1, column: 0 },
                message: `These styled components should use $themeStyles prop: ${missingComponents.join(', ')}`
              });
            }
          }
          
          // 5. Check for useDirectTheme hook usage
          if (!state.usesDirectThemeHook && state.allStyledComponents.size > 0) {
            context.report({
              loc: { line: 1, column: 0 },
              message: 'Components using styled components should call useDirectTheme() hook.'
            });
          }
        }
      }
    };
  }
}; 