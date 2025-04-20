/**
 * Example demonstrating real-time data synchronization with WebSockets
 * 
 * This example shows how to:
 * 1. Connect to a WebSocket server for real-time data
 * 2. Subscribe to specific topics or channels
 * 3. Process incoming data using ETL transformers
 * 4. Handle reconnection and error scenarios
 */

import { DataSync, DataSyncFactory, WebSocketStatus, WebSocketMessage } from '../DataSync';
import { DataTransformer } from '../DataTransformer';

// Example data types for our application
interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  volume: number;
  timestamp: string;
}

interface EnhancedStockQuote extends StockQuote {
  valueCategory: 'low' | 'medium' | 'high';
  trending: 'up' | 'down' | 'neutral';
  formattedPrice: string;
  formattedChange: string;
}

/**
 * A mock WebSocket server for demonstration purposes
 * In a real application, you would connect to an actual WebSocket server
 */
class MockWebSocketServer {
  private clients: Set<any> = new Set();
  private subscriptions: Map<string, Set<any>> = new Map();
  private intervalId: any = null;
  private stockData: Map<string, StockQuote> = new Map();
  
  constructor() {
    // Initialize mock stock data
    this.initializeStockData();
  }
  
  /**
   * Start the mock server
   */
  start(): void {
    if (this.intervalId !== null) {
      return;
    }
    
    console.log('[MockServer] Starting mock WebSocket server');
    
    // Simulate price updates every 2 seconds
    this.intervalId = setInterval(() => {
      this.updateStockPrices();
    }, 2000);
  }
  
  /**
   * Stop the mock server
   */
  stop(): void {
    if (this.intervalId === null) {
      return;
    }
    
    console.log('[MockServer] Stopping mock WebSocket server');
    clearInterval(this.intervalId);
    this.intervalId = null;
  }
  
