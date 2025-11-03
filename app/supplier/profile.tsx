// app/supplier/profile.tsx

import { Feather } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert, Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

const { width } = Dimensions.get('window');

// Interfaces
interface ProfileData {
    name: string;
    email: string;
    phone: string;
    address: string;
    img: string;
}

interface PasswordData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Mock Cloudinary config (For UI structure reference)
const CLOUD_NAME = "dn5edjpzg";
const UPLOAD_PRESET = "FarmConnect";

const SupplierProfileScreen = () => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(true);

    const [profileData, setProfileData] = useState<ProfileData>({
        name: "Ali Raza Supplies", email: "ali@supplier.com", phone: "0300-1234567", address: "Lahore, Punjab", img: "",
    });

    const [tempData, setTempData] = useState({
        ...profileData,
        imgFile: null as any, 
        imgPreview: "", 
    });

    const [passwordData, setPasswordData] = useState<PasswordData>({
        oldPassword: "", newPassword: "", confirmPassword: "",
    });

    const showToast = (message: string, isError = false) => { Alert.alert(isError ? "Error" : "Success", message); };

    // --- MOCK DATA FETCH ---
    useEffect(() => {
        // Simulate fetch delay
        setTimeout(() => {
            setLoading(false);
            setTempData(prev => ({ ...prev, img: "https://via.placeholder.com/150" }));
        }, 800);
    }, []);

    // Mock handlers (replacing actual API calls)
    const handleImageSelection = async () => {
        // Mock ImagePicker result
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setTempData((prev) => ({ ...prev, imgFile: result.assets[0], imgPreview: result.assets[0].uri }));
        }
    };

    const handleSave = async () => {
        // Mock save process
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setProfileData({ ...tempData, img: tempData.imgPreview || tempData.img });
        setIsEditing(false);
        setLoading(false);
        showToast("Profile updated successfully (Mock)");
    };

    const handleLogout = async () => {
        // Mock logout
        await new Promise(resolve => setTimeout(resolve, 500));
        router.replace("/");
        showToast("Logged out successfully (Mock)");
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast("Passwords don't match", true);
            return;
        }
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsChangingPassword(false);
        setLoading(false);
        showToast("Password changed successfully (Mock)");
    };

    const handleDeleteAccount = () => {
        Alert.alert(
            "Delete Account", "Are you sure you want to delete your account? This cannot be undone.",
            [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => {
                router.replace("/");
                showToast("Account deleted (Mock)");
            }}]
        );
    };

    const handleCancel = () => {
        setTempData({ ...profileData, imgFile: null, imgPreview: "" });
        setIsEditing(false);
        setIsChangingPassword(false);
        setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    };

    const getImageUrl = () => {
        if (tempData.imgPreview) return { uri: tempData.imgPreview };
        if (typeof tempData.img === "string" && tempData.img) return { uri: tempData.img };
        return null;
    };
    
    const handleFieldChange = (key: keyof ProfileData, value: string) => {
        setTempData(p => ({ ...p, [key]: value }));
    };
    
    const handlePasswordChange = (key: keyof PasswordData, value: string) => {
        setPasswordData(p => ({ ...p, [key]: value }));
    };


    if (loading && !profileData.name) {
        return (<View style={styles.loadingContainer}><ActivityIndicator size="large" color="#16a34a" /><Text style={{marginTop: 10}}>Loading profile...</Text></View>);
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
            <Text style={styles.pageTitle}>Supplier Profile</Text>

            {/* Header Actions */}
            <View style={styles.headerActions}>
                {!isEditing && !isChangingPassword && (
                    <>
                        <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton} disabled={loading}>
                            <Feather name="edit" size={18} color="#10b981" />
                            <Text style={styles.editButtonText}>Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton} disabled={loading}>
                            <Feather name="log-out" size={18} color="#dc2626" />
                            <Text style={styles.logoutButtonText}>Logout</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Profile Card */}
            <View style={styles.profileCard}>
                <View style={styles.profileContent}>
                    {/* Profile Picture */}
                    <View style={styles.imageWrapper}>
                        {getImageUrl() ? (
                            <Image source={getImageUrl()!} style={styles.profileImage} resizeMode="cover" />
                        ) : (
                            <View style={styles.noImage}><Text style={styles.noImageText}>No Image</Text></View>
                        )}

                        {isEditing && (
                            <TouchableOpacity onPress={handleImageSelection} style={styles.cameraButton}>
                                <Feather name="camera" size={18} color="white" />
                            </TouchableOpacity>
                        )}
                        {isEditing && getImageUrl() && (
                            <TouchableOpacity onPress={() => setTempData(p => ({ ...p, imgFile: null, imgPreview: "", img: "" }))} style={styles.removeImageButton}>
                                <Feather name="x" size={18} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Profile Info / Form */}
                    <View style={styles.infoContainer}>
                        {isChangingPassword ? (
                            <View style={styles.passwordFormContainer}>
                                <Text style={styles.formSectionTitle}>Change Password</Text>
                                <TextInput style={styles.input} placeholder="Old Password" secureTextEntry value={passwordData.oldPassword} onChangeText={(text) => handlePasswordChange('oldPassword', text)} />
                                <TextInput style={styles.input} placeholder="New Password" secureTextEntry value={passwordData.newPassword} onChangeText={(text) => handlePasswordChange('newPassword', text)} />
                                <TextInput style={styles.input} placeholder="Confirm New Password" secureTextEntry value={passwordData.confirmPassword} onChangeText={(text) => handlePasswordChange('confirmPassword', text)} />
                            </View>
                        ) : isEditing ? (
                            <View style={styles.editFormContainer}>
                                <Text style={styles.formSectionTitle}>Edit Profile</Text>
                                <TextInput style={styles.input} placeholder="Full Name" value={tempData.name} onChangeText={(text) => handleFieldChange('name', text)} />
                                <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" value={tempData.email} onChangeText={(text) => handleFieldChange('email', text)} />
                                <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" value={tempData.phone} onChangeText={(text) => handleFieldChange('phone', text)} />
                                <TextInput style={styles.input} placeholder="Address" value={tempData.address} onChangeText={(text) => handleFieldChange('address', text)} />
                            </View>
                        ) : (
                            <>
                                <Text style={styles.profileName}>{profileData.name}</Text>
                                <View style={styles.detailRow}>
                                    <Feather name="map-pin" size={16} color="#6b7280" />
                                    <Text style={styles.detailText}>{profileData.address || "N/A"}</Text>
                                </View>
                                <View style={styles.statusBadgeContainer}>
                                    <View style={styles.statusDot} />
                                    <Text style={styles.statusText}>Active</Text>
                                </View>
                                <View style={styles.contactSection}>
                                    <View style={styles.detailCard}>
                                        <Feather name="mail" size={20} color="#3b82f6" />
                                        <Text style={styles.detailText}>{profileData.email}</Text>
                                    </View>
                                    <View style={styles.detailCard}>
                                        <Feather name="phone" size={20} color="#10b981" />
                                        <Text style={styles.detailText}>{profileData.phone}</Text>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </View>
            
            {/* Action Buttons (Save/Cancel/Password/Delete) */}
            <View style={styles.bottomActions}>
                {isEditing || isChangingPassword ? (
                    <>
                        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton} disabled={loading}><Text style={styles.cancelButtonText}>Cancel</Text></TouchableOpacity>
                        <TouchableOpacity onPress={isChangingPassword ? handleChangePassword : handleSave} style={[styles.saveButton, loading && styles.saveButtonDisabled]} disabled={loading}>
                            {loading ? (<ActivityIndicator color="white" />) : (<Text style={styles.saveButtonText}>{isChangingPassword ? "Change Password" : "Save Changes"}</Text>)}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity onPress={() => setIsChangingPassword(true)} style={styles.changePassButton}>
                            <Feather name="lock" size={16} color="#2563eb" />
                            <Text style={styles.changePassButtonText}>Change Password</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteButton}>
                            <Feather name="trash-2" size={16} color="#dc2626" />
                            <Text style={styles.deleteButtonText}>Delete Account</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ScrollView>
    );
};

// --- STYLES ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f3f4f6' },
    contentPadding: { padding: 16 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', height: 300 },
    pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 20 },
    headerActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginBottom: 20 },
    editButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'white', padding: 10, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
    editButtonText: { color: '#10b981', fontWeight: '600' },
    logoutButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fecaca', padding: 10, borderRadius: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
    logoutButtonText: { color: '#dc2626', fontWeight: '600' },
    profileCard: { backgroundColor: 'white', borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 5, overflow: 'hidden' },
    profileContent: { flexDirection: 'column', alignItems: 'center', padding: 20 },
    imageWrapper: { position: 'relative', height: 100, width: 100, borderRadius: 50, borderWidth: 4, borderColor: 'white', backgroundColor: '#e5e7eb', overflow: 'hidden', marginBottom: 20 },
    profileImage: { width: '100%', height: '100%' },
    noImage: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e5e7eb' },
    noImageText: { color: '#9ca3af', fontSize: 12 },
    cameraButton: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#059669', padding: 5, borderRadius: 15, borderWidth: 2, borderColor: 'white' },
    removeImageButton: { position: 'absolute', top: 0, left: 0, backgroundColor: '#dc2626', padding: 5, borderRadius: 15, borderWidth: 2, borderColor: 'white' },
    infoContainer: { width: '100%', alignItems: 'center' },
    profileName: { fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 5 },
    statusBadgeContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#d1fae5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15, marginTop: 10, marginBottom: 20 },
    statusDot: { height: 8, width: 8, borderRadius: 4, backgroundColor: '#10b981', marginRight: 6 },
    statusText: { color: '#047857', fontWeight: '600', fontSize: 13 },
    detailRow: { flexDirection: 'row', alignItems: 'center', gap: 5, color: '#6b7280', marginTop: 5 },
    detailText: { fontSize: 14, color: '#4b5563' },
    contactSection: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20, gap: 10 },
    detailCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8, flex: 1 },
    // Forms
    formSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 15, marginTop: 10, alignSelf: 'flex-start' },
    passwordFormContainer: { width: '100%', gap: 10, marginTop: 10 },
    editFormContainer: { width: '100%', gap: 10, marginTop: 10 },
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, width: '100%', backgroundColor: 'white', fontSize: 14 },
    // Bottom Action Buttons
    bottomActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 10 },
    cancelButton: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#6b7280', alignItems: 'center' },
    cancelButtonText: { color: '#6b7280', fontWeight: '600' },
    saveButton: { flex: 1, padding: 12, borderRadius: 8, backgroundColor: '#10b981', alignItems: 'center' },
    saveButtonDisabled: { opacity: 0.6 },
    saveButtonText: { color: 'white', fontWeight: '600' },
    changePassButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#bfdbfe', padding: 12, borderRadius: 8, flex: 1, justifyContent: 'center' },
    changePassButtonText: { color: '#1e40af', fontWeight: '600' },
    deleteButton: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fee2e2', padding: 12, borderRadius: 8, flex: 1, justifyContent: 'center' },
    deleteButtonText: { color: '#dc2626', fontWeight: '600' },
});

export default SupplierProfileScreen;