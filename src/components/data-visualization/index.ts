// Export chart components
export { BarChart, LineChart, PieChart, DonutChart } from './Charts';
export { ScatterChart } from './ScatterChart';

// Export graph components
export { Graph, OrganizationChart } from './Graph';

// Export map components
export { Map, ChoroplethMap, HeatMap } from './Map';

// Export demo components
export * from './DataVisualizationDemo';

// Export types
export type { DataPoint } from './Charts';
export type { ScatterPoint } from './ScatterChart';
export type { GraphNode, GraphEdge, GraphData } from './Graph';
export type { MapData, GeoPoint, GeoPath, MapRegion } from './Map';

// Add default export for the main visualization demo component
import { DataVisualizationDemo } from './DataVisualizationDemo';
export default DataVisualizationDemo;