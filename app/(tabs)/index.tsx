import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StyleSheet,
  StatusBar,
  Animated,
  Easing,
  Linking,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

// CORRECTED PATH: Jumps up two levels to the project root to find 'components'
import Navbar from '../../components/Navbar';
import AuthModal from '../../components/AuthModal';

const { width, height } = Dimensions.get('window');

// Define types
interface CountState {
  farmers: number;
  buyers: number;
  products: number;
}

type SectionId = 'about' | 'features' | 'contact';
type SocialPlatform = 'facebook' | 'twitter' | 'instagram' | 'linkedin';

const Index = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [count, setCount] = useState<CountState>({ farmers: 0, buyers: 0, products: 0 });
  
  // SCROLLING REFS
  const scrollViewRef = useRef<ScrollView>(null);
  const aboutRef = useRef<View>(null);
  const featuresRef = useRef<LinearGradient>(null); // Use LinearGradient type for features ref
  const contactRef = useRef<View>(null);

  const sectionRefs = {
    about: aboutRef,
   // features: featuresRef,
    contact: contactRef,
  };

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // SMOOTH SCROLL HANDLER: Measures target component position and scrolls to it.
  const handleScrollTo = (section: SectionId) => {
    const targetRef = sectionRefs[section];

    targetRef.current?.measureLayout(
      // The first argument is the ancestor view (ScrollView in this case)
      scrollViewRef.current as any, 
      (x, y) => {
        // Offset for better positioning (e.g., to leave room for the fixed Navbar)
        const offset = Platform.OS === 'android' ? 70 : 90; 
        
        scrollViewRef.current?.scrollTo({ 
          y: y - offset, 
          animated: true 
        });
      },
      () => {
        // Layout measurement failed (e.g., component not yet rendered)
      }
    );
  };

  useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true, }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true, }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true, }),
    ]).start();

    // Floating animation
    const startFloating = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, { toValue: 1, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, }),
          Animated.timing(floatAnim, { toValue: 0, duration: 2000, easing: Easing.inOut(Easing.sin), useNativeDriver: true, }),
        ])
      ).start();
    };
    startFloating();

    // Counter animation
    const maxCounts = { farmers: 5000, buyers: 3500, products: 10000 };
    const stepSizes = { farmers: 50, buyers: 35, products: 100 };

    const counterInterval = setInterval(() => {
      setCount(prev => ({
        farmers: prev.farmers < maxCounts.farmers ? Math.min(prev.farmers + stepSizes.farmers, maxCounts.farmers) : maxCounts.farmers,
        buyers: prev.buyers < maxCounts.buyers ? Math.min(prev.buyers + stepSizes.buyers, maxCounts.buyers) : maxCounts.buyers,
        products: prev.products < maxCounts.products ? Math.min(prev.products + stepSizes.products, maxCounts.products) : maxCounts.products,
      }));
    }, 50);

    const timeout = setTimeout(() => {
        clearInterval(counterInterval);
    }, 5000);

    return () => {
      clearInterval(counterInterval);
      clearTimeout(timeout);
    };
  }, []);

  const openEmail = (email: string) => { Linking.openURL(`mailto:${email}`); };
  const openPhone = (phone: string) => { Linking.openURL(`tel:${phone}`); };
  const openSocialMedia = (platform: SocialPlatform) => {
    const urls = {
      facebook: 'https://facebook.com/farmconnect', twitter: 'https://twitter.com/farmconnect',
      instagram: 'https://instagram.com/farmconnect', linkedin: 'https://linkedin.com/company/farmconnect',
    };
    Linking.openURL(urls[platform]);
  };
  
  const floatingTranslateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });
  
  const mockImage = require('../../assets/images/hero.jpg'); // Adjusted path for assets

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Navbar with smooth scroll handler */}
      <Navbar onAuthPress={() => setIsAuthModalOpen(true)} onScrollTo={handleScrollTo} />

      <ScrollView 
        ref={scrollViewRef} // Attach ScrollView Ref
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image 
            source={mockImage} 
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)', 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.heroOverlay}
          />
          
          <Animated.View 
            style={[
              styles.heroContent,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] }
            ]}
          >
            <Animated.View style={{ transform: [{ translateY: floatingTranslateY }] }}>
              <Ionicons name="leaf" size={40} color="#4ade80" style={styles.leafIcon} />
            </Animated.View>
            
            <Text style={styles.heroTitle}>Welcome to FarmConnect</Text>
            <Text style={styles.heroSubtitle}>Revolutionizing Agriculture by Connecting Farmers, Buyers & Suppliers</Text>
            <Text style={styles.heroTagline}>Growing Together. Thriving Together.</Text>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => setIsAuthModalOpen(true)}
              activeOpacity={0.8}
            >
              <LinearGradient colors={['#22c55e', '#16a34a']} style={styles.ctaGradient}>
                <Text style={styles.ctaText}>Get Started</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Stats Section */}
        <LinearGradient colors={['#15803d', '#166534']} style={styles.statsSection}>
          <View style={styles.statsContainer}>
            {[
              { key: 'farmers', label: 'Farmers Connected', icon: 'people' as const },
              { key: 'buyers', label: 'Active Buyers', icon: 'business' as const },
              { key: 'products', label: 'Products Listed', icon: 'inventory' as const }
            ].map((stat) => (
              <Animated.View key={stat.key} style={[ styles.statItem, { transform: [{ translateY: floatingTranslateY }] } ]} >
                <MaterialIcons name={stat.icon} size={40} color="white" />
                <Text style={styles.statNumber}>{count[stat.key].toLocaleString()}+</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </Animated.View>
            ))}
          </View>
        </LinearGradient>

        {/* About Section - ATTACH REF HERE */}
        <View style={styles.aboutSection} ref={aboutRef}>
          <Text style={styles.sectionBadge}>About Us</Text>
          <Text style={styles.sectionTitle}>About FarmConnect</Text>
          
          <View style={styles.aboutContent}>
            <View style={styles.aboutImageContainer}>
              <Image source={mockImage} style={styles.aboutImage} resizeMode="cover" />
            </View>
            
            <View style={styles.aboutText}>
              <Text style={styles.aboutParagraph}>FarmConnect is a revolutionary digital platform designed to bridge the gap between farmers, buyers, and suppliers.</Text>
              <Text style={styles.aboutParagraph}>Our mission is to create a seamless and transparent agricultural marketplace where all stakeholders can trade efficiently without the interference of middlemen.</Text>
              <Text style={styles.aboutParagraph}>By leveraging technology, we empower farmers to sell their products at fair prices, buyers to access fresh and high-quality produce, and suppliers to provide essential farming materials with ease.</Text>
              
              <TouchableOpacity style={styles.learnMoreButton} onPress={() => handleScrollTo('features')}>
                <Text style={styles.learnMoreText}>Learn More →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Vision Section (Keep standard for visual flow) */}
        <View style={styles.visionSection}>
          <View style={styles.visionContent}>
            <Image source={mockImage} style={styles.visionImage} resizeMode="cover" />
            <View style={styles.visionText}>
              <Text style={styles.sectionBadge}>Our Vision</Text>
              <Text style={styles.visionTitle}>Connecting Tomorrow's Agriculture</Text>
              <Text style={styles.visionParagraph}>We envision a future where farmers, buyers, and suppliers seamlessly connect through technology, ensuring transparency, fair pricing, and sustainable agricultural practices.</Text>
            </View>
          </View>
        </View>

        {/* Mission Section (Keep standard for visual flow) */}
        <View style={styles.missionSection}>
          <View style={styles.missionContent}>
            <View style={styles.missionText}>
              <Text style={styles.sectionBadge}>Our Mission</Text>
              <Text style={styles.missionTitle}>Revolutionizing Agriculture</Text>
              <Text style={styles.missionParagraph}>Our mission is to create an efficient, transparent, and fair agricultural trading system by leveraging cutting-edge technology.</Text>
            </View>
            <Image source={mockImage} style={styles.missionImage} resizeMode="cover" />
          </View>
        </View>

        {/* Features Section - ATTACH REF HERE */}
        <LinearGradient
          colors={['#f0fdf4', '#ffffff']}
          style={styles.featuresSection}
          ref={featuresRef as any} // Must cast to any as Animated.ScrollView ref typing can be tricky
        >
          <Text style={styles.sectionBadge}>Our Features</Text>
          <Text style={styles.sectionTitle}>Why Choose FarmConnect</Text>
          
          <View style={styles.featuresGrid}>
            {[
              { icon: '🌱', title: 'Direct Marketplace', description: 'Connect directly with buyers and suppliers without intermediaries' },
              { icon: '📱', title: 'Real-Time Updates', description: 'Get live market prices and trends to make informed decisions' },
              { icon: '🔒', title: 'Secure Transactions', description: 'Safe and transparent payment system for all parties' },
              { icon: '🚚', title: 'Logistics Support', description: 'Integrated transportation solutions for product delivery' },
              { icon: '📊', title: 'Data Insights', description: 'AI-powered analytics to optimize your agricultural business' },
              { icon: '🌍', title: 'Sustainability Focus', description: 'Promoting environmentally friendly farming practices' },
            ].map((feature, index) => (
              <Animated.View 
                key={index}
                style={[ styles.featureCard, { transform: [{ translateY: floatingTranslateY }] } ]}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </Animated.View>
            ))}
          </View>
        </LinearGradient>

        {/* Contact Section - ATTACH REF HERE */}
        <View style={styles.contactSection} ref={contactRef}>
          <Text style={styles.sectionBadge}>Contact Us</Text>
          <Text style={styles.sectionTitle}>Get in Touch</Text>
          <Text style={styles.contactSubtitle}>Have questions or want to learn more? Reach out to us - we're here to help you grow!</Text>
          
          <View style={styles.contactContent}>
            {/* Contact Info */}
            <View style={styles.contactInfo}>
              {/* ... Contact Items ... */}
              <TouchableOpacity style={styles.contactItem} onPress={() => Linking.openURL('https://maps.google.com/')}>
                <View style={styles.contactIcon}><Ionicons name="location" size={20} color="#16a34a" /></View>
                <View><Text style={styles.contactTitle}>Our Office</Text><Text style={styles.contactText}>123 Farm Road{'\n'}Agricultural City, AC 12345</Text></View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactItem} onPress={() => openPhone('+12345678900')}>
                <View style={styles.contactIcon}><Ionicons name="call" size={20} color="#16a34a" /></View>
                <View><Text style={styles.contactTitle}>Phone Number</Text><Text style={styles.contactText}>+1 (234) 567-8900</Text></View>
              </TouchableOpacity>
              <TouchableOpacity style={styles.contactItem} onPress={() => openEmail('info@farmconnect.com')}>
                <View style={styles.contactIcon}><Ionicons name="mail" size={20} color="#16a34a" /></View>
                <View><Text style={styles.contactTitle}>Email Address</Text><Text style={styles.contactText}>info@farmconnect.com</Text></View>
              </TouchableOpacity>
              
              {/* Social Media */}
              <View style={styles.socialMedia}>
                {[{ platform: 'facebook', icon: 'logo-facebook' as const, color: '#1877F2' }].map((social, index) => (
                  <TouchableOpacity key={index} style={[styles.socialButton, { backgroundColor: social.color }]} onPress={() => openSocialMedia(social.platform as SocialPlatform)}>
                    <Ionicons name={social.icon} size={24} color="white" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Contact Form */}
            <View style={styles.contactForm}>
              <TextInput style={styles.formInput} placeholder="Your Name" placeholderTextColor="#9ca3af" />
              <TextInput style={styles.formInput} placeholder="Your Email" placeholderTextColor="#9ca3af" keyboardType="email-address" />
              <TextInput style={[styles.formInput, styles.messageInput]} placeholder="Your Message" placeholderTextColor="#9ca3af" multiline numberOfLines={5} textAlignVertical="top" />
              <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Send Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Footer */}
        <LinearGradient colors={['#14532d', '#0f172a']} style={styles.footer}>
          <View style={styles.footerContent}>
            <Text style={styles.footerTitle}>FarmConnect</Text>
            <View style={styles.footerDivider} />
            <View style={styles.footerLinks}>
              {/* Footer Links with smooth scroll */}
              <TouchableOpacity onPress={() => handleScrollTo('about')}><Text style={styles.footerLink}>About</Text></TouchableOpacity>
              {/* <TouchableOpacity onPress={() => handleScrollTo('features')}><Text style={styles.footerLink}>Features</Text></TouchableOpacity> */}
              <TouchableOpacity onPress={() => handleScrollTo('contact')}><Text style={styles.footerLink}>Contact</Text></TouchableOpacity>
            </View>
          </View>
          <View style={styles.footerDivider} />
          <Text style={styles.footerCopyright}>
            © 2024 FarmConnect. All rights reserved. | Designed with ❤️ by FarmConnect
          </Text>
        </LinearGradient>
      </ScrollView>

      {/* Auth Modal */}
      <AuthModal
        visible={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </View>
  );
};

