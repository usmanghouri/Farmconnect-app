// utils/apiAuth.ts
import * as SecureStore from 'expo-secure-store';
import apiClient, { TOKEN_KEY } from './apiClient';
import { authPaths, UserRole } from './endpoints';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  imgURL?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export async function registerUser(role: UserRole, payload: RegisterPayload) {
  const { data } = await apiClient.post(authPaths.register(role), payload);
  return data;
}

export async function verifyEmail(role: UserRole, email: string, otp: string) {
  const { data } = await apiClient.post(authPaths.verify(role), { email, otp });
  return data;
}

export async function resendOtp(role: UserRole, email: string) {
  const { data } = await apiClient.post(authPaths.resendOtp(role), { email });
  return data;
}

export async function loginUser(role: UserRole, payload: LoginPayload) {
  const { data } = await apiClient.post(authPaths.login(role), payload);
  // Try to persist token if provided
  const token = (data && (data.token || data.accessToken || data.jwt)) as string | undefined;
  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
  return data;
}

export async function logoutUser(role: UserRole) {
  const { data } = await apiClient.get(authPaths.logout(role));
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  return data;
}

export async function getMyProfile(role: UserRole) {
  const { data } = await apiClient.get(authPaths.me(role));
  return data;
}

export async function updateProfile(role: UserRole, payload: Partial<RegisterPayload> & { imgURL?: string }) {
  const { data } = await apiClient.put(authPaths.updateProfile(role), payload);
  return data;
}

export async function deleteProfile(role: UserRole) {
  const { data } = await apiClient.delete(authPaths.deleteProfile(role));
  return data;
}

export async function changePassword(role: UserRole, oldPassword: string, newPassword: string) {
  const path = authPaths.changePassword(role);
  const { data } = await apiClient.put(path, { oldPassword, newPassword });
  return data;
}

export async function forgotPassword(role: UserRole, email: string, phone: string) {
  const { data } = await apiClient.post(authPaths.forgotPassword(role), { email, phone });
  return data;
}

export async function resetPassword(role: UserRole, email: string, phone: string, otp: string, newPassword: string) {
  const { data } = await apiClient.post(authPaths.resetPassword(role), { email, phone, otp, newPassword });
  return data;
}

export async function getAllUsers(role: UserRole) {
  const { data } = await apiClient.get(authPaths.all(role));
  return data;
}

export async function getProfileWithProducts(role: 'Farmer' | 'Supplier', id: string) {
  const { data } = await apiClient.get(authPaths.profileWithProducts(role, id));
  return data;
}


