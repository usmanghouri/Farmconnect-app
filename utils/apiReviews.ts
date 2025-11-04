// utils/apiReviews.ts
import apiClient from './apiClient';
import { reviewPaths } from './endpoints';

export interface AddReviewInput {
  productId: string;
  rating: number;
  comment?: string;
}

export async function addReview(input: AddReviewInput) {
  const { data } = await apiClient.post(reviewPaths.add, input);
  return data;
}

export async function getReviews(productId: string) {
  const { data } = await apiClient.get(reviewPaths.getByProduct(productId));
  return data;
}


