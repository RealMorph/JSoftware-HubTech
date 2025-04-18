# Data Visualization Components

This directory contains modular, reusable data visualization components for displaying charts, graphs, and maps.

## Components Overview

### Chart Components
- **BarChart** - For displaying categorical data comparisons
- **LineChart** - For trending data over time or sequence
- **PieChart** - For part-to-whole relationships
- **DonutChart** - A variation of pie chart with a hollow center

### Graph Components
- **Graph** - For network/relationship visualizations
- **OrganizationChart** - For hierarchical structures

### Map Components
- **Map** - Basic SVG map for geographic data visualization
- **ChoroplethMap** - Map with regions colored by value
- **HeatMap** - Map for showing data intensity

### Advanced Maps
- **LeafletMap** - Integration with Leaflet for real geography (requires additional installation)

## Installation

### Basic Components
The basic chart, graph, and SVG map components require no additional installation. They are built with React and emotion styling.

### Leaflet Map (Optional)
To use the LeafletMap component with real geographical features:

```bash
npm install leaflet @types/leaflet
```

Then ensure Leaflet CSS is imported in your main CSS or index file:

```js
import 'leaflet/dist/leaflet.css';
```

## Troubleshooting

### Mouse Wheel Event Errors

If you're seeing console errors like:

```
Unable to preventDefault inside passive event listener invocation.
```

This is happening because the wheel event in the Map component is being treated as a passive listener by modern browsers. To fix this:

**Option 1: Add touchAction style (recommended):**
The Map component now includes `style={{ touchAction: 'none' }}` on the MapCanvas element, which should prevent most issues.

**Option 2: Add a global event listener option:**
You can add this to your main JavaScript file:

```js
// Add support for passive event listeners
document.addEventListener('wheel', () => {}, { passive: false });
```

## Usage Examples

### Basic Chart

```jsx
import { BarChart } from '../components/data-visualization';

const MyComponent = () => {
  const data = [
    { id: '1', label: 'Jan', value: 45 },
    { id: '2', label: 'Feb', value: 62 },
    { id: '3', label: 'Mar', value: 58 }
  ];
  
  return (
    <BarChart 
      data={data}
      title="Monthly Revenue"
      onDataPointClick={(id) => console.log(`Clicked on ${id}`)}
    />
  );
};
```

### Network Graph

```jsx
import { Graph } from '../components/data-visualization';

const MyComponent = () => {
  const graphData = {
    nodes: [
      { id: 'user1', label: 'User 1', radius: 20 },
      { id: 'user2', label: 'User 2', radius: 20 }
    ],
    edges: [
      { id: 'conn1', source: 'user1', target: 'user2' }
    ]
  };
  
  return (
    <Graph 
      data={graphData}
      title="User Connections"
      physics={{ gravity: -200 }}
    />
  );
};
```

### Leaflet Map (Real Geography)

```jsx
import { LeafletMap } from '../components/data-visualization';

const MyComponent = () => {
  return (
    <LeafletMap
      center={[40.7128, -74.0060]}
      zoom={13}
      points={[
        { 
          id: 'nyc', 
          label: 'New York City', 
          latitude: 40.7128, 
          longitude: -74.0060 
        }
      ]}
      height="500px"
      title="New York City Map"
    />
  );
};
```

## Demo

All components can be viewed in the demo:

```
/demos/data-visualization
``` 