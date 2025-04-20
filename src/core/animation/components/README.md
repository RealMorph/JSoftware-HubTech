# Animation Components

This directory contains specialized animation components that provide enhanced animation capabilities for the application.

## Components Overview

### AccessibleAnimation

A component that provides animations with built-in accessibility features, respecting user motion preferences and handling keyboard focus appropriately.

```tsx
import { AccessibleAnimation } from '@/core/animation';

<AccessibleAnimation
  type="fade"
  direction="in"
  duration="standard"
  easing="easeOut"
  animateOnMount={true}
  respectReducedMotion={true}
  reducedMotionAlternative="opacity"
  accessibleBeforeComplete={true}
>
  <div>This content will animate with accessibility in mind</div>
</AccessibleAnimation>
```

**Key Features:**
- Respects reduced motion preferences
- Maintains keyboard focus during animations
- Provides alternative visual indicators for users with reduced motion preferences
- ARIA attributes for screen reader compatibility
- Event-based animations (focus, hover)

### AnimationSequence

Orchestrates multiple animations in a sequence with configurable timing, delays, and callbacks.

```tsx
import { AnimationSequence } from '@/core/animation';

<AnimationSequence
  items={[
    {
      key: "header",
      component: <h1>Welcome</h1>,
      duration: "standard",
      easing: "easeOut"
    },
    {
      key: "subtitle",
      component: <p>To our application</p>,
      delay: 200,
      duration: "medium",
      easing: "easeOut"
    },
    {
      key: "button",
      component: <button>Get Started</button>,
      delay: 300,
      duration: "short",
      easing: "easeOut",
      onComplete: () => console.log("Button animation complete")
    }
  ]}
  autoStart={true}
  baseDelay={100}
  staggered={true}
  onComplete={() => console.log("All animations complete")}
/>
```

**Key Features:**
- Sequential animation control
- Individual timing and easing per item
- Callbacks for individual items and sequence completion
- Auto-start and loop options
- Configurable base delay and staggering

### AnimatedLottie

A wrapper for Lottie animations with enhanced controls and accessibility considerations.

```tsx
import { AnimatedLottie } from '@/core/animation';

<AnimatedLottie
  animationPath="/animations/loading.json"
  autoplay={true}
  loop={true}
  speed={1}
  width="100px"
  height="100px"
  respectReducedMotion={true}
  reducedMotionOptions={{
    useStillFrame: true,
    stillFrameIndex: -1
  }}
/>
```

**Key Features:**
- Dynamic loading of Lottie library
- Reduced motion preference handling
- Multiple renderer options (SVG, Canvas, HTML)
- Extensive animation control (segments, speed, direction)
- Performance optimizations

### StaggeredAnimation

Animates multiple children with a staggered delay effect, great for lists and grids.

```tsx
import { StaggeredAnimation } from '@/core/animation';

<StaggeredAnimation
  animationType="fade"
  direction="in"
  duration="standard"
  easing="easeOut"
  staggerDelay={50}
  staggerFrom="start"
>
  {items.map(item => (
    <div key={item.id} className="card">
      {item.content}
    </div>
  ))}
</StaggeredAnimation>
```

**Key Features:**
- Configurable stagger delay
- Animation direction control (start to end or end to start)
- Support for all animation types
- Auto-detection of new children
- Configurable animation trigger for re-animation

## Integration with Animation System

All components integrate with the application's theme and animation system:

- They pull animation configuration from the theme
- Respect user's motion preferences
- Use consistent animation types and durations
- Provide consistent API patterns

## Accessibility Considerations

These components have been built with accessibility in mind:

- All respect the user's motion preference settings
- Provide alternative visual indicators for users with reduced motion preference
- Maintain keyboard focus during animations
- Include proper ARIA attributes for screen readers
- Ensure content remains accessible even during animations

## Performance Optimizations

Performance has been considered in the implementation:

- Components use `requestAnimationFrame` for smooth animations
- Expensive calculations are memoized
- Animation calculations happen outside the render cycle when possible
- Components cleanup resources on unmount
- Dynamic imports for external dependencies

## Examples

### Splash Screen Sequence

```tsx
import { AnimationSequence, AccessibleAnimation } from '@/core/animation';

function SplashScreen() {
  return (
    <AnimationSequence
      items={[
        {
          key: "logo",
          component: (
            <AccessibleAnimation type="scale" direction="in">
              <img src="/logo.png" alt="Company Logo" />
            </AccessibleAnimation>
          ),
          duration: "medium"
        },
        {
          key: "heading",
          component: (
            <AccessibleAnimation type="fade" direction="in">
              <h1>Welcome to Our App</h1>
            </AccessibleAnimation>
          ),
          delay: 300
        },
        {
          key: "subheading",
          component: (
            <AccessibleAnimation type="slide" direction="up">
              <p>The best experience for your needs</p>
            </AccessibleAnimation>
          ),
          delay: 200
        }
      ]}
      onComplete={() => {
        // Navigate to main app after animations complete
        router.push('/dashboard');
      }}
    />
  );
}
```

### Data Dashboard with Staggered Loading

```tsx
import { StaggeredAnimation, AnimatedLottie } from '@/core/animation';

function DataDashboard({ isLoading, data }) {
  return (
    <div className="dashboard">
      {isLoading ? (
        <AnimatedLottie
          animationPath="/animations/loading-spinner.json"
          loop={true}
          width="100px"
          height="100px"
        />
      ) : (
        <StaggeredAnimation
          animationType="slide"
          direction="up"
          staggerDelay={75}
          animationTrigger={data} // Re-trigger animation when data changes
        >
          {data.map(item => (
            <div key={item.id} className="data-card">
              <h3>{item.title}</h3>
              <p>{item.value}</p>
            </div>
          ))}
        </StaggeredAnimation>
      )}
    </div>
  );
}
```

### Accessible Form with Focus Animations

```tsx
import { AccessibleAnimation } from '@/core/animation';

function ContactForm() {
  return (
    <form>
      <AccessibleAnimation
        type="fade"
        animateOnFocus={true}
        reducedMotionAlternative="border"
      >
        <div className="form-field">
          <label htmlFor="name">Name</label>
          <input id="name" type="text" />
        </div>
      </AccessibleAnimation>
      
      <AccessibleAnimation
        type="fade"
        animateOnFocus={true}
        reducedMotionAlternative="border"
      >
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" />
        </div>
      </AccessibleAnimation>
      
      <AccessibleAnimation
        type="scale"
        direction="in"
        animateOnHover={true}
        animateOnFocus={true}
      >
        <button type="submit">Submit</button>
      </AccessibleAnimation>
    </form>
  );
}
``` 