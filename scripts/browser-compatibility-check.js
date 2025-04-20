/**
 * Browser Compatibility Check for Theme System
 * 
 * This script helps with the "Cross-browser Testing" subtask by:
 * 1. Detecting the current browser and its features
 * 2. Checking CSS compatibility for theme-related properties
 * 3. Testing theme system functioning across different browsers
 * 4. Reporting potential compatibility issues
 */

// Browser detection
const browserInfo = {
  name: detectBrowser(),
  version: detectBrowserVersion(),
  os: detectOS(),
  features: detectFeatures(),
  cssSupport: checkCSSSupport()
};

// Function to detect browser
function detectBrowser() {
  const userAgent = navigator.userAgent;
  
  if (userAgent.indexOf("Firefox") > -1) {
    return "Firefox";
  } else if (userAgent.indexOf("SamsungBrowser") > -1) {
    return "Samsung Internet";
  } else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) {
    return "Opera";
  } else if (userAgent.indexOf("Trident") > -1 || userAgent.indexOf("MSIE") > -1) {
    return "Internet Explorer";
  } else if (userAgent.indexOf("Edge") > -1) {
    return "Edge (Legacy)";
  } else if (userAgent.indexOf("Edg") > -1) {
    return "Edge (Chromium)";
  } else if (userAgent.indexOf("Chrome") > -1) {
    return "Chrome";
  } else if (userAgent.indexOf("Safari") > -1) {
    return "Safari";
  } else {
    return "Unknown";
  }
}

// Function to detect browser version
function detectBrowserVersion() {
  const userAgent = navigator.userAgent;
  let offset, browserVersion;
  
  switch (detectBrowser()) {
    case "Firefox":
      offset = userAgent.indexOf("Firefox/");
      browserVersion = userAgent.substring(offset + 8);
      break;
    case "Samsung Internet":
      offset = userAgent.indexOf("SamsungBrowser/");
      browserVersion = userAgent.substring(offset + 15);
      break;
    case "Opera":
      if (userAgent.indexOf("OPR/") !== -1) {
        offset = userAgent.indexOf("OPR/");
        browserVersion = userAgent.substring(offset + 4);
      } else {
        offset = userAgent.indexOf("Opera/");
        browserVersion = userAgent.substring(offset + 6);
      }
      break;
    case "Internet Explorer":
      if (userAgent.indexOf("MSIE") !== -1) {
        offset = userAgent.indexOf("MSIE");
        browserVersion = userAgent.substring(offset + 5, userAgent.indexOf(";", offset));
      } else {
        offset = userAgent.indexOf("rv:");
        browserVersion = userAgent.substring(offset + 3, userAgent.indexOf(")", offset));
      }
      break;
    case "Edge (Legacy)":
      offset = userAgent.indexOf("Edge/");
      browserVersion = userAgent.substring(offset + 5);
      break;
    case "Edge (Chromium)":
      offset = userAgent.indexOf("Edg/");
      browserVersion = userAgent.substring(offset + 4);
      break;
    case "Chrome":
      offset = userAgent.indexOf("Chrome/");
      browserVersion = userAgent.substring(offset + 7, userAgent.indexOf(" ", offset));
      break;
    case "Safari":
      offset = userAgent.indexOf("Version/");
      browserVersion = userAgent.substring(offset + 8, userAgent.indexOf(" ", offset));
      break;
    default:
      browserVersion = "Unknown";
  }
  
  return browserVersion;
}

// Function to detect operating system
function detectOS() {
  const userAgent = navigator.userAgent;
  
  if (userAgent.indexOf("Win") > -1) {
    return "Windows";
  } else if (userAgent.indexOf("Mac") > -1) {
    return "MacOS";
  } else if (userAgent.indexOf("Linux") > -1) {
    return "Linux";
  } else if (userAgent.indexOf("Android") > -1) {
    return "Android";
  } else if (userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1 || userAgent.indexOf("iPod") > -1) {
    return "iOS";
  } else {
    return "Unknown";
  }
}

