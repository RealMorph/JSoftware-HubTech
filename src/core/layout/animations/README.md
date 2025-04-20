# Animation Performance Optimizations

This directory contains components and hooks that implement performance optimizations for animations in the application. These optimizations help ensure smooth animations even on lower-end devices and prevent unnecessary rendering.

## Key Performance Optimizations

### 1. Virtual Rendering

The `OptimizedAnimatedGrid` component implements virtual rendering (or "windowing"), which only renders items that are currently visible in the viewport. This significantly improves performance for large lists and grids by:

- Reducing DOM node count
- Minimizing rendering work
- Lowering memory usage

```tsx
// Example usage
<OptimizedAnimatedGrid
  columns={3}
  gap={16}
  animationType="fade"
  animationDuration="standard"
  itemHeight={120}  // Required for virtual scrolling calculations
  containerHeight={500}
  itemsPerPage={24} // Buffer size
>
  {items.map(item => <GridItem key={item.id} data={item} />)}
</OptimizedAnimatedGrid>
```

### 2. Intersection Observer

The `useAnimateOnVisible` hook uses `IntersectionObserver` to trigger animations only when elements enter the viewport, which:

- Prevents off-screen animations from consuming resources
- Improves perceived performance
- Reduces battery consumption on mobile devices

```tsx
// Example usage
const MyAnimatedComponent = () => {
  const { ref, isVisible, animationConfig } = useAnimateOnVisible(
    'fade',
    'standard',
    '100px', // Root margin
    0.1      // Visibility threshold
  );

  return (
    <div ref={ref} style={{
      opacity: isVisible ? 1 : 0,
      transition: `opacity ${animationConfig.duration}ms`
    }}>
      Content appears when visible
    </div>
  );
};
```

### 3. Memoization

Multiple hooks and components use `useMemo`, `useCallback`, and `React.memo` to prevent unnecessary recalculations and re-renders:

```tsx
// Memoize expensive calculations
const processedData = useMemo(() => {
  return heavyDataProcessing(data);
}, [data]);

// Memoize event handlers
const handleClick = useCallback(() => {
  performAction();
}, []);

// Memoize components
const OptimizedComponent = React.memo(({ prop1, prop2 }) => {
  // Component implementation
});
```

### 4. Hardware Acceleration

Components use CSS properties that trigger hardware acceleration and minimize layout calculations:

- `transform` and `opacity` for animations (instead of properties that cause layout)
- `will-change` to hint the browser about upcoming animations
- `backface-visibility` and `translate3d` to force GPU rendering

```css
/* Example of hardware accelerated styles */
.accelerated-element {
  transform: translate3d(0, 0, 0);
  will-change: transform, opacity;
  backface-visibility: hidden;
}
```

### 5. Debouncing

The `useDebounce` hook delays processing updates until user input stabilizes:

```tsx
// Example with search input
const SearchComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  
  // API call only happens after typing stops for 300ms
  useEffect(() => {
    if (debouncedSearchTerm) {
      searchApi(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
};
```

### 6. RequestAnimationFrame

The `useRaf` hook synchronizes animations with the browser's repaint cycle:

```tsx
// Example of smooth animation with requestAnimationFrame
const AnimatedCounter = ({ target }) => {
  const [count, setCount] = useState(0);
  
  useRaf((time) => {
    if (count < target) {
      setCount(prev => Math.min(prev + 1, target));
    }
  }, [count, target]);
  
  return <div>{count}</div>;
};
```

## Best Practices

1. **Measure First**: Use the Performance tab in Chrome DevTools to identify bottlenecks before optimizing.
2. **Prioritize Visible Content**: Only animate what the user can see.
3. **Batch DOM Updates**: Group changes to minimize layout thrashing.
4. **Avoid Layout Properties**: Properties like `width`, `height`, `top`, `left` trigger expensive layout recalculations.
5. **Use Compositor-Only Properties**: Stick to `transform` and `opacity` for animations when possible.
6. **Reduce State Updates**: Each state update can trigger re-renders; optimize state management.
7. **Test on Lower-End Devices**: Ensure animations remain smooth across a range of devices.

## Additional Resources

- Check the `PerformanceOptimizedExample` component for a complete example
- See documentation in each component's code comments for specific implementation details 