  /**
   * Initialize with some stock data
   */
  private initializeStockData(): void {
    const stocks = [
      { symbol: 'AAPL', price: 145.86, change: 0, percentChange: 0, volume: 0 },
      { symbol: 'MSFT', price: 290.73, change: 0, percentChange: 0, volume: 0 },
      { symbol: 'GOOGL', price: 128.38, change: 0, percentChange: 0, volume: 0 },
      { symbol: 'AMZN', price: 129.96, change: 0, percentChange: 0, volume: 0 },
      { symbol: 'META', price: 302.55, change: 0, percentChange: 0, volume: 0 }
    ];
    
    for (const stock of stocks) {
      this.stockData.set(stock.symbol, {
        ...stock,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  /**
   * Update stock prices with random changes
   */
  private updateStockPrices(): void {
    const updatedStocks: string[] = [];
    
    for (const [symbol, quote] of this.stockData.entries()) {
      // Generate a random price change (-2% to +2%)
      const changePercent = (Math.random() * 4 - 2) / 100;
      const oldPrice = quote.price;
      const newPrice = parseFloat((oldPrice * (1 + changePercent)).toFixed(2));
      const change = parseFloat((newPrice - oldPrice).toFixed(2));
      const percentChange = parseFloat((changePercent * 100).toFixed(2));
      const volume = Math.floor(Math.random() * 10000) + 1000;
      
      // Update the stock data
      const updatedQuote: StockQuote = {
        symbol,
        price: newPrice,
        change,
        percentChange,
        volume,
        timestamp: new Date().toISOString()
      };
      
      this.stockData.set(symbol, updatedQuote);
      updatedStocks.push(symbol);
      
      // Broadcast to subscribers of this stock
      this.broadcastToTopic(`stock/${symbol}`, updatedQuote);
    }
    
    // Broadcast to market overview subscribers
    this.broadcastToTopic('market/overview', {
      timestamp: new Date().toISOString(),
      updates: updatedStocks,
      marketStatus: 'open'
    });
  }
  
  /**
   * Register a new client connection
   */
  registerClient(client: any): void {
    this.clients.add(client);
    console.log(`[MockServer] Client connected (${this.clients.size} total)`);
  }
  
  /**
   * Remove a client connection
   */
  removeClient(client: any): void {
    this.clients.delete(client);
    
    // Remove client from all subscriptions
    for (const subscribers of this.subscriptions.values()) {
      subscribers.delete(client);
    }
    
    console.log(`[MockServer] Client disconnected (${this.clients.size} remaining)`);
  }
  
  /**
   * Handle a message from a client
   */
  handleMessage(client: any, message: WebSocketMessage<any>): void {
    console.log(`[MockServer] Received message: ${message.type}`);
    
    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(client, message);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(client, message);
        break;
      default:
        console.log(`[MockServer] Unknown message type: ${message.type}`);
    }
  }
  
  /**
   * Handle a subscribe request
   */
  private handleSubscribe(client: any, message: WebSocketMessage<any>): void {
    if (!message.topic) {
      return;
    }
    
    if (!this.subscriptions.has(message.topic)) {
      this.subscriptions.set(message.topic, new Set());
    }
    
    this.subscriptions.get(message.topic)?.add(client);
    
    console.log(`[MockServer] Client subscribed to ${message.topic}`);
    
    // Send an initial data update
    if (message.topic.startsWith('stock/')) {
      const symbol = message.topic.split('/')[1];
      const data = this.stockData.get(symbol);
      
      if (data) {
        this.sendToClient(client, {
          type: 'data',
          topic: message.topic,
          data
        });
      }
    } else if (message.topic === 'market/overview') {
      this.sendToClient(client, {
        type: 'data',
        topic: message.topic,
        data: {
          timestamp: new Date().toISOString(),
          updates: Array.from(this.stockData.keys()),
          marketStatus: 'open'
        }
      });
    }
  }
  
  /**
   * Handle an unsubscribe request
   */
  private handleUnsubscribe(client: any, message: WebSocketMessage<any>): void {
    if (!message.topic || !this.subscriptions.has(message.topic)) {
      return;
    }
    
    this.subscriptions.get(message.topic)?.delete(client);
    console.log(`[MockServer] Client unsubscribed from ${message.topic}`);
  }
  
  /**
   * Broadcast a message to all subscribers of a topic
   */
  private broadcastToTopic(topic: string, data: any): void {
    if (!this.subscriptions.has(topic)) {
      return;
    }
    
    const subscribers = this.subscriptions.get(topic);
    
    if (!subscribers || subscribers.size === 0) {
      return;
    }
    
    console.log(`[MockServer] Broadcasting to ${subscribers.size} subscribers of ${topic}`);
    
    const message: WebSocketMessage<any> = {
      type: 'data',
      topic,
      data
    };
    
    for (const client of subscribers) {
      this.sendToClient(client, message);
    }
  }
  
  /**
   * Send a message to a specific client
   */
  private sendToClient(client: any, message: WebSocketMessage<any>): void {
    if (client && client.onmessage) {
      // Simulate the WebSocket message event
      setTimeout(() => {
        client.onmessage({
          data: JSON.stringify(message)
        });
      }, 0);
    }
  }
}

/**
 * Create a mock WebSocket that interacts with our mock server
 */
function createMockWebSocket(url: string, protocols?: string | string[]): WebSocket {
  // Static server instance shared between all mock WebSockets
  if (!(globalThis as any).mockServer) {
    (globalThis as any).mockServer = new MockWebSocketServer();
    (globalThis as any).mockServer.start();
  }
  
  const mockServer = (globalThis as any).mockServer as MockWebSocketServer;
  
  // Create a mock WebSocket that will interact with our mock server
  const mockWs = {
    url,
    protocols,
    readyState: WebSocket.CONNECTING,
    onopen: null as any,
    onclose: null as any,
    onerror: null as any,
    onmessage: null as any,
    
    close: (code?: number, reason?: string) => {
      mockWs.readyState = WebSocket.CLOSING;
      mockServer.removeClient(mockWs);
      
      setTimeout(() => {
        mockWs.readyState = WebSocket.CLOSED;
        if (mockWs.onclose) {
          mockWs.onclose({
            code: code || 1000,
            reason: reason || 'Normal closure',
            wasClean: true
          });
        }
      }, 50);
    },
    
    send: (data: string) => {
      if (mockWs.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket is not open');
      }
      
      try {
        const message = JSON.parse(data);
        mockServer.handleMessage(mockWs, message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    }
  } as unknown as WebSocket;
  
  // Register with the mock server
  mockServer.registerClient(mockWs);
  
  // Simulate connection delay
  setTimeout(() => {
    mockWs.readyState = WebSocket.OPEN;
    if (mockWs.onopen) {
      mockWs.onopen({} as Event);
    }
  }, 100);
  
  return mockWs;
}

/**
 * Basic example of WebSocket data sync
 */
async function basicWebSocketExample(): Promise<void> {
  console.log('--- Basic WebSocket Sync Example ---');
  
  // Override the global WebSocket constructor with our mock version for this example
  const originalWebSocket = globalThis.WebSocket;
  (globalThis as any).WebSocket = createMockWebSocket;
  
  // Create a DataSync instance
  const dataSync = new DataSync({
    url: 'wss://example.com/ws',
    autoReconnect: true,
    reconnectDelay: 1000,
    useExponentialBackoff: true
  });
  
  // Listen for connection events
  dataSync.on('open', () => {
    console.log('WebSocket connected');
  });
  
  dataSync.on('close', () => {
    console.log('WebSocket disconnected');
  });
  
  dataSync.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
  
  dataSync.on('message', (message) => {
    console.log('Received raw message:', message.type);
  });
  
  // Wait for the connection to establish
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Create transformers for stock quotes
  const enhanceStockQuote = (quote: StockQuote): EnhancedStockQuote => {
    return {
      ...quote,
      valueCategory: quote.price < 150 ? 'low' : quote.price < 250 ? 'medium' : 'high',
      trending: quote.change > 0 ? 'up' : quote.change < 0 ? 'down' : 'neutral',
      formattedPrice: `$${quote.price.toFixed(2)}`,
      formattedChange: `${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)} (${quote.percentChange.toFixed(2)}%)`
    };
  };
  
  // Subscribe to some stock quotes
  const stocks = ['AAPL', 'MSFT', 'GOOGL'];
  
  stocks.forEach(symbol => {
    dataSync.subscribe<StockQuote>({
      topic: `stock/${symbol}`,
      onMessage: (quote) => {
        const enhanced = enhanceStockQuote(quote);
        console.log(`${enhanced.symbol}: ${enhanced.formattedPrice} ${enhanced.formattedChange} - ${enhanced.trending.toUpperCase()}`);
      }
    });
  });
  
  // Subscribe to market overview with transformers
  dataSync.subscribe({
    topic: 'market/overview',
    transformers: [
      // Add a timestamp in local format
      (data: any) => ({
        ...data,
        localTime: new Date(data.timestamp).toLocaleTimeString()
      })
    ],
    onMessage: (data) => {
      console.log(`Market update at ${data.localTime} - ${data.updates.length} stocks updated`);
    }
  });
  
  // Let it run for a while to see some updates
  console.log('Waiting for real-time updates...');
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  // Unsubscribe from one stock
  console.log('\nUnsubscribing from AAPL...');
  dataSync.unsubscribe('stock/AAPL');
  
  // Wait a bit more
  await new Promise(resolve => setTimeout(resolve, 4000));
  
  // Disconnect
  console.log('\nDisconnecting...');
  dataSync.disconnect();
  
  // Restore the original WebSocket
  (globalThis as any).WebSocket = originalWebSocket;
}

/**
 * Advanced example with integration into DataProcessor
 */
async function advancedSyncProcessorExample(): Promise<void> {
  console.log('\n--- Advanced Sync Processor Example ---');
  
  // Override the global WebSocket constructor with our mock version for this example
  const originalWebSocket = globalThis.WebSocket;
  (globalThis as any).WebSocket = createMockWebSocket;
  
  // Define transformers for processing stock data
  const stockTransformers = [
    // Extract stock data
    (message: any) => message.data,
    
    // Calculate 10-period moving average (simulated)
    (quote: StockQuote) => ({
      ...quote,
      ma10: quote.price * (1 + (Math.random() * 0.05 - 0.025)) // Simulate MA
    }),
    
    // Add indicators and formatting
    (quote: any): EnhancedStockQuote & { ma10: number } => ({
      ...quote,
      valueCategory: quote.price < 150 ? 'low' : quote.price < 250 ? 'medium' : 'high',
      trending: quote.change > 0 ? 'up' : quote.change < 0 ? 'down' : 'neutral',
      formattedPrice: `$${quote.price.toFixed(2)}`,
      formattedChange: `${quote.change >= 0 ? '+' : ''}${quote.change.toFixed(2)} (${quote.percentChange.toFixed(2)}%)`
    })
  ];
  
  // Create synchronized processors for each stock we want to monitor
  const { dataSync, processor } = DataSyncFactory.createSyncProcessor({
    url: 'wss://example.com/ws',
    autoReconnect: true
  }, {
    topic: 'stock/GOOGL',
    processorName: 'GOOGL Stock Processor',
    transformers: stockTransformers,
    onSuccess: (result) => {
      console.log(`Processed GOOGL: ${result.formattedPrice} MA10: $${result.ma10.toFixed(2)}`);
    }
  });
  
  // Listen for connection status
  dataSync.on('open', () => {
    console.log('WebSocket connected, subscribing to stocks');
    
    // Subscribe to the stock topic
    dataSync.subscribe({
      topic: 'stock/GOOGL',
      onMessage: async (data) => {
        // Process the data through our processor
        await processor.process(data);
      }
    });
  });
  
  // Wait for the connection and some data
  console.log('Waiting for real-time updates through processor...');
  await new Promise(resolve => setTimeout(resolve, 8000));
  
  // Disconnect
  console.log('\nDisconnecting...');
  dataSync.disconnect();
  
  // Restore the original WebSocket
  (globalThis as any).WebSocket = originalWebSocket;
}

/**
 * Run the examples
 */
async function runExamples() {
  await basicWebSocketExample();
  await advancedSyncProcessorExample();
  
  console.log('\n--- Example Complete ---');
  console.log('The DataSync module provides WebSocket-based real-time data synchronization capabilities.');
  console.log('It integrates with the DataProcessor to allow for real-time ETL operations on streaming data.');
  
  // Shut down any running mock servers
  if ((globalThis as any).mockServer) {
    (globalThis as any).mockServer.stop();
    delete (globalThis as any).mockServer;
  }
}

// Run the examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

// Export for testing or reuse
export { runExamples }; 