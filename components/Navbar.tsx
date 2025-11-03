// components/Navbar.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface NavbarProps {
  onAuthPress: () => void;
  onScrollTo: (section: 'about'  | 'contact') => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAuthPress, onScrollTo }) => {
  return (
    <LinearGradient
      colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.5)', 'transparent']}
      style={styles.navbarContainer}
      // FIXED: Removed pointerEvents="box-none" so the buttons are clickable
    >
      <View style={styles.logoContainer}>
        <Ionicons name="leaf" size={24} color="#4ade80" />
        <Text style={styles.logoText}>FarmConnect</Text>
      </View>
      
      <View style={styles.navLinks}>
        {[
          { label: 'About', id: 'about' as const },
         // { label: 'Features', id: 'features' as const },
          { label: 'Contact', id: 'contact' as const },
        ].map((link) => (
          <TouchableOpacity 
            key={link.id} 
            style={styles.navLinkButton}
            onPress={() => onScrollTo(link.id)} // Scroll handler
          >
            <Text style={styles.navLinkText}>{link.label}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={styles.authButton}
          onPress={onAuthPress}
          activeOpacity={0.8}
        >
          {/* Reduced text size for better fit */}
          <Text style={styles.authButtonText}>Sign In</Text> 
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop:  35,
    paddingBottom: 10,
    paddingHorizontal: 15,
    width: width,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, // Allows it to shrink if necessary
  },
  logoText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  navLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1, // Allows links to squeeze
  },
  navLinkButton: {
    marginHorizontal: 5, // Reduced margin
  },
  navLinkText: {
    color: 'white',
    fontSize: 13, // Reduced font size
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  authButton: {
    marginLeft: 10, // Reduced margin
    backgroundColor: '#16a34a',
    paddingHorizontal: 10, // Reduced padding
    paddingVertical: 6,   // Reduced padding
    borderRadius: 20,
    shadowColor: '#16a34a',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  authButtonText: {
    color: 'white',
    fontSize: 13, // Reduced font size
    fontWeight: '600',
  },
});

export default Navbar;