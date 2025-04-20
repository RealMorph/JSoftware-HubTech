import { Workbox } from 'workbox-window';

// Function to register the service worker
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/service-worker.js');

    // Add event listeners to detect new service worker updates
    wb.addEventListener('waiting', (event) => {
      // Show a notification that an update is available
      const updateAvailable = confirm(
        'A new version of the application is available. Would you like to update now?'
      );

      if (updateAvailable) {
        // Send a message to the service worker to skip waiting
        wb.messageSkipWaiting();
      }
    });

    // When the service worker takes control, reload the page for the new version
    wb.addEventListener('controlling', (event) => {
      // Reload after the new service worker takes control
      window.location.reload();
    });

    // Register the service worker
    wb.register()
      .then((registration) => {
        if (registration) {
          console.log('Service Worker registered with scope:', registration.scope);
        }
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });

    // Return the Workbox instance for further use if needed
    return wb;
  }

  // Return null if service workers are not supported
  return null;
};

// Function to check if the app is online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Function to register background sync
export const registerBackgroundSync = async (
  tag: string,
  callback: () => void
) => {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if the sync API is available on the registration
      if ('sync' in registration) {
        await (registration as any).sync.register(tag);
        return true;
      }
      
      // Fallback if sync API is not available
      callback();
      return false;
    } catch (error) {
      console.error('Background sync registration failed:', error);
      
      // If registration fails, immediately execute the callback
      callback();
      return false;
    }
  } else {
    // If background sync is not supported, immediately execute the callback
    callback();
    return false;
  }
};

// Function to send a message to the service worker
export const sendMessageToServiceWorker = async (message: any): Promise<any> => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    return new Promise((resolve, reject) => {
      // Create a unique message ID
      const messageId = new Date().getTime().toString();
      const messageChannel = new MessageChannel();

      // Listen for response
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.error) {
          reject(event.data.error);
        } else {
          resolve(event.data);
        }
      };

      // Send the message - controller is already checked to be non-null above
      const controller = navigator.serviceWorker.controller!;
      controller.postMessage(
        {
          ...message,
          messageId,
        },
        [messageChannel.port2]
      );

      // Set a timeout in case the service worker doesn't respond
      setTimeout(() => {
        reject(new Error('ServiceWorker response timeout'));
      }, 5000);
    });
  }

  return Promise.reject(new Error('No active service worker'));
};

// Function to check if updates are available
export const checkForUpdates = async (): Promise<boolean> => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      return registration.waiting !== null;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return false;
    }
  }
  return false;
};

// Event listeners for online/offline status changes
export const addNetworkStatusListeners = (
  onOnline: () => void,
  onOffline: () => void
) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  // Return a cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}; 