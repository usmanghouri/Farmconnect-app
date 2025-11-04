// app/buyer/buyer-products.tsx

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput, TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get('window');

import axios from "axios";
import { getAllProducts } from "../../utils/apiProducts";
interface Product {
    _id: string;
    name: string;
    description?: string;
    category?: string;
    price: number;
    unit?: string;
    isAvailable: boolean;
    images?: string[];
}

//

const categories = [
    { id: "all", name: "All Products" },
    { id: "fruits", name: "Fruits" },
    { id: "vegetables", name: "Vegetables" },
    { id: "crops", name: "Crops" },
    { id: "pesticides", name: "Pesticides" },
    { id: "fertilizer", name: "Fertilizer" },
];

const BuyerProductsScreen = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [wishlistItems, setWishlistItems] = useState<string[]>([]);
    const router = useRouter();

    const showToast = (message: string, isError = false) => {
        Alert.alert(isError ? "Error" : "Success", message);
    };

    const fetchProducts = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await getAllProducts();
            const list = Array.isArray(data?.products) ? data.products : [];
            setProducts(list);
        } catch (e: any) {
            setError(e?.message || 'Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId: string) => {
        try {
            const res = await axios.post('https://agrofarm-vd8i.onrender.com/api/cart/add', { productId, quantity: 1 }, { withCredentials: true });
            if (res.status !== 200) throw new Error(res.data?.message || 'Failed to add to cart');
            showToast(res.data?.message || 'Added to cart');
        } catch (e: any) {
            showToast(e?.message || 'Failed to add to cart', true);
        }
    };

    const addToWishlist = async (productId: string) => {
        try {
            const res = await axios.post('https://agrofarm-vd8i.onrender.com/api/wishlist/add', { productId }, { withCredentials: true });
            if (res.status !== 200) throw new Error(res.data?.message || 'Failed to add to wishlist');
            setWishlistItems(prev => [...prev, productId]);
            showToast(res.data?.message || 'Added to wishlist');
        } catch (e: any) {
            showToast(e?.message || 'Failed to add to wishlist', true);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const category = product.category?.toLowerCase() || "";
        const searchTermLower = searchTerm.toLowerCase();

        const matchesSearch = name.includes(searchTermLower) || category.includes(searchTermLower);
        const matchesCategory = activeTab === "all" || category.includes(activeTab.toLowerCase());

        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={{marginTop: 10, color: '#4b5563'}}>Loading marketplace...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Error</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={fetchProducts} style={styles.retryButton}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
            <Text style={styles.pageTitle}>Browse All Products</Text>

            {/* Search Input */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    placeholderTextColor="#9ca3af"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </View>

            {/* Category Tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        onPress={() => setActiveTab(category.id)}
                        style={[
                            styles.tabButton,
                            activeTab === category.id ? styles.tabActive : styles.tabInactive,
                        ]}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === category.id ? styles.tabTextActive : styles.tabTextInactive,
                        ]}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
                <View style={styles.noProductsContainer}>
                    <Ionicons name="sad-outline" size={60} color="#9ca3af" />
                    <Text style={styles.noProductsTitle}>No products found</Text>
                    <Text style={styles.noProductsText}>
                        No products match your search criteria.
                    </Text>
                </View>
            ) : (
                <View style={styles.productGrid}>
                    {filteredProducts.map((product) => (
                        <TouchableOpacity 
                            key={product._id} 
                            style={styles.productCard}
                            onPress={() => showToast(`View details for ${product.name}`)}
                        >
                            <View style={styles.imageWrapper}>
                                {product.images?.[0] ? (
                                    <Image
                                        source={{ uri: product.images[0] }}
                                        style={styles.productImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Ionicons name="image-outline" size={40} color="#9ca3af" />
                                    </View>
                                )}
                                {!product.isAvailable && (
                                    <View style={styles.outOfStockBadge}>
                                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                                    </View>
                                )}
                                <TouchableOpacity
                                    onPress={() => addToWishlist(product._id)}
                                    style={styles.wishlistButton}
                                >
                                    <Ionicons 
                                        name={wishlistItems.includes(product._id) ? "heart" : "heart-outline"} 
                                        size={24} 
                                        color={wishlistItems.includes(product._id) ? "#ef4444" : "#4b5563"} 
                                    />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.cardInfo}>
                                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                                
                                <View style={styles.priceContainer}>
                                    <Text style={styles.productPrice}>
                                        Rs. {product.price?.toLocaleString()}
                                    </Text>
                                    <Text style={styles.productUnit}>/ {product.unit}</Text>
                                </View>
                                
                                <Text style={styles.productCategory}>{product.category}</Text>

                                <TouchableOpacity
                                    disabled={!product.isAvailable}
                                    onPress={() => addToCart(product._id)}
                                    style={[styles.cartButton, !product.isAvailable && styles.cartButtonDisabled]}
                                >
                                    <Text style={styles.cartButtonText}>
                                        {product.isAvailable ? "Add to Cart" : "Unavailable"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    contentPadding: { padding: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 300 },
    errorBox: { backgroundColor: '#fee2e2', borderLeftWidth: 4, borderLeftColor: '#ef4444', padding: 16, margin: 16, borderRadius: 8 },
    errorTitle: { fontWeight: 'bold', color: '#dc2626', marginBottom: 5 },
    errorText: { color: '#dc2626', fontSize: 14 },
    retryButton: { marginTop: 10, backgroundColor: '#dc2626', padding: 8, borderRadius: 6, alignSelf: 'flex-start' },
    retryButtonText: { color: 'white', fontWeight: '600' },
    pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#1f2937', marginBottom: 20 },
    searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 8, borderWidth: 1, borderColor: '#d1d5db', marginBottom: 15, paddingHorizontal: 10 },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, height: 40, fontSize: 16 },
    tabsContainer: { marginBottom: 20, marginHorizontal: -16, paddingHorizontal: 16, },
    tabButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, marginRight: 10, },
    tabActive: { backgroundColor: '#3b82f6', },
    tabInactive: { backgroundColor: '#e5e7eb', },
    tabText: { fontSize: 14, fontWeight: '600', },
    tabTextActive: { color: 'white', },
    tabTextInactive: { color: '#4b5563', },
    productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', },
    productCard: {
        width: (width - 48) / 2, 
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        marginBottom: 16,
        overflow: 'hidden',
    },
    imageWrapper: { height: 120, width: '100%', backgroundColor: '#f3f4f6', position: 'relative', justifyContent: 'center', alignItems: 'center' },
    productImage: { width: '100%', height: '100%', position: 'absolute' },
    imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    outOfStockBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
    outOfStockText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    wishlistButton: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 20, padding: 5 },
    cardInfo: { padding: 12, flexGrow: 1, justifyContent: 'space-between' },
    productName: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 5 },
    priceContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 5 },
    productPrice: { fontSize: 15, fontWeight: 'bold', color: '#059669' },
    productUnit: { fontSize: 12, color: '#4b5563', marginLeft: 4, marginBottom: 1 },
    productCategory: { fontSize: 12, color: '#3b82f6', backgroundColor: '#eff6ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginBottom: 10 },
    cartButton: { backgroundColor: '#10b981', paddingVertical: 10, borderRadius: 8, marginTop: 8, alignItems: 'center' },
    cartButtonDisabled: { backgroundColor: '#9ca3af' },
    cartButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    noProductsContainer: { backgroundColor: 'white', borderRadius: 12, padding: 40, alignItems: 'center', marginTop: 30, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    noProductsTitle: { fontSize: 20, fontWeight: '600', color: '#374151', marginTop: 10 },
    noProductsText: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 5 },
});

export default BuyerProductsScreen;