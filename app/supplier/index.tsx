// app/supplier/index.tsx

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { logoutUser } from "../../utils/apiAuth";
import { getMyProducts } from "../../utils/apiProducts";

const { width } = Dimensions.get('window');

// --- SHARED GRADIENT BACKGROUND COMPONENT ---
const GradientBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <LinearGradient
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
    { _id: 'ORD001', status: 'delivered', totalPrice: 5200, products: [{ name: 'Fertilizer' }], userId: 'BUYER123', createdAt: new Date().toISOString() },
    { _id: 'ORD002', status: 'processing', totalPrice: 3500, products: [{ name: 'Seeds' }], userId: 'FARMER456', createdAt: new Date().toISOString() },
    { _id: 'ORD003', status: 'pending', totalPrice: 1500, products: [{ name: 'Pesticides' }], userId: 'BUYER789', createdAt: new Date().toISOString() },
];
const DUMMY_REVENUE = 15500;
const DUMMY_PRODUCT_COUNT = 15;

// --- CARD COMPONENT WITH LINK ---
const DashboardCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
  link: string; // Link is now mandatory
}> = ({ title, value, subtitle, iconName, iconColor, bgColor, link }) => (
  <Link href={link} asChild>
    <TouchableOpacity style={[styles.card, { backgroundColor: bgColor }]} activeOpacity={0.8}>
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

const SupplierDashboard = () => {
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [recentOrders, setRecentOrders] = useState(DUMMY_ORDERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const my = await getMyProducts();
        setProductsCount(Array.isArray(my?.products) ? my.products.length : 0);
        // Keep dummy orders/revenue until APIs exist
        setActiveOrdersCount(DUMMY_ORDERS.length);
        setRevenue(DUMMY_REVENUE);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: async () => { try { await logoutUser('Supplier'); } catch {}; router.replace('/'); } },
      ]
    );
  };

  const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'delivered': return { bgColor: '#d1fae5', textColor: '#065f46', text: 'Delivered' };
        case 'processing': return { bgColor: '#bfdbfe', textColor: '#1e40af', text: 'Processing' };
        default: return { bgColor: '#fef3c7', textColor: '#92400e', text: 'Pending' };
    }
  };
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Error loading dashboard: {error}</Text>
      </View>
    );
  }

  return (
    <GradientBackground>
      <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentContainer}>
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>Supplier Dashboard</Text>
          <View style={{flexDirection:'row', alignItems:'center', gap:12}}>
            <TouchableOpacity onPress={() => router.push('/supplier/profile')}>
              <Ionicons name="person-circle-outline" size={30} color="#1f2937" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={26} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>
        
        {loading && <ActivityIndicator size="large" color="#16a34a" style={{marginVertical: 20}} />}

        {/* Dashboard Stats Cards (Clickable) */}
        <View style={styles.statsGrid}>
          <DashboardCard
            title="Total Orders"
            value={loading ? "..." : activeOrdersCount}
            iconName="receipt"
            iconColor="#16a34a"
            bgColor="#ecfdf5"
            link="/supplier/orders" // New screen link
          />

          <DashboardCard
            title="Products Listed"
            value={loading ? "..." : productsCount}
            iconName="package-variant"
            iconColor="#3b82f6"
            bgColor="#eff6ff"
            link="/supplier/products" // New screen link
          />

          <DashboardCard
            title="Revenue (Month)"
            value={loading ? "..." : `Rs. ${revenue.toLocaleString()}`}
            iconName="cash"
            iconColor="#f59e0b"
            bgColor="#fff7ed"
            link="/supplier/revenue" // New screen link
          />

          <DashboardCard
            title="Weather Status"
            value="Clear"
            subtitle="28°C - Islamabad"
            iconName="weather-sunny"
            iconColor="#0ea5e9"
            bgColor="#f0f9ff"
            link="/supplier/weather-alerts" // Placeholder link
          />
        </View>

        {/* Recent Orders (Section View) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => router.push('/supplier/order-management')}>
                <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.tableContainer}>
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <View key={order._id} style={styles.tableRow}>
                    <Text style={[styles.tableCell, { flex: 1.2 }]}>#{order._id.slice(-6)}</Text>
                    <Text style={[styles.tableCell, { flex: 2 }]}>{order.products[0]?.name || "N/A"}</Text>
                    <Text style={[styles.tableCell, { flex: 1.5 }]}>{order.userId?.slice(-6) || "N/A"}</Text>
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
              <Text style={styles.tableMessage}>No recent orders found</Text>
            )}
          </View>
        </View>

        {/* Product Management Quick Link */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.quickLinksContainer}>
              <TouchableOpacity style={styles.quickLinkButton} onPress={() => router.push('/supplier/product-management')}>
                  <Ionicons name="add-circle-outline" size={24} color="#16a34a" />
                  <Text style={styles.quickLinkText}>Manage Products</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickLinkButton} onPress={() => router.push('/supplier/order-management')}>
                  <Ionicons name="list-circle-outline" size={24} color="#3b82f6" />
                  <Text style={styles.quickLinkText}>Order Management</Text>
              </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </GradientBackground>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  gradientWrapper: { flex: 1 },
  contentScrollView: { flex: 1, backgroundColor: 'transparent' },
  contentContainer: { padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#1f2937', marginBottom: 20 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: 'red', fontSize: 16 },
  
  // Card Styles
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
  card: {
    width: (width - 60) / 2, // Adjusted for cleaner two-column layout
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
  
  // Section Styles
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
  },
  sectionHeader: { 
      flexDirection: 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 10 
  },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937' },
  viewAllText: { color: '#16a34a', fontSize: 14, fontWeight: '600' },

  // Table Styles (Recent Orders)
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
  
  // Quick Links
  quickLinksContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: 10,
  },
  quickLinkButton: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLinkText: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: '600',
    color: '#4b5563',
    textAlign: 'center',
  }
});

export default SupplierDashboard;