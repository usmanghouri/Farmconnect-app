// app/supplier/order-management.tsx

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
// Note: Removed Link/motion/AnimatePresence from imports to ensure compatibility

const { width, height } = Dimensions.get('window');

// --- INTERFACES ---
interface ProductItem {
    _id: string;
    name?: string;
    quantity?: number;
    price?: number;
    images?: string[];
    supplier?: { name?: string };
}

interface Order {
    _id: string;
    createdAt: string;
    status: "pending" | "processing" | "shipped" | "delivered" | "canceled";
    totalPrice: number;
    products: ProductItem[];
    shippingAddress: {
        street?: string; city?: string; zipCode?: string; phoneNumber?: string;
    };
    paymentInfo: {
        method: string;
        status: "completed" | "pending" | "failed";
    };
    deliveryInfo?: { notes?: string };
}

// --- DUMMY DATA ---
const DUMMY_ORDERS: Order[] = [
    { _id: 'ORD001', createdAt: new Date(Date.now() - 100000000).toISOString(), status: 'pending', totalPrice: 1500, products: [{ _id: 'P1', name: 'Wheat Seeds', price: 150, quantity: 10, images: [''] }], shippingAddress: { street: '123 Main St', city: 'Lahore', phoneNumber: '03001234567' }, paymentInfo: { method: 'cod', status: 'pending' }, deliveryInfo: { notes: 'Call before delivery.' } },
    { _id: 'ORD002', createdAt: new Date(Date.now() - 200000000).toISOString(), status: 'processing', totalPrice: 4500, products: [{ _id: 'P2', name: 'Fertilizer', price: 4500, quantity: 1, images: [''] }], shippingAddress: { street: '456 Oak Ln', city: 'Karachi', phoneNumber: '03219876543' }, paymentInfo: { method: 'easypaisa', status: 'completed' } },
    { _id: 'ORD003', createdAt: new Date(Date.now() - 300000000).toISOString(), status: 'shipped', totalPrice: 800, products: [{ _id: 'P3', name: 'Small Tools', price: 800, quantity: 1, images: [''] }], shippingAddress: { street: '789 Pine Ave', city: 'Islamabad', phoneNumber: '03331122333' }, paymentInfo: { method: 'jazzcash', status: 'completed' } },
    { _id: 'ORD004', createdAt: new Date(Date.now() - 400000000).toISOString(), status: 'delivered', totalPrice: 2200, products: [{ _id: 'P4', name: 'Organic Pesticide', price: 1100, quantity: 2, images: [''] }], shippingAddress: { street: '22 Maple Rd', city: 'Lahore', phoneNumber: '03001234567' }, paymentInfo: { method: 'cod', status: 'completed' } },
    { _id: 'ORD005', createdAt: new Date(Date.now() - 500000000).toISOString(), status: 'canceled', totalPrice: 500, products: [{ _id: 'P5', name: 'Plant Pots', price: 500, quantity: 1, images: [''] }], shippingAddress: { street: '10 River Dr', city: 'Karachi', phoneNumber: '03219876543' }, paymentInfo: { method: 'cod', status: 'failed' } },
    ...Array.from({ length: 5 }).map((_, i) => ({ 
        _id: `ORD00${i + 6}`, 
        createdAt: new Date(Date.now() - (i + 6) * 50000000).toISOString(), 
        status: i % 2 === 0 ? 'pending' : 'processing' as const, 
        totalPrice: (i + 1) * 1000, 
        products: [{ _id: `P${i+6}`, name: `Item ${i+6}`, price: 1000, quantity: i+1, images: [''] }],
        shippingAddress: { street: `${i+1} Farm Lane`, city: 'Multan', phoneNumber: '03330000000' },
        paymentInfo: { method: 'cod', status: 'pending' },
    })),
];


