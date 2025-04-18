# Component Visibility System

This module provides a comprehensive set of tools for efficiently managing component visibility in React applications. It leverages the Intersection Observer API for performance and includes ready-to-use components for common visibility-related patterns.

## Core Features

- **Visibility Detection**: Track when elements enter or exit the viewport
- **Lazy Loading**: Load components or media only when they become visible
- **Infinite Scrolling**: Automatically load more content as users scroll
- **Visibility-Based Animations**: Trigger animations when elements become visible

## Components

### VisibilitySensor

A basic wrapper around `react-visibility-sensor` with enhanced features:

```tsx
import { VisibilitySensor } from '../core/visibility';

<VisibilitySensor
  onChange={(isVisible) => console.log('Element is visible:', isVisible)}
  minVisibleTime={500}
  offset={{ top: 100 }}
  partialVisibility={true}
  triggerOnce={true}
>
  <div>This content is monitored for visibility</div>
</VisibilitySensor>
```

#### Props

- `onChange`: Function called when visibility changes
- `minVisibleTime`: Minimum time the element needs to be visible before triggering onChange
- `offset`: Offset to determine visibility in pixels
- `partialVisibility`: Whether partial visibility should count as visible
- `triggerOnce`: Whether to trigger only once and then stop monitoring
- `className`: Custom class name
- `onFirstVisible`: Function called the first time the element becomes visible
- `onFirstInvisible`: Function called the first time the element becomes invisible
- `style`: Additional styles for the container

### LazyLoad

A component that only renders its children when they come into view:

```tsx
import { LazyLoad } from '../core/visibility';

<LazyLoad
  placeholder={<div>Loading...</div>}
  height="300px"
  fadeIn={true}
  fadeInDuration={500}
>
  <ExpensiveComponent />
</LazyLoad>
```

#### Props

- `placeholder`: Content to show while the main content is not yet visible
- `height`: Height for the placeholder
- `width`: Width for the placeholder
- `offset`: Offset to determine visibility
- `visibleDelay`: Minimum time in milliseconds element should be visible before loading
- `fadeIn`: Whether to show a fade-in animation when content appears
- `fadeInDuration`: Fade-in animation duration in milliseconds
- `className`: Custom class name
- `triggerOnce`: Whether to trigger only once and then stop monitoring
- `style`: Additional styles for the container
- `partialVisibility`: Whether partial visibility should count as visible

### InfiniteScroll

A component that automatically loads more content as the user scrolls:

```tsx
import { InfiniteScroll } from '../core/visibility';

<InfiniteScroll
  onLoadMore={async () => {
    await fetchMoreData();
    return hasMoreData; // return false when no more data
  }}
  loadingElement={<div>Loading more items...</div>}
  endElement={<div>No more items to load</div>}
  hasMore={true}
  threshold={300}
  throttleMs={1000}
>
  {items.map(item => (
    <Item key={item.id} data={item} />
  ))}
</InfiniteScroll>
```

#### Props

- `onLoadMore`: Function called to load more items, should return a Promise
- `loadingElement`: Element to display while loading more items
- `endElement`: Element to display when all items are loaded
- `hasMore`: Whether there are more items to load
- `className`: Custom class name
- `threshold`: Distance in pixels before the end when `onLoadMore` should be called
- `resetOnChildrenChange`: Whether to reset scroll state when children change
- `throttleMs`: Minimum time between load more calls
- `initialLoading`: Initial loading state

## Hooks

### useVisibility

A hook for tracking element visibility using the Intersection Observer API:

```tsx
import { useVisibility } from '../core/visibility';

function VisibilityExample() {
  const { isVisible, ref, hasBeenVisible } = useVisibility({
    threshold: 0.5,
    triggerOnce: true
  });

  return (
    <div ref={ref}>
      {isVisible ? 'I am visible!' : 'I am not visible'}
      {hasBeenVisible && <div>I have been seen at least once!</div>}
    </div>
  );
}
```

#### Options

- `root`: Root element to use as viewport (null = browser viewport)
- `rootMargin`: Margin around the root element
- `threshold`: Threshold(s) at which the callback should be triggered
- `triggerOnce`: Whether to only trigger once
- `initialIsVisible`: Initial visibility state

#### Return Values

- `isVisible`: Whether the element is currently visible
- `ref`: Ref to attach to the target element
- `hasBeenVisible`: Whether the element has ever been visible

### useVisibilitySystem

A comprehensive hook that combines all visibility features:

```tsx
import { useVisibilitySystem, LazyLoad, InfiniteScroll } from '../core/visibility';

function AdvancedVisibilityExample() {
  const { 
    isVisible, 
    ref, 
    hasBeenVisible,
    createLazyLoadConfig,
    createInfiniteScrollConfig
  } = useVisibilitySystem({
    onVisibilityChange: (visible) => console.log('Visibility changed:', visible),
    onFirstVisible: () => console.log('Element first became visible!'),
    threshold: 0.1
  });

  const content = <div>Visibility-managed content</div>;
  
  // Option 1: Use the ref directly
  return <div ref={ref}>{content}</div>;
  
  // Option 2: Use lazy loading
  const lazyConfig = createLazyLoadConfig({ 
    fadeIn: true,
    height: "300px" 
  });
  return <LazyLoad {...lazyConfig}>{content}</LazyLoad>;
  
  // Option 3: Use infinite scrolling
  const fetchMoreData = async () => {
    // load more data
    return true; // return false when no more data
  };
  
  const scrollConfig = createInfiniteScrollConfig({ 
    onLoadMore: fetchMoreData,
    hasMore: true 
  });
  return <InfiniteScroll {...scrollConfig}>{content}</InfiniteScroll>;
}
```

## Usage Examples

### Lazy Loading Images

```tsx
import { LazyLoad } from '../core/visibility';

function GalleryImage({ src, alt }) {
  return (
    <LazyLoad
      placeholder={<div className="image-placeholder" />}
      height="300px"
      fadeIn={true}
    >
      <img src={src} alt={alt} />
    </LazyLoad>
  );
}
```

### Animated Entrance

```tsx
import { useVisibility } from '../core/visibility';
import { motion } from 'framer-motion';

function AnimatedSection({ children }) {
  const { isVisible, ref } = useVisibility({ triggerOnce: true });
  
  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
```

### Performance Optimized List

```tsx
import { InfiniteScroll, LazyLoad } from '../core/visibility';

function OptimizedList({ items, fetchMore, hasMore }) {
  return (
    <InfiniteScroll
      onLoadMore={fetchMore}
      hasMore={hasMore}
      loadingElement={<Spinner />}
    >
      {items.map(item => (
        <LazyLoad key={item.id} height="100px">
          <ListItem data={item} />
        </LazyLoad>
      ))}
    </InfiniteScroll>
  );
}
```

## Best Practices

1. **Use triggerOnce**: For one-time animations or lazy loading, set `triggerOnce={true}` to prevent unnecessary recalculations.

2. **Set appropriate thresholds**: Consider how much of an element should be visible to trigger the callback:
   - For lazy loading: Lower thresholds (0.1-0.2)
   - For animations: Higher thresholds (0.5-0.7)

3. **Provide dimensions**: For LazyLoad, always provide `height` or a `placeholder` to prevent layout shifts.

4. **Handle loading states**: For InfiniteScroll, always provide a `loadingElement` for better UX.

5. **Consider throttling**: For scroll-heavy pages, use `throttleMs` in InfiniteScroll to limit the number of API calls.

## Browser Compatibility

The visibility system uses the Intersection Observer API, which is supported in all modern browsers. For older browsers, you may need to use a polyfill. 