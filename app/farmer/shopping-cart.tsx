import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
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
    View
} from "react-native";

const { width, height } = Dimensions.get('window');

// --- INTERFACES ---
interface CartItem {
    _id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    images: string[];
    supplier: {
        userID: string;
    }
}

interface CheckoutForm {
    fullName: string;
    phoneNumber: string;
    street: string;
    city: string;
    zipCode: string;
    notes: string;
    paymentMethod: "cash-on-delivery" | "easypaisa" | "jazzcash";
}

// --- API ENDPOINTS (As per your previous React JS code) ---
const CART_API = "https://agrofarm-vd8i.onrender.com/api/cart/add"; // Used implicitly
const MY_CART_API = "https://agrofarm-vd8i.onrender.com/api/cart/my-cart";
const UPDATE_CART_API = "https://agrofarm-vd8i.onrender.com/api/cart/update";
const CLEAR_CART_BASE_API = "https://agrofarm-vd8i.onrender.com/api/cart/clear";
const REMOVE_ITEM_BASE_API = "https://agrofarm-vd8i.onrender.com/api/cart/item";
const PLACE_ORDER_API = "https://agrofarm-vd8i.onrender.com/api/v1/order/place-order";


const ShoppingCartScreen = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCheckoutModal, setShowCheckoutModal] = useState(false);
    const [cartId, setCartId] = useState<string | null>(null);
    const router = useRouter();

    const [checkoutForm, setCheckoutForm] = useState<CheckoutForm>({
        fullName: "", phoneNumber: "", street: "", city: "", zipCode: "", notes: "", paymentMethod: "cash-on-delivery",
    });

    const formatCurrency = (amount: number) => `Rs. ${amount.toLocaleString()}`;

    const showToast = (message: string, isError = false) => {
        Alert.alert(isError ? "Error" : "Success", message);
    };

    const handleInputChange = (name: keyof CheckoutForm, value: string) => {
        setCheckoutForm((prev) => ({ ...prev, [name]: value }));
    };

    // --- FETCH CART ---
    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get(MY_CART_API, { withCredentials: true });
            
            const cart = response.data.cart;
            setCartItems(cart?.products || []);
            setCartId(cart?._id);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Failed to fetch cart items");
        } finally {
            setLoading(false);
        }
    };

    // --- UPDATE QUANTITY ---
    const updateQuantity = async (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        if (!cartId) {
            showToast("No cart found", true);
            return;
        }

        try {
            const response = await axios.put(
                UPDATE_CART_API,
                { cartId, productId: id, quantity: newQuantity },
                { withCredentials: true }
            );

            if (response.status !== 200) {
                throw new Error(response.data.message || "Failed to update quantity");
            }
            
            showToast("Quantity updated successfully");
            fetchCartItems(); 
        } catch (err: any) {
            showToast(err.message || "Failed to update quantity", true);
        }
    };

    // --- REMOVE ITEM ---
    const removeItem = async (id: string) => {
        if (!cartId) {
            showToast("No cart found", true);
            return;
        }

        try {
            // Using axios.delete with a `data` property to send the cartId in the body (Axios standard)
            const response = await axios.delete(
                `${REMOVE_ITEM_BASE_API}/${id}`, 
                { data: { cartId }, withCredentials: true }
            );

            if (response.status !== 200) {
                throw new Error(response.data.message || "Failed to remove item");
            }
            
            showToast("Item removed successfully");
            fetchCartItems(); 
        } catch (err: any) {
            showToast(err.message || "Failed to remove item", true);
        }
    };

    // --- CLEAR CART ---
    const HandleClearCart = async () => {
        if (!cartId) {
            showToast("No cart found to clear", true);
            return;
        }
        
        Alert.alert(
            "Clear Cart",
            "Are you sure you want to clear your entire shopping cart?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", style: "destructive", onPress: async () => {
                    try {
                        const response = await axios.delete(
                            `${CLEAR_CART_BASE_API}/${cartId}`,
                            { withCredentials: true }
                        );

                        if (response.status !== 200) {
                            throw new Error(response.data.message || "Failed to clear cart");
                        }

                        showToast("Cart is cleared successfully.");
                        fetchCartItems();
                    } catch (err: any) {
                        showToast(err.message || "Failed to clear cart", true);
                    }
                }},
            ]
        );
    };

    // --- PLACE ORDER ---
    const placeOrder = async () => {
        if (!cartId) {
            showToast("No cart found.", true);
            return;
        }
        
        // Simple client-side validation
        if (!checkoutForm.fullName || !checkoutForm.phoneNumber || !checkoutForm.street || !checkoutForm.city) {
            Alert.alert("Validation Error", "Please fill out all required shipping fields.");
            return;
        }

        try {
            const response = await axios.post(
                PLACE_ORDER_API,
                {
                    cartId: cartId,
                    paymentMethod: checkoutForm.paymentMethod,
                    street: checkoutForm.street,
                    city: checkoutForm.city,
                    zipCode: checkoutForm.zipCode,
                    phoneNumber: checkoutForm.phoneNumber,
                    notes: checkoutForm.notes,
                },
                { withCredentials: true }
            );

            if (response.status !== 200) {
                throw new Error(response.data.message || "Failed to place order");
            }

            showToast("Order placed successfully!");
            setShowCheckoutModal(false);
            router.replace("/farmer/my-orders");
        } catch (err: any) {
            showToast(err.message || "Failed to place order. Please try again.", true);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#16a34a" />
                <Text style={{marginTop: 10, color: '#4b5563'}}>Loading cart...</Text>
            </View>
        );
    }

    if (error && cartItems.length === 0) {
        return (
            <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Error Loading Cart</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchCartItems} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // --- Checkout Modal Component (Embedded) ---
    const CheckoutModal = () => (
        <Modal
            visible={showCheckoutModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCheckoutModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <ScrollView contentContainerStyle={styles.modalScroll}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Checkout</Text>
                            <TouchableOpacity onPress={() => setShowCheckoutModal(false)} style={{padding: 5}}>
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Shipping Information */}
                        <Text style={styles.formSectionTitle}>Shipping Information</Text>
                        <View style={styles.formGrid}>
                            <TextInput style={styles.input} placeholder="Full Name" value={checkoutForm.fullName} onChangeText={(text) => handleInputChange('fullName', text)} autoCorrect={false} />
                            <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={checkoutForm.phoneNumber} onChangeText={(text) => handleInputChange('phoneNumber', text)} autoCorrect={false} />
                            <TextInput style={styles.input} placeholder="Street Address" value={checkoutForm.street} onChangeText={(text) => handleInputChange('street', text)} autoCorrect={false} />
                            <TextInput style={styles.input} placeholder="City" value={checkoutForm.city} onChangeText={(text) => handleInputChange('city', text)} autoCorrect={false} />
                            <TextInput style={styles.input} placeholder="ZIP Code" keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'default'} value={checkoutForm.zipCode} onChangeText={(text) => handleInputChange('zipCode', text)} autoCorrect={false} />
                            <TextInput 
                                style={[styles.input, styles.textArea]} 
                                placeholder="Delivery Notes (Optional)" 
                                multiline 
                                value={checkoutForm.notes} 
                                onChangeText={(text) => handleInputChange('notes', text)} 
                                autoCorrect={false} 
                            />
                        </View>
                        
                        {/* Payment Method */}
                        <Text style={styles.formSectionTitle}>Payment Method</Text>
                        <View style={styles.paymentContainer}>
                            {['cash-on-delivery', 'easypaisa', 'jazzcash'].map(method => (
                                <TouchableOpacity
                                    key={method}
                                    style={styles.paymentOption}
                                    onPress={() => handleInputChange('paymentMethod', method as CheckoutForm['paymentMethod'])}
                                >
                                    <View style={styles.radioContainer}>
                                        <View style={[styles.radioOuter, checkoutForm.paymentMethod === method && styles.radioOuterActive]}>
                                            {checkoutForm.paymentMethod === method && <View style={styles.radioInner} />}
                                        </View>
                                    </View>
                                    <View>
                                        <Text style={styles.paymentTitle}>{method.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</Text>
                                        <Text style={styles.paymentSubtitle}>
                                            {method === 'cash-on-delivery' ? 'Pay when you receive your order' : 'Mobile wallet payment'}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Order Summary in Modal */}
                        <View style={styles.modalSummary}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryTotalText}>Total Amount</Text>
                                <Text style={styles.summaryTotalValue}>{formatCurrency(total)}</Text>
                            </View>
                        </View>
                        
                        {/* Buttons */}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity onPress={() => setShowCheckoutModal(false)} style={styles.modalCancelButton}>
                                <Text style={styles.modalCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={placeOrder} style={styles.modalPlaceOrderButton}>
                                <Text style={styles.modalPlaceOrderText}>Place Order</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
    // --- End Checkout Modal Component ---

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentPadding}>
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>Your Shopping Cart</Text>
                    {cartItems.length > 0 && (
                        <TouchableOpacity
                            onPress={HandleClearCart}
                            style={styles.clearCartButton}
                        >
                            <Text style={styles.clearCartText}>Clear Cart</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {cartItems.length > 0 ? (
                    <View style={styles.cartContent}>
                        {/* Cart Items */}
                        <View style={styles.itemsListContainer}>
                            {cartItems.map((item) => (
                                <View key={item._id} style={styles.itemCard}>
                                    <View style={styles.itemImageContainer}>
                                        {item.images?.[0] ? (
                                            <Image source={{ uri: item.images[0] }} style={styles.itemImage} resizeMode="cover" />
                                        ) : (
                                            <Ionicons name="image-outline" size={40} color="#9ca3af" />
                                        )}
                                    </View>

                                    <View style={styles.itemDetailsArea}>
                                        <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                        <Text style={styles.itemSupplier}>Supplier: {item.supplier?.userID || 'N/A'}</Text>
                                        <Text style={styles.itemPricePerUnit}>{formatCurrency(item.price)} / unit</Text>
                                    </View>

                                    <View style={styles.quantityControl}>
                                        <View style={styles.quantityButtons}>
                                            <TouchableOpacity onPress={() => updateQuantity(item.productId, item.quantity - 1)} style={styles.qtyButton}>
                                                <Text style={styles.qtyButtonText}>-</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.qtyText}>{item.quantity}</Text>
                                            <TouchableOpacity onPress={() => updateQuantity(item.productId, item.quantity + 1)} style={styles.qtyButton}>
                                                <Text style={styles.qtyButtonText}>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <Text style={styles.itemSubtotalValue}>{formatCurrency(item.price * item.quantity)}</Text>
                                        <TouchableOpacity onPress={() => removeItem(item._id)} style={styles.removeItemButton}>
                                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                        </TouchableOpacity>
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
                                <TouchableOpacity
                                    onPress={() => setShowCheckoutModal(true)}
                                    style={styles.checkoutButton}
                                >
                                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => router.push("/farmer/farmer-products")}
                                    style={styles.continueButton}
                                >
                                    <Text style={styles.continueButtonText}>Continue Shopping</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cart-outline" size={60} color="#9ca3af" style={{marginBottom: 10}}/>
                        <Text style={styles.emptyTitle}>Your cart is empty</Text>
                        <Text style={styles.emptyText}>Add some items to start your order.</Text>
                        <TouchableOpacity
                            onPress={() => router.push("/farmer/farmer-products")}
                            style={styles.browseButton}
                        >
                            <Text style={styles.browseButtonText}>Browse Products</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
            <CheckoutModal />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    contentPadding: { padding: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 300 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#16a34a' },
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
    
    // Item Card Styles
    itemCard: { flexDirection: 'row', backgroundColor: 'white', borderRadius: 12, padding: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, alignItems: 'center', gap: 10 },
    itemImageContainer: { width: 80, height: 80, backgroundColor: '#e5e7eb', borderRadius: 8, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    itemImage: { width: '100%', height: '100%' },
    itemDetailsArea: { flex: 1 },
    itemName: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
    itemSupplier: { fontSize: 12, color: '#6b7280' },
    itemPricePerUnit: { fontSize: 14, fontWeight: '500', color: '#059669', marginTop: 5 },
    quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    quantityButtons: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, overflow: 'hidden' },
    qtyButton: { paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#f3f4f6' },
    qtyButtonText: { fontSize: 16, fontWeight: 'bold', color: '#4b5563' },
    qtyText: { paddingHorizontal: 10, fontSize: 16, color: '#1f2937' },
    itemSubtotalValue: { fontSize: 16, fontWeight: 'bold', color: '#1f2937' },
    removeItemButton: { marginLeft: 10, padding: 5, borderRadius: 20 },

    // Summary Card Styles
    summaryCard: { backgroundColor: 'white', borderRadius: 12, padding: 20, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, elevation: 3 },
    summaryTitle: { fontSize: 20, fontWeight: '600', color: '#1f2937', marginBottom: 20 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    summaryTotalText: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
    summaryTotalValue: { fontSize: 18, fontWeight: 'bold', color: '#059669' },
    checkoutButton: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 10 },
    checkoutButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    continueButton: { backgroundColor: '#e5e7eb', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db' },
    continueButtonText: { color: '#4b5563', fontWeight: 'bold', fontSize: 16 },
    
    // Empty State
    emptyContainer: { backgroundColor: 'white', borderRadius: 12, padding: 40, alignItems: 'center', marginTop: 30 },
    emptyTitle: { fontSize: 24, fontWeight: '600', color: '#374151', marginBottom: 5 },
    emptyText: { fontSize: 16, color: '#6b7280', marginBottom: 20 },
    browseButton: { backgroundColor: '#16a34a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    browseButtonText: { color: 'white', fontWeight: 'bold' },
    
    // Modal Styles
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContent: { backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: height * 0.95, width: '100%' },
    modalScroll: { padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
    formSectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 15, marginTop: 15 },
    formGrid: { gap: 10 },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, backgroundColor: 'white', fontSize: 14 },
    textArea: { height: 80, textAlignVertical: 'top' },
    paymentContainer: { gap: 10 },
    paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', padding: 15, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb' },
    radioContainer: { marginRight: 15 },
    radioOuter: { height: 20, width: 20, borderRadius: 10, borderWidth: 2, borderColor: '#16a34a', alignItems: 'center', justifyContent: 'center' },
    radioOuterActive: { borderColor: '#16a34a' },
    radioInner: { height: 10, width: 10, borderRadius: 5, backgroundColor: '#16a34a' },
    paymentTitle: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
    paymentSubtitle: { fontSize: 12, color: '#6b7280' },
    modalSummary: { paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#e5e7eb', marginTop: 15 },
    modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, paddingTop: 10 },
    modalCancelButton: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center' },
    modalCancelText: { color: '#6b7280', fontWeight: '600' },
    modalPlaceOrderButton: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, backgroundColor: '#10b981', alignItems: 'center' },
    modalPlaceOrderText: { color: 'white', fontWeight: '600' },
});

export default ShoppingCartScreen;