const OrderManagementScreen = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderDetails, setShowOrderDetails] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;
    const router = useRouter();

    const formatCurrency = (amount: number | undefined) => `Rs. ${amount?.toLocaleString() || "0"}`;
    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    };

    const getStatusInfo = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending": return { color: "#92400e", bgColor: "#fef3c7", text: "Pending" };
            case "processing": return { color: "#1e40af", bgColor: "#bfdbfe", text: "Processing" };
            case "shipped": return { color: "#5b21b6", bgColor: "#ede9fe", text: "Shipped" };
            case "delivered": return { color: "#065f46", bgColor: "#d1fae5", text: "Delivered" };
            case "canceled": return { color: "#991b1b", bgColor: "#fee2e2", text: "Canceled" };
            default: return { color: "#4b5563", bgColor: "#e5e7eb", text: status };
        }
    };

    const showToast = (message: string, isError = false) => { Alert.alert(isError ? "Error" : "Success", message); };

    // --- MOCK DATA FETCH ---
    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 800));
        setOrders(DUMMY_ORDERS.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // --- MOCK STATUS CHANGE ---
    const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
        setOrders((prevOrders) =>
            prevOrders.map((order) =>
                order._id === orderId ? { ...order, status: newStatus } : order
            )
        );
        if (selectedOrder && selectedOrder._id === orderId) {
            setSelectedOrder((prev) => ({ ...prev!, status: newStatus }));
        }
        showToast(`Order ${orderId.slice(-4)} status set to ${newStatus} (Mock)`);
    };
    
    // --- UTILITY ---
    const viewOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setShowOrderDetails(true);
    };
    
    // --- FILTERING AND PAGINATION LOGIC ---
    const searchTermLower = searchTerm.toLowerCase();
    const filteredOrders = orders.filter((order) => {
        const matchesStatus = statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesSearch = 
            order._id.toLowerCase().includes(searchTermLower) ||
            order.products.some(p => p.name?.toLowerCase().includes(searchTermLower)) ||
            order.shippingAddress.city?.toLowerCase().includes(searchTermLower) ||
            order.shippingAddress.phoneNumber?.includes(searchTerm) ||
            order.shippingAddress.street?.toLowerCase().includes(searchTermLower);
        return matchesStatus && matchesSearch;
    });

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    
    const renderOrderRow = ({ item: order }: { item: Order }) => {
        const statusInfo = getStatusInfo(order.status);
        const paymentStatus = order.paymentInfo?.status || 'N/A';
        const paymentStyle = paymentStatus === 'completed' ? { color: '#065f46', backgroundColor: '#d1fae5' } : { color: '#92400e', backgroundColor: '#fef3c7' };
        
        return (
            <View style={styles.tableRow}>
                <Text style={[styles.cell, styles.cellId]}>{order._id.substring(0, 8)}...</Text>
                <View style={styles.cellProduct}>
                    <Text style={styles.productText} numberOfLines={1}>{order.products[0]?.name}</Text>
                    <Text style={styles.subText}>{order.products.length} items</Text>
                </View>
                <Text style={styles.cellDate}>{formatDate(order.createdAt)}</Text>
                <Text style={styles.cellTotal}>{formatCurrency(order.totalPrice)}</Text>
                <Text style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor, color: statusInfo.color }]}>
                    {statusInfo.text}
                </Text>
                <Text style={[styles.statusBadge, { backgroundColor: paymentStyle.backgroundColor, color: paymentStyle.color }]}>
                    {paymentStatus}
                </Text>
                <View style={styles.cellActions}>
                    <TouchableOpacity onPress={() => viewOrderDetails(order)} style={styles.actionButton}>
                        <Feather name="eye" size={18} color="#3b82f6" />
                    </TouchableOpacity>
                    <View style={styles.statusPickerWrapper}>
                         {/* We use a simple view/text mockup for status change since RN Pickers are complex inside tables */}
                         <Text style={[styles.statusChangeMock, {color: statusInfo.color}]}>{statusInfo.text}</Text>
                         {order.status !== 'delivered' && order.status !== 'canceled' && (
                             <TouchableOpacity 
                                onPress={() => handleStatusChange(order._id, order.status === 'pending' ? 'processing' : 'shipped')}
                                style={styles.statusCycleButton}
                             >
                                <Feather name="arrow-right" size={12} color="#fff" />
                             </TouchableOpacity>
                         )}
                    </View>
                </View>
            </View>
        );
    };

    // --- MODAL COMPONENT ---
    const OrderDetailsModal = () => (
        <Modal visible={showOrderDetails} transparent={true} animationType="fade" onRequestClose={() => setShowOrderDetails(false)}>
            <ScrollView contentContainerStyle={styles.modalScroll}>
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Order #{selectedOrder?._id.slice(-6)}</Text>
                        <TouchableOpacity onPress={() => setShowOrderDetails(false)}>
                            <Feather name="x" size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                    
                    {/* Details */}
                    <Text style={styles.detailSectionTitle}>ORDER INFORMATION</Text>
                    <View style={{gap: 5}}>
                        <Text>Status: {getStatusInfo(selectedOrder!.status).text}</Text>
                        <Text>Total: {formatCurrency(selectedOrder!.totalPrice)}</Text>
                    </View>
                    
                    <Text style={styles.detailSectionTitle}>CUSTOMER INFORMATION</Text>
                    <View style={{gap: 5}}>
                        <Text>Name: John Doe (Mock)</Text>
                        <Text>City: {selectedOrder!.shippingAddress.city}</Text>
                        <Text>Phone: {selectedOrder!.shippingAddress.phoneNumber}</Text>
                    </View>

                    <Text style={styles.detailSectionTitle}>ORDER ITEMS ({selectedOrder!.products.length})</Text>
                    {selectedOrder!.products.map((p, i) => (
                        <View key={i} style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#f3f4f6'}}>
                            <Text style={{fontWeight: '500'}}>{p.name}</Text>
                            <Text>{p.quantity} x {formatCurrency(p.price)}</Text>
                        </View>
                    ))}
                    
                    <TouchableOpacity style={styles.printButton} onPress={() => showToast("Printing invoice (Mock)")}>
                        <Feather name="printer" size={18} color="white" />
                        <Text style={styles.printButtonText}>Print Invoice</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Modal>
    );

    // --- RENDER ---
    if (loading) {
        return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#16a34a" /><Text style={{marginTop: 10}}>Loading data...</Text></View>;
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <View style={styles.errorAlert}>
                    <Feather name="alert-circle" size={20} color="#dc2626" style={{marginRight: 10}}/>
                    <View style={{flex: 1}}>
                        <Text style={styles.errorTitle}>Error</Text>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity onPress={fetchOrders} style={styles.retryButton}>
                            <Feather name="refresh-cw" size={16} color="white" style={{marginRight: 5}}/>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
    
    return (
        <View style={styles.baseContainer}>
            <ScrollView contentContainerStyle={styles.contentPadding}>
                <View style={styles.dashboardHeader}>
                    <View>
                        <Text style={styles.pageTitle}>Order Management</Text>
                        <Text style={styles.subTitle}>Manage and track all your orders</Text>
                    </View>
                    <TouchableOpacity onPress={fetchOrders} style={styles.refreshButton}>
                        <Feather name="refresh-cw" size={20} color="white" />
                        <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>

                {/* Filters and Search */}
                <View style={styles.filterBar}>
                    <View style={styles.searchContainer}>
                        <Feather name="search" size={18} color="#9ca3af" style={{ marginRight: 8 }} />
                        <TextInput
                            placeholder="Search by ID, product, city, or phone..."
                            style={styles.searchInput}
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                    </View>

                    <TouchableOpacity onPress={() => setIsFilterOpen(!isFilterOpen)} style={styles.filterButton}>
                        <Feather name="filter" size={18} color="#4b5563" />
                        <Text style={{ marginLeft: 5 }}>Filter</Text>
                        <Feather name={isFilterOpen ? "chevron-up" : "chevron-down"} size={16} color="#4b5563" style={{ marginLeft: 5 }} />
                    </TouchableOpacity>
                </View>

                {isFilterOpen && (
                    <View style={styles.filterDropdown}>
                        <Text style={styles.filterTitle}>Order Status</Text>
                        <View style={styles.statusFilterGrid}>
                            {["all", "pending", "processing", "shipped", "delivered", "canceled"].map(s => (
                                <TouchableOpacity
                                    key={s}
                                    onPress={() => { setStatusFilter(s); setIsFilterOpen(false); }}
                                    style={[styles.filterOption, statusFilter === s && styles.filterOptionActive]}
                                >
                                    <Text style={[styles.filterOptionText, statusFilter === s && { color: 'white' }]}>{getStatusInfo(s).text}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
                
                {/* Orders List */}
                <View style={styles.orderListCard}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.headerCell, { flex: 1.2 }]}>ID</Text>
                        <Text style={[styles.headerCell, { flex: 2.5 }]}>Products</Text>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>Date</Text>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>Total</Text>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>Status</Text>
                        <Text style={[styles.headerCell, { flex: 1.5 }]}>Payment</Text>
                        <Text style={[styles.headerCell, { flex: 1.2, textAlign: 'right' }]}>Actions</Text>
                    </View>
                    
                    {currentOrders.length > 0 ? (
                        <FlatList
                            data={currentOrders}
                            renderItem={renderOrderRow}
                            keyExtractor={item => item._id}
                            scrollEnabled={false}
                            contentContainerStyle={styles.flatlistContent}
                            ListFooterComponent={<View style={styles.paginationSpacer} />}
                        />
                    ) : (
                        <View style={styles.noOrdersContainer}>
                            <Feather name="file-text" size={40} color="#9ca3af" />
                            <Text style={styles.noOrdersText}>No orders found matching criteria.</Text>
                        </View>
                    )}
                </View>
                
                {/* Pagination (Simplified) */}
                {totalPages > 1 && (
                    <View style={styles.paginationContainer}>
                        <TouchableOpacity 
                            onPress={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            style={[styles.paginationButton, currentPage === 1 && styles.paginationDisabled]}
                        >
                            <Text style={styles.paginationText}>Previous</Text>
                        </TouchableOpacity>
                        <Text style={styles.paginationText}>
                            Page {currentPage} of {totalPages}
                        </Text>
                        <TouchableOpacity 
                            onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            style={[styles.paginationButton, currentPage === totalPages && styles.paginationDisabled]}
                        >
                            <Text style={styles.paginationText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
            {selectedOrder && <OrderDetailsModal />}
        </View>
    );
};

// --- STYLES ---

const styles = StyleSheet.create({
    baseContainer: { flex: 1, backgroundColor: '#f3f4f6' },
    contentPadding: { padding: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 300 },
    errorContainer: { padding: 16 },
    errorAlert: { flexDirection: 'row', backgroundColor: '#fee2e2', borderLeftWidth: 4, borderLeftColor: '#ef4444', padding: 15, borderRadius: 8 },
    errorTitle: { fontWeight: 'bold', color: '#dc2626' },
    errorText: { color: '#dc2626', fontSize: 13, marginTop: 5 },
    retryButton: { marginTop: 10, backgroundColor: '#dc2626', padding: 8, borderRadius: 6, flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start' },
    retryButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
    
    dashboardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
    subTitle: { fontSize: 14, color: '#6b7280' },
    refreshButton: { backgroundColor: '#16a34a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 5 },
    refreshButtonText: { color: 'white', fontWeight: '600' },

    // Filters and Search
    filterBar: { flexDirection: 'row', gap: 10, marginBottom: 15 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 10 },
    searchInput: { flex: 1, height: 40, fontSize: 14 },
    filterButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
    filterDropdown: { backgroundColor: 'white', borderRadius: 8, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#d1d5db' },
    filterTitle: { fontSize: 14, fontWeight: '600', color: '#1f2937', marginBottom: 10 },
    statusFilterGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    filterOption: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15 },
    filterOptionActive: { backgroundColor: '#16a34a' },
    filterOptionText: { fontSize: 13, color: '#4b5563', textTransform: 'capitalize' },

    // Orders List Table
    orderListCard: { backgroundColor: 'white', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, overflow: 'hidden' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#f9fafb', paddingHorizontal: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    headerCell: { fontSize: 10, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' },
    tableRow: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', alignItems: 'center' },
    cell: { flex: 1, fontSize: 13, color: '#374151' },
    cellProduct: { flex: 2.5, justifyContent: 'center' },
    cellId: { flex: 1.2, fontWeight: '600' },
    cellDate: { flex: 1.5, fontSize: 12, color: '#6b7280' },
    cellTotal: { flex: 1.5, fontWeight: 'bold' },
    productText: { fontSize: 13, color: '#1f2937' },
    subText: { fontSize: 11, color: '#9ca3af' },
    statusBadge: { fontSize: 10, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 10, alignSelf: 'flex-start', marginHorizontal: 2, textTransform: 'capitalize' },
    cellActions: { flexDirection: 'row', flex: 1.2, justifyContent: 'flex-end', alignItems: 'center', gap: 5 },
    actionButton: { padding: 5 },
    statusPickerWrapper: { 
        height: 30, 
        width: 60, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#16a34a',
        borderRadius: 5,
        position: 'relative'
    },
    statusChangeMock: { 
        fontSize: 12, 
        color: '#fff',
        paddingHorizontal: 8,
        fontWeight: 'bold',
    },
    statusCycleButton: {
        backgroundColor: '#059669',
        padding: 5,
        borderRadius: 5,
        marginLeft: 5
    },

    // Pagination
    paginationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, paddingHorizontal: 10 },
    paginationButton: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6 },
    paginationDisabled: { opacity: 0.5 },
    paginationText: { fontSize: 14, color: '#4b5563' },

    // Modal Styles
    modalScroll: { flexGrow: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 15, width: '100%', maxWidth: 600, alignSelf: 'center', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e5e7eb', paddingBottom: 10, marginBottom: 15 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
    detailSectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#6b7280', marginTop: 15, marginBottom: 5 },
    printButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16a34a', padding: 10, borderRadius: 8, alignSelf: 'flex-end', marginTop: 15, gap: 5 },
    printButtonText: { color: 'white', fontWeight: '600' },
    noOrdersContainer: { padding: 40, alignItems: 'center' },
    noOrdersText: { marginTop: 10, color: '#6b7280' },
    flatlistContent: { paddingBottom: 10 },
    paginationSpacer: { height: 50 },
});

export default OrderManagementScreen;