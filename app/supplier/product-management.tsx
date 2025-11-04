// app/supplier/product-management.tsx

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');

import { addProduct, getMyProducts, ProductInput } from "../../utils/apiProducts";

const ProductManagementScreen = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [isAdding, setIsAdding] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMine = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getMyProducts();
                // Expecting { products: [...] }
                setProducts(Array.isArray(data?.products) ? data.products : []);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        fetchMine();
    }, []);

    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.price || !newProduct.stock) {
            Alert.alert("Error", "Please fill in all fields.");
            return;
        }
        setLoading(true);
        try {
            const payload: ProductInput = {
                name: newProduct.name,
                description: '',
                price: parseFloat(newProduct.price),
                unit: 'unit',
                quantity: parseInt(newProduct.stock),
                images: [],
            };
            await addProduct(payload);
            const refreshed = await getMyProducts();
            setProducts(Array.isArray(refreshed?.products) ? refreshed.products : []);
            setNewProduct({ name: '', price: '', stock: '' });
            setIsAdding(false);
            Alert.alert("Success", "Product added successfully!");
        } catch (e) {
            Alert.alert("Error", e instanceof Error ? e.message : 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyle = (status: string) => {
        return status === 'In Stock' ? { color: '#047857', bg: '#d1fae5' } : { color: '#991b1b', bg: '#fee2e2' };
    };

    const ProductForm = () => (
        <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Add New Product</Text>
            <TextInput style={styles.input} placeholder="Product Name" value={newProduct.name} onChangeText={(text) => setNewProduct(p => ({ ...p, name: text }))} />
            <TextInput style={styles.input} placeholder="Price (Rs.)" keyboardType="numeric" value={newProduct.price} onChangeText={(text) => setNewProduct(p => ({ ...p, price: text }))} />
            <TextInput style={styles.input} placeholder="Stock Quantity" keyboardType="numeric" value={newProduct.stock} onChangeText={(text) => setNewProduct(p => ({ ...p, stock: text }))} />
            
            <View style={styles.formActions}>
                <TouchableOpacity onPress={() => setIsAdding(false)} style={styles.cancelButton} disabled={loading}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddProduct} style={styles.addButton} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>Save Product</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <LinearGradient colors={['#f0fdf4', '#d1fae5']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.gradientWrapper}>
            <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentContainer}>
                
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>Product Management</Text>
                    {!isAdding && (
                        <TouchableOpacity onPress={() => setIsAdding(true)} style={styles.addActionButton}>
                            <Feather name="plus-circle" size={20} color="#fff" />
                            <Text style={styles.addActionButtonText}>Add Product</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {isAdding && <ProductForm />}

                {/* Product List */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>My Listed Products ({products.length})</Text>
                    {error ? <Text style={{ color: '#dc2626', marginBottom: 8 }}>{error}</Text> : null}
                    {loading ? <ActivityIndicator /> : null}
                    <View style={styles.listHeader}>
                        <Text style={[styles.headerText, { flex: 3 }]}>Product Name</Text>
                        <Text style={[styles.headerText, { flex: 1.5, textAlign: 'center' }]}>Stock</Text>
                        <Text style={[styles.headerText, { flex: 2, textAlign: 'center' }]}>Price (Rs)</Text>
                        <Text style={[styles.headerText, { flex: 2, textAlign: 'right' }]}>Status</Text>
                    </View>
                    
                    {products.map((product) => {
                        const statusStyle = getStatusStyle(product.status);
                        return (
                            <View key={product._id || product.id} style={styles.productRow}>
                                <Text style={[styles.productCell, { flex: 3, fontWeight: '600' }]}>{product.name}</Text>
                                <Text style={[styles.productCell, { flex: 1.5, textAlign: 'center' }]}>{product.quantity ?? product.stock}</Text>
                                <Text style={[styles.productCell, { flex: 2, textAlign: 'center' }]}>{(product.price ?? 0).toLocaleString()}</Text>
                                <View style={[styles.productCell, { flex: 2, alignItems: 'flex-end' }]}>
                                    <Text style={[styles.statusBadge, { backgroundColor: statusStyle.bg, color: statusStyle.color }]}>
                                        {product.isAvailable === false ? 'Out of Stock' : 'In Stock'}
                                    </Text>
                                </View>
                            </View>
                        );
                    })}
                </View>

            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientWrapper: { flex: 1 },
    contentScrollView: { flex: 1, backgroundColor: 'transparent' },
    contentContainer: { padding: 16 },
    
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#1f2937' },
    addActionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16a34a', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8, gap: 5, elevation: 5 },
    addActionButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
    
    section: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 8,
    },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 10 },

    // List Styles
    listHeader: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: '#f3f4f6' },
    headerText: { fontSize: 12, fontWeight: 'bold', color: '#6b7280' },
    productRow: { flexDirection: 'row', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f9fafb', alignItems: 'center' },
    productCell: { fontSize: 14, color: '#4b5563', justifyContent: 'center' },
    statusBadge: { fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, textTransform: 'uppercase' },

    // Form Styles
    formContainer: { backgroundColor: '#f9fafb', padding: 15, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#d1fae5', elevation: 2 },
    formTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 15 },
    input: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: 'white' },
    formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 10 },
    cancelButton: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#6b7280', alignItems: 'center' },
    cancelButtonText: { color: '#6b7280', fontWeight: '600' },
    addButton: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8, backgroundColor: '#10b981', alignItems: 'center', flexDirection: 'row' },
    addButtonText: { color: 'white', fontWeight: '600' },
});

export default ProductManagementScreen;