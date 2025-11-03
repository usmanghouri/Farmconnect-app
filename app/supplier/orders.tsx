// app/supplier/orders.tsx

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

const { width } = Dimensions.get('window');

// --- INTERFACES ---
interface Order {
    _id: string;
    createdAt: string;
    status: string;
    totalPrice: number;
    products: { name?: string }[];
    userId?: string;
    paymentInfo?: { status: string };
}

// --- DUMMY DATA ---
const DUMMY_ALL_ORDERS: Order[] = [
    { _id: 'ORD001', createdAt: new Date(Date.now() - 50000000).toISOString(), status: 'delivered', totalPrice: 5200, products: [{ name: 'Fertilizer' }], userId: 'BUYER123', paymentInfo: { status: 'completed' } },
    { _id: 'ORD002', createdAt: new Date(Date.now() - 150000000).toISOString(), status: 'processing', totalPrice: 3500, products: [{ name: 'Seeds' }], userId: 'FARMER456', paymentInfo: { status: 'pending' } },
    { _id: 'ORD003', createdAt: new Date(Date.now() - 250000000).toISOString(), status: 'pending', totalPrice: 1500, products: [{ name: 'Pesticides' }], userId: 'BUYER789', paymentInfo: { status: 'completed' } },
    { _id: 'ORD004', createdAt: new Date(Date.now() - 400000000).toISOString(), status: 'delivered', totalPrice: 8500, products: [{ name: 'Machinery Part' }], userId: 'SUPP888', paymentInfo: { status: 'completed' } },
    { _id: 'ORD005', createdAt: new Date(Date.now() - 550000000).toISOString(), status: 'canceled', totalPrice: 1200, products: [{ name: 'Seeds' }], userId: 'BUYER222', paymentInfo: { status: 'failed' } },
    { _id: 'ORD006', createdAt: new Date(Date.now() - 700000000).toISOString(), status: 'shipped', totalPrice: 950, products: [{ name: 'Tools' }], userId: 'FARMER101', paymentInfo: { status: 'completed' } },
];

// --- UTILITY FUNCTIONS ---
const getStatusInfo = (status: string) => {
    switch (status?.toLowerCase()) {
        case 'delivered': return { color: '#047857', bg: '#d1fae5', text: 'DELIVERED' };
        case 'shipped': return { color: '#1e40af', bg: '#bfdbfe', text: 'SHIPPED' };
        case 'processing': return { color: '#f59e0b', bg: '#fff7ed', text: 'PROCESSING' };
        case 'pending': return { color: '#92400e', bg: '#fef3c7', text: 'PENDING' };
        case 'canceled': return { color: '#991b1b', bg: '#fee2e2', text: 'CANCELED' };
        default: return { color: '#4b5563', bg: '#e5e7eb', text: 'N/A' };
    }
};

const formatCurrency = (amount: number | undefined) => `Rs. ${amount?.toLocaleString() || "0"}`;
const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};


const SupplierOrdersScreen = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Simulate data fetch
        setTimeout(() => {
            setOrders(DUMMY_ALL_ORDERS.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            setLoading(false);
        }, 800);
    }, []);

    const renderOrderRow = ({ item: order }: { item: Order }) => {
        const statusInfo = getStatusInfo(order.status);
        const paymentStatus = order.paymentInfo?.status || 'N/A';
        const paymentStyle = paymentStatus === 'completed' ? { color: '#047857', bg: '#d1fae5' } : { color: '#f59e0b', bg: '#fff7ed' };

        return (
            <View style={styles.tableRow}>
                <Text style={[styles.cell, { flex: 1.5, fontWeight: '600' }]}>#{order._id.slice(-6)}</Text>
                <Text style={[styles.cell, { flex: 2.5 }]}>{order.products[0]?.name || "N/A"}</Text>
                <Text style={[styles.cell, { flex: 1.5 }]}>{formatDate(order.createdAt)}</Text>
                
                <View style={[styles.cell, { flex: 2 }]}>
                    <Text style={[styles.statusBadge, { backgroundColor: statusInfo.bg, color: statusInfo.color }]}>
                        {statusInfo.text}
                    </Text>
                </View>
                
                <View style={[styles.cell, { flex: 2 }]}>
                     <Text style={[styles.statusBadge, { backgroundColor: paymentStyle.bg, color: paymentStyle.color }]}>
                        {paymentStatus.toUpperCase()}
                    </Text>
                </View>
                
                <Text style={[styles.cell, { flex: 2, fontWeight: '700', textAlign: 'right' }]}>{formatCurrency(order.totalPrice)}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#16a34a" />
                <Text style={{marginTop: 10, color: '#4b5563'}}>Loading all orders...</Text>
            </View>
        );
    }

    return (
        <LinearGradient colors={['#f0fdf4', '#d1fae5']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.gradientWrapper}>
            <View style={styles.baseContainer}>
                <Text style={styles.pageTitle}>Total Orders History</Text>

                <View style={styles.listCard}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>Order ID</Text>
                        <Text style={[styles.headerCell, { flex: 2.5 }]}>Product</Text>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>Date</Text>
                        <Text style={[styles.headerCell, { flex: 2 }]}>Status</Text>
                        <Text style={[styles.headerCell, { flex: 2 }]}>Payment</Text>
                        <Text style={[styles.headerCell, { flex: 2, textAlign: 'right' }]}>Amount</Text>
                    </View>
                    
                    {orders.length === 0 ? (
                        <Text style={styles.emptyText}>No orders recorded yet.</Text>
                    ) : (
                        <FlatList
                            data={orders}
                            renderItem={renderOrderRow}
                            keyExtractor={item => item._id}
                            scrollEnabled={false}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                    )}
                </View>
            </View>
        </LinearGradient>
    );
};

// --- STYLES ---
const styles = StyleSheet.create({
    gradientWrapper: { flex: 1 },
    baseContainer: { flex: 1, padding: 16, backgroundColor: 'transparent' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 300 },
    
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 20 },
    
    listCard: { backgroundColor: 'white', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 8, overflow: 'hidden' },
    
    // Table Styles
    tableHeader: { flexDirection: 'row', backgroundColor: '#f9fafb', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    headerCell: { fontSize: 11, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' },
    
    tableRow: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 10, alignItems: 'center' },
    cell: { fontSize: 13, color: '#374151', justifyContent: 'center' },
    separator: { height: 1, backgroundColor: '#f3f4f6' },

    statusBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10, textTransform: 'uppercase' },
    
    emptyText: { padding: 20, textAlign: 'center', color: '#6b7280', fontSize: 14 },
});

export default SupplierOrdersScreen;