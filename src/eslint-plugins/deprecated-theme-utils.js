/**
 * Custom ESLint rule to detect usage of deprecated theme utility functions.
 */

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Detect usage of deprecated theme utility functions',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      // Detect imports of deprecated theme utilities
      ImportDeclaration(node) {
        const source = node.source.value;
        
        if (
          source === '../../core/theme/styled' ||
          source === '../../core/theme/styled.ts' ||
          source === '../../core/theme/theme-utils' ||
          source === '../../core/theme/theme-utils.ts' ||
          source === '../../core/theme/theme-adapter' ||
          source === '../../core/theme/theme-adapter.ts' ||
          source === 'src/core/theme/styled' ||
          source === 'src/core/theme/theme-utils' ||
          source === 'src/core/theme/theme-adapter'
        ) {
          // Check for specific imports from these files
          node.specifiers.forEach(specifier => {
            if (specifier.type === 'ImportSpecifier') {
              const importedName = specifier.imported.name;
              
              // Known deprecated functions
              const deprecatedFunctions = [
                'getThemeValue', 
                'createThemeValueGetter', 
                'getThemeColor',
                'getThemeSpacing',
                'getThemeFontSize', 
                'getThemeShadow',
                'getThemeBorderRadius',
                'getThemeTransitionDuration',
                'getThemeTransition',
                'adaptThemeForEmotion',
                'adaptEmotionTheme',
                'withThemeAdapter',
                'themed',
                'mixins'
              ];
              
              if (deprecatedFunctions.includes(importedName)) {
                context.report({
                  node: specifier,
                  message: `'${importedName}' is deprecated. Use useDirectTheme() hook from DirectThemeProvider instead.`,
                  fix(fixer) {
                    // This is a simple example - in practice you might need more complex fixes
                    if (importedName === 'getThemeValue' || importedName === 'getThemeColor') {
                      return [
                        // Remove this import
                        fixer.remove(specifier),
                        // Potentially add the correct import if it doesn't exist,
                        // but that would require more complex analysis
                      ];
                    }
                    return null;
                  }
                });
              }
            }
          });
        }
      },
      
      // Detect calls to deprecated functions
      CallExpression(node) {
        if (node.callee.type === 'Identifier') {
          const functionName = node.callee.name;
          
          const deprecatedFunctions = [
            'getThemeValue', 
            'createThemeValueGetter', 
            'getThemeColor',
            'getThemeSpacing',
            'getThemeFontSize', 
            'getThemeShadow',
            'getThemeBorderRadius',
            'getThemeTransitionDuration',
            'getThemeTransition',
            'adaptThemeForEmotion',
            'adaptEmotionTheme',
            'withThemeAdapter',
            'themed'
          ];
          
          if (deprecatedFunctions.includes(functionName)) {
            context.report({
              node,
              message: `'${functionName}' is deprecated. Use useDirectTheme() hook from DirectThemeProvider instead.`
            });
          }
        }
        
        // Also check for member expressions like theme.getThemeValue
        if (node.callee.type === 'MemberExpression' && node.callee.property.type === 'Identifier') {
          const methodName = node.callee.property.name;
          
          if ([
            'getThemeValue',
            'getThemeColor',
            'getThemeSpacing'
          ].includes(methodName)) {
            context.report({
              node,
              message: `'${methodName}' is deprecated. Use useDirectTheme() hook from DirectThemeProvider instead.`
            });
          }
        }
      }
    };
  }
}; 