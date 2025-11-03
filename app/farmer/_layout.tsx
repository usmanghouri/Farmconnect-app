import { Stack } from 'expo-router';

export default function FarmerLayout() {
  return (
    <Stack screenOptions={{
      headerStyle: {
        backgroundColor: '#16a34a', // Dark Green Header
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      contentStyle: {
        backgroundColor: '#f3f4f6', // Background color for screens
      }
    }}>
      {/* Farmer Dashboard */}
      <Stack.Screen
        name="index"
        options={{
          title: 'Farmer Dashboard',
        }}
      />
      
      {/* Browse Supplies */}
      <Stack.Screen
        name="farmer-products"
        options={{
          title: 'Browse Supplies',
        }}
      />

      {/* My Orders */}
      <Stack.Screen
        name="my-orders"
        options={{
          title: 'My Orders',
        }}
      />

      {/* Shopping Cart (Often accessed via a header icon, but kept in stack) */}
      <Stack.Screen
        name="shopping-cart"
        options={{
          title: 'Shopping Cart',
        }}
      />
      
      {/* Wishlist */}
      <Stack.Screen
        name="wishlist"
        options={{
          title: 'Wishlist',
        }}
      />
      
      {/* Profile Page */}
      <Stack.Screen
        name="profile"
        options={{
          title: 'My Profile',
        }}
      />
      
      {/* Product Detail Page (Placeholder for dynamic routes) */}
      <Stack.Screen
        name="product/[id]" // Keep the dynamic route structure
        options={{
          title: 'Product Details',
        }}
      />
    </Stack>
  );
}