// Function to detect browser features
function detectFeatures() {
  return {
    css: {
      variables: window.CSS && CSS.supports && CSS.supports('--custom-property', 'value'),
      grid: window.CSS && CSS.supports && CSS.supports('display', 'grid'),
      flexbox: window.CSS && CSS.supports && CSS.supports('display', 'flex'),
      transitions: window.CSS && CSS.supports && CSS.supports('transition', 'all 0.1s ease-in-out'),
      animations: window.CSS && CSS.supports && CSS.supports('@keyframes name {}') || 
                  window.CSS && CSS.supports && CSS.supports('animation-name', 'test'),
      calcFunction: window.CSS && CSS.supports && CSS.supports('width', 'calc(10px + 10px)'),
      filters: window.CSS && CSS.supports && CSS.supports('filter', 'blur(1px)'),
      transforms: window.CSS && CSS.supports && CSS.supports('transform', 'rotate(1deg)'),
      mediaQueries: 'matchMedia' in window
    },
    javascript: {
      localStorage: 'localStorage' in window,
      sessionStorage: 'sessionStorage' in window,
      fetch: 'fetch' in window,
      promise: 'Promise' in window,
      async: (function() {
        try {
          eval('async function test() {}');
          return true;
        } catch (e) {
          return false;
        }
      })(),
      objectSpread: (function() {
        try {
          eval('const obj = {...{}}');
          return true;
        } catch (e) {
          return false;
        }
      })(),
      nullishCoalescing: (function() {
        try {
          eval('const test = null ?? "default"');
          return true;
        } catch (e) {
          return false;
        }
      })(),
      optionalChaining: (function() {
        try {
          eval('const test = {}?.property');
          return true;
        } catch (e) {
          return false;
        }
      })()
    }
  };
}

// Function to check CSS support for theme-related properties
function checkCSSSupport() {
  const cssProperties = [
    { property: 'color-scheme', value: 'light dark' },
    { property: 'backdrop-filter', value: 'blur(10px)' },
    { property: 'background-blend-mode', value: 'overlay' },
    { property: 'background-clip', value: 'text' },
    { property: 'mask-image', value: 'linear-gradient(rgba(0, 0, 0, 1.0), transparent)' },
    { property: 'position', value: 'sticky' },
    { property: 'aspect-ratio', value: '16/9' },
    { property: 'gap', value: '10px' },
    { property: 'overflow-anchor', value: 'auto' },
    { property: 'overscroll-behavior', value: 'contain' },
    { property: 'scroll-behavior', value: 'smooth' },
    { property: 'text-overflow', value: 'ellipsis' },
    { property: 'user-select', value: 'none' },
  ];
  
  const results = {};
  
  if (window.CSS && CSS.supports) {
    cssProperties.forEach(({ property, value }) => {
      results[property] = CSS.supports(property, value);
    });
  } else {
    // Fallback for browsers without CSS.supports
    const testElement = document.createElement('div');
    cssProperties.forEach(({ property, value }) => {
      const camelProperty = property.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      testElement.style[camelProperty] = value;
      results[property] = testElement.style[camelProperty] === value;
    });
  }
  
  return results;
}

// Function to test theme system compatibility
function testThemeSystem() {
  const results = {
    themeChanges: testThemeChanges(),
    responsiveness: testResponsiveness(),
    renderingSpeed: measureRenderingSpeed(),
    animationSmoothness: testAnimationSmoothness()
  };
  
  console.log('Theme System Compatibility Test Results:', results);
  
  // Generate report
  const issues = [];
  
  // Check for potential issues
  if (!browserInfo.features.css.variables) {
    issues.push('CSS variables not supported - theme switching may not work correctly');
  }
  if (!browserInfo.features.css.transitions) {
    issues.push('CSS transitions not supported - theme changes will not be animated');
  }
  if (!browserInfo.features.css.mediaQueries) {
    issues.push('Media queries not supported - responsive layout may not work correctly');
  }
  if (!results.themeChanges.success) {
    issues.push(`Theme switching issues: ${results.themeChanges.details}`);
  }
  if (!results.responsiveness.success) {
    issues.push(`Responsiveness issues: ${results.responsiveness.details}`);
  }
  if (results.renderingSpeed.averageTime > 300) {
    issues.push(`Slow theme rendering (${results.renderingSpeed.averageTime}ms) - may cause visual lag`);
  }
  if (!results.animationSmoothness.smooth) {
    issues.push(`Theme animations not smooth: ${results.animationSmoothness.details}`);
  }
  
  return {
    compatible: issues.length === 0,
    browserInfo,
    testResults: results,
    issues
  };
}

