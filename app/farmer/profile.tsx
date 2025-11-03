// app/farmer/profile.tsx

import { Feather } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

// Interfaces
interface ProfileData {
    name: string;
    email: string;
    phone: string;
    address: string;
    img: string; // URL string
}

// Fixed PasswordData: Initializing strings to "" (empty string literal) 
// required explicit string type in the interface for the state setter to work.
interface PasswordData {
    oldPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Mock Cloudinary config
const CLOUD_NAME = "dn5edjpzg";
const UPLOAD_PRESET = "FarmConnect";

const FarmerProfileScreen = () => {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [profileData, setProfileData] = useState<ProfileData>({
        name: "", email: "", phone: "", address: "", img: "",
    });

    const [tempData, setTempData] = useState({
        ...profileData,
        imgFile: null as any, 
        imgPreview: "", 
    });

    const [passwordData, setPasswordData] = useState<PasswordData>({
        oldPassword: "", newPassword: "", confirmPassword: "",
    });

    const showToast = (message: string, isError = false) => {
        Alert.alert(isError ? "Error" : "Success", message);
    };

    // --- API Calls ---

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                "https://agrofarm-vd8i.onrender.com/api/farmers/me",
                { 
                    withCredentials: true // FIXED: Use withCredentials for Axios GET
                }
            );

            if (response.status !== 200 || !response.data.user) {
                throw new Error("Failed to fetch profile data");
            }

            const { name, email, phone, address, img } = response.data.user;

