import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { showToast } from '../../utils/toast';
import API_BASE_URL from '../../utils/api';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Enhanced InputField component matching login design
const InputField = React.memo(({
  name,
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  isPassword = false,
  showPassword = false,
  onTogglePassword,
  focused,
  onFocus,
  onBlur
}) => {
  return (
    <View style={[
      styles.inputWrapper,
      focused === name && styles.inputWrapperFocused
    ]}>
      <View style={styles.inputIconContainer}>
        <Ionicons name={icon} size={20} color="#504B38" />
      </View>
      <TextInput
        style={[styles.input, isPassword && styles.passwordInput]}
        placeholder={placeholder}
        placeholderTextColor="#B9B28A"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        onFocus={() => onFocus(name)}
        onBlur={onBlur}
      />
      {isPassword && (
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={onTogglePassword}
        >
          <Ionicons 
            name={showPassword ? "eye-off-outline" : "eye-outline"} 
            size={20} 
            color="#504B38" 
          />
        </TouchableOpacity>
      )}
    </View>
  );
});

const Register = ({ navigation }) => {
  // User Information
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // Address Information
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast('error', 'Permission Denied', 'Sorry, we need camera roll permissions to select an image');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const manipulatedImage = await manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 500, height: 500 } }],
        { compress: 0.7, format: SaveFormat.JPEG }
      );
      setProfilePhoto(manipulatedImage);
    }
  };

  const validateForm = () => {
    if (!name || !email || !password || !confirmPassword) {
      showToast('error', 'Error', 'Please fill in all required fields');
      return false;
    }

    if (password !== confirmPassword) {
      showToast('error', 'Error', "Passwords don't match!");
      return false;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      showToast('error', 'Error', 'Please enter a valid email address');
      return false;
    }

    if (!street || !city || !country) {
      showToast('error', 'Error', 'Please fill in required address fields');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      
      formData.append('name', name);
      formData.append('email', email.toLowerCase());
      formData.append('password', password);
      
      formData.append('address[street]', street);
      formData.append('address[city]', city);
      formData.append('address[state]', state);
      formData.append('address[postalCode]', postalCode);
      formData.append('address[country]', country);
      
      if (profilePhoto) {
        formData.append('profilePhoto', {
          uri: profilePhoto.uri,
          type: 'image/jpeg',
          name: 'profile.jpg'
        });
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formData
      });

      const responseText = await response.text();
      let data;
      
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error('Invalid server response');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      await AsyncStorage.multiSet([
        ['userToken', data.token],
        ['userData', JSON.stringify(data.user)]
      ]);

      showToast('success', 'Success', 'Account created successfully!');
      navigation.replace('Home');

    } catch (error) {
      console.error('Registration error:', error);
      showToast('error', 'Registration Failed', error.message || 'Could not register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Memoized toggle functions
  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#504B38" />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={pickImage} style={styles.profileImageContainer}>
              <View style={styles.profileImageWrapper}>
                <Image 
                  source={profilePhoto ? { uri: profilePhoto.uri } : require('../../assets/default-profile.png')}
                  style={styles.profileImage}
                />
                <View style={styles.cameraIconContainer}>
                  <Ionicons name="camera" size={18} color="#F8F3D9" />
                </View>
              </View>
              <View style={styles.profileImageShadow} />
            </TouchableOpacity>
            
            <Text style={styles.welcomeText}>Join Drive Smart</Text>
            <Text style={styles.subtitle}>Create your account and start your driving journey</Text>
            
            {/* Decorative Line */}
            <View style={styles.decorativeLine}>
              <View style={styles.lineSegment} />
              <Ionicons name="person-add" size={20} color="#B9B28A" />
              <View style={styles.lineSegment} />
            </View>
          </View>
          
          {/* Form Card */}
          <View style={styles.formCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Create Account</Text>
              <Text style={styles.cardSubtitle}>Fill in your details to get started</Text>
            </View>
            
            {/* Personal Information Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="person-outline" size={18} color="#504B38" />
                </View>
                <Text style={styles.sectionTitle}>Personal Details</Text>
              </View>
              
              <InputField
                name="name"
                icon="person-outline"
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                focused={focusedInput}
                onFocus={setFocusedInput}
                onBlur={() => setFocusedInput(null)}
              />
              
              <InputField
                name="email"
                icon="mail-outline"
                placeholder="Enter your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                focused={focusedInput}
                onFocus={setFocusedInput}
                onBlur={() => setFocusedInput(null)}
              />
              
              <InputField
                name="password"
                icon="lock-closed-outline"
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                isPassword={true}
                secureTextEntry={!showPassword}
                showPassword={showPassword}
                onTogglePassword={toggleShowPassword}
                focused={focusedInput}
                onFocus={setFocusedInput}
                onBlur={() => setFocusedInput(null)}
              />
              
              <InputField
                name="confirmPassword"
                icon="lock-closed-outline"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword={true}
                secureTextEntry={!showConfirmPassword}
                showPassword={showConfirmPassword}
                onTogglePassword={toggleShowConfirmPassword}
                focused={focusedInput}
                onFocus={setFocusedInput}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Address Information Section */}
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="location-outline" size={18} color="#504B38" />
                </View>
                <Text style={styles.sectionTitle}>Address Information</Text>
              </View>
              
              <InputField
                name="street"
                icon="home-outline"
                placeholder="Street address"
                value={street}
                onChangeText={setStreet}
                focused={focusedInput}
                onFocus={setFocusedInput}
                onBlur={() => setFocusedInput(null)}
              />
              
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <InputField
                    name="city"
                    icon="business-outline"
                    placeholder="City"
                    value={city}
                    onChangeText={setCity}
                    focused={focusedInput}
                    onFocus={setFocusedInput}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
                <View style={styles.halfInput}>
                  <InputField
                    name="state"
                    icon="map-outline"
                    placeholder="State/Province"
                    value={state}
                    onChangeText={setState}
                    focused={focusedInput}
                    onFocus={setFocusedInput}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>
              
              <View style={styles.rowInputs}>
                <View style={styles.halfInput}>
                  <InputField
                    name="postalCode"
                    icon="mail-outline"
                    placeholder="Postal Code"
                    value={postalCode}
                    onChangeText={setPostalCode}
                    keyboardType="numeric"
                    focused={focusedInput}
                    onFocus={setFocusedInput}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
                <View style={styles.halfInput}>
                  <InputField
                    name="country"
                    icon="globe-outline"
                    placeholder="Country"
                    value={country}
                    onChangeText={setCountry}
                    focused={focusedInput}
                    onFocus={setFocusedInput}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
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
                    <Text style={styles.registerButtonText}>Create Account</Text>
                    <View style={styles.buttonIconContainer}>
                      <Ionicons name="arrow-forward" size={20} color="#F8F3D9" />
                    </View>
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Sign In</Text>
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
    top: 150,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(80, 75, 56, 0.08)',
  },
  decorativeCircle3: {
    position: 'absolute',
    bottom: 300,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(185, 178, 138, 0.06)',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 25,
    paddingHorizontal: 30,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 55 : 35,
    left: 25,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 25,
  },
  profileImageWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
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
    position: 'relative',
  },
  profileImageShadow: {
    position: 'absolute',
    top: 6,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(80, 75, 56, 0.1)',
    zIndex: 1,
  },
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#504B38',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#504B38',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#B9B28A',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  decorativeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 120,
  },
  lineSegment: {
    flex: 1,
    height: 2,
    backgroundColor: '#B9B28A',
    marginHorizontal: 12,
  },
  formCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    paddingHorizontal: 25,
    paddingTop: 30,
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
    marginBottom: 30,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#504B38',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#B9B28A',
    textAlign: 'center',
    fontWeight: '400',
  },
  sectionContainer: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EBE5C2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#504B38',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F3D9',
    borderRadius: 16,
    marginBottom: 15,
    paddingVertical: 4,
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  inputWrapperFocused: {
    borderColor: '#B9B28A',
    backgroundColor: '#FFFFFF',
    shadowOpacity: 0.12,
  },
  inputIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EBE5C2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 15,
    color: '#504B38',
    fontWeight: '400',
  },
  passwordInput: {
    paddingRight: 45,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  registerButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 15,
    marginBottom: 25,
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  buttonGradient: {
    height: 54,
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
  registerButtonText: {
    color: '#F8F3D9',
    fontSize: 17,
    fontWeight: '600',
    marginRight: 10,
  },
  buttonIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(248, 243, 217, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 5,
  },
  footerText: {
    color: '#B9B28A',
    fontSize: 15,
    fontWeight: '400',
  },
  loginText: {
    color: '#504B38',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default Register;