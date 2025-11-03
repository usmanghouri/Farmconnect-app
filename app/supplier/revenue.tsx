// app/supplier/revenue.tsx

import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get('window');

const RevenueScreen = () => {
    const DUMMY_CHART_DATA = [500, 1200, 800, 1800, 1500, 2500];

    return (
        <LinearGradient colors={['#f0fdf4', '#d1fae5']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.gradientWrapper}>
            <ScrollView style={styles.contentScrollView} contentContainerStyle={styles.contentContainer}>
                
                <Text style={styles.pageTitle}>Monthly Revenue Breakdown</Text>
                
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Total Revenue This Month</Text>
                    <Text style={styles.summaryValue}>Rs. 15,500</Text>
                    <Text style={styles.summarySubtitle}>+12% vs last month</Text>
                </View>

                {/* Mock Chart Area */}
                <View style={styles.chartSection}>
                    <Text style={styles.chartTitle}>Last 6 Months Performance</Text>
                    <View style={styles.chartArea}>
                        {DUMMY_CHART_DATA.map((value, index) => (
                            <View key={index} style={styles.barContainer}>
                                <View style={[styles.bar, { height: value / 30 }]} />
                                <Text style={styles.barLabel}>{value / 1000}k</Text>
                            </View>
                        ))}
                    </View>
                    <Text style={styles.chartFooter}>Analyze trends for better pricing.</Text>
                </View>

                {/* Financial Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Financial Tools</Text>
                    <View style={styles.financialActions}>
                        <TouchableOpacity style={styles.actionButton}>
                            <Feather name="download" size={20} color="#10b981" />
                            <Text style={styles.actionText}>Export Report</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <MaterialCommunityIcons name="bank-transfer" size={20} color="#3b82f6" />
                            <Text style={styles.actionText}>View Payments</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradientWrapper: { flex: 1 },
    contentScrollView: { flex: 1, backgroundColor: 'transparent' },
    contentContainer: { padding: 16 },
    pageTitle: { fontSize: 24, fontWeight: '700', color: '#1f2937', marginBottom: 20 },
    
    // Summary Card
    summaryCard: { backgroundColor: '#059669', padding: 20, borderRadius: 12, marginBottom: 20, elevation: 5 },
    summaryTitle: { fontSize: 16, color: '#d1fae5' },
    summaryValue: { fontSize: 36, fontWeight: 'bold', color: 'white', marginTop: 5 },
    summarySubtitle: { fontSize: 14, color: '#86efac', marginTop: 5 },

    // Chart
    chartSection: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 20, elevation: 5 },
    chartTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 15 },
    chartArea: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 150, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
    barContainer: { alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
    bar: { width: 25, backgroundColor: '#10b981', borderRadius: 4, marginHorizontal: 5 },
    barLabel: { fontSize: 10, color: '#6b7280', marginTop: 5 },
    chartFooter: { fontSize: 12, color: '#6b7280', textAlign: 'center', marginTop: 15 },

    // Actions
    section: { backgroundColor: 'white', padding: 15, borderRadius: 12, elevation: 5 },
    sectionTitle: { fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 10 },
    financialActions: { flexDirection: 'row', justifyContent: 'space-around', gap: 10 },
    actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, justifyContent: 'center', gap: 5 },
    actionText: { fontWeight: '600', color: '#4b5563' },
});

export default RevenueScreen;