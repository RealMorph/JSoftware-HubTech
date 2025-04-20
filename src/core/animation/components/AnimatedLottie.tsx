import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useAnimation } from '../AnimationProvider';
import { useMotionPreference } from '../hooks/useMotionPreference';

// Declare module for dynamic import
declare module 'lottie-web';

// We'll use dynamic imports to prevent bundle bloat for users who don't use Lottie
let lottie: any = null;

// Async loader for lottie-web
const loadLottie = async () => {
  if (!lottie) {
    try {
      // Dynamically import lottie-web only when needed
      lottie = (await import('lottie-web')).default;
    } catch (error) {
      console.error('Failed to load lottie-web. Please install it with: npm install lottie-web', error);
      throw new Error('Lottie animation library not available. Install lottie-web package.');
    }
  }
  return lottie;
};

export interface AnimatedLottieProps {
  /**
   * Path to the Lottie JSON animation file
   */
  animationPath: string | object;
  
  /**
   * Whether to autoplay the animation on mount
   * @default true
   */
  autoplay?: boolean;
  
  /**
   * Whether to loop the animation
   * @default false
   */
  loop?: boolean;
  
  /**
   * Speed of the animation (1 is normal speed)
   * @default 1
   */
  speed?: number;
  
  /**
   * Container width
   * @default '100%'
   */
  width?: number | string;
  
  /**
   * Container height
   * @default '100%'
   */
  height?: number | string;
  
  /**
   * Container className
   */
  className?: string;
  
  /**
   * Initial direction (1 for forward, -1 for reverse)
   * @default 1
   */
  direction?: 1 | -1;
  
  /**
   * Animation segment to play [startFrame, endFrame]
   */
  segments?: [number, number];
  
  /**
   * Animation start frame
   */
  startAt?: number;
  
  /**
   * Event triggered when animation is loaded
   */
  onLoad?: () => void;
  
  /**
   * Event triggered when animation completes
   */
  onComplete?: () => void;
  
  /**
   * Renderer type
   * @default 'svg'
   */
  renderer?: 'svg' | 'canvas' | 'html';
  
  /**
   * When true, animation will respect reduced motion preferences
   * @default true
   */
  respectReducedMotion?: boolean;
  
  /**
   * Options to use when reduced motion is active
   */
  reducedMotionOptions?: {
    /**
     * Whether to show still frame instead of animation when reduced motion is active
     * @default true
     */
    useStillFrame?: boolean;
    
    /**
     * Which frame to show when using still frame
     * @default -1 (last frame)
     */
    stillFrameIndex?: number;
    
    /**
     * Whether to use slower speed instead of still frame
     * @default false
     */
    useSlowerSpeed?: boolean;
    
    /**
     * Speed to use when useSlowerSpeed is true
     * @default 0.5
     */
    reducedSpeed?: number;
  };
}

export interface AnimatedLottieMethods {
  play: () => void;
  pause: () => void;
  stop: () => void;
  goToAndPlay: (frame: number, isFrame?: boolean) => void;
  goToAndStop: (frame: number, isFrame?: boolean) => void;
  setSpeed: (speed: number) => void;
  setDirection: (direction: 1 | -1) => void;
  playSegments: (segments: [number, number], forceFlag?: boolean) => void;
  destroy: () => void;
}

