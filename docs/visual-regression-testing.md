# Visual Regression Testing with Chromatic

This document describes how to use Chromatic for visual regression testing in this project.

## Overview

Visual regression testing helps ensure that UI components maintain their expected visual appearance across code changes. We use [Chromatic](https://www.chromatic.com/) (by Storybook) for this purpose, which automates visual testing by taking screenshots of all our Storybook stories and comparing them against baseline versions.

## Prerequisites

- Node.js (version 18 or higher)
- npm
- A Chromatic account and project token

## Setup

1. **Ensure you have the Chromatic project token**:
   - For local development, set it as an environment variable:
     ```
     export CHROMATIC_PROJECT_TOKEN=your_token_here
     ```
   - For CI, it should be set as a secret in your GitHub repository settings.

2. **Build Storybook**:
   ```
   npm run build-storybook
   ```

## Running Visual Regression Tests

### Local Development

To run visual regression tests locally:

```bash
# Run Chromatic tests
npm run test:chromatic

# Or to automatically accept all changes as a new baseline:
npm run test:chromatic -- --auto-accept-changes
```

### Integration with the Test Dashboard

Visual regression test results are automatically integrated with our test dashboard:

```bash
# Run tests and view in dashboard
npm run test:chromatic && npm run test:dashboard
```

### CI/CD Integration

Visual regression tests run automatically on:
- Pull requests to main/develop branches
- Pushes to main/develop branches

The workflow is defined in `.github/workflows/chromatic.yml`.

## Working with Visual Changes

When Chromatic detects visual changes:

1. **Review Changes**: Visit the Chromatic UI to review all detected changes.
2. **Accept or Reject**: For each change, decide if it's intended (accept) or a regression (reject).
3. **Fix Issues**: If changes are unintended, fix the component and push updates.

### Best Practices

1. **Component Stories**: Ensure every component has comprehensive Storybook stories.
2. **Isolated Components**: Components should be rendered in isolation to make visual changes obvious.
3. **Theme Testing**: Test components in all supported themes.
4. **Responsive Testing**: Test components across different viewport sizes.
5. **Accept Changes Deliberately**: Don't automatically accept all changes unless you're establishing a new baseline.

## Workflow Integration

Our visual regression testing is integrated with:

1. **GitHub Actions**: Tests run on PRs and provide feedback via comments.
2. **Test Dashboard**: Results appear in the Visual Regression tab.

## Troubleshooting

### Common Issues

1. **Authentication Problems**:
   - Verify your CHROMATIC_PROJECT_TOKEN is correct
   - Check you have the necessary permissions on the Chromatic project

2. **Flaky Tests**:
   - Add `chromatic.troubleshoot: true` to stories causing issues
   - Use deterministic data in your stories
   - Avoid animations or time-dependent elements

3. **Long Build Times**:
   - Use `onlyChanged: true` to test only modified components
   - Split large UI changes across multiple PRs

### Getting Help

If you encounter issues with Chromatic:
1. Check the [Chromatic documentation](https://www.chromatic.com/docs/)
2. Review the build logs for specific error messages
3. Contact the development team for project-specific guidance 