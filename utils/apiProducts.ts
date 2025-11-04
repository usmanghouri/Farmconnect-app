// utils/apiProducts.ts
import apiClient from './apiClient';
import { productPaths } from './endpoints';

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  category?: string;
  images: string[];
}

export async function addProduct(input: ProductInput) {
  const { data } = await apiClient.post(productPaths.add, input);
  return data;
}

export async function getAllProducts() {
  const { data } = await apiClient.get(productPaths.all);
  return data;
}

export async function getMyProducts() {
  const { data } = await apiClient.get(productPaths.my);
  return data;
}

export async function deleteProduct(id: string) {
  const { data } = await apiClient.delete(productPaths.delete(id));
  return data;
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const { data } = await apiClient.put(productPaths.update(id), input);
  return data;
}

export async function getProductsForFarmerFeed() {
  const { data } = await apiClient.get(productPaths.productsForFarmer);
  return data;
}


