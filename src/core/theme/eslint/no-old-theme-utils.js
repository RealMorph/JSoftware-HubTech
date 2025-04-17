module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Prevent importing from deprecated theme utilities',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },
  create(context) {
    return {
      ImportDeclaration(node) {
        const deprecatedModules = [
          '../theme-utils',
          '../styled',
          '../../core/theme/theme-utils',
          '../../core/theme/styled',
        ];

        const source = node.source.value;
        if (deprecatedModules.some(module => source.endsWith(module))) {
          context.report({
            node,
            message: 'Importing from deprecated theme utilities is not allowed. Use DirectTheme pattern instead.',
            fix(fixer) {
              // Suggest using DirectTheme
              return fixer.replaceText(
                node,
                `import { useDirectTheme } from '${source.replace(/theme-utils|styled/, 'DirectThemeProvider')}'`
              );
            },
          });
        }
      },
    };
  },
}; 