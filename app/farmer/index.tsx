// app/farmer/index.tsx

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient'; // Import for background
import { Link } from "expo-router"; // Import Link for navigation
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

// Interface for API response data (retained)
interface Order {
    _id: string;
    status: string;
    createdAt: string;
    totalPrice: number;
    products: { name?: string }[];
    userId?: string;
}
interface Product {
    _id: string;
}

// --- FIXED DASHBOARD CARD COMPONENT ---
// Uses Link and TouchableOpacity for clickable navigation cards
const DashboardCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  iconName: string;
  iconColor: string;
  bgColor: string;
  link: string; // Ensure link is a string type
}> = ({ title, value, subtitle, iconName, iconColor, bgColor, link }) => (
  // Use Link component from Expo Router to wrap the TouchableOpacity
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

const FarmerDashboard = () => {
    // Note: Axios network calls are kept but will still fail without Auth/SecureStore setup
    const [activeOrdersCount, setActiveOrdersCount] = useState(0);
    const [productsCount, setProductsCount] = useState(0);
    const [revenue, setRevenue] = useState(0);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // --- MOCK API DATA FOR RUNNABILITY ---
        const MOCK_ORDERS = [
            { _id: 'ORD1', status: 'delivered', totalPrice: 5200, products: [{ name: 'Wheat' }] },
            { _id: 'ORD2', status: 'processing', totalPrice: 3500, products: [{ name: 'Seeds' }] },
        ];
        
        setTimeout(() => {
            setActiveOrdersCount(12);
            setProductsCount(8);
            setRevenue(25000);
            setRecentOrders(MOCK_ORDERS);
            setLoading(false);
        }, 500);

        // --- Original API fetching logic (commented out for testability) ---
        // const fetchData = async () => { /* ... API logic here ... */ };
        // fetchData();
        
    }, []);

    const getStatusInfo = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'delivered': return { bgColor: '#d1fae5', textColor: '#065f46', text: 'Delivered' };
            case 'processing': return { bgColor: '#bfdbfe', textColor: '#1e40af', text: 'Processing' };
            case 'pending': return { bgColor: '#fef3c7', textColor: '#92400e', text: 'Pending' };
            default: return { bgColor: '#e5e7eb', textColor: '#4b5563', text: 'N/A' };
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
                <Text style={styles.headerTitle}>Farmer Dashboard</Text>
                
                {loading && <ActivityIndicator size="large" color="#16a34a" style={{marginVertical: 20}} />}

                {/* Dashboard Stats Cards */}
                <View style={styles.statsGrid}>
                    {/* Total Orders -> Link to Orders Screen */}
                    <DashboardCard
                        title="Total Orders"
                        value={loading ? "..." : activeOrdersCount}
                        iconName="receipt"
                        iconColor="#16a34a"
                        bgColor="#ecfdf5"
                        link="/farmer/my-orders" // FIXED LINK PATH
                    />

                    {/* Products Listed -> Link to Products Screen */}
                    <DashboardCard
                        title="Products Listed"
                        value={loading ? "..." : productsCount}
                        iconName="package-variant"
                        iconColor="#3b82f6"
                        bgColor="#eff6ff"
                        link="/farmer/farmer-products" // FIXED LINK PATH
                    />

                    {/* Revenue (Month) -> Link to Revenue Screen */}
                    <DashboardCard
                        title="Revenue (Month)"
                        value={loading ? "..." : `Rs. ${revenue.toLocaleString()}`}
                        iconName="cash"
                        iconColor="#f59e0b"
                        bgColor="#fff7ed"
                        link="/farmer/profile" // FIXED LINK PATH
                    />

                    {/* Weather Status -> Link to Order Management (Placeholder) */}
                    <DashboardCard
                        title="Cart"
                        value="Clear"
                        subtitle="28°C - Islamabad"
                        iconName="weather-sunny"
                        iconColor="#0ea5e9"
                        bgColor="#f0f9ff"
                        link="/farmer/shopping-cart" // Placeholder Link
                    />
                </View>

                {/* Recent Orders */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Orders</Text>
                    <View style={styles.tableContainer}>
                        {loading ? (
                            <Text style={styles.tableMessage}>Loading orders...</Text>
                        ) : recentOrders.length > 0 ? (
                            recentOrders.map((order) => {
                                const statusInfo = getStatusInfo(order.status);
                                return (
                                    <View key={order._id} style={styles.tableRow}>
                                        <Text style={[styles.tableCell, { flex: 1.5 }]}>#{order._id.slice(-6)}</Text>
                                        <Text style={styles.tableCell}>{order.products[0]?.name || "N/A"}</Text>
                                        <Text style={styles.tableCell}>{`Rs. ${order.totalPrice.toLocaleString()}`}</Text>
                                        <View style={styles.tableCell}>
                                            <Text style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor, color: statusInfo.textColor }]}>
                                                {statusInfo.text}
                                            </Text>
                                        </View>
                                    </View>
                                );
                            })
                        ) : (
                            <Text style={styles.tableMessage}>No recent orders found</Text>
                        )}
                    </View>
                </View>

                {/* Weather Forecast (Simplified) */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Weather Forecast</Text>
                    <View style={[styles.weatherAlert, {borderColor: '#f59e0b', backgroundColor: '#fff7ed'}]}>
                        <Ionicons name="warning" size={20} color="#f59e0b" style={{marginRight: 8}}/>
                        <Text style={{fontSize: 14, color: '#92400e'}}>
                            Light rain expected on Thursday. Consider covering sensitive crops.
                        </Text>
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
    headerTitle: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 20 },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: 'red', fontSize: 16 },
    
    statsGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        marginBottom: 30 
    },
    card: {
        width: (width - 60) / 2, // 2 cards per row with margin
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 }, // Enhanced shadow
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8, // Enhanced elevation
        padding: 15,
        marginBottom: 20,
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: '500',
        color: '#4b5563',
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 5,
    },
    cardSubtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    section: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 }, // Enhanced shadow
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8, // Enhanced elevation
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 10,
    },
    // Table Styles (Recent Orders)
    tableContainer: {
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        overflow: 'hidden',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        alignItems: 'center',
    },
    tableCell: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
        justifyContent: 'center',
    },
    statusBadge: {
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    tableMessage: {
        padding: 20,
        textAlign: 'center',
        color: '#6b7280',
        fontSize: 14,
    },
    weatherAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 4,
    }
});

export default FarmerDashboard;