import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { getRoutesWithProtection } from './routeRegistry';
import { RouteDefinition } from './RouteConfig';

interface RouteGeneratorProps {
  // Optional filter to render only specific routes
  filter?: (route: RouteDefinition) => boolean;
}

/**
 * RouteGenerator - Renders routes from the route registry
 * Can optionally filter routes based on specific criteria
 */
export const RouteGenerator: React.FC<RouteGeneratorProps> = ({ filter }) => {
  // Get all routes with their protection wrappers applied
  const routes = getRoutesWithProtection();
  
  // Apply filter if provided
  const filteredRoutes = filter ? routes.filter(filter) : routes;
  
  // Recursively render routes and their children
  const renderRoutes = (routesToRender: RouteDefinition[]) => {
    return routesToRender.map((route) => (
      <Route 
        key={route.path} 
        path={route.path} 
        element={route.element}
      >
        {route.children && renderRoutes(route.children)}
      </Route>
    ));
  };
  
  return <Routes>{renderRoutes(filteredRoutes)}</Routes>;
};

export default RouteGenerator; 