// ... STYLES (Kept as provided) ...

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  heroSection: {
    height: height,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    position: 'relative',
    zIndex: 10,
  },
  leafIcon: {
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: width > 400 ? 42 : 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  heroTagline: {
    fontSize: 16,
    color: '#86efac',
    textAlign: 'center',
    marginBottom: 40,
    fontWeight: '600',
  },
  ctaButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: 16,
    paddingHorizontal: 40,
  },
  ctaText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  statsSection: {
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  aboutSection: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  sectionBadge: {
    alignSelf: 'center',
    backgroundColor: '#dcfce7',
    color: '#16a34a',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#1f2937',
  },
  aboutContent: {
    alignItems: 'center',
  },
  aboutImageContainer: {
    marginBottom: 30,
    borderRadius: 15,
    overflow: 'hidden',
  },
  aboutImage: {
    width: width - 40,
    height: 250,
    borderRadius: 15,
  },
  aboutText: {
    paddingHorizontal: 20,
  },
  aboutParagraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 16,
    textAlign: 'center',
  },
  learnMoreButton: {
    alignSelf: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  learnMoreText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  visionSection: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    backgroundColor: '#f9fafb',
  },
  visionContent: {
    alignItems: 'center',
  },
  visionImage: {
    width: width - 40,
    height: 250,
    borderRadius: 15,
    marginBottom: 30,
  },
  visionText: {
    paddingHorizontal: 20,
  },
  visionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1f2937',
  },
  visionParagraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 16,
    textAlign: 'center',
  },
  missionSection: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  missionContent: {
    alignItems: 'center',
  },
  missionText: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  missionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1f2937',
  },
  missionParagraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4b5563',
    marginBottom: 16,
    textAlign: 'center',
  },
  missionImage: {
    width: width - 40,
    height: 250,
    borderRadius: 15,
  },
  featuresSection: {
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  featureIcon: {
    fontSize: 30,
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
    marginBottom: 10,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  contactSection: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  contactSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  contactContent: {
    gap: 40,
  },
  contactInfo: {
    gap: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  contactIcon: {
    width: 44,
    height: 44,
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5,
  },
  contactText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  socialMedia: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
    justifyContent: 'center',
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactForm: {
    gap: 20,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  footerContent: {
    alignItems: 'center',
    marginBottom: 25,
  },
  footerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 25,
    letterSpacing: 1,
  },
  footerDivider: {
    width: '80%',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 40,
    justifyContent: 'center',
  },
  footerLink: {
    color: '#d1d5db',
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  footerCopyright: {
    color: '#9ca3af',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
    marginTop: 20,
  },
});

export default Index;