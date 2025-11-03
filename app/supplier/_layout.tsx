// app/supplier/_layout.tsx

import { Stack } from 'expo-router';

export default function SupplierLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: '#16a34a', // Deep Green Header
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      contentStyle: {
        backgroundColor: '#f3f4f6',
      }
    }}>
      {/* 1. Primary Dashboard */}
      <Stack.Screen name="index" options={{ title: 'Supplier Dashboard' }} />
      
      {/* 2. Primary Action Screens */}
      <Stack.Screen name="product-management" options={{ title: 'Product Management' }} />
      <Stack.Screen name="order-management" options={{ title: 'Order Management' }} />
      
      {/* 3. Detailed Stats Screens */}
      <Stack.Screen name="orders" options={{ title: 'Total Orders History' }} />
      <Stack.Screen name="products" options={{ title: 'My Listed Products' }} />
      <Stack.Screen name="revenue" options={{ title: 'Monthly Revenue' }} />
      
      {/* 4. Profile */}
      <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
    </Stack>
  );
}