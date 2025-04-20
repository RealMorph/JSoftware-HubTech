/**
 * Product Service Example
 * 
 * This file demonstrates how to create a type-safe service for a specific data model
 * using the unified data adapter system.
 */

import { createModelAdapter } from '../../hooks/useDataAdapter';

// Define the product model
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

// Define DTOs for product operations
export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  inStock?: boolean;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  imageUrl?: string;
  inStock?: boolean;
}

// Create a custom hook for product operations
export const useProductService = createModelAdapter<Product, CreateProductDto, UpdateProductDto>('products');

// Example usage:
/*
function ProductList() {
  const productService = useProductService();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const response = await productService.getAll();
        setProducts(response.data);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadProducts();
  }, [productService]);
  
  return (
    <div>
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <ul>
          {products.map(product => (
            <li key={product.id}>{product.name} - ${product.price}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
*/ 