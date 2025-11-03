// app/buyer/my-orders.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get('window');

// --- DUMMY DATA AND INTERFACES ---
interface ProductItem {
    _id: string;
    name?: string;
    quantity?: number;
    price?: number;
    images?: string[];
}

interface Order {
    _id: string;
    createdAt: string;
    status: string;
    totalPrice: number;
    products: ProductItem[];
    shippingAddress?: {
        street?: string;
        city?: string;
        zipCode?: string;
        phoneNumber?: string;
    };
    paymentInfo?: {
        method?: string;
        status?: string;
    };
    notes?: string;
}

const DUMMY_ORDERS: Order[] = [
    { 
        _id: 'ORD001', createdAt: new Date().toISOString(), status: 'delivered', totalPrice: 5200, 
        products: [
            { _id: 'P1', name: 'Premium Wheat', price: 2000, quantity: 2, images: [''] },
            { _id: 'P2', name: 'Fertilizer Bag', price: 1200, quantity: 1, images: [''] },
        ],
        paymentInfo: { status: 'completed' }
    },
    { 
        _id: 'ORD002', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'shipped', totalPrice: 3500, 
        products: [{ _id: 'P3', name: 'Organic Apples', price: 1750, quantity: 2, images: [''] }],
        paymentInfo: { status: 'pending' }
    },
    { 
        _id: 'ORD003', createdAt: new Date(Date.now() - 345600000).toISOString(), status: 'pending', totalPrice: 12000, 
        products: [{ _id: 'P4', name: 'Tractor Part', price: 12000, quantity: 1, images: [''] }],
        paymentInfo: { status: 'pending' }
    },
];

// --- UTILITY FUNCTIONS ---
const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
        case "delivered": return { color: "#065f46", backgroundColor: "#d1fae5" };
        case "shipped": return { color: "#1e40af", backgroundColor: "#bfdbfe" };
        case "pending": return { color: "#92400e", backgroundColor: "#fef3c7" };
        case "cancelled": return { color: "#991b1b", backgroundColor: "#fee2e2" };
        default: return { color: "#4b5563", backgroundColor: "#e5e7eb" };
    }
};

const BuyerMyOrdersScreen = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const formatCurrency = (amount: number | undefined) => {
        return `Rs. ${amount?.toLocaleString() || "0"}`;
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    };
    
    const showToast = (message: string, isError = false) => {
        Alert.alert(isError ? "Error" : "Success", message);
    };

    // --- MOCK DATA FETCH ---
    const fetchUserOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Simulate network call delay
            await new Promise(resolve => setTimeout(resolve, 800));
            
            setOrders(DUMMY_ORDERS.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (err: any) {
            setError("Error loading orders from mock API.");
        } finally {
            setLoading(false);
        }
    };

    // --- CANCEL ORDER (MOCK) ---
    const cancelOrder = (orderId: string) => {
        if (!orders.find(o => o._id === orderId)) return;
        
        Alert.alert(
            "Cancel Order",
            "Are you sure you want to cancel this order?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: () => {
                    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
                    showToast("Order cancelled successfully (Mock)");
                } },
            ]
        );
    };

    useEffect(() => {
        fetchUserOrders();
    }, []);

    // --- RENDER FUNCTIONS ---

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{marginTop: 10, color: '#4b5563'}}>Loading orders...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Error Loading Orders</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchUserOrders} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
            <View style={styles.header}>
                <Text style={styles.pageTitle}>My Orders</Text>
                <TouchableOpacity
                    onPress={() => router.push("/buyer/buyer-products")}
                    style={styles.continueShoppingButton}
                >
                    <Text style={styles.continueShoppingText}>Browse Products</Text>
                </TouchableOpacity>
            </View>

            {orders.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="basket-outline" size={60} color="#9ca3af" style={{marginBottom: 10}} />
                    <Text style={styles.emptyTitle}>No Orders Found</Text>
                    <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
                    <TouchableOpacity
                        onPress={() => router.push("/buyer/buyer-products")}
                        style={styles.browseButton}
                    >
                        <Text style={styles.browseButtonText}>Browse Products</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.ordersList}>
                    {orders.map((order) => {
                        const statusStyle = getStatusStyle(order.status);
                        return (
                            <View key={order._id} style={styles.orderCard}>
                                <View style={styles.orderHeader}>
                                    <View>
                                        <Text style={styles.orderId}>Order #{order._id.slice(-6).toUpperCase()}</Text>
                                        <Text style={styles.orderDate}>Placed on {formatDate(order.createdAt)}</Text>
                                    </View>
                                    <View style={styles.statusPriceContainer}>
                                        <Text style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor, color: statusStyle.color }]}>
                                            {order.status?.toUpperCase() || "PENDING"}
                                        </Text>
                                        <Text style={styles.totalPrice}>{formatCurrency(order.totalPrice)}</Text>
                                    </View>
                                </View>

                                <View style={styles.itemsSection}>
                                    {order.products?.map((product, index) => (
                                        <View key={product._id || index} style={styles.itemRow}>
                                            <View style={styles.itemImagePlaceholder}>
                                                <Ionicons name="image-outline" size={24} color="#9ca3af" />
                                            </View>
                                            <View style={styles.itemDetails}>
                                                <Text style={styles.itemName} numberOfLines={1}>{product.name || "Unknown Product"}</Text>
                                                <Text style={styles.itemQty}>Qty: {product.quantity || "1"}</Text>
                                            </View>
                                            <Text style={styles.itemSubtotal}>{formatCurrency((product.price || 0) * (product.quantity || 1))}</Text>
                                        </View>

                                    ))}
                                    
                                </View>
                                
                                
                                <View style={styles.footerActions}>
                                    <TouchableOpacity 
                                        onPress={() => showToast(`Viewing details for ${order._id}`)}
                                        style={styles.viewDetailButton}
                                    >
                                        <Text style={styles.viewDetailText}>View Details</Text>
                                    </TouchableOpacity>
                                    
                                    {order.status === "pending" && (
                                        <TouchableOpacity 
                                            onPress={() => cancelOrder(order._id)}
                                            style={styles.cancelButton}
                                        >
                                            <Text style={styles.cancelButtonText}>Cancel Order</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}
        </ScrollView>
    );
};

