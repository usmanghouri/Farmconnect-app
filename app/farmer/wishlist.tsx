// app/farmer/wishlist.tsx

import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');

interface WishlistItemProduct {
    _id: string;
    name: string;
    price: number;
    unit: string;
    isAvailable: boolean;
    images?: string[];
    upLoadedBy?: {
        uploaderName?: string;
    }
}

interface WishlistItem {
    _id: string;
    productId: WishlistItemProduct;
    addedAt: string;
}

const WishlistScreen = () => {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);

    const showToast = (message: string, isError = false) => {
        Alert.alert(isError ? "Error" : "Success", message);
    };

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                "https://agrofarm-vd8i.onrender.com/api/wishlist/my-wishlist",
                { withCredentials: true }
            );

            if (response.status !== 200 || !response.data.wishlist) {
                throw new Error("Failed to fetch wishlist");
            }

            setWishlistItems(response.data.wishlist.products || []);
        } catch (error: any) {
            showToast("Failed to fetch wishlist", true);
            setWishlistItems([]);
        } finally {
            setLoading(false);
        }
    };

    const removeItemFromWishlist = async (productId: string) => {
        try {
            const response = await axios.delete(
                `https://agrofarm-vd8i.onrender.com/api/wishlist/item/${productId}`,
                { withCredentials: true }
            );

            if (response.status !== 200) throw new Error("Failed to remove item");

            showToast("Item removed from wishlist");
            fetchWishlist();
        } catch (error: any) {
            showToast("Failed to remove item", true);
        }
    };

    const emptyWishlist = () => {
         Alert.alert(
            "Clear Wishlist",
            "Are you sure you want to clear your entire wishlist?",
            [
                { text: "No", style: "cancel" },
                { text: "Yes", onPress: performEmptyWishlist },
            ]
        );
    };
    
    const performEmptyWishlist = async () => {
        try {
            const response = await axios.delete(
                "https://agrofarm-vd8i.onrender.com/api/wishlist/clear",
                { withCredentials: true }
            );

            if (response.status !== 200) throw new Error("Failed to clear wishlist");

            showToast("Wishlist cleared");
            setWishlistItems([]);
        } catch (error: any) {
            showToast("Failed to clear wishlist", true);
        }
    };

    const addToCart = async (productId: string, quantity = 1) => {
        try {
            // NOTE: The original API endpoint was unusual. Using the standard cart API.
            const response = await axios.post(
                "https://agrofarm-vd8i.onrender.com/api/cart/add",
                { productId, quantity },
                { withCredentials: true }
            );

            if (response.status !== 200) throw new Error("Failed to add to cart");

            showToast("Item added to cart");
            removeItemFromWishlist(productId); // Optional: Remove from wishlist after moving to cart
        } catch (error: any) {
            showToast("Failed to add to cart", true);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#16a34a" />
                <Text style={{marginTop: 10, color: '#4b5563'}}>Loading wishlist...</Text>
            </View>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="heart-dislike-outline" size={60} color="#9ca3af" style={{marginBottom: 10}} />
                <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
                <Text style={styles.emptyText}>Add some products you like to view them here.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
            <View style={styles.header}>
                <Text style={styles.pageTitle}>My Wishlist</Text>
                <TouchableOpacity
                    onPress={emptyWishlist}
                    style={styles.clearAllButton}
                >
                    <Text style={styles.clearAllText}>Clear All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.wishlistGrid}>
                {wishlistItems.map((item) => {
                    const product = item.productId;
                    const firstImage = product.images?.[0];
                    
                    return (
                        <View key={item._id} style={styles.productCard}>
                            <View style={styles.imageWrapper}>
                                {firstImage ? (
                                    <Image
                                        source={{ uri: firstImage }}
                                        style={styles.productImage}
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.imagePlaceholder}><Ionicons name="image-outline" size={40} color="#9ca3af" /></View>
                                )}
                            </View>

                            <View style={styles.cardInfo}>
                                <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                                <Text style={styles.productPrice}>
                                    Rs. {product.price?.toLocaleString()} / {product.unit}
                                </Text>
                                <Text style={styles.productSupplier}>
                                    Supplier: {product.upLoadedBy?.uploaderName || "Unknown"}
                                </Text>
                                
                                <View style={styles.statusRow}>
                                    <Text style={[styles.availabilityText, {color: product.isAvailable ? '#10b981' : '#ef4444'}]}>
                                        {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                                    </Text>
                                    <Text style={styles.dateAdded}>
                                        Added: {new Date(item.addedAt).toLocaleDateString()}
                                    </Text>
                                </View>

                                <View style={styles.actionRow}>
                                    <TouchableOpacity
                                        onPress={() => removeItemFromWishlist(product._id)}
                                        style={styles.removeButton}
                                    >
                                        <Text style={styles.removeButtonText}>Remove</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => addToCart(product._id, 1)}
                                        disabled={!product.isAvailable}
                                        style={[styles.cartButton, !product.isAvailable && {opacity: 0.5}]}
                                    >
                                        <Text style={styles.cartButtonText}>Add to Cart</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    );
                })}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9fafb' },
    contentPadding: { padding: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 300 },
    emptyContainer: { backgroundColor: 'white', borderRadius: 12, padding: 40, alignItems: 'center', marginTop: 30 },
    emptyTitle: { fontSize: 24, fontWeight: '600', color: '#374151', marginBottom: 5 },
    emptyText: { fontSize: 16, color: '#6b7280', marginBottom: 20 },
    
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
    clearAllButton: { backgroundColor: '#ef4444', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
    clearAllText: { color: 'white', fontWeight: '600' },

    wishlistGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    productCard: {
        width: (width - 48) / 2, // 2 items per row
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        marginBottom: 16,
        overflow: 'hidden',
    },
    imageWrapper: { height: 120, width: '100%', backgroundColor: '#f3f4f6', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
    productImage: { width: '100%', height: '100%' },
    imagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    cardInfo: { padding: 12, flex: 1, justifyContent: 'space-between' },
    productName: { fontSize: 16, fontWeight: '600', color: '#1f2937', marginBottom: 5 },
    productPrice: { fontSize: 14, fontWeight: 'bold', color: '#059669' },
    productSupplier: { fontSize: 12, color: '#6b7280', marginTop: 2 },
    
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    availabilityText: { fontSize: 12, fontWeight: 'bold' },
    dateAdded: { fontSize: 11, color: '#9ca3af' },

    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 10 },
    removeButton: { padding: 5 },
    removeButtonText: { color: '#ef4444', fontSize: 14, fontWeight: '600' },
    cartButton: { backgroundColor: '#10b981', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    cartButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
});

export default WishlistScreen;