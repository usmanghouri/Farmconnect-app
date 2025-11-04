

import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

// 1. Import useRouter from Expo Router
import { useRouter } from 'expo-router';
import { forgotPassword, loginUser, registerUser, resendOtp, resetPassword, verifyEmail } from '../utils/apiAuth';
import { UserRole } from '../utils/endpoints';

const { width, height } = Dimensions.get('window');

// API endpoints are wired via utils/apiAuth and utils/endpoints

type Role = UserRole;
type AuthStep = 'auth' | 'forgot' | 'reset' | 'otp';

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

const FormMessages: React.FC<{ error: string; success: string }> = ({ error, success }) => {
  if (!error && !success) return null;
  const message = error || success;
  const isError = !!error;
  const icon = isError ? 'error-outline' : 'check-circle-outline';
  const backgroundColor = isError ? 'rgba(220, 38, 38, 0.2)' : 'rgba(20, 184, 166, 0.2)';
  const borderColor = isError ? '#dc2626' : '#0d9488';
  const color = isError ? '#f87171' : '#5eead4';

  return (
    <View
      style={[
        styles.messageBox,
        { backgroundColor, borderColor },
      ]}
    >
      <MaterialIcons name={icon} size={20} color={color} style={{ marginRight: 10 }} />
      <Text style={[styles.messageText, { color }]}>{message}</Text>
    </View>
  );
};

