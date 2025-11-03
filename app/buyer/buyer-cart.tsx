// app/buyer/buyer-cart.tsx

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient'; // Required for gradient background
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get('window');

// --- INTERFACES & DUMMY DATA ---
interface CartItem {
    _id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    images: string[];
    supplier: { userID: string; }
}

interface CheckoutForm {
    fullName: string; phoneNumber: string; street: string; city: string; 
    zipCode: string; notes: string; paymentMethod: "cash-on-delivery" | "easypaisa" | "jazzcash";
}

const DUMMY_CART_ITEMS: CartItem[] = [
    { _id: 'C1', productId: 'P1', name: 'Premium Wheat Seeds', price: 1500, quantity: 2, images: [''], supplier: { userID: 'FARMER-A' } },
    { _id: 'C2', productId: 'P2', name: 'Organic Fertilizer', price: 800, quantity: 5, images: [''], supplier: { userID: 'SUPPLIER-B' } },
];

// --- GRADIENT WRAPPER ---
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

const BuyerCartScreen = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [cartId, setCartId] = useState<string | null>('MOCK_CART_ID'); 
    const router = useRouter();

    const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
        fullName: "", phoneNumber: "", street: "", city: "", zipCode: "", notes: "", paymentMethod: "cash-on-delivery",
    });

    const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

    const showToast = (message: string, isError = false) => { Alert.alert(isError ? "Error" : "Success", message); };
    const handleInputChange = (name: keyof CheckoutForm, value: string) => { setCheckoutForm((prev) => ({ ...prev, [name]: value })); };

    // --- MOCK LOGIC ---
    const fetchCartItems = async () => {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 500));
        setCartItems(DUMMY_CART_ITEMS);
        setLoading(false);
    };

    const updateQuantity = async (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCartItems(prev => prev.map(item => item.productId === id ? { ...item, quantity: newQuantity } : item));
        showToast("Quantity updated (Mock)");
    };

    const removeItem = async (id: string) => {
        setCartItems(prev => prev.filter(item => item.productId !== id));
        showToast("Item removed (Mock)");
    };

    const HandleClearCart = async () => {
        Alert.alert("Clear Cart", "Are you sure?", 
            [{ text: "No", style: "cancel" }, { text: "Yes", onPress: () => { setCartItems([]); showToast("Cart cleared (Mock)"); } }]
        );
    };

    const placeOrder = async () => {
        if (!checkoutForm.fullName || !checkoutForm.phoneNumber) {
            Alert.alert("Validation", "Please fill in Name and Phone.");
            return;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        showToast("Order Placed Successfully! (Mock)");
        setShowCheckoutModal(false);
        setCartItems([]); 
        router.replace("/buyer/my-orders");
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // --- Checkout Modal Component (Embedded) ---
    const CheckoutModal = () => (
        <Modal visible={showCheckoutModal} transparent={true} animationType="slide" onRequestClose={() => setShowCheckoutModal(false)}>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Checkout</Text>
                            <TouchableOpacity onPress={() => setShowCheckoutModal(false)} style={{padding: 5}}><Ionicons name="close" size={24} color="#6b7280" /></TouchableOpacity>
                        </View>
                        <Text style={styles.formSectionTitle}>Shipping Information</Text>
                        <View style={styles.formGrid}>
                            <TextInput style={styles.input} placeholder="Full Name" value={checkoutForm.fullName} onChangeText={(text) => handleInputChange('fullName', text)} autoCorrect={false} />
                            <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={checkoutForm.phoneNumber} onChangeText={(text) => handleInputChange('phoneNumber', text)} autoCorrect={false} />
                            <TextInput style={styles.input} placeholder="Street Address" value={checkoutForm.street} onChangeText={(text) => handleInputChange('street', text)} autoCorrect={false} />
                            <TextInput style={styles.input} placeholder="City" value={checkoutForm.city} onChangeText={(text) => handleInputChange('city', text)} autoCorrect={false} />
                            <TextInput style={styles.input} placeholder="ZIP Code" keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'} value={checkoutForm.zipCode} onChangeText={(text) => handleInputChange('zipCode', text)} autoCorrect={false} />
                            <TextInput style={[styles.input, styles.textArea]} placeholder="Delivery Notes (Optional)" multiline value={checkoutForm.notes} onChangeText={(text) => handleInputChange('notes', text)} autoCorrect={false} />
                        </View>
                        <Text style={styles.formSectionTitle}>Payment Method</Text>
                        <View style={styles.paymentContainer}>
                            {['cash-on-delivery', 'easypaisa', 'jazzcash'].map(method => (
                                <TouchableOpacity key={method} style={styles.paymentOption} onPress={() => handleInputChange('paymentMethod', method as CheckoutForm['paymentMethod'])}>
                                    <View style={styles.radioContainer}>
                                        <View style={[styles.radioOuter, checkoutForm.paymentMethod === method && styles.radioOuterActive]}>
                                            {checkoutForm.paymentMethod === method && <View style={styles.radioInner} />}
                                        </View>
                                    </View>
                                    <View><Text style={styles.paymentTitle}>{method.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</Text><Text style={styles.paymentSubtitle}>
                                            {method === 'cash-on-delivery' ? 'Pay when you receive your order' : 'Mobile wallet payment'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.modalSummary}><View style={styles.summaryRow}><Text style={styles.summaryTotalText}>Total Amount</Text><Text style={styles.summaryTotalValue}>{formatCurrency(total)}</Text></View></View>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setShowCheckoutModal(false)} style={styles.modalCancelButton}><Text style={styles.modalCancelText}>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity onPress={placeOrder} style={styles.modalPlaceOrderButton}><Text style={styles.modalPlaceOrderText}>Place Order</Text></TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
    // --- End Checkout Modal Component ---

    if (loading) { return (<View style={styles.loadingContainer}><ActivityIndicator size="large" color="#3b82f6" /><Text style={{marginTop: 10, color: '#4b5563'}}>Loading cart...</Text></View>); }
    if (error) { return (<View style={styles.errorBox}><Text style={styles.errorTitle}>Error</Text><Text style={styles.errorText}>{error}</Text><TouchableOpacity onPress={fetchCartItems} style={styles.retryButton}><Text style={styles.retryButtonText}>Retry</Text></TouchableOpacity></View>); }

    return (
        <GradientBackground> {/* NEW: Gradient Background Wrapper */}
            <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentPadding}>
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>Your Shopping Cart</Text>
                    {cartItems.length > 0 && (
                        <TouchableOpacity onPress={HandleClearCart} style={styles.clearCartButton}><Text style={styles.clearCartText}>Clear Cart</Text></TouchableOpacity>
                    )}
                </View>

                {cartItems.length > 0 ? (
                    <View style={styles.cartContent}>
                        {/* Cart Items */}
                        <View style={styles.itemsListContainer}>
                            {cartItems.map((item) => (
                                <View key={item._id} style={styles.itemCard}>
                                    <View style={styles.itemImageContainer}>
                                        {item.images?.[0] ? (<Image source={{ uri: item.images[0] }} style={styles.itemImage} resizeMode="cover" />) : (<Ionicons name="image-outline" size={40} color="#9ca3af" />)}
                                    </View>
                                    <View style={styles.itemDetailsArea}>
                                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.itemSupplier}>Supplier: {item.supplier?.userID || 'N/A'}</Text>
                                        <Text style={styles.itemPricePerUnit}>{formatCurrency(item.price)} / unit</Text>
                                    </View>
                                    <View style={styles.quantityControl}>
                                        <View style={styles.quantityButtons}>
                                            <TouchableOpacity onPress={() => updateQuantity(item.productId, item.quantity - 1)} style={styles.qtyButton}><Text style={styles.qtyButtonText}>-</Text></TouchableOpacity>
                                            <Text style={styles.qtyText}>{item.quantity}</Text>
                                            <TouchableOpacity onPress={() => updateQuantity(item.productId, item.quantity + 1)} style={styles.qtyButton}><Text style={styles.qtyButtonText}>+</Text></TouchableOpacity>
                                        </View>
                                        <Text style={styles.itemSubtotalValue}>{formatCurrency(item.price * item.quantity)}</Text>
                                        <TouchableOpacity onPress={() => removeItem(item.productId)} style={styles.removeItemButton}><Ionicons name="trash-outline" size={20} color="#ef4444" /></TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* Order Summary */}
                        <View style={styles.summaryContainer}>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryTitle}>Order Summary</Text>
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryTotalText}>Total</Text>
                                    <Text style={styles.summaryTotalValue}>{formatCurrency(total)}</Text>
                                </View>
                                <TouchableOpacity onPress={() => setShowCheckoutModal(true)} style={styles.checkoutButton}><Text style={styles.checkoutButtonText}>Proceed to Checkout</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => router.push("/buyer/buyer-products")} style={styles.continueButton}><Text style={styles.continueButtonText}>Continue Shopping</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={60} color="#9ca3af" style={{marginBottom: 10}}/>
                        <Text style={styles.emptyTitle}>Your cart is empty</Text>
                        <Text style={styles.emptyText}>Add some items to start your order.</Text>
                        <TouchableOpacity onPress={() => router.push("/buyer/buyer-products")} style={styles.browseButton}><Text style={styles.browseButtonText}>Browse Products</Text></TouchableOpacity>
                    </View>
                )}
            </ScrollView>
            <CheckoutModal />
        </GradientBackground>
    );
};

const styles = StyleSheet.create({
    // NEW: Gradient Wrapper and ScrollView background
    gradientWrapper: { flex: 1 }, 
    contentScrollView: { flex: 1, backgroundColor: 'transparent' }, 
    
    container: { flex: 1, backgroundColor: '#f9fafb' }, // This BG is now hidden by the gradient
    contentPadding: { padding: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 300 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' }, // Adjusted to dark text for contrast

    clearCartButton: { backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    clearCartText: { color: 'white', fontSize: 14, fontWeight: '600' },
    errorBox: { backgroundColor: '#fee2e2', borderLeftWidth: 4, borderLeftColor: '#ef4444', padding: 16, margin: 16, borderRadius: 8 },
    errorTitle: { fontWeight: 'bold', color: '#dc2626', marginBottom: 5 },
    errorText: { color: '#dc2626', fontSize: 14 },
    retryButton: { marginTop: 10, backgroundColor: '#dc2626', padding: 8, borderRadius: 6, alignSelf: 'flex-start' },
    retryButtonText: { color: 'white', fontWeight: '600' },
    
    cartContent: { flexDirection: width > 768 ? 'row' : 'column', gap: 16 },
    itemsListContainer: { flex: 1, gap: 10 },
    summaryContainer: { width: width > 768 ? 300 : '100%', marginTop: width > 768 ? 0 : 20, },
    
    // ITEM CARD STYLES (Enhanced separation)
    itemCard: { 
        flexDirection: 'row', 
        backgroundColor: 'white', 
        borderRadius: 12, 
        padding: 15, // Increased padding
        shadowColor: '#000', 
        shadowOpacity: 0.1, 
        shadowRadius: 5, 
        elevation: 5, // Clear lift
        alignItems: 'center', 
        gap: 15 
    },
    itemImageContainer: { width: 80, height: 80, backgroundColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    itemImage: { width: '100%', height: '100%' },
    itemDetailsArea: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
    itemSupplier: { fontSize: 12, color: '#6b7280' },
    itemPricePerUnit: { fontSize: 14, fontWeight: '600', color: '#059669', marginTop: 5 },
    
    // QUANTITY CONTROLS
    quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    quantityButtons: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#10b981', borderRadius: 8, overflow: 'hidden' }, // Green border
    qtyButton: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#d1fae5' }, // Light green background
    qtyButtonText: { fontSize: 16, fontWeight: 'bold', color: '#047857' }, // Dark green text
    qtyText: { paddingHorizontal: 10, fontSize: 16, color: '#1f2937' },
    itemSubtotalValue: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
    removeItemButton: { marginLeft: 10, padding: 5, borderRadius: 20 },

    // SUMMARY CARD
    summaryCard: { 
        backgroundColor: 'white', 
        borderRadius: 12, 
        padding: 20, 
        shadowColor: '#000', 
        shadowOpacity: 0.15, 
        shadowRadius: 6, 
        elevation: 8 
    },
    summaryTitle: { fontSize: 20, fontWeight: '700', color: '#1f2937', marginBottom: 20 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    summaryTotalText: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
    summaryTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#059669' },
    checkoutButton: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
    checkoutButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    continueButton: { backgroundColor: '#e5e7eb', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db' },
    continueButtonText: { color: '#4b5563', fontWeight: 'bold', fontSize: 16 },
    
    // EMPTY STATE
    emptyContainer: { 
        backgroundColor: 'white', 
        borderRadius: 12, 
        padding: 40, 
        alignItems: 'center', 
        marginTop: 30,
        shadowColor: '#000', 
        shadowOpacity: 0.1, 
        shadowRadius: 5, 
        elevation: 5 
    },
    emptyTitle: { fontSize: 24, fontWeight: '600', color: '#374151', marginBottom: 5 },
    emptyText: { fontSize: 16, color: '#6b7280', marginBottom: 20 },
    browseButton: { backgroundColor: '#059669', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }, // Darker green for primary action
    browseButtonText: { color: 'white', fontWeight: 'bold' },
    
    // MODAL STYLES (Minor tweaks)
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: height * 0.95, width: '100%' },
    modalScroll: { padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
    formSectionTitle: { fontSize: 18, fontWeight: '600', color: '#047857', marginBottom: 15, marginTop: 15 }, // Green tint
    formGrid: { gap: 10 },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, backgroundColor: 'white', fontSize: 14 },
    textArea: { height: 80, textAlignVertical: 'top' },
    paymentContainer: { gap: 10 },
    paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
    radioContainer: { marginRight: 15 },
    radioOuter: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#059669', alignItems: 'center', justifyContent: 'center' }, // Dark green radio
    radioOuterActive: { borderColor: '#059669' },
    radioInner: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#059669' },
    paymentTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
    paymentSubtitle: { fontSize: 12, color: '#6b7280' },
    modalSummary: { paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 15 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, paddingTop: 10 },
    modalCancelButton: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' },
    modalCancelText: { color: '#6b7280', fontWeight: '600' },
    modalPlaceOrderButton: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, backgroundColor: '#3b82f6', alignItems: 'center' },
    modalPlaceOrderText: { color: 'white', fontWeight: '600' },
});

export default BuyerCartScreen;