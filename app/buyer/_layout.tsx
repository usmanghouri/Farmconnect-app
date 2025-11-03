// app/buyer/_layout.tsx

import { Stack } from 'expo-router';

export default function BuyerLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: '#16a34a', // Primary Blue Header
      },
      headerTintColor: '#052e16',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      contentStyle: {
        backgroundColor: '#052e16',
      }
    }}>
      {/* 1. Dashboard Main Page */}
      <Stack.Screen name="index" options={{ title: 'Buyer Dashboard' }} />
      {/* 2. Product Marketplace */}
      <Stack.Screen name="buyer-products" options={{ title: 'Marketplace' }} />
      {/* 3. Shopping Cart */}
      <Stack.Screen name="buyer-cart" options={{ title: 'My Cart' }} />
      {/* 4. Orders List */}
      <Stack.Screen name="my-orders" options={{ title: 'My Orders' }} />
      {/* 5. Wishlist */}
      <Stack.Screen name="wishlist" options={{ title: 'Wishlist' }} />
      {/* 6. Profile Page */}
      <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
    </Stack>
  );
}