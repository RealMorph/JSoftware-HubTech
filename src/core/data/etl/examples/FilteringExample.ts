/**
 * Example demonstrating server-side filtering and pagination
 * 
 * This example shows how to:
 * 1. Create complex filter conditions
 * 2. Apply sorting to data
 * 3. Use pagination to handle large datasets
 * 4. Integrate filtering with an API endpoint
 */

import { DataFilter, DataTransformer, PaginatedResponse } from '../';

// Example product data for demonstration
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  tags: string[];
  stock: number;
  rating: {
    average: number;
    count: number;
  };
  discontinued: boolean;
}

/**
 * Sample product data
 */
const products: Product[] = [
  {
    id: 'p001',
    name: 'Smartphone X',
    price: 799.99,
    category: 'electronics',
    tags: ['phone', 'mobile', '5G'],
    stock: 45,
    rating: { average: 4.7, count: 128 },
    discontinued: false,
  },
  {
    id: 'p002',
    name: 'Laptop Pro',
    price: 1299.99,
    category: 'electronics',
    tags: ['computer', 'laptop', 'productivity'],
    stock: 12,
    rating: { average: 4.8, count: 90 },
    discontinued: false,
  },
  {
    id: 'p003',
    name: 'Bluetooth Headphones',
    price: 129.99,
    category: 'electronics',
    tags: ['audio', 'wireless', 'bluetooth'],
    stock: 78,
    rating: { average: 4.2, count: 254 },
    discontinued: false,
  },
  {
    id: 'p004',
    name: 'Smart Watch',
    price: 249.99,
    category: 'electronics',
    tags: ['wearable', 'watch', 'fitness'],
    stock: 34,
    rating: { average: 4.5, count: 182 },
    discontinued: false,
  },
  {
    id: 'p005',
    name: 'Coffee Maker',
    price: 89.99,
    category: 'home',
    tags: ['kitchen', 'appliance', 'coffee'],
    stock: 23,
    rating: { average: 4.1, count: 120 },
    discontinued: false,
  },
  {
    id: 'p006',
    name: 'Wireless Mouse',
    price: 39.99,
    category: 'electronics',
    tags: ['computer', 'accessory', 'wireless'],
    stock: 56,
    rating: { average: 4.3, count: 88 },
    discontinued: false,
  },
  {
    id: 'p007',
    name: 'Desk Lamp',
    price: 29.99,
    category: 'home',
    tags: ['lighting', 'desk', 'office'],
    stock: 17,
    rating: { average: 3.9, count: 45 },
    discontinued: false,
  },
  {
    id: 'p008',
    name: 'Portable Speaker',
    price: 59.99,
    category: 'electronics',
    tags: ['audio', 'wireless', 'bluetooth'],
    stock: 62,
    rating: { average: 4.4, count: 136 },
    discontinued: false,
  },
  {
    id: 'p009',
    name: 'Retro Phone',
    price: 24.99,
    category: 'electronics',
    tags: ['phone', 'retro', 'vintage'],
    stock: 0,
    rating: { average: 3.5, count: 28 },
    discontinued: true,
  },
  {
    id: 'p010',
    name: 'Blender',
    price: 79.99,
    category: 'home',
    tags: ['kitchen', 'appliance', 'cooking'],
    stock: 9,
    rating: { average: 4.6, count: 74 },
    discontinued: false,
  },
];

/**
 * Example of basic filtering
 */
function demonstrateBasicFiltering() {
  console.log('--- Basic Filtering ---');

  // Create a filter for electronics priced under $100
  const filter = DataFilter.and(
    DataFilter.field('category', 'eq', 'electronics'),
    DataFilter.field('price', 'lt', 100)
  );

  // Apply the filter
  const result = DataFilter.apply(products, { filter });

  console.log(`Found ${result.data.length} products:`);
  result.data.forEach(p => console.log(`- ${p.name}: $${p.price}`));
  console.log();
}

/**
 * Example of complex filtering with logical operators
 */
function demonstrateComplexFiltering() {
  console.log('--- Complex Filtering ---');

  // Find products that are either:
  // 1. Electronics with rating > 4.5
  // 2. Home category items that cost less than $50
  const filter = DataFilter.or(
    DataFilter.and(
      DataFilter.field('category', 'eq', 'electronics'),
      DataFilter.field('rating.average', 'gt', 4.5)
    ),
    DataFilter.and(
      DataFilter.field('category', 'eq', 'home'),
      DataFilter.field('price', 'lt', 50)
    )
  );

  // Apply the filter
  const result = DataFilter.apply(products, { filter });

  console.log(`Found ${result.data.length} products matching complex criteria:`);
  result.data.forEach(p => 
    console.log(`- ${p.name}: $${p.price}, Category: ${p.category}, Rating: ${p.rating.average}`)
  );
  console.log();
}

/**
 * Example of filtering with text-based operations
 */
