module.exports = {
  projectToken: process.env.CHROMATIC_PROJECT_TOKEN,
  // Don't allow builds to pass when there are visual changes
  exitZeroOnChanges: false,
  // Don't allow the build to start with uncommitted changes
  // This ensures clean comparisons
  allowConsoleErrors: false,
  // Capture screenshots for all stories in Storybook
  storybookBuildDir: 'storybook-static',
  // Set a maximum build time (30 minutes)
  buildScriptName: 'build-storybook',
  // Only run visual tests on components that have changed
  onlyChanged: false,
  // Speed up builds by only capturing full page screenshots
  // instead of both component and full page
  preserveMissingScreenshots: true,
} 