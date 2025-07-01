import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, ScrollView, Alert, Image,
  Platform, ActivityIndicator, Dimensions, ActionSheetIOS,
  Animated, Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../../utils/api';

const { width, height } = Dimensions.get('window');

const Report = ({ navigation }) => {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const slideAnim = useState(new Animated.Value(50))[0];

  // Request media library and camera permissions
  useEffect(() => {
    (async () => {
      const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (mediaStatus !== 'granted') {
        Alert.alert('Permission required', 'Need media library permission to select photos');
      }
      if (cameraStatus !== 'granted') {
        Alert.alert('Permission required', 'Need camera permission to take photos');
      }
    })();

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const showImagePickerOptions = () => {
    if (photos.length >= 5) {
      Alert.alert('Limit Reached', 'You can only add up to 5 photos.');
      return;
    }

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            pickImage();
          }
        }
      );
    } else {
      Alert.alert(
        'Add Photo',
        'Choose an option',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Take Photo', onPress: () => takePhoto() },
          { text: 'Choose from Library', onPress: () => pickImage() },
        ]
      );
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const newPhoto = {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: `photo_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`
        };
        setPhotos(prev => [...prev, newPhoto]);
        
        // Animate new photo addition
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          Animated.spring(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
        selectionLimit: 5 - photos.length
      });

      if (!result.canceled) {
        const newPhotos = result.assets.map(asset => ({
          uri: asset.uri,
          type: 'image/jpeg',
          name: `photo_${Date.now()}_${Math.floor(Math.random() * 1000)}.jpg`
        }));
        setPhotos(prev => [...prev, ...newPhotos]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to select images');
    }
  };

  const removePhoto = (index) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setPhotos(prev => prev.filter((_, i) => i !== index))
        }
      ]
    );
  };

  const validateForm = () => {
    if (!description.trim()) {
      Alert.alert('Missing Information', 'Please provide a description of what happened.');
      return false;
    }
    if (!location.trim()) {
      Alert.alert('Missing Information', 'Please specify where this occurred.');
      return false;
    }
    if (photos.length === 0) {
      Alert.alert('Missing Information', 'Please add at least one photo as evidence.');
      return false;
    }
    return true;
  };

  const submitReport = async () => {
    try {
      if (!validateForm()) return;

      setIsSubmitting(true);
      
      // Get token
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Authentication Error', 'Please login to submit reports');
        return;
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('location', location.trim());

      // Add photos to FormData
      photos.forEach((photo, index) => {
        formData.append('photos', {
          uri: Platform.OS === 'android' ? photo.uri : photo.uri.replace('file://', ''),
          type: photo.type,
          name: photo.name
        });
      });

      // Submit report
      const response = await fetch(`${API_BASE_URL}/report/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Submission failed');
      }

      // Show success animation
      setShowSuccess(true);
      
      setTimeout(() => {
        Alert.alert(
          'Success!',
          'Your report has been submitted successfully. Thank you for helping make our community safer.',
          [{ 
            text: 'OK', 
            onPress: () => {
              // Reset form
              setDescription('');
              setLocation('');
              setPhotos([]);
              setShowSuccess(false);
              navigation.goBack();
            }
          }]
        );
      }, 1500);

    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert(
        'Submission Failed', 
        error.message || 'Unable to submit report. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = description.trim() && location.trim() && photos.length > 0;

  return (
    <View style={styles.container}>
      {/* Animated decorative background elements */}
      <Animated.View style={[
        styles.decorativeCircle1,
        { opacity: fadeAnim }
      ]} />
      <Animated.View style={[
        styles.decorativeCircle2,
        { opacity: fadeAnim }
      ]} />
      
      {/* Success overlay */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <Animated.View style={[
            styles.successCard,
            { 
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <Ionicons name="checkmark-circle" size={64} color="#2ecc71" />
            <Text style={styles.successText}>Report Submitted!</Text>
          </Animated.View>
        </View>
      )}
      
      <ScrollView 
        style={styles.scrollContainer} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[
          styles.header,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#504B38" />
          </TouchableOpacity>
          <Text style={styles.title}>Submit Report</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        <Animated.View style={[
          styles.form,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {/* Description Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              multiline
              numberOfLines={4}
              placeholder="Describe what happened, when it occurred, and any other relevant details..."
              placeholderTextColor="#B9B28A"
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />
          </View>

          {/* Location Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Street address, landmark, or area description"
              placeholderTextColor="#B9B28A"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Photos Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Evidence Photos (Max 5) *</Text>
            <TouchableOpacity 
              style={[
                styles.uploadButton, 
                photos.length >= 5 && styles.buttonDisabled
              ]} 
              onPress={showImagePickerOptions}
              disabled={photos.length >= 5}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={photos.length >= 5 ? ['#999', '#666'] : ['#504B38', '#B9B28A']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons 
                  name={photos.length >= 5 ? "ban" : "camera"} 
                  size={20} 
                  color="#F8F3D9" 
                />
                <Text style={styles.uploadButtonText}>
                  {photos.length >= 5 ? 'Maximum reached' : `Add Photos (${photos.length}/5)`}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.photosContainer}>
              {photos.map((photo, index) => (
                <Animated.View 
                  key={index} 
                  style={[
                    styles.photoItem,
                    { transform: [{ scale: scaleAnim }] }
                  ]}
                >
                  <Image source={{ uri: photo.uri }} style={styles.photo} />
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => removePhoto(index)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(231, 76, 60, 0.9)', 'rgba(192, 57, 43, 0.9)']}
                      style={styles.deleteButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name="close" size={16} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton, 
              (!isFormValid || isSubmitting) && styles.submitDisabled
            ]}
            onPress={submitReport}
            disabled={!isFormValid || isSubmitting}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={(!isFormValid || isSubmitting) ? ['#999', '#666'] : ['#504B38', '#B9B28A']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {isSubmitting ? (
                <>
                  <ActivityIndicator color="#F8F3D9" size="small" />
                  <Text style={styles.submitText}>Submitting...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#F8F3D9" />
                  <Text style={styles.submitText}>Submit Report</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              💡 Tip: Include clear photos and detailed descriptions to help authorities respond effectively.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3D9',
  },
  scrollContainer: {
    flex: 1,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -75,
    right: -75,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(185, 178, 138, 0.08)',
    zIndex: 0,
  },
  decorativeCircle2: {
    position: 'absolute',
    top: height * 0.3,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(80, 75, 56, 0.06)',
    zIndex: 0,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  successText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2ecc71',
    marginTop: 15,
  },
  content: {
    paddingBottom: 30,
    zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    backgroundColor: 'rgba(248, 243, 217, 0.95)',
    backdropFilter: 'blur(10px)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(80, 75, 56, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#504B38',
    letterSpacing: 0.5,
  },
  form: {
    padding: 20,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    color: '#504B38',
    letterSpacing: 0.3,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EBE5C2',
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    color: '#504B38',
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  uploadButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#F8F3D9',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  photoItem: {
    width: (width - 60) / 3,
    height: (width - 60) / 3,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#EBE5C2',
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  photo: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  submitDisabled: {
    opacity: 0.6,
  },
  submitText: {
    color: '#F8F3D9',
    fontWeight: '700',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  helpContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'rgba(185, 178, 138, 0.1)',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#B9B28A',
  },
  helpText: {
    fontSize: 14,
    color: '#504B38',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default Report;