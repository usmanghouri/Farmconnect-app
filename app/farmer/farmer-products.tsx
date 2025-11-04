// app/farmer/farmer-products.tsx

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
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { addProduct, getMyProducts, ProductInput } from "../../utils/apiProducts";

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

const categories = [
    { id: "all", name: "All Products" },
    { id: "fruits", name: "Fruits" },
    { id: "vegetables", name: "Vegetables" },
    { id: "crops", name: "Crops" },
    { id: "pesticides", name: "Pesticides" },
    { id: "fertilizer", name: "Fertilizer" },
];

const categoryMatchKey = (tabId: string) => {
    switch (tabId) {
        case 'vegetables': return 'veg';
        case 'fruits': return 'fruits';
        case 'crops': return 'crops';
        case 'pesticides': return 'pesticides';
        case 'fertilizer': return 'fertilizer';
        default: return '';
    }
};

const FarmerProductsScreen = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState("all");
    const [wishlistItems, setWishlistItems] = useState<string[]>([]); // Array of product IDs in wishlist (not used here)
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '', unit: '', category: '', description: '', imageUrl: '' });
    const router = useRouter();

    // Replaces react-toastify
    const showToast = (message: string, isError = false) => {
        Alert.alert(isError ? "Error" : "Success", message);
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMyProducts();
            setProducts(Array.isArray(data?.products) ? data.products : []);
        } catch (err: any) {
            setError(err.message || "Error loading products");
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (_productId: string, _quantity = 1) => {
        showToast("Cart not available on My Products");
    };

    const addToWishlist = async (_productId: string) => {
        showToast("Wishlist not available on My Products");
    };

    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.price || !newProduct.quantity || !newProduct.unit) {
            showToast('Please fill all required fields', true);
            return;
        }
        try {
            setLoading(true);
            const payload: ProductInput = {
                name: newProduct.name,
                description: newProduct.description || '',
                price: parseFloat(newProduct.price),
                unit: newProduct.unit,
                quantity: parseInt(newProduct.quantity),
                category: newProduct.category || undefined,
                images: newProduct.imageUrl ? [newProduct.imageUrl] : [],
            };
            await addProduct(payload);
            const refreshed = await getMyProducts();
            setProducts(Array.isArray(refreshed?.products) ? refreshed.products : []);
            setIsAddOpen(false);
            setNewProduct({ name: '', price: '', quantity: '', unit: '', category: '', description: '', imageUrl: '' });
            showToast('Product added');
        } catch (e: any) {
            showToast(e?.message || 'Failed to add product', true);
        } finally {
            setLoading(false);
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

        const matchesCategory = activeTab === 'all'
            ? true
            : category === categoryMatchKey(activeTab);

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
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <Text style={styles.pageTitle}>My Products</Text>
                <TouchableOpacity onPress={() => setIsAddOpen(true)} style={{backgroundColor:'#16a34a', paddingHorizontal:12, paddingVertical:8, borderRadius:8}}>
                    <Text style={{color:'white', fontWeight:'600'}}>Add Product</Text>
                </TouchableOpacity>
            </View>

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
                            ? "You haven't added any products yet."
                            : "No products match your search criteria."}
                    </Text>
                </View>
            ) : (
                <View style={styles.productGrid}>
                    {filteredProducts.map((product) => (
                        <TouchableOpacity 
                            key={product._id} 
                            style={styles.productCard}
                            onPress={() => (router as any).push({ pathname: "/farmer/product/[id]", params: { id: product._id } })} 
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
            {/* Simple Add Product Drawer */}
            {isAddOpen && (
                <View style={{position:'absolute', left:0, right:0, bottom:0, backgroundColor:'white', borderTopLeftRadius:16, borderTopRightRadius:16, padding:16, borderWidth:1, borderColor:'#d1d5db'}}>
                    <Text style={{fontSize:16, fontWeight:'700', marginBottom:10}}>New Product</Text>
                    <TextInput placeholder="Name" style={styles.input} value={newProduct.name} onChangeText={(t)=>setNewProduct(p=>({...p,name:t}))} />
                    <TextInput placeholder="Price" keyboardType="numeric" style={styles.input} value={newProduct.price} onChangeText={(t)=>setNewProduct(p=>({...p,price:t}))} />
                    <TextInput placeholder="Quantity" keyboardType="numeric" style={styles.input} value={newProduct.quantity} onChangeText={(t)=>setNewProduct(p=>({...p,quantity:t}))} />
                    <TextInput placeholder="Unit (e.g., kg, bag)" style={styles.input} value={newProduct.unit} onChangeText={(t)=>setNewProduct(p=>({...p,unit:t}))} />
                    {/* Category dropdown */}
                    <View style={[styles.input, {paddingVertical:6}]}> 
                        <Text style={{marginBottom:6, color:'#4b5563'}}>Category</Text>
                        <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
                            {['vegetables','fruits','crops','pesticides','fertilizer'].map((opt) => (
                                <TouchableOpacity key={opt} onPress={()=>setNewProduct(p=>({...p,category: categoryMatchKey(opt)}))} style={{paddingHorizontal:10, paddingVertical:6, borderRadius:16, borderWidth:1, borderColor: newProduct.category===categoryMatchKey(opt)?'#16a34a':'#d1d5db', backgroundColor: newProduct.category===categoryMatchKey(opt)?'#dcfce7':'#fff'}}>
                                    <Text style={{color: newProduct.category===categoryMatchKey(opt)?'#065f46':'#374151'}}>{opt}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                    <TextInput placeholder="Image URL (optional)" style={styles.input} value={newProduct.imageUrl} onChangeText={(t)=>setNewProduct(p=>({...p,imageUrl:t}))} />
                    <TextInput placeholder="Description (optional)" style={[styles.input,{height:80}]} multiline value={newProduct.description} onChangeText={(t)=>setNewProduct(p=>({...p,description:t}))} />
                    <View style={{flexDirection:'row', justifyContent:'flex-end', gap:10}}>
                        <TouchableOpacity onPress={()=>setIsAddOpen(false)} style={{paddingHorizontal:16, paddingVertical:10, borderRadius:8, borderWidth:1, borderColor:'#6b7280'}}>
                            <Text style={{color:'#6b7280', fontWeight:'600'}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleAddProduct} style={{paddingHorizontal:16, paddingVertical:10, borderRadius:8, backgroundColor:'#10b981'}}>
                            <Text style={{color:'white', fontWeight:'600'}}>Save</Text>
                        </TouchableOpacity>
                    </View>
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
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: 'white',
        marginBottom: 10,
    },
});

export default FarmerProductsScreen;