// --- STYLES ---

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    contentPadding: { padding: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 300 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
    continueShoppingButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    continueShoppingText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
    // Empty State & Error
    emptyContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        marginTop: 30,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    emptyTitle: { fontSize: 20, fontWeight: '600', color: '#374151', marginBottom: 5 },
    emptyText: { fontSize: 14, color: '#6b7280', marginBottom: 20 },
    browseButton: { backgroundColor: '#3b82f6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    browseButtonText: { color: 'white', fontWeight: 'bold' },
    errorBox: {
        backgroundColor: '#fee2e2',
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
        padding: 16,
        margin: 16,
        borderRadius: 8,
    },
    errorTitle: { fontWeight: 'bold', color: '#dc2626', marginBottom: 5 },
    errorText: { color: '#dc2626', fontSize: 14 },
    retryButton: {
        marginTop: 10, backgroundColor: '#dc2626', padding: 8, borderRadius: 6, alignSelf: 'flex-start',
    },
    retryButtonText: { color: 'white', fontWeight: '600' },
    // Order Cards
    ordersList: { gap: 15 },
    orderCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
        marginBottom: 10,
    },
    orderId: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
    orderDate: { fontSize: 12, color: '#6b7280' },
    statusPriceContainer: { alignItems: 'flex-end' },
    statusBadge: {
        fontSize: 10,
        fontWeight: '700',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        marginBottom: 5,
    },
    totalPrice: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
    // Items
    itemsSection: { marginBottom: 15 },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    itemImagePlaceholder: {
        width: 40,
        height: 40,
        backgroundColor: '#e5e7eb',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    itemDetails: { flex: 1 },
    itemName: { fontSize: 14, fontWeight: '500', color: '#1f2937' },
    itemQty: { fontSize: 12, color: '#6b7280' },
    itemSubtotal: { fontSize: 14, fontWeight: '600', color: '#059669' },
    // Footer Actions
    footerActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 5,
    },
    viewDetailButton: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#3b82f6',
    },
    viewDetailText: {
        color: '#3b82f6',
        fontWeight: '600',
        fontSize: 14,
    },
    cancelButton: {
        backgroundColor: '#ef4444',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    cancelButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
    },
});

export default BuyerMyOrdersScreen;