const AnimatedLottie = forwardRef<AnimatedLottieMethods, AnimatedLottieProps>((props, ref) => {
  const {
    animationPath,
    autoplay = true,
    loop = false,
    speed = 1,
    width = '100%',
    height = '100%',
    className,
    direction = 1,
    segments,
    startAt,
    onLoad,
    onComplete,
    renderer = 'svg',
    respectReducedMotion = true,
    reducedMotionOptions = {
      useStillFrame: true,
      stillFrameIndex: -1,
      useSlowerSpeed: false,
      reducedSpeed: 0.5
    }
  } = props;
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [lottieInstance, setLottieInstance] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const animation = useAnimation();
  const { isReducedMotion } = useMotionPreference();
  
  // Effect to load and setup Lottie animation
  useEffect(() => {
    let animInstance: any = null;
    
    const setupLottie = async () => {
      try {
        const lottieLib = await loadLottie();
        
        // Skip animation setup if the component has unmounted
        if (!containerRef.current) return;
        
        // Determine if we should use reduced motion settings
        const shouldUseReducedMotion = respectReducedMotion && isReducedMotion;
        
        // Configure animation options
        const animOptions = {
          container: containerRef.current,
          renderer: renderer,
          loop: shouldUseReducedMotion ? false : loop,
          autoplay: shouldUseReducedMotion ? false : autoplay,
          animationData: typeof animationPath === 'string' ? undefined : animationPath,
          path: typeof animationPath === 'string' ? animationPath : undefined,
          rendererSettings: {
            progressiveLoad: true,
            preserveAspectRatio: 'xMidYMid meet',
          }
        };
        
        // Create animation instance
        animInstance = lottieLib.loadAnimation(animOptions);
        setLottieInstance(animInstance);
        
        // Setup event listeners
        animInstance.addEventListener('DOMLoaded', () => {
          setIsLoaded(true);
          
          // Apply initial settings
          animInstance.setSpeed(
            shouldUseReducedMotion && reducedMotionOptions.useSlowerSpeed 
              ? reducedMotionOptions.reducedSpeed 
              : speed
          );
          
          animInstance.setDirection(direction);
          
          if (startAt !== undefined) {
            animInstance.goToAndStop(startAt, true);
          }
          
          if (segments) {
            animInstance.playSegments(segments, true);
          }
          
          // Handle reduced motion preference
          if (shouldUseReducedMotion) {
            if (reducedMotionOptions.useStillFrame) {
              // If using still frame, go to specified frame (default to end frame if -1)
              const frameIndex = reducedMotionOptions.stillFrameIndex;
              if (frameIndex === -1) {
                // Go to last frame
                animInstance.goToAndStop(animInstance.totalFrames, true);
              } else {
                // Go to specified frame
                animInstance.goToAndStop(frameIndex, true);
              }
            } else if (reducedMotionOptions.useSlowerSpeed) {
              // If using slower speed, start playback at reduced speed
              animInstance.setSpeed(reducedMotionOptions.reducedSpeed);
              if (autoplay) {
                animInstance.play();
              }
            }
          }
          
          // Call onLoad callback if provided
          if (onLoad) {
            onLoad();
          }
        });
        
        // Handle completion
        animInstance.addEventListener('complete', () => {
          if (onComplete) {
            onComplete();
          }
        });
      } catch (error) {
        console.error('Error setting up Lottie animation:', error);
      }
    };
    
    setupLottie();
    
    // Cleanup function
    return () => {
      if (animInstance) {
        animInstance.destroy();
      }
    };
  }, [animationPath, renderer, autoplay, loop, respectReducedMotion, isReducedMotion]);
  
  // Update animation if props change
  useEffect(() => {
    if (lottieInstance && isLoaded) {
      // Apply new settings if the instance exists and is loaded
      const shouldUseReducedMotion = respectReducedMotion && isReducedMotion;
      
      lottieInstance.setSpeed(
        shouldUseReducedMotion && reducedMotionOptions.useSlowerSpeed 
          ? reducedMotionOptions.reducedSpeed 
          : speed
      );
      
      lottieInstance.setDirection(direction);
      
      if (segments) {
        lottieInstance.playSegments(segments, true);
      }
    }
  }, [speed, direction, segments, isLoaded, lottieInstance, isReducedMotion, respectReducedMotion, reducedMotionOptions]);
  
  // Public methods exposed for reference access
  const methods: AnimatedLottieMethods = {
    play: () => lottieInstance?.play(),
    pause: () => lottieInstance?.pause(),
    stop: () => lottieInstance?.stop(),
    goToAndPlay: (frame: number, isFrame = true) => lottieInstance?.goToAndPlay(frame, isFrame),
    goToAndStop: (frame: number, isFrame = true) => lottieInstance?.goToAndStop(frame, isFrame),
    setSpeed: (newSpeed: number) => lottieInstance?.setSpeed(newSpeed),
    setDirection: (newDirection: 1 | -1) => lottieInstance?.setDirection(newDirection),
    playSegments: (newSegments: [number, number], forceFlag = true) => lottieInstance?.playSegments(newSegments, forceFlag),
    destroy: () => lottieInstance?.destroy()
  };
  
  // Make methods accessible via ref
  useImperativeHandle(ref, () => methods);
  
  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={{ width, height }}
      aria-hidden={!isLoaded}
    />
  );
});

AnimatedLottie.displayName = 'AnimatedLottie';

export default AnimatedLottie; 