            setProfileData({ name, email, phone, address, img });
            setTempData({ name, email, phone, address, img, imgFile: null, imgPreview: "" });
        } catch (error: any) {
            showToast(error.message, true);
        } finally {
            setLoading(false);
        }
    };
    
    // Cloudinary RN upload function (unchanged)
    const uploadToCloudinaryRN = async (imageUri: string) => {
        const type = imageUri.split('.').pop() === 'png' ? 'image/png' : 'image/jpeg';
        const formData = new FormData();
        
        formData.append('file', {
            uri: imageUri,
            name: `profile-${Date.now()}.${type.split('/')[1]}`,
            type: type,
        } as any);
        formData.append('upload_preset', UPLOAD_PRESET);
        
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: "POST",
                body: formData,
            }
        );
        const data = await response.json();
        if (data.secure_url) return data.secure_url;
        throw new Error("Cloudinary upload failed.");
    };

    const handleImageSelection = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setTempData((prev) => ({ 
                ...prev, 
                imgFile: result.assets[0], 
                imgPreview: result.assets[0].uri 
            }));
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            let imgUrl = tempData.img;

            if (tempData.imgFile) {
                showToast("Uploading image...", false);
                imgUrl = await uploadToCloudinaryRN(tempData.imgPreview);
            }

            const response = await axios.put(
                "https://agrofarm-vd8i.onrender.com/api/farmers/update",
                {
                    name: tempData.name,
                    email: tempData.email,
                    phone: tempData.phone,
                    address: tempData.address,
                    img: imgUrl,
                },
                { 
                    withCredentials: true // FIXED: Use withCredentials for Axios PUT
                }
            );

            if (response.status !== 200) {
                throw new Error(response.data.message || "Update failed");
            }

            await fetchProfileData(); 
            setIsEditing(false);
            showToast("Profile updated successfully");
        } catch (error: any) {
            showToast(error.message || "Update failed", true);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                "https://agrofarm-vd8i.onrender.com/api/farmers/logout",
                { 
                    withCredentials: true // FIXED: Use withCredentials for Axios GET
                }
            );

            if (response.status !== 200) throw new Error("Logout failed");

            showToast("Logged out successfully");
            router.replace("/");
        } catch (error: any) {
            showToast(error.message, true);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            showToast("All password fields are required", true);
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast("New passwords do not match", true);
            return;
        }
        if (passwordData.newPassword.length < 6) {
            showToast("New password must be at least 6 characters.", true);
            return;
        }
        
        try {
            setLoading(true);
            const response = await axios.put(
                "https://agrofarm-vd8i.onrender.com/api/farmers/changepassword",
                {
                    oldPassword: passwordData.oldPassword,
                    newPassword: passwordData.newPassword,
                },
                { 
                    withCredentials: true // FIXED: Use withCredentials for Axios PUT
                }
            );

            if (response.status !== 200) {
                throw new Error(response.data.message || "Password change failed");
            }

            showToast("Password changed successfully");
            setIsChangingPassword(false);
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error: any) {
            showToast(error.message, true);
        } finally {
            setLoading(false);
        }
    };
    
    // Fixed: Account deletion logic needed
    const handleDeleteAccount = async () => {
        Alert.alert(
            "Delete Account",
            "Are you sure you want to delete your account? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        setLoading(true);
                        const response = await axios.delete(
                            "https://agrofarm-vd8i.onrender.com/api/farmers/delete",
                            { withCredentials: true }
                        );
                        
                        if (response.status !== 200) {
                             throw new Error("Account deletion failed");
                        }
                        showToast("Account deleted successfully");
                        router.replace("/");
                    } catch (error: any) {
                        showToast(error.message, true);
                    } finally {
                        setLoading(false);
                    }
                }},
            ]
        );
    };

    // Helper function to get ImageSourcePropType or null
    const getImageUrl = () => {
        if (tempData.imgPreview) return { uri: tempData.imgPreview };
        if (typeof tempData.img === "string" && tempData.img) return { uri: tempData.img };
        return null; // Return null when no image source is available
    };

    // Handle password field changes
    const handlePasswordChange = (name: keyof PasswordData, value: string) => {
        // FIXED: Using non-literal string type in interface resolves the implicit any/literal type errors
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    if (loading && !profileData.name) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#16a34a" />
                <Text style={{marginTop: 10, color: '#4b5563'}}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentPadding}>
            <Text style={styles.pageTitle}>Farmer Profile</Text>

            {/* Header Actions */}
            <View style={styles.headerActions}>
                {!isEditing && !isChangingPassword && (
                    <>
                        <TouchableOpacity
                            onPress={() => setIsEditing(true)}
                            style={styles.editButton}
                            disabled={loading}
                        >
                            <Feather name="edit" size={18} color="#10b981" />
                            <Text style={styles.editButtonText}>Edit Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleLogout}
                            style={styles.logoutButton}
                            disabled={loading}
                        >
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
                        {/* FIXED: Conditional rendering ensures 'source' prop is not null */}
                        {getImageUrl() ? (
                            <Image source={getImageUrl()!} style={styles.profileImage} resizeMode="cover" />
                        ) : (
                            <View style={styles.noImage}><Text style={styles.noImageText}>No Image</Text></View>
                        )}

                        {isEditing && (
                            <TouchableOpacity
                                onPress={handleImageSelection}
                                style={styles.cameraButton}
                            >
                                <Feather name="camera" size={18} color="white" />
                            </TouchableOpacity>
                        )}
                        {isEditing && getImageUrl() && (
                            <TouchableOpacity
                                onPress={() => setTempData(prev => ({ ...prev, imgFile: null, imgPreview: "", img: "" }))}
                                style={styles.removeImageButton}
                            >
                                <Feather name="x" size={18} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Profile Info / Form */}
                    <View style={styles.infoContainer}>
                        {isChangingPassword ? (
                            <ScrollView style={{maxHeight: 300, width: '100%'}}>
                                <Text style={styles.formSectionTitle}>Change Password</Text>
                                <TextInput
                                    style={styles.input} placeholder="Old Password" secureTextEntry
                                    value={passwordData.oldPassword}
                                    onChangeText={(text) => handlePasswordChange('oldPassword', text)}
                                />
                                <TextInput
                                    style={styles.input} placeholder="New Password" secureTextEntry
                                    value={passwordData.newPassword}
                                    onChangeText={(text) => handlePasswordChange('newPassword', text)}
                                />
                                <TextInput
                                    style={styles.input} placeholder="Confirm New Password" secureTextEntry
                                    value={passwordData.confirmPassword}
                                    onChangeText={(text) => handlePasswordChange('confirmPassword', text)}
                                />
                            </ScrollView>
                        ) : isEditing ? (
                            <ScrollView style={{maxHeight: 300, width: '100%'}}>
                                <Text style={styles.formSectionTitle}>Edit Profile</Text>
                                <TextInput
                                    style={styles.input} placeholder="Full Name"
                                    value={tempData.name}
                                    onChangeText={(text) => setTempData(p => ({ ...p, name: text }))}
                                />
                                <TextInput
                                    style={styles.input} placeholder="Email" keyboardType="email-address"
                                    value={tempData.email}
                                    onChangeText={(text) => setTempData(p => ({ ...p, email: text }))}
                                />
                                <TextInput
                                    style={styles.input} placeholder="Phone Number" keyboardType="phone-pad"
                                    value={tempData.phone}
                                    onChangeText={(text) => setTempData(p => ({ ...p, phone: text }))}
                                />
                                <TextInput
                                    style={styles.input} placeholder="Address"
                                    value={tempData.address}
                                    onChangeText={(text) => setTempData(p => ({ ...p, address: text }))}
                                />
                            </ScrollView>
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
                        <TouchableOpacity
                            onPress={handleCancel}
                            style={styles.cancelButton}
                            disabled={loading}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={isChangingPassword ? handleChangePassword : handleSave}
                            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.saveButtonText}>
                                    {isChangingPassword ? "Change Password" : "Save Changes"}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <TouchableOpacity
                            onPress={() => setIsChangingPassword(true)}
                            style={styles.changePassButton}
                        >
                            <Feather name="lock" size={16} color="#2563eb" />
                            <Text style={styles.changePassButtonText}>Change Password</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleDeleteAccount}
                            style={styles.deleteButton}
                        >
                            <Feather name="trash-2" size={16} color="#dc2626" />
                            <Text style={styles.deleteButtonText}>Delete Account</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </ScrollView>
    );
};

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
    input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, marginBottom: 10, width: '100%', backgroundColor: 'white', fontSize: 14 },

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

export default FarmerProfileScreen;