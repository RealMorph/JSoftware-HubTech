# Hot Reloading

This document explains how to use the hot reloading feature in the project.

## Overview

Hot reloading (also known as Hot Module Replacement or HMR) allows you to see changes in your application without losing the current state. This means you can modify your React components, CSS, and other assets, and see the changes immediately without a full page refresh.

## Getting Started

To start the development server with hot reloading enabled, run:

```bash
npm run dev:hot
```

This will start the Vite development server with enhanced hot reloading features.

## Features

The hot reloading setup includes the following features:

- **Fast Refresh**: React components are updated without losing their state
- **CSS Hot Reloading**: CSS changes are applied instantly without a page refresh
- **Error Overlay**: Errors are displayed in an overlay in the browser
- **Automatic Port Management**: If the default port is in use, the server will attempt to kill the process using it
- **Proxy Configuration**: API requests are automatically proxied to the backend server

## Configuration

You can configure the hot reloading behavior by setting the following environment variables:

- `PORT`: The port to run the development server on (default: 3000)
- `HOST`: The host to run the development server on (default: localhost)
- `OPEN`: Whether to open the browser automatically (default: true)
- `WATCH`: Whether to watch for file changes (default: true)
- `PROXY`: The URL to proxy API requests to (default: http://localhost:3001)

Example:

```bash
PORT=3001 HOST=0.0.0.0 npm run dev:hot
```

## Troubleshooting

If you encounter issues with hot reloading, try the following:

1. **Check for Port Conflicts**: If the port is already in use, the server will attempt to kill the process using it. If this fails, you can manually kill the process or change the port.

2. **Clear Browser Cache**: Sometimes, the browser cache can interfere with hot reloading. Try clearing your browser cache or using incognito mode.

3. **Check for Syntax Errors**: Hot reloading may not work if there are syntax errors in your code. Check the console for errors.

4. **Restart the Server**: If hot reloading stops working, try restarting the development server.

## Best Practices

- **Keep Components Small**: Smaller components are easier to hot reload and debug.
- **Use Functional Components**: Functional components work better with hot reloading than class components.
- **Avoid Side Effects**: Side effects in components can cause issues with hot reloading. Use `useEffect` for side effects.
- **Use CSS Modules**: CSS modules work better with hot reloading than global CSS.

## Limitations

- **State Reset**: Some state changes may cause a full page refresh.
- **Third-Party Libraries**: Some third-party libraries may not work well with hot reloading.
- **Browser Extensions**: Some browser extensions may interfere with hot reloading.

## Additional Resources

- [Vite HMR Documentation](https://vitejs.dev/guide/api-hmr.html)
- [React Fast Refresh Documentation](https://reactjs.org/blog/2020/10/20/react-v17.html)
- [CSS Modules Documentation](https://github.com/css-modules/css-modules) 