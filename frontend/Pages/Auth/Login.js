import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Image, 
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { showToast } from '../../utils/toast';
import API_BASE_URL from '../../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const validateForm = () => {
    if (!email.trim()) {
      showToast('error', 'Email Required', 'Please enter your email address');
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showToast('error', 'Invalid Email', 'Please enter a valid email address');
      return false;
    }

    if (!password.trim()) {
      showToast('error', 'Password Required', 'Please enter your password');
      return false;
    }

    if (password.length < 6) {
      showToast('error', 'Password Too Short', 'Password must be at least 6 characters');
      return false;
    }

    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim()
        })
      });

      if (!response) {
        throw new Error('No response from server');
      }

      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Failed to parse JSON:', responseText);
        throw new Error('Server returned invalid data');
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.token || !data.user) {
        throw new Error('Invalid response format');
      }

      await AsyncStorage.multiSet([
        ['userToken', data.token],
        ['userData', JSON.stringify(data.user)],
        ['isAuthenticated', 'true']
      ]);

      showToast('success', 'Login Successful', `Welcome back, ${data.user.name || data.user.email}!`);
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });

    } catch (error) {
      console.error('Login Error:', error);
      showToast(
        'error', 
        'Login Failed', 
        error.message || 'An error occurred during login'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#F8F3D9', '#EBE5C2']}
        style={styles.gradientContainer}
      >
        {/* Decorative Background Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />
        
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Image 
                  source={require('../../assets/driveSmartLogo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.logoShadow} />
            </View>
            <Text style={styles.welcomeText}>Drive Smart Academy</Text>
            <Text style={styles.subtitle}>Your journey to confident driving starts here</Text>
            
            {/* Decorative Line */}
            <View style={styles.decorativeLine}>
              <View style={styles.lineSegment} />
              <Ionicons name="car-sport" size={20} color="#B9B28A" />
              <View style={styles.lineSegment} />
            </View>
          </View>
          
          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Welcome Back</Text>
              <Text style={styles.cardSubtitle}>Sign in to continue your driving journey</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <View style={[
                styles.inputWrapper,
                focusedInput === 'email' && styles.inputWrapperFocused
              ]}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="mail-outline" size={20} color="#504B38" />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#B9B28A"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>
              
              <View style={[
                styles.inputWrapper,
                focusedInput === 'password' && styles.inputWrapperFocused
              ]}>
                <View style={styles.inputIconContainer}>
                  <Ionicons name="lock-closed-outline" size={20} color="#504B38" />
                </View>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Enter your password"
                  placeholderTextColor="#B9B28A"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={handleLogin}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#504B38" 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#504B38', '#B9B28A']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#F8F3D9" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.loginButtonText}>Start Your Journey</Text>
                    <View style={styles.buttonIconContainer}>
                      <Ionicons name="arrow-forward" size={20} color="#F8F3D9" />
                    </View>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Alternative Login Methods */}
            <View style={styles.alternativeSection}>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>or sign in with</Text>
                <View style={styles.divider} />
              </View>
              
              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="finger-print" size={24} color="#504B38" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-google" size={24} color="#504B38" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-apple" size={24} color="#504B38" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Registration Link */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>New to Drive Smart? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.signUpText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
    position: 'relative',
  },
  // Decorative Elements
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(185, 178, 138, 0.1)',
  },
  decorativeCircle2: {
    position: 'absolute',
    top: 100,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(80, 75, 56, 0.08)',
  },
  decorativeCircle3: {
    position: 'absolute',
    bottom: 200,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(185, 178, 138, 0.06)',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    minHeight: height,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 30,
    paddingHorizontal: 30,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoBackground: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 2,
  },
  logoShadow: {
    position: 'absolute',
    top: 8,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(80, 75, 56, 0.1)',
    zIndex: 1,
  },
  logo: {
    width: 60,
    height: 60,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#504B38',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#B9B28A',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 25,
  },
  decorativeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
  },
  lineSegment: {
    flex: 1,
    height: 2,
    backgroundColor: '#B9B28A',
    marginHorizontal: 15,
  },
  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 30,
    paddingTop: 35,
    paddingBottom: 30,
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: -5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 35,
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#504B38',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#B9B28A',
    textAlign: 'center',
    fontWeight: '400',
  },
  inputContainer: {
    marginBottom: 25,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F3D9',
    borderRadius: 18,
    marginBottom: 18,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputWrapperFocused: {
    borderColor: '#B9B28A',
    backgroundColor: '#FFFFFF',
    shadowOpacity: 0.15,
  },
  inputIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: '#EBE5C2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  input: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#504B38',
    fontWeight: '400',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 30,
    paddingVertical: 5,
  },
  forgotPasswordText: {
    color: '#B9B28A',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 30,
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    height: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#F8F3D9',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 10,
  },
  buttonIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(248, 243, 217, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alternativeSection: {
    marginBottom: 25,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  divider: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#EBE5C2',
  },
  dividerText: {
    marginHorizontal: 20,
    color: '#B9B28A',
    fontSize: 14,
    fontWeight: '400',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F8F3D9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EBE5C2',
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 10,
  },
  footerText: {
    color: '#B9B28A',
    fontSize: 16,
    fontWeight: '400',
  },
  signUpText: {
    color: '#504B38',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Login;