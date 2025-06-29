import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, ScrollView, Alert, Image,
  Platform, ActivityIndicator, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../../utils/api';

const { width } = Dimensions.get('window');

const Report = ({ navigation }) => {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [photos, setPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Request media library permissions
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Need media library permission to select photos');
      }
    })();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
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
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const submitReport = async () => {
    try {
      // Validation
      if (!description.trim()) throw new Error('Description is required');
      if (!location.trim()) throw new Error('Location is required');
      if (photos.length === 0) throw new Error('At least one photo is required');

      setIsSubmitting(true);
      
      // Get token
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('Please login to submit reports');

      // Prepare FormData
      const formData = new FormData();
      formData.append('description', description.trim());
      formData.append('location', location.trim());

      // Add photos to FormData
      photos.forEach((photo) => {
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

      Alert.alert(
        'Success',
        'Report submitted successfully!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

      // Reset form
      setDescription('');
      setLocation('');
      setPhotos([]);

    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', error.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Decorative Background Elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#504B38" />
        </TouchableOpacity>
        <Text style={styles.title}>Submit Report</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Describe what happened..."
          placeholderTextColor="#B9B28A"
          value={description}
          onChangeText={setDescription}
        />

        <Text style={styles.label}>Location *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Where did this occur?"
          placeholderTextColor="#B9B28A"
          value={location}
          onChangeText={setLocation}
        />

        <Text style={styles.label}>Photos (Max 5) *</Text>
        <TouchableOpacity 
          style={[styles.uploadButton, photos.length >= 5 && styles.buttonDisabled]} 
          onPress={pickImage}
          disabled={photos.length >= 5}
        >
          <LinearGradient
            colors={['#504B38', '#B9B28A']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="cloud-upload" size={20} color="#F8F3D9" />
            <Text style={styles.uploadButtonText}>
              {photos.length >= 5 ? 'Maximum reached' : 'Select Photos'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.photosContainer}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoItem}>
              <Image source={{ uri: photo.uri }} style={styles.photo} />
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={() => removePhoto(index)}
              >
                <LinearGradient
                  colors={['rgba(80, 75, 56, 0.8)', 'rgba(185, 178, 138, 0.8)']}
                  style={styles.deleteButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="close" size={16} color="#F8F3D9" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitDisabled]}
          onPress={submitReport}
          disabled={isSubmitting || !description || !location || photos.length === 0}
        >
          <LinearGradient
            colors={['#504B38', '#B9B28A']}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#F8F3D9" size="small" />
            ) : (
              <Text style={styles.submitText}>Submit Report</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3D9',
    position: 'relative',
  },
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
  content: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    backgroundColor: '#F8F3D9',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(80, 75, 56, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#504B38',
  },
  form: {
    padding: 20,
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#504B38',
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE5C2',
    borderRadius: 12,
    padding: 15,
    fontSize: 14,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    color: '#504B38',
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    color: '#F8F3D9',
    marginLeft: 8,
    fontWeight: '500',
    fontSize: 16,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  photoItem: {
    width: (width - 60) / 3,
    height: (width - 60) / 3,
    marginRight: 10,
    marginBottom: 10,
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EBE5C2',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  deleteButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
  },
  deleteButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    color: '#F8F3D9',
    fontWeight: '500',
    fontSize: 16,
  },
});

export default Report;