const AuthModal: React.FC<AuthModalProps> = ({ visible, onClose }) => {
  // 2. Initialize router
  const router = useRouter(); 

  const [isSignup, setIsSignup] = useState(false);
  const [role, setRole] = useState<Role>('Farmer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    address: '',
  });
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<AuthStep>('auth');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const scaleAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible]);

  const resetFormState = () => {
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(false);
  };

  const onModalClose = () => {
    onClose();
    setTimeout(() => {
      // Keep role selection active on close
      setStep('auth');
      setFormData({ email: '', password: '', name: '', phone: '', address: '' });
      setOtp('');
      setNewPassword('');
      resetFormState();
    }, 500); 
  };

  const handleChange = (name: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    resetFormState();
    // ... validation logic (kept the same) ...
    if (!formData.email || !formData.password) {
      setErrorMessage('Email and password are required');
      return false;
    }
    if (!validateEmail(formData.email)) {
      setErrorMessage('Please enter a valid email address');
      return false;
    }
    if (isSignup && (!formData.name || !formData.phone || !formData.address)) {
      setErrorMessage('All fields are required for signup');
      return false;
    }
    return true;
  };

  // --- Real API Call Logic with Navigation ---
  const handleAuth = async () => {
    Keyboard.dismiss();
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      if (isSignup) {
        await registerUser(role, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
        });
        setSuccessMessage(`✅ Registered as ${role}! Please verify your email.`);
        setStep('otp');
      } else {
        await loginUser(role, { email: formData.email, password: formData.password });
        setSuccessMessage(`✅ Logged in successfully as ${role}!`);
        const dashboardPath = `/${role.toLowerCase()}`;
        setTimeout(() => {
          onClose();
          (router as any).replace(dashboardPath);
        }, 800);
      }

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };
  // --- End Real API Call Logic with Navigation ---
  
  const handleVerifyOTP = async () => {
    Keyboard.dismiss();
    if (!otp || otp.length < 4) {
      setErrorMessage("Please enter a valid OTP");
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(role, formData.email, otp);
      setSuccessMessage('✅ Email verified! Please log in.');
      setTimeout(() => {
        setStep('auth');
        setIsSignup(false);
      }, 800);
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    Keyboard.dismiss();
    if (!formData.email) { setErrorMessage('Enter your email first'); return; }
    setLoading(true);
    try {
      await resendOtp(role, formData.email);
      setSuccessMessage('OTP resent to your email');
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };


  const renderAuthForm = () => (
    <View style={styles.formContainer}>
      {/* ... (Input Fields remain the same) ... */}
      {isSignup && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#9ca3af"
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#9ca3af"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => handleChange('phone', text)}
          />
          <TextInput
            style={styles.input}
            placeholder="Address"
            placeholderTextColor="#9ca3af"
            value={formData.address}
            onChangeText={(text) => handleChange('address', text)}
          />
        </>
      )}
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        keyboardType="email-address"
        autoCapitalize="none"
        value={formData.email}
        onChangeText={(text) => handleChange('email', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        value={formData.password}
        onChangeText={(text) => handleChange('password', text)}
      />
      
      {!isSignup && (
        <TouchableOpacity
          style={styles.forgotPasswordButton}
          onPress={() => {
            setStep('forgot');
            resetFormState();
          }}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      )}

      <FormMessages error={errorMessage} success={successMessage} />

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleAuth}
        disabled={loading}
      >
        <LinearGradient
          colors={loading ? ['#9ca3af', '#6b7280'] : ['#22c55e', '#16a34a']}
          style={styles.submitButtonGradient}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isSignup ? 'Create Account' : 'Sign In'}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderOTPForm = () => (
    <View style={styles.formContainer}>
      <Text style={styles.resetText}>
        We've sent a 6-digit code to {formData.email}
      </Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter OTP"
        placeholderTextColor="#9ca3af"
        keyboardType="numeric"
        maxLength={6}
        value={otp}
        onChangeText={setOtp}
      />
      
      <FormMessages error={errorMessage} success={successMessage} />
      
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.submitButton, { flex: 1 }]}
          onPress={handleVerifyOTP}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#9ca3af', '#6b7280'] : ['#22c55e', '#16a34a']}
            style={styles.submitButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Verify OTP</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resendButton, { flex: 1 }]}
          onPress={handleResendOtp}
          disabled={loading}
        >
          <Text style={styles.resendButtonText}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep('auth')}
      >
        <Ionicons name="arrow-back" size={18} color="#9ca3af" />
        <Text style={styles.backButtonText}>Back to {isSignup ? 'Sign Up' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );

  // Simplified renderGenericForm (for forgot/reset steps)
  const renderGenericForm = (
    title: string,
    submitText: string,
    onSubmit: () => Promise<void>,
    children: React.ReactNode
  ) => (
    <View style={styles.formContainer}>
      <Text style={styles.resetText}>{title}</Text>
      {children}
      <FormMessages error={errorMessage} success={successMessage} />
      
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.submitButton, { flex: 1 }]}
          onPress={onSubmit}
          disabled={loading}
        >
          <LinearGradient
            colors={loading ? ['#9ca3af', '#6b7280'] : ['#22c55e', '#16a34a']}
            style={styles.submitButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>{submitText}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.cancelButton, { flex: 1 }]}
          onPress={() => setStep('auth')}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => setStep('auth')}
      >
        <Ionicons name="arrow-back" size={18} color="#9ca3af" />
        <Text style={styles.backButtonText}>Back to {isSignup ? 'Sign Up' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );


  const renderContent = () => {
    switch (step) {
      case 'otp':
        return renderOTPForm();
      case 'forgot':
        return renderGenericForm('Forgot Password', 'Send OTP', async () => {
          Keyboard.dismiss();
          setLoading(true);
          setErrorMessage(''); setSuccessMessage('');
          try {
            if (!formData.email || !formData.phone) { setErrorMessage('Email and phone are required'); return; }
            await forgotPassword(role, formData.email, formData.phone);
            setSuccessMessage('OTP sent to your email/phone');
            setStep('reset');
          } catch (e) {
            setErrorMessage(e instanceof Error ? e.message : 'Failed to send OTP');
          } finally {
            setLoading(false);
          }
        }, (
          <>
            <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9ca3af" keyboardType="email-address" autoCapitalize="none" value={formData.email} onChangeText={(t) => handleChange('email', t)} />
            <TextInput style={styles.input} placeholder="Phone" placeholderTextColor="#9ca3af" keyboardType="phone-pad" value={formData.phone} onChangeText={(t) => handleChange('phone', t)} />
          </>
        ));
      case 'reset':
        return renderGenericForm('Reset Password', 'Reset', async () => {
          Keyboard.dismiss();
          setLoading(true);
          setErrorMessage(''); setSuccessMessage('');
          try {
            if (!formData.email || !formData.phone || !otp || !newPassword) { setErrorMessage('All fields are required'); return; }
            await resetPassword(role, formData.email, formData.phone, otp, newPassword);
            setSuccessMessage('Password updated. Please login.');
            setTimeout(() => { setStep('auth'); setIsSignup(false); }, 800);
          } catch (e) {
            setErrorMessage(e instanceof Error ? e.message : 'Failed to reset password');
          } finally {
            setLoading(false);
          }
        }, (
          <>
            <TextInput style={styles.input} placeholder="OTP" placeholderTextColor="#9ca3af" keyboardType="numeric" value={otp} onChangeText={setOtp} />
            <TextInput style={styles.input} placeholder="New Password" placeholderTextColor="#9ca3af" secureTextEntry value={newPassword} onChangeText={setNewPassword} />
          </>
        ));
      case 'auth':
      default:
        return renderAuthForm();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onModalClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {/* Close Button */}
              <TouchableOpacity style={styles.closeButton} onPress={onModalClose}>
                <Ionicons name="close" size={24} color="#f8fafb" />
              </TouchableOpacity>

              {/* Header */}
              <Text style={styles.modalTitle}>
                {step === 'otp' ? 'Verify Your Email' : isSignup ? `Join as ${role}` : `Welcome Back ${role}`}
              </Text>

              {/* Role Selection */}
              {step === 'auth' && (
                <View style={styles.roleSelector}>
                  {(['Farmer', 'Buyer', 'Supplier'] as Role[]).map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.roleButton,
                        role === r ? styles.roleButtonActive : styles.roleButtonInactive,
                      ]}
                      onPress={() => setRole(r)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.roleButtonText}>{r}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Forms */}
              {renderContent()}

              {/* Sign Up/Login Toggle */}
              {step === 'auth' && (
                <View style={styles.toggleContainer}>
                  <Text style={styles.toggleText}>
                    {isSignup ? 'Already have an account?' : 'New to FarmConnect?'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsSignup(!isSignup);
                      resetFormState();
                    }}
                  >
                    <Text style={styles.toggleLinkText}>
                      {isSignup ? 'Sign In' : 'Create Account'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
    maxHeight: height * 0.9,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  // CORRECTED CLOSE BUTTON STYLE
  closeButton: {
     position: 'absolute',
     top: 1,
     right: 0.5,
     zIndex: 0.5,
     backgroundColor: '#dc2626',
    borderRadius: 20,
    padding: 0.2,
   },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  roleButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  roleButtonActive: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  roleButtonInactive: {
    backgroundColor: '#374151',
  },
  roleButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    gap: 15,
  },
  input: {
    backgroundColor: '#1f2937',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: '#374151',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#6ee7b7',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  submitButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  toggleText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  toggleLinkText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  messageBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageText: {
    fontSize: 14,
    flexShrink: 1,
  },
  resetText: {
    color: '#d1d5db',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  resendButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  resendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: '#4b5563',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 10,
  },
  backButtonText: {
    color: '#9ca3af',
    fontSize: 14,
    marginLeft: 5,
  },
});

export default AuthModal;

