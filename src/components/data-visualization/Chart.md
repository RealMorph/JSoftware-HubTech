# Chart Component Documentation

The Chart component is a versatile data visualization library that provides various chart types with modern styling, accessibility features, and responsive design. It uses the DirectTheme pattern for consistent theming across the application.

## Features

- Multiple chart types (Bar, Line, Pie, Donut)
- Responsive design with customizable aspect ratios
- Comprehensive theme integration
- Interactive elements with tooltips
- Accessible with ARIA support
- Keyboard navigation
- Customizable variants and sizes
- Animation support

## Installation

The Chart component is part of the data visualization module. No additional installation is required if you're using the main application.

## Usage

### Basic Example

```tsx
import { BarChart, LineChart, PieChart, DonutChart } from './components/data-visualization/Chart';

const data = [
  { id: '1', label: 'Category A', value: 30 },
  { id: '2', label: 'Category B', value: 45 },
  { id: '3', label: 'Category C', value: 25 },
];

// Bar Chart
<BarChart
  data={data}
  title="Sales by Category"
  showLegend={true}
  showTooltips={true}
  responsive={true}
/>

// Line Chart
<LineChart
  data={data}
  title="Trend Analysis"
  showValues={true}
  variant="outlined"
/>

// Pie Chart
<PieChart
  data={data}
  title="Market Share"
  showLegend={true}
  size="large"
/>

// Donut Chart
<DonutChart
  data={data}
  title="Revenue Distribution"
  innerRadius={0.6}
  showValues={true}
/>
```

## Component API

### Common Props

All chart types share these common props:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `DataPoint[]` | Required | Array of data points to visualize |
| `width` | `string` | '100%' | Chart width |
| `height` | `string` | '400px' | Chart height |
| `title` | `string` | undefined | Chart title |
| `showLegend` | `boolean` | true | Show/hide legend |
| `showTooltips` | `boolean` | true | Enable/disable tooltips |
| `showValues` | `boolean` | false | Show/hide data values |
| `colorScale` | `string[]` | theme colors | Custom colors for chart elements |
| `onDataPointClick` | `(pointId: string) => void` | undefined | Click handler for data points |
| `responsive` | `boolean` | true | Enable responsive layout |
| `minHeight` | `string` | '250px' | Minimum height for responsive mode |
| `aspectRatio` | `number` | 4/3 | Aspect ratio for responsive mode |
| `variant` | `'default' \| 'filled' \| 'outlined'` | 'default' | Visual variant |
| `size` | `'small' \| 'medium' \| 'large'` | 'medium' | Size variant |
| `interactive` | `boolean` | true | Enable interactive features |
| `highlightOnHover` | `boolean` | true | Enable hover effects |
| `animateOnMount` | `boolean` | true | Enable mount animation |

### DataPoint Interface

```typescript
interface DataPoint {
  id: string;
  label: string;
  value: number;
  color?: string;
}
```

### Specific Props

#### DonutChart
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `innerRadius` | `number` | 0.6 | Radius of inner circle (0-1) |

## Theme Integration

The Chart component uses the DirectTheme pattern and responds to the following theme properties:

### Colors
- Primary colors for chart elements
- Text colors for labels
- Background colors
- Border colors

### Typography
- Font family
- Font sizes
- Font weights
- Line heights

### Spacing
- Padding
- Margins
- Gap sizes

### Borders
- Border radius
- Border width
- Border styles

### Animations
- Duration
- Easing functions
- Transition properties

## Accessibility

The Chart component follows WCAG 2.1 guidelines and provides:

- Proper ARIA roles and attributes
- Keyboard navigation
- Screen reader support
- High contrast mode support
- Focus indicators
- Live regions for dynamic content

## Responsive Design

The component adapts to different screen sizes:

- Fluid width with maintained aspect ratio
- Configurable minimum height
- Mobile-optimized touch targets
- Responsive typography
- Adjustable padding based on screen size

## Best Practices

1. **Data Format**
   - Ensure consistent data structure
   - Use meaningful labels
   - Provide unique IDs for each data point

2. **Accessibility**
   - Include descriptive titles
   - Provide meaningful ARIA labels
   - Test with screen readers

3. **Responsive Design**
   - Set appropriate aspect ratios
   - Define minimum heights
   - Test on various screen sizes

4. **Performance**
   - Limit data points for optimal rendering
   - Use memoization for complex calculations
   - Implement proper cleanup in useEffect

## Examples

### Responsive Bar Chart
```tsx
<BarChart
  data={data}
  responsive={true}
  aspectRatio={16/9}
  minHeight="300px"
  title="Sales Performance"
  showLegend={true}
  showTooltips={true}
  variant="filled"
  size="large"
  interactive={true}
  highlightOnHover={true}
  animateOnMount={true}
  ariaLabel="Monthly sales data visualization"
/>
```

### Interactive Line Chart
```tsx
<LineChart
  data={timeSeriesData}
  showValues={true}
  showTooltips={true}
  onDataPointClick={(pointId) => {
    console.log(`Clicked point: ${pointId}`);
  }}
  variant="outlined"
  size="medium"
/>
```

### Accessible Pie Chart
```tsx
<PieChart
  data={marketShareData}
  title="Market Share Distribution"
  showLegend={true}
  ariaLabel="Market share distribution pie chart"
  ariaDescribedBy="chart-description"
  role="img"
/>
```

### Customized Donut Chart
```tsx
<DonutChart
  data={revenueData}
  innerRadius={0.7}
  showValues={true}
  colorScale={customColors}
  variant="filled"
  size="large"
/>
```

## Error Handling

The component handles various edge cases:

- Empty data sets
- Invalid data formats
- Missing theme values
- Responsive container issues
- Animation failures

## Performance Considerations

1. **Memoization**
   - Theme styles are memoized
   - Event handlers use useCallback
   - Complex calculations are cached

2. **Rendering Optimization**
   - Efficient update checks
   - Proper cleanup of effects
   - Optimized SVG rendering

3. **Animation Performance**
   - Hardware-accelerated properties
   - Efficient transition handling
   - Reduced layout thrashing

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11 support requires polyfills
- Mobile browsers fully supported

## Contributing

When contributing to the Chart component:

1. Follow the DirectTheme pattern
2. Maintain accessibility features
3. Add proper documentation
4. Include unit tests
5. Consider performance implications
6. Test responsive behavior 