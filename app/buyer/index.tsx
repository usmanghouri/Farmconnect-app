// app/buyer/index.tsx

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');

// --- SHARED GRADIENT BACKGROUND COMPONENT ---
const GradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <LinearGradient
        // Custom Light Green Gradient for Agriculture theme
        colors={['#f0fdf4', '#d1fae5']} 
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }} 
        style={styles.gradientWrapper}
    >
        {children}
    </LinearGradient>
);

// --- DUMMY DATA ---
const DUMMY_ORDERS = [
    { _id: 'ORD001', status: 'shipped', totalPrice: 5200, products: [{ name: 'Wheat Seeds' }] },
    { _id: 'ORD002', status: 'delivered', totalPrice: 800, products: [{ name: 'Organic Fertilizer' }] },
    { _id: 'ORD003', status: 'pending', totalPrice: 1500, products: [{ name: 'Pesticide' }] },
];

const DUMMY_PRODUCTS = [
    { _id: 'P001', name: 'Fresh Tomatoes', price: 150, category: 'Vegetables' },
    { _id: 'P002', name: 'Basmati Rice', price: 4000, category: 'Crops' },
    { _id: 'P003', name: 'High-yield Seeds', price: 800, category: 'Pesticides' },
];

// --- COMPONENTS ---
const DashboardCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
  link: any;
}> = ({ title, value, subtitle, iconName, iconColor, bgColor, link }) => (
  <Link href={link || "/buyer"} asChild>
    <TouchableOpacity style={[styles.card, { backgroundColor: bgColor }]}>
        <View style={styles.cardContent}>
            <View>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={[styles.cardValue, { color: iconColor }]}>{value}</Text>
                {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
            </View>
            <MaterialCommunityIcons name={iconName as any} size={32} color={iconColor} />
        </View>
    </TouchableOpacity>
  </Link>
);

const BuyerDashboard = () => {
  const router = useRouter();
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState(DUMMY_ORDERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate fetching data (instant mock success)
    setTimeout(() => {
        setOrdersCount(DUMMY_ORDERS.length);
        setWishlistCount(3);
        setCartItemsCount(2);
        setLoading(false);
    }, 500);
  }, []);
  
  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'delivered': return { bgColor: '#15803d', textColor: '#d1fae5', text: 'Delivered' };
        case 'shipped': return { bgColor: '#3b82f6', textColor: '#bfdbfe', text: 'Shipped' };
        default: return { bgColor: '#f59e0b', textColor: '#fff7ed', text: 'Pending' };
    }
  };

  if (error) {
    return <View style={styles.errorContainer}><Text style={styles.errorText}>Error loading dashboard: {error}</Text></View>;
  }

  return (
    // 1. Apply Gradient Wrapper
    <GradientBackground> 
      {/* 2. ScrollView background is now transparent, showing the gradient */}
      <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.headerTitle}>Buyer Dashboard</Text>
        
        {loading && <ActivityIndicator size="large" color="#3b82f6" style={{marginVertical: 20}} />}

        {/* Dashboard Stats Cards */}
        <View style={styles.statsGrid}>
          
          {/* My Orders - Teal/Aqua Theme */}
          <DashboardCard
            title="My Orders"
            value={loading ? "..." : ordersCount}
            iconName="receipt"
            iconColor="#00838f" // Deep Teal
            bgColor="#e0f7fa" // Pale Aqua
            link="/buyer/my-orders"
          />

          {/* Wishlist - Red/Crimson Theme */}
          <DashboardCard
            title="Wishlist"
            value={loading ? "..." : wishlistCount}
            iconName="heart"
            iconColor="#c62828" // Crimson Red
            bgColor="#ffebee" // Pale Pink/Red
            link="/buyer/wishlist"
          />

          {/* Cart Items - Green/Lime Theme */}
          <DashboardCard
            title="Cart Items"
            value={loading ? "..." : cartItemsCount}
            iconName="cart"
            iconColor="#558b2f" // Dark Moss Green
            bgColor="#f1f8e9" // Pale Lime
            link="/buyer/buyer-cart"
          />

          {/* Quick Shop - Blue/Royal Theme */}
          <DashboardCard
            title="Quick Shop"
            value="Browse"
            iconName="magnify"
            iconColor="#1565c0" // Royal Blue
            bgColor="#e3f2fd" // Pale Blue
            link="/buyer/buyer-products"
          />
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Orders</Text>
              <Link href="/buyer/my-orders">
                  <Text style={styles.viewAllText}>View All</Text>
              </Link>
          </View>
          
          <View style={styles.tableContainer}>
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <View key={order._id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>#{order._id.slice(-6)}</Text>
                    <Text style={[styles.tableCell, { flex: 2.5 }]}>{order.products.length} Items ({order.products[0]?.name})</Text>
                    <View style={[styles.tableCell, { flex: 1.5 }]}>
                      <Text style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor, color: statusInfo.textColor }]}>
                        {statusInfo.text}
                      </Text>
                    </View>
                    <Text style={[styles.tableCell, { flex: 1.5, fontWeight: '700' }]}>{`Rs. ${order.totalPrice.toLocaleString()}`}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.tableMessage}>No recent orders found. Tap to start shopping.</Text>
            )}
          </View>
        </View>

        {/* Weather Forecast (Mock) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Weather & Farm Alerts</Text>
          </View>
          <View style={styles.weatherAlert}>
            <Ionicons name="warning" size={20} color="#f59e0b" style={{marginRight: 8}}/>
            <Text style={{fontSize: 14, color: '#92400e'}}>
                Temperature expected to drop by 6°C tomorrow. Protect sensitive crops!
            </Text>
          </View>
          <View style={styles.recommendedGrid}>
              {DUMMY_PRODUCTS.slice(0,2).map((product) => (
                  <TouchableOpacity 
                      key={product._id} 
                      style={styles.productItem}
                      onPress={() => router.push('/buyer/buyer-products')}
                  >
                      <MaterialCommunityIcons name="seedling" size={24} color="#10b981" />
                      <View style={{flex: 1, marginLeft: 10}}>
                          <Text style={styles.productName} numberOfLines={1}>Recommended: {product.name}</Text>
                          <Text style={styles.productCategory}>{product.category}</Text>
                      </View>
                      <Text style={styles.productPrice}>{`Rs. ${product.price.toLocaleString()}`}</Text>
                  </TouchableOpacity>
              ))}
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  // 1. GRADIENT WRAPPER
  gradientWrapper: { 
      flex: 1, 
  },
  // 2. SCROLLVIEW MUST HAVE TRANSPARENT BACKGROUND
  contentScrollView: { flex: 1, backgroundColor: 'transparent' }, 
  contentContainer: { padding: 15 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1f2937', marginBottom: 20 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  
 // CARD STYLES: Uses specific color in component prop, but keeps separation styling here
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  card: {
    width: (width - 45) / 2, 
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    padding: 15,
    marginBottom: 15,
  },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 13, fontWeight: '500', color: '#4b5563', opacity: 0.8 },
  cardValue: { fontSize: 22, fontWeight: 'bold', marginTop: 5 },
  cardSubtitle: { fontSize: 11, color: '#6b7280', marginTop: 2, opacity: 0.7 },
  
  // SECTION STYLES: Strongest separation
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8, 
    borderWidth: 1,
    borderColor: '#e5e7eb' 
  },
  sectionHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 10 
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  viewAllText: { color: '#3b82f6', fontSize: 14, fontWeight: '600' },

  tableContainer: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden' },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    alignItems: 'center',
  },
  tableCell: { fontSize: 12, color: '#374151' },
  statusBadge: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  tableMessage: { padding: 15, textAlign: 'center', color: '#6b7280', fontSize: 14 },
  
  weatherAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fff7ed',
    marginBottom: 15,
  },

  recommendedGrid: { gap: 10, marginTop: 10 },
  productItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
  },
  productName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  productCategory: { fontSize: 12, color: '#6b7280' },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: '#059669' },
});

export default BuyerDashboard;