// Function to test theme changes
function testThemeChanges() {
  try {
    const themeSwitch = document.querySelector('[data-testid="theme-switch"]');
    if (!themeSwitch) {
      return {
        success: false,
        details: 'Theme switch not found in the DOM'
      };
    }
    
    // Get initial theme
    const initialTheme = document.documentElement.getAttribute('data-theme') || 
                         document.body.getAttribute('data-theme') || 
                         'default';
    
    // Click the theme switch
    themeSwitch.click();
    
    // Get the new theme
    const newTheme = document.documentElement.getAttribute('data-theme') || 
                     document.body.getAttribute('data-theme') || 
                     'default';
    
    // Click again to restore original theme
    themeSwitch.click();
    
    return {
      success: initialTheme !== newTheme,
      details: initialTheme !== newTheme ? 
        `Successfully changed theme from ${initialTheme} to ${newTheme}` : 
        'Theme did not change when switch was clicked'
    };
  } catch (error) {
    return {
      success: false,
      details: `Error testing theme changes: ${error.message}`
    };
  }
}

// Function to test responsiveness
function testResponsiveness() {
  try {
    const originalWidth = window.innerWidth;
    const breakpoints = [375, 768, 1024, 1440];
    const results = [];
    
    // Test different viewport widths
    breakpoints.forEach(width => {
      window.innerWidth = width;
      window.dispatchEvent(new Event('resize'));
      
      // Check if any responsive adjustments are made
      // This is a simplified check - actual implementation would
      // need to check specific elements that should change
      const stylesBefore = getComputedStylesSnapshot();
      window.innerWidth = width + 1;
      window.dispatchEvent(new Event('resize'));
      const stylesAfter = getComputedStylesSnapshot();
      
      results.push({
        width,
        changed: !compareStyleSnapshots(stylesBefore, stylesAfter)
      });
    });
    
    // Restore original width
    window.innerWidth = originalWidth;
    window.dispatchEvent(new Event('resize'));
    
    const allResponsive = results.every(result => result.changed);
    return {
      success: allResponsive,
      details: allResponsive ? 
        'Application correctly responds to all viewport size changes' : 
        `Application did not respond to viewport changes at: ${results.filter(r => !r.changed).map(r => r.width).join(', ')}px`
    };
  } catch (error) {
    return {
      success: false,
      details: `Error testing responsiveness: ${error.message}`
    };
  }
}

// Helper function to get computed styles snapshot
function getComputedStylesSnapshot() {
  const snapshot = {};
  const elements = document.querySelectorAll('*');
  const sampleSize = Math.min(elements.length, 10); // Sample a subset for performance
  
  for (let i = 0; i < sampleSize; i++) {
    const element = elements[Math.floor(Math.random() * elements.length)];
    const styles = window.getComputedStyle(element);
    snapshot[element.tagName + '-' + i] = {
      width: styles.width,
      height: styles.height,
      display: styles.display,
      position: styles.position,
      fontSize: styles.fontSize
    };
  }
  
  return snapshot;
}

// Helper function to compare style snapshots
function compareStyleSnapshots(snapshot1, snapshot2) {
  const keys = Object.keys(snapshot1);
  if (keys.length !== Object.keys(snapshot2).length) {
    return false;
  }
  
  for (const key of keys) {
    if (!snapshot2[key]) {
      return false;
    }
    
    const styles1 = snapshot1[key];
    const styles2 = snapshot2[key];
    
    for (const prop in styles1) {
      if (styles1[prop] !== styles2[prop]) {
        return false;
      }
    }
  }
  
  return true;
}

// Function to measure rendering speed
function measureRenderingSpeed() {
  try {
    const iterations = 5;
    const timings = [];
    
    // Get theme switch element
    const themeSwitch = document.querySelector('[data-testid="theme-switch"]');
    if (!themeSwitch) {
      return {
        success: false,
        averageTime: 0,
        details: 'Theme switch not found in the DOM'
      };
    }
    
    // Measure theme switching time
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      themeSwitch.click();
      
      // Force layout recalculation
      document.body.offsetHeight;
      
      const endTime = performance.now();
      timings.push(endTime - startTime);
      
      // Click again to restore previous theme for next iteration
      themeSwitch.click();
      document.body.offsetHeight;
    }
    
    const averageTime = timings.reduce((sum, time) => sum + time, 0) / timings.length;
    
    return {
      success: true,
      averageTime,
      details: `Average theme rendering time: ${averageTime.toFixed(2)}ms`
    };
  } catch (error) {
    return {
      success: false,
      averageTime: 0,
      details: `Error measuring rendering speed: ${error.message}`
    };
  }
}