function demonstrateTextFiltering() {
  console.log('--- Text-Based Filtering ---');

  // Find products with 'phone' in the tags array
  const tagFilter = DataFilter.field('tags', 'contains', 'phone');
  const tagResult = DataFilter.apply(products, { filter: tagFilter });

  console.log(`Products with 'phone' tag: ${tagResult.data.length}`);
  tagResult.data.forEach(p => console.log(`- ${p.name} (Tags: ${p.tags.join(', ')})`));
  
  // Find products with names starting with 'S'
  const nameFilter = DataFilter.field('name', 'startswith', 'S');
  const nameResult = DataFilter.apply(products, { filter: nameFilter });

  console.log(`Products with names starting with 'S': ${nameResult.data.length}`);
  nameResult.data.forEach(p => console.log(`- ${p.name}`));
  console.log();
}

/**
 * Example of sorting
 */
function demonstrateSorting() {
  console.log('--- Sorting ---');

  // Sort products by price (highest first), then by name
  const sortOptions = { 
    sort: [
      { field: 'price', direction: 'desc' as const },
      { field: 'name', direction: 'asc' as const }
    ]
  };

  const result = DataFilter.apply(products, sortOptions);

  console.log('Products sorted by price (desc) and name:');
  result.data.forEach(p => console.log(`- ${p.name}: $${p.price}`));
  console.log();
}

/**
 * Example of pagination
 */
function demonstratePagination() {
  console.log('--- Pagination ---');

  // Show the second page of results with 3 items per page
  const paginationOptions = {
    pagination: { page: 2, pageSize: 3 },
    includeCount: true,
    sort: [{ field: 'name', direction: 'asc' as const }]
  };

  const result = DataFilter.apply(products, paginationOptions);

  console.log(`Page ${result.meta.page} of ${result.meta.pageCount}:`);
  result.data.forEach(p => console.log(`- ${p.name}`));
  console.log(`Total products: ${result.meta.totalCount}`);
  console.log(`Has next page: ${result.meta.hasNextPage}`);
  console.log(`Has previous page: ${result.meta.hasPreviousPage}`);
  console.log();
}

/**
 * Example of building a server request URL
 */
function demonstrateServerRequest() {
  console.log('--- Server Request URL Generation ---');

  // Create a complex filter
  const filter = DataFilter.and(
    DataFilter.field('category', 'eq', 'electronics'),
    DataFilter.or(
      DataFilter.field('price', 'lt', 100),
      DataFilter.field('rating.average', 'gt', 4.5)
    ),
    DataFilter.field('discontinued', 'eq', false)
  );

  // Create complete options
  const options = {
    filter,
    sort: [{ field: 'price', direction: 'asc' as const }],
    pagination: { page: 1, pageSize: 20 },
    includeCount: true
  };

  // Build the URL
  const url = DataFilter.buildServerRequest('https://api.example.com/products', options);
  console.log('Generated URL:');
  console.log(url);
  console.log();

  // Show how the params would be parsed back
  console.log('URL parameter conversion demonstration:');
  
  // Convert to query params
  const params = DataFilter.toQueryParams(options);
  console.log('To query params:', params);
  
  // Convert back from query params
  const parsedOptions = DataFilter.fromQueryParams(params);
  console.log('Parsed back from params:', JSON.stringify(parsedOptions, null, 2));
  console.log();
}

/**
 * Example of integration with an ETL pipeline
 */
function demonstratePipelineIntegration() {
  console.log('--- ETL Pipeline Integration ---');

  // Our filtering and transformation pipeline:
  // 1. Filter to in-stock electronics
  // 2. Apply pagination
  // 3. Transform the data (add a "fullName" property)
  
  // Create a filter transformer
  const filterTransformer = DataFilter.createFilterTransformer<Product>({
    filter: DataFilter.and(
      DataFilter.field('category', 'eq', 'electronics'),
      DataFilter.field('stock', 'gt', 0)
    ),
    sort: [{ field: 'price', direction: 'asc' as const }],
    pagination: { page: 1, pageSize: 3 },
    includeCount: true
  });
  
  // Create a transformer for the filtered data
  const formatTransformer = <T extends Product>(response: PaginatedResponse<T>): PaginatedResponse<T & { fullName: string }> => {
    const transformedData = response.data.map(product => ({
      ...product,
      fullName: `${product.name} (${product.category})`
    }));
    
    return {
      data: transformedData as (T & { fullName: string })[],
      meta: response.meta
    };
  };
  
  // Create the pipeline
  const pipeline = DataTransformer.createPipeline<Product[], PaginatedResponse<Product & { fullName: string }>>({
    name: 'Product Filtering Pipeline',
    transformers: [
      filterTransformer,
      formatTransformer
    ]
  });
  
  // Execute the pipeline
  pipeline(products).then(result => {
    console.log('Pipeline result:');
    console.log(`Found ${result.meta.totalCount} total electronics in stock`);
    console.log(`Showing page ${result.meta.page} of ${result.meta.pageCount}`);
    
    result.data.forEach(p => {
      console.log(`- ${p.fullName}: $${p.price} (${p.stock} in stock)`);
    });
  });
}

/**
 * Run all the examples
 */
function runExamples() {
  demonstrateBasicFiltering();
  demonstrateComplexFiltering();
  demonstrateTextFiltering();
  demonstrateSorting();
  demonstratePagination();
  demonstrateServerRequest();
  demonstratePipelineIntegration();
}

// Run the examples if this file is executed directly
if (require.main === module) {
  runExamples();
}

// Export for testing or reuse
export { runExamples }; 