// app/supplier/products.tsx

import { Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from "react";
import { Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');

// --- DUMMY DATA ---
const DUMMY_PRODUCTS = [
    { id: 'P001', name: 'High-Yield Wheat Seeds', stock: 1500, price: 1500, status: 'Active', category: 'Seeds' },
    { id: 'P002', name: 'Organic Pesticide', stock: 0, price: 950, status: 'Out of Stock', category: 'Pesticides' },
    { id: 'P003', name: 'Tractor Oil (5L)', stock: 20, price: 3200, status: 'Active', category: 'Equipment' },
    { id: 'P004', name: 'Premium Fertilizer', stock: 50, price: 4500, status: 'Active', category: 'Fertilizer' },
];

const ProductsListedScreen = () => {
    const [products, setProducts] = useState(DUMMY_PRODUCTS);
    
    // --- UTILITY ---
    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'Active': return { color: '#047857', bg: '#d1fae5' };
            case 'Out of Stock': return { color: '#991b1b', bg: '#fee2e2' };
            default: return { color: '#4b5563', bg: '#e5e7eb' };
        }
    };
    
    const renderProductRow = ({ item: product }: { item: typeof DUMMY_PRODUCTS[0] }) => {
        const statusStyle = getStatusInfo(product.status);
        return (
            <View style={styles.productRow}>
                <View style={styles.productCellName}>
                    <Text style={styles.productNameText}>{product.name}</Text>
                    <Text style={styles.productCategoryText}>{product.category}</Text>
                </View>
                <Text style={styles.productCell}>{product.stock.toLocaleString()}</Text>
                <Text style={[styles.productCell, { fontWeight: 'bold' }]}>Rs. {product.price.toLocaleString()}</Text>
                <View style={styles.productCellStatus}>
                    <Text style={[styles.statusBadge, { backgroundColor: statusStyle.bg, color: statusStyle.color }]}>
                        {product.status}
                    </Text>
                </View>
                {/* Mock Edit Button */}
                <View style={styles.productCellActions}>
                    <Feather name="edit" size={18} color="#3b82f6" />
                </View>
            </View>
        );
    };

    return (
        <LinearGradient 
            colors={['#f0fdf4', '#d1fae5']} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 0, y: 1 }} 
            style={styles.gradientWrapper}
        >
            <ScrollView style={styles.baseContainer} contentContainerStyle={{flexGrow: 1}}>
                <View style={styles.header}>
                    <Text style={styles.pageTitle}>My Listed Products ({products.length})</Text>
                    <TouchableOpacity style={styles.addButton}>
                        <Feather name="plus" size={18} color="white" />
                        <Text style={styles.addButtonText}>New Listing</Text>
                    </TouchableOpacity>
                </View>

                {/* Product List Table */}
                <View style={styles.listCard}>
                    <View style={styles.listHeader}>
                        <Text style={[styles.headerText, { flex: 3.5 }]}>Product</Text>
                        <Text style={[styles.headerText, { flex: 1.5, textAlign: 'center' }]}>Stock</Text>
                        <Text style={[styles.headerText, { flex: 2, textAlign: 'right' }]}>Price</Text>
                        <Text style={[styles.headerText, { flex: 2, textAlign: 'center' }]}>Status</Text>
                        <Text style={[styles.headerText, { flex: 1.5, textAlign: 'right' }]}>Edit</Text>
                    </View>
                    
                    <FlatList
                        data={products}
                        renderItem={renderProductRow}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientWrapper: { flex: 1 },
    baseContainer: { flex: 1, padding: 16, backgroundColor: 'transparent' },
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#1f2937' },
    
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    addButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#059669', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, gap: 5, elevation: 5 },
    addButtonText: { color: 'white', fontWeight: '600', fontSize: 14 },
    
    listCard: { backgroundColor: 'white', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, elevation: 8, overflow: 'hidden' },
    
    // Table/List Styles
    listHeader: { flexDirection: 'row', backgroundColor: '#f9fafb', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    headerText: { fontSize: 11, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase' },
    separator: { height: 1, backgroundColor: '#f3f4f6' },

    productRow: { flexDirection: 'row', paddingHorizontal: 15, paddingVertical: 15, alignItems: 'center' },
    productCell: { flex: 1.5, fontSize: 14, color: '#4b5563' },
    productCellName: { flex: 3.5, justifyContent: 'center' },
    productNameText: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
    productCategoryText: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
    productCellStatus: { flex: 2, alignItems: 'center' },
    productCellActions: { flex: 1.5, alignItems: 'flex-end' },
    
    statusBadge: { fontSize: 11, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, textTransform: 'uppercase' },
});

export default ProductsListedScreen;