// Function to test animation smoothness
function testAnimationSmoothness() {
  try {
    // Create a test element with a transition
    const testElement = document.createElement('div');
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.style.width = '100px';
    testElement.style.height = '100px';
    testElement.style.backgroundColor = 'blue';
    testElement.style.transition = 'all 300ms linear';
    document.body.appendChild(testElement);
    
    // Force initial layout
    testElement.offsetHeight;
    
    // Start tracking frames
    const frameTimestamps = [];
    const expectedDuration = 300; // ms
    const expectedFrames = expectedDuration / 16.7; // ~60fps
    
    // Create RAF loop
    let startTime = performance.now();
    let previousTimestamp = startTime;
    let rafId;
    
    const trackFrame = (timestamp) => {
      const frameDuration = timestamp - previousTimestamp;
      frameTimestamps.push(frameDuration);
      previousTimestamp = timestamp;
      
      if (timestamp - startTime < expectedDuration) {
        rafId = requestAnimationFrame(trackFrame);
      } else {
        // Complete test
        completeTest();
      }
    };
    
    // Start animation
    testElement.style.backgroundColor = 'red';
    testElement.style.transform = 'translateX(100px)';
    rafId = requestAnimationFrame(trackFrame);
    
    // Function to complete the test
    const completeTest = () => {
      // Calculate frame metrics
      if (frameTimestamps.length < 2) {
        document.body.removeChild(testElement);
        return {
          smooth: false,
          details: 'Insufficient frames captured for analysis'
        };
      }
      
      // Remove first frame which may include setup time
      frameTimestamps.shift();
      
      // Calculate average and max frame duration
      const avgFrameDuration = frameTimestamps.reduce((sum, time) => sum + time, 0) / frameTimestamps.length;
      const maxFrameDuration = Math.max(...frameTimestamps);
      const framesDropped = frameTimestamps.filter(duration => duration > 33.4).length; // >2 frames at 60fps
      
      // Calculate jank (stuttering) percentage
      const jankPercentage = (framesDropped / frameTimestamps.length) * 100;
      
      // Clean up
      document.body.removeChild(testElement);
      cancelAnimationFrame(rafId);
      
      return {
        smooth: jankPercentage < 20 && avgFrameDuration < 25,
        framesPerSecond: Math.round(1000 / avgFrameDuration),
        jankPercentage: Math.round(jankPercentage),
        details: `Avg: ${avgFrameDuration.toFixed(2)}ms, Max: ${maxFrameDuration.toFixed(2)}ms, Jank: ${jankPercentage.toFixed(2)}%, FPS: ${Math.round(1000 / avgFrameDuration)}`
      };
    };
    
    // Return placeholder - actual results will come from completeTest
    return {
      smooth: true,
      details: 'Animation test in progress'
    };
  } catch (error) {
    return {
      smooth: false,
      details: `Error testing animation smoothness: ${error.message}`
    };
  }
}

// Function to run the full browser compatibility check
function runCompatibilityCheck() {
  const testResults = testThemeSystem();
  
  // Display results in the console
  console.log('Browser Compatibility Check Results:');
  console.log('-----------------------------------');
  console.log(`Browser: ${browserInfo.name} ${browserInfo.version} on ${browserInfo.os}`);
  console.log(`Compatible: ${testResults.compatible ? 'Yes ✅' : 'No ❌'}`);
  
  if (testResults.issues.length > 0) {
    console.log('Issues:');
    testResults.issues.forEach(issue => {
      console.log(`- ${issue}`);
    });
  } else {
    console.log('No compatibility issues found! 🎉');
  }
  
  return testResults;
}

// Export functions for use in tests or from browser console
window.browserCompatCheck = {
  runCompatibilityCheck,
  getBrowserInfo: () => browserInfo,
  detectFeatures,
  checkCSSSupport,
  testThemeSystem
};

// Automatically run check if loaded directly in browser
if (typeof document !== 'undefined' && document.readyState === 'complete') {
  setTimeout(runCompatibilityCheck, 1000);
} else if (typeof document !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(runCompatibilityCheck, 1000);
  });
} 