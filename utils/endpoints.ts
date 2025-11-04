// utils/endpoints.ts
// Centralized helpers for building endpoint paths per role and features

export type UserRole = 'Farmer' | 'Buyer' | 'Supplier';

export const roleToBasePath: Record<UserRole, string> = {
  Farmer: 'farmers',
  Buyer: 'buyers',
  Supplier: 'suppliers',
};

export const authPaths = {
  register: (role: UserRole) => `${roleToBasePath[role]}/new`,
  login: (role: UserRole) => `${roleToBasePath[role]}/login`,
  logout: (role: UserRole) => `${roleToBasePath[role]}/logout`,
  verify: (role: UserRole) => `${roleToBasePath[role]}/verify`,
  resendOtp: (role: UserRole) => `${roleToBasePath[role]}/resendOTP`,
  me: (role: UserRole) => `${roleToBasePath[role]}/me`,
  updateProfile: (role: UserRole) => `${roleToBasePath[role]}/update`,
  deleteProfile: (role: UserRole) => `${roleToBasePath[role]}/delete`,
  changePassword: (role: UserRole) => {
    // API uses different casing for farmer: changepassword
    if (role === 'Farmer') return `${roleToBasePath[role]}/changepassword`;
    return `${roleToBasePath[role]}/change-password`;
  },
  forgotPassword: (role: UserRole) => `${roleToBasePath[role]}/forgot-password`,
  resetPassword: (role: UserRole) => `${roleToBasePath[role]}/reset-password`,
  all: (role: UserRole) => `${roleToBasePath[role]}/all`,
  profileWithProducts: (role: Exclude<UserRole, 'Buyer'>, id: string) => {
    const slug = role === 'Farmer' ? 'farmer' : 'supplier';
    return `${roleToBasePath[role]}/${slug}/${id}`;
  },
};

export const productPaths = {
  add: `products/add`,
  all: `products/all`,
  my: `products/my_product`,
  delete: (id: string) => `products/delete/${id}`,
  update: (id: string) => `products/update/${id}`,
  productsForFarmer: `products/productForFarmer`,
};

export const chatbotPaths = {
  ask: `chatbot/ask`,
};

export const reviewPaths = {
  add: `review/add`,
  getByProduct: (productId: string) => `get-review/${productId}`,
};


