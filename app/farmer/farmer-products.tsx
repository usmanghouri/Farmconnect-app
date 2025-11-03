// app/farmer/farmer-products.tsx

import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
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
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get('window');

// Interface for product data (simplified based on your API response)
interface Product {
    _id: string;
    name: string;
    description?: string;
    category?: string;
    price: number;
    quantity: number;
    unit?: string;
    isAvailable: boolean;
    images?: string[];
}

const API_URL = "https://agrofarm-vd8i.onrender.com/api/products/productForFarmer";
const CART_API = "https://agrofarm-vd8i.onrender.com/api/cart/add";
const WISHLIST_API = "https://agrofarm-vd8i.onrender.com/api/wishlist/add";

const categories = [
    { id: "all", name: "All Products" },
    { id: "fruits", name: "Fruits" },
    { id: "vegetables", name: "Vegetables" },
    { id: "crops", name: "Crops" },
    { id: "pesticides", name: "Pesticides" },
    { id: "fertilizer", name: "Fertilizer" },
];

const FarmerProductsScreen = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [wishlistItems, setWishlistItems] = useState<string[]>([]); // Array of product IDs in wishlist
    const router = useRouter();

    // Replaces react-toastify
    const showToast = (message: string, isError = false) => {
        Alert.alert(isError ? "Error" : "Success", message);
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(API_URL, { withCredentials: true });

            if (response.status !== 200) {
                throw new Error(response.data.message || "Failed to fetch products");
            }

            setProducts(response.data.products || []);
        } catch (err: any) {
            setError(err.message || "Error loading products");
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId: string, quantity = 1) => {
        try {
            const response = await axios.post(CART_API, { productId, quantity }, { withCredentials: true });

            if (response.status !== 200) {
                throw new Error(response.data.message || "Failed to add to cart");
            }

            showToast(response.data.message || "Product added to cart successfully");
        } catch (err: any) {
            showToast(err.message || "Error adding to cart", true);
        }
    };

    const addToWishlist = async (productId: string) => {
        try {
            const response = await axios.post(WISHLIST_API, { productId }, { withCredentials: true });

            if (response.status !== 200) {
                throw new Error(response.data.message || "Failed to add to wishlist");
            }

            setWishlistItems(prev => [...prev, productId]);
            showToast(response.data.message || "Product added to wishlist successfully");
        } catch (err: any) {
            showToast(err.message || "Error adding to wishlist", true);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const filteredProducts = products.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const description = product.description?.toLowerCase() || "";
        const category = product.category?.toLowerCase() || "";
        const searchTermLower = searchTerm.toLowerCase();

        const matchesSearch =
            name.includes(searchTermLower) ||
            description.includes(searchTermLower) ||
            category.includes(searchTermLower);

        const matchesCategory =
            activeTab === "all" || category.includes(activeTab.toLowerCase());

        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#16a34a" />
                <Text style={{marginTop: 10, color: '#4b5563'}}>Loading products...</Text>
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
            <Text style={styles.pageTitle}>Browse Supplies</Text>

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
                        {products.length === 0
                            ? "There are currently no products available."
                            : "No products match your search criteria."}
                    </Text>
                </View>
            ) : (
                <View style={styles.productGrid}>
                    {filteredProducts.map((product) => (
                        <TouchableOpacity 
                            key={product._id} 
                            style={styles.productCard}
                            // Navigate to product detail page (You need to set up app/farmer/product/[id].tsx route)
                            onPress={() => router.push({ pathname: "/farmer/product/[id]", params: { id: product._id } })} 
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
                                    <Text style={styles.productUnit}>
                                        {product.quantity} {product.unit}
                                    </Text>
                                </View>
                                
                                <Text style={styles.productCategory}>{product.category}</Text>

                                <TouchableOpacity
                                    disabled={!product.isAvailable}
                                    onPress={() => addToCart(product._id, 1)}
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
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    contentPadding: {
        padding: 16,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 300,
    },
    errorBox: {
        backgroundColor: '#fee2e2',
        borderLeftWidth: 4,
        borderLeftColor: '#ef4444',
        padding: 16,
        margin: 16,
        borderRadius: 8,
    },
    errorTitle: {
        fontWeight: 'bold',
        color: '#dc2626',
        marginBottom: 5,
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
    },
    retryButton: {
        marginTop: 10,
        backgroundColor: '#dc2626',
        padding: 8,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    retryButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        marginBottom: 15,
        paddingHorizontal: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
    },
    tabsContainer: {
        marginBottom: 20,
        marginHorizontal: -16, // Extend beyond padding
        paddingHorizontal: 16,
    },
    tabButton: {
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
    },
    tabActive: {
        backgroundColor: '#16a34a',
    },
    tabInactive: {
        backgroundColor: '#e5e7eb',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    tabTextActive: {
        color: 'white',
    },
    tabTextInactive: {
        color: '#4b5563',
    },
    productGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    productCard: {
        width: (width - 48) / 2, // 2 items per row (16*3 = 48 total margin/padding)
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
    imageWrapper: {
        height: 120,
        width: '100%',
        backgroundColor: '#f3f4f6',
        position: 'relative',
    },
    productImage: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outOfStockBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#ef4444',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    outOfStockText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    wishlistButton: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 20,
        padding: 5,
    },
    cardInfo: {
        padding: 12,
        flexGrow: 1,
        justifyContent: 'space-between',
    },
    productName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 5,
    },
    priceContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    productPrice: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#059669',
    },
    productUnit: {
        fontSize: 12,
        color: '#4b5563',
    },
    productCategory: {
        fontSize: 12,
        color: '#60a5fa',
        backgroundColor: '#eff6ff',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    cartButton: {
        backgroundColor: '#10b981',
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 8,
        alignItems: 'center',
    },
    cartButtonDisabled: {
        backgroundColor: '#9ca3af',
    },
    cartButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
    noProductsContainer: {
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
    noProductsTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#374151',
        marginTop: 10,
    },
    noProductsText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginTop: 5,
    },
});

export default FarmerProductsScreen;