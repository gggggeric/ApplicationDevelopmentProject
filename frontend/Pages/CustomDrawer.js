import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../utils/toast';
import API_BASE_URL from '../utils/api';

const { height } = Dimensions.get('window');

const CustomDrawer = ({ navigation, onClose }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('learning');

  const categories = [
    {
      id: 'learning',
      title: 'Learning',
      icon: 'book-outline',
      color: '#504B38'
    },
    {
      id: 'safety',
      title: 'Safety',
      icon: 'shield-checkmark-outline',
      color: '#504B38'
    },
    {
      id: 'tools',
      title: 'Tools',
      icon: 'construct-outline',
      color: '#504B38'
    },
    {
      id: 'community',
      title: 'Community',
      icon: 'people-outline',
      color: '#504B38'
    }
  ];

  const learningFeatures = [
    { id: '1', title: 'Interactive Lessons', icon: 'book-outline', route: 'InteractiveLessons',
      description: 'Traffic signs, defensive driving, road etiquette and violations' },
    { id: '2', title: 'Driving Quizzes', icon: 'help-circle-outline', route: 'DrivingQuiz',
      description: 'Test your knowledge with interactive quizzes' },
    { id: '3', title: 'Driving Simulations', icon: 'car-sport-outline', route: 'DrivingSimulations',
      description: 'Practice scenarios in a risk-free environment' }
  ];

  const safetyFeatures = [
    { id: '6', title: 'Emergency Tips', icon: 'warning-outline', route: 'Weather',
      description: 'Weather-specific driving guidance' }
  ];

const toolsFeatures = [
  { id: '7', title: 'Practice Scheduler', icon: 'calendar-outline', route: 'PracticeScheduler',
    description: 'Set reminders for driving practice sessions' },
  { id: '8', title: 'Wellness Check', icon: 'heart-circle-outline', route: 'DriverWellness',
    description: 'Daily mental and physical readiness checklist' },
  { id: '9', title: 'Vehicle Maintenance', icon: 'settings-outline', route: 'VehicleMaintenance',
    description: 'Tips for inspection and safe car handling' },
  { id: '17', title: 'AI Driving Assistant', icon: 'chatbubble-ellipses-outline', route: 'AiChatBot',
    description: 'Get instant answers to your driving questions' }
];

  const communityFeatures = [
    { id: '10', title: 'Community Forum', icon: 'chatbubbles-outline', route: 'Forum',
      description: 'Share experiences and get advice from experts' },
    { id: '11', title: 'Report Unsafe Driving', icon: 'alert-circle-outline', route: 'Report',
      description: 'Anonymously report reckless driving' },
    { id: '12', title: 'Certification', icon: 'ribbon-outline', route: 'Certification',
      description: 'Earn badges for completing modules' }
  ];

  const bottomItems = [
    { id: '13', title: 'Parental Monitoring', icon: 'people-circle-outline', route: 'ParentalMonitoring' },
    { id: '14', title: 'Settings', icon: 'settings-outline', route: 'Settings' },
    { id: '15', title: 'Help & Support', icon: 'help-circle-outline', route: 'Support' },
    { id: '16', title: 'About Us', icon: 'information-circle-outline', route: 'AboutUs' },
  ];

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Profile fetch failed');

      setProfileData(data.user);
    } catch (error) {
      console.error('Profile fetch error:', error);
      showToast('error', 'Profile Error', error.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleNavigation = (route) => {
    onClose?.();
    navigation.navigate(route);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: performLogout,
        },
      ],
      { cancelable: true }
    );
  };

  const performLogout = async () => {
    try {
      onClose?.();
      await AsyncStorage.multiRemove(['userToken', 'userData', 'isAuthenticated']);
      
      showToast('success', 'Logged Out', 'You have been successfully logged out');
      
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      showToast('error', 'Logout Failed', 'Something went wrong. Please try again.');
    }
  };

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        activeCategory === category.id && styles.activeCategoryButton
      ]}
      onPress={() => setActiveCategory(category.id)}
    >
      <Ionicons 
        name={category.icon} 
        size={24} 
        color={activeCategory === category.id ? '#F8F3D9' : '#504B38'} 
      />
      <Text style={[
        styles.categoryText,
        activeCategory === category.id && styles.activeCategoryText
      ]}>
        {category.title}
      </Text>
    </TouchableOpacity>
  );

  const renderFeatureItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.featureItem}
      onPress={() => handleNavigation(item.route)}
      activeOpacity={0.7}
    >
      <View style={styles.featureIconContainer}>
        <Ionicons name={item.icon} size={24} color="#504B38" />
      </View>
      <View style={styles.featureTextContainer}>
        <Text style={styles.featureTitle}>{item.title}</Text>
        {item.description && (
          <Text style={styles.featureDescription}>{item.description}</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#B9B28A" />
    </TouchableOpacity>
  );

  const renderBottomItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.bottomItem}
      onPress={() => handleNavigation(item.route)}
      activeOpacity={0.7}
    >
      <Ionicons name={item.icon} size={22} color="#504B38" />
      <Text style={styles.bottomText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const getActiveFeatures = () => {
    switch (activeCategory) {
      case 'learning': return learningFeatures;
      case 'safety': return safetyFeatures;
      case 'tools': return toolsFeatures;
      case 'community': return communityFeatures;
      default: return learningFeatures;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#504B38" />
      </SafeAreaView>
    );
  }

  const user = profileData || {
    name: 'User',
    email: 'user@example.com',
    profilePhoto: null,
    address: null
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <LinearGradient
          colors={['#504B38', '#B9B28A']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={28} color="#F8F3D9" />
          </TouchableOpacity>

          <View style={styles.profileSection}>
            <Image
              source={user.profilePhoto 
                ? { uri: user.profilePhoto } 
                : require('../assets/default-profile.png')}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Category Selector */}
        <View style={styles.categoryContainer}>
          {categories.map(renderCategoryButton)}
        </View>

        {/* Features Section */}
        <View style={styles.featuresContainer}>
          <Text style={styles.sectionTitle}>
            {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Features
          </Text>
          {getActiveFeatures().map(renderFeatureItem)}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => handleNavigation('EmergencyTips')}
          >
            <LinearGradient
              colors={['#504B38', '#B9B28A']}
              style={styles.quickActionIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="warning" size={24} color="#F8F3D9" />
            </LinearGradient>
            <Text style={styles.quickActionText}>Emergency Guide</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => handleNavigation('ReportDriving')}
          >
            <LinearGradient
              colors={['#504B38', '#B9B28A']}
              style={styles.quickActionIcon}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="report-problem" size={24} color="#F8F3D9" />
            </LinearGradient>
            <Text style={styles.quickActionText}>Report Issue</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Menu Items */}
        <View style={styles.bottomSection}>
          <View style={styles.divider} />
          <View style={styles.bottomItemsContainer}>
            {bottomItems.map(renderBottomItem)}
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={24} color="#504B38" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3D9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F3D9'
  },
  header: {
    paddingBottom: 25,
    paddingTop: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginRight: 20,
    marginBottom: 20,
    padding: 5,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(248, 243, 217, 0.3)',
  },
  profileInfo: {
    marginLeft: 15,
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#F8F3D9',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(248, 243, 217, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F8F3D9',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(248, 243, 217, 0.8)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(248, 243, 217, 0.3)',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 10,
  },
  categoryButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    width: '23%',
    backgroundColor: '#EBE5C2',
  },
  activeCategoryButton: {
    backgroundColor: '#504B38',
  },
  categoryText: {
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
    color: '#504B38',
  },
  activeCategoryText: {
    color: '#F8F3D9',
  },
  featuresContainer: {
    paddingHorizontal: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#504B38',
    marginBottom: 15,
    marginLeft: 5,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE5C2',
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(80, 75, 56, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#504B38',
  },
  featureDescription: {
    fontSize: 12,
    color: '#B9B28A',
    marginTop: 3,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 15,
    marginTop: 15,
  },
  quickAction: {
    alignItems: 'center',
    width: '45%',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#504B38',
    textAlign: 'center',
  },
  bottomSection: {
    marginTop: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#EBE5C2',
    marginHorizontal: 20,
  },
  bottomItemsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  bottomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingVertical: 12,
    paddingHorizontal: 5,
  },
  bottomText: {
    fontSize: 14,
    color: '#504B38',
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EBE5C2',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#504B38',
    marginLeft: 15,
    fontWeight: '600',
  },
});

export default CustomDrawer;