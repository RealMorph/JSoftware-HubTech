# Animation System

This module provides a comprehensive animation system that integrates with our application's theme and provides a variety of ways to add animations to components.

## Key Features

- 🎨 **Theme Integration**: Animations follow theme settings, ensuring consistent motion across the application
- ♿ **Accessibility**: Respects user motion preferences with reduced motion support
- 🧩 **Modularity**: Multiple ways to add animations (hooks, HOCs, components)
- 🔄 **Performance**: Optimized animations with performance settings
- 🔌 **Extensibility**: Easy to extend with new animation types and components

## Usage Examples

### Basic Provider Setup

Wrap your application or a part of it with the `AnimationProvider`:

```tsx
import { AnimationProvider } from '@/core/animation';

function App() {
  return (
    <AnimationProvider>
      {/* Your animated components */}
    </AnimationProvider>
  );
}
```

### Using Animation Hooks

```tsx
import { useAnimationPreset } from '@/core/animation';

function MyComponent() {
  const fadeAnimation = useAnimationPreset('fade', 'in', 'standard', 'easeOut');
  
  return (
    <div 
      style={{
        opacity: fadeAnimation.initial.opacity,
        transition: `opacity ${fadeAnimation.transition.duration} ${fadeAnimation.transition.easing}`
      }}
    >
      I will fade in
    </div>
  );
}
```

### Using Higher-Order Components

```tsx
import { withEntranceAnimation } from '@/core/animation';

function Card({ children, ...props }) {
  return (
    <div className="card" {...props}>
      {children}
    </div>
  );
}

// Create an animated version with fade-in animation
const AnimatedCard = withEntranceAnimation(Card, {
  type: 'fade',
  direction: 'in',
  duration: 'standard',
  easing: 'easeOut'
});

// Usage
function MyPage() {
  return (
    <div>
      <AnimatedCard>This card will animate on mount</AnimatedCard>
    </div>
  );
}
```

### Using Animation Components

```tsx
import { 
  AccessibleAnimation,
  StaggeredAnimation,
  AnimationSequence
} from '@/core/animation';

function AnimatedList({ items }) {
  return (
    <div>
      <AccessibleAnimation type="fade" direction="in">
        <h2>Items List</h2>
      </AccessibleAnimation>
      
      <StaggeredAnimation
        animationType="slide"
        direction="up"
        staggerDelay={50}
      >
        {items.map(item => (
          <div key={item.id} className="list-item">
            {item.name}
          </div>
        ))}
      </StaggeredAnimation>
      
      <AnimationSequence
        items={[
          {
            key: "button1",
            component: <button>Save</button>,
            duration: "short"
          },
          {
            key: "button2",
            component: <button>Cancel</button>,
            delay: 100
          }
        ]}
      />
    </div>
  );
}
```

### Using Scroll Animations

```tsx
import { useScrollAnimation } from '@/core/animation';

function ScrollRevealSection() {
  const { ref, styles, isVisible } = useScrollAnimation({
    animationType: 'fade',
    animationDirection: 'in',
    triggerOffset: 0.2
  });
  
  return (
    <div ref={ref} style={styles} className="section">
      This section will animate when scrolled into view
    </div>
  );
}
```

### Lottie Animations

```tsx
import { AnimatedLottie } from '@/core/animation';

function LoadingIndicator() {
  return (
    <AnimatedLottie
      animationPath="/animations/loading.json"
      loop={true}
      autoplay={true}
      width="100px"
      height="100px"
      respectReducedMotion={true}
    />
  );
}
```

### Motion Preferences

You can check and manage motion preferences:

```tsx
import { useMotionPreference } from '@/core/animation';

function MotionControls() {
  const { 
    isMotionEnabled, 
    isReducedMotion, 
    toggleMotionEnabled,
    setReducedMotion,
    systemReducedMotion 
  } = useMotionPreference();
  
  return (
    <div>
      <div>System prefers reduced motion: {systemReducedMotion ? 'Yes' : 'No'}</div>
      
      <div>
        <label>
          <input 
            type="checkbox" 
            checked={isMotionEnabled} 
            onChange={toggleMotionEnabled} 
          />
          Enable animations
        </label>
      </div>
      
      <div>
        <label>
          <input 
            type="checkbox" 
            checked={isReducedMotion} 
            onChange={(e) => setReducedMotion(e.target.checked)} 
          />
          Reduce motion
        </label>
      </div>
    </div>
  );
}
```

## Architecture

The animation system is built with the following components:

1. **AnimationProvider**: Core provider that integrates with the theme system
2. **useAnimation**: Hook for accessing animation context directly
3. **useAnimationPreset**: Hook for creating animation presets
4. **useMotionPreference**: Hook for checking and managing motion preferences
5. **useScrollAnimation**: Hook for scroll-based animations
6. **withAnimation**: HOC for adding animations to components

### Component Libraries

The system includes these specialized components:

1. **AccessibleAnimation**: Animation wrapper with accessibility features
2. **StaggeredAnimation**: Component for staggered animation sequences
3. **AnimationSequence**: Component for orchestrating sequential animations
4. **AnimatedLottie**: Wrapper for Lottie animations with motion preferences

## Animation Types

The system supports several animation types:

- **fade**: Opacity-based fade in/out animations
- **slide**: Position-based slide animations (up, down, left, right)
- **scale**: Size-based zoom animations
- **rotate**: Rotation-based animations

## Integration with Theme

Animations pull their configuration from the theme system, specifically:

- **Animation durations**: shortest, shorter, short, standard, medium, long, longer, longest
- **Animation easings**: easeInOut, easeIn, easeOut, sharp, elastic, bounce, cubic
- **Animation variants**: Predefined animation configurations for each animation type
- **Motion preferences**: Default motion preferences and reduced motion settings

## Accessibility

The animation system has been designed with accessibility in mind:

- **Reduced motion support**: All animations respect the user's reduced motion preference
- **Alternative indicators**: Components provide alternative visual cues for users with reduced motion preference
- **Keyboard focus**: Components maintain proper keyboard focus during animations
- **Screen reader support**: All components include appropriate ARIA attributes

## Performance

Performance optimizations include:

- **Staggered loads**: Components can stagger animations to reduce CPU/GPU load
- **Intersection Observer**: Scroll-based animations only run when elements are visible
- **Hardware acceleration**: CSS transforms and opacity changes are GPU-accelerated
- **Throttling**: Animation calculations are throttled to prevent jank
- **Resource cleanup**: All components and hooks clean up resources on unmount

## Directory Structure

- `/`: Core animation system files
- `/hooks`: Animation hooks for various use cases
- `/components`: Reusable animation components
- `/examples`: Example implementations and patterns
- `/testing`: Utilities for testing animations

## Further Documentation

See the following for more detailed documentation:

- [Component Documentation](./components/README.md): Details on animation components
- [Hooks Documentation](./hooks/README.md): Usage information for animation hooks
- [Accessibility Guide](../docs/accessibility.md): Guidelines for accessible animations
- [Performance Guide](../docs/performance.md): Performance best practices 