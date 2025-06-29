import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Modal,
  Animated,
  StatusBar,
  Platform,
  Easing,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import CustomDrawer from './CustomDrawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const getStatusBarHeight = () => {
  if (Platform.OS === 'ios') {
    if (height >= 812) {
      return 44;
    }
    return 20;
  }
  return StatusBar.currentHeight || 24;
};

const Home = ({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const slideAnim = useRef(new Animated.Value(-width * 0.8)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          const parsedData = JSON.parse(userData);
          setUserName(parsedData.name || 'Driver');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const featuredItems = [
    {
      id: '1',
      title: 'Interactive Driving Lessons',
      description: 'Covers traffic signs, defensive driving techniques, and road etiquette',
      price: 'Free',
      icon: 'book',
      iconSet: 'Ionicons',
      rating: 4.8
    },
    {
      id: '2',
      title: 'Road Safety Game Mode',
      description: 'Gamified challenges to test your road rules knowledge',
      price: 'Free',
      icon: 'gamepad',
      iconSet: 'FontAwesome',
      rating: 4.7
    },
    {
      id: '3',
      title: 'Driver Certification',
      description: 'Earn badges by completing safety challenges',
      price: 'Free',
      icon: 'certificate',
      iconSet: 'FontAwesome',
      rating: 4.9
    }
  ];

  const categories = [
    { id: '1', name: 'Lessons', icon: 'book' },
    { id: '2', name: 'Safety', icon: 'shield' },
    { id: '3', name: 'Alerts', icon: 'notifications' },
    { id: '4', name: 'Practice', icon: 'car' },
    { id: '5', name: 'Reports', icon: 'alert' },
    { id: '6', name: 'Community', icon: 'people' }
  ];

  const renderIcon = (iconSet, iconName, size = 24, color = '#504B38') => {
    switch (iconSet) {
      case 'MaterialIcons':
        return <MaterialIcons name={iconName} size={size} color={color} />;
      case 'FontAwesome':
        return <FontAwesome name={iconName} size={size} color={color} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
      default:
        return <Ionicons name={iconName} size={size} color={color} />;
    }
  };

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 350,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -width * 0.8,
        duration: 300,
        easing: Easing.bezier(0.55, 0.06, 0.68, 0.19),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      })
    ]).start(() => {
      setDrawerVisible(false);
    });
  };

  const renderFeaturedItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.featuredItem}
      onPress={() => navigation.navigate('CourseDetail', { item })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#504B38', '#B9B28A']}
        style={styles.featuredIconContainer}
      >
        {renderIcon(item.iconSet, item.icon, 28, '#F8F3D9')}
      </LinearGradient>
      <View style={styles.featuredInfo}>
        <Text style={styles.featuredTitle}>{item.title}</Text>
        <Text style={styles.featuredDescription}>{item.description}</Text>
        <View style={styles.featuredFooter}>
          <Text style={styles.featuredPrice}>{item.price}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryItem}
      onPress={() => navigation.navigate('Category', { category: item.name })}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#F8F3D9', '#EBE5C2']}
        style={styles.categoryIconContainer}
      >
        <Ionicons name={item.icon} size={24} color="#504B38" />
      </LinearGradient>
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F3D9" />
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Decorative Background Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        
        <LinearGradient
          colors={['#F8F3D9', '#EBE5C2']}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTop}>
              <TouchableOpacity 
                onPress={openDrawer} 
                style={styles.headerButton}
                activeOpacity={0.7}
              >
                <Ionicons name="menu" size={28} color="#504B38" />
              </TouchableOpacity>
              
              <View style={styles.logoContainer}>
                <Image 
                  source={require('../assets/driveSmartLogo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              
              <TouchableOpacity 
                onPress={() => navigation.navigate('Search')} 
                style={styles.headerButton}
                activeOpacity={0.7}
              >
                <Ionicons name="search" size={28} color="#504B38" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.welcomeContainer}>
              <Text style={styles.headerTitle}>Welcome back, {userName}!</Text>
              <Text style={styles.headerSubtitle}>Ready to improve your driving skills?</Text>
              
              {/* Decorative Line */}
              <View style={styles.decorativeLine}>
                <View style={styles.lineSegment} />
                <Ionicons name="car-sport" size={20} color="#B9B28A" />
                <View style={styles.lineSegment} />
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Featured Modules</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Featured')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={featuredItems}
              renderItem={renderFeaturedItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={item => item.id}
              numColumns={3}
              columnWrapperStyle={styles.categoryRow}
              scrollEnabled={false}
            />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Safety Tools</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Tools')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.toolsContainer}>
              <TouchableOpacity 
                style={styles.toolCard}
                onPress={() => navigation.navigate('Alerts')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#F8F3D9', '#EBE5C2']}
                  style={styles.toolIconContainer}
                >
                  <Ionicons name="notifications" size={30} color="#504B38" />
                </LinearGradient>
                <Text style={styles.toolName}>Safety Alerts</Text>
                <Text style={styles.toolDescription}>Real-time notifications</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.toolCard}
                onPress={() => navigation.navigate('Reports')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#F8F3D9', '#EBE5C2']}
                  style={styles.toolIconContainer}
                >
                  <Ionicons name="alert" size={30} color="#504B38" />
                </LinearGradient>
                <Text style={styles.toolName}>Report Issues</Text>
                <Text style={styles.toolDescription}>Dangerous conditions</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.toolCard}
                onPress={() => navigation.navigate('Wellness')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#F8F3D9', '#EBE5C2']}
                  style={styles.toolIconContainer}
                >
                  <Ionicons name="heart" size={30} color="#504B38" />
                </LinearGradient>
                <Text style={styles.toolName}>Wellness Check</Text>
                <Text style={styles.toolDescription}>Driver readiness</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.specialOffer}
            onPress={() => navigation.navigate('SpecialOffer')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#504B38', '#B9B28A']}
              style={styles.specialOfferGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.specialOfferContent}>
                <View>
                  <Text style={styles.specialOfferTitle}>New Challenge!</Text>
                  <Text style={styles.specialOfferText}>Complete this week's safety quiz for bonus points</Text>
                </View>
                <Ionicons name="trophy" size={40} color="#F8F3D9" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={drawerVisible}
        transparent={true}
        animationType="none"
        onRequestClose={closeDrawer}
        statusBarTranslucent={true}
      >
        <View style={styles.modalContainer}>
          <Animated.View 
            style={[
              styles.overlay, 
              { 
                opacity: overlayOpacity,
                marginLeft: 0,
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }
            ]}
          >
            <TouchableOpacity 
              style={{ flex: 1 }} 
              activeOpacity={1} 
              onPress={closeDrawer}
            />
          </Animated.View>
          
          <Animated.View
            style={[
              styles.drawerContainer,
              {
                transform: [{ translateX: slideAnim }]
              }
            ]}
          >
            <CustomDrawer navigation={navigation} onClose={closeDrawer} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3D9',
  },
  scrollView: {
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
  header: {
    paddingBottom: 30,
    paddingTop: getStatusBarHeight() + 10,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(80, 75, 56, 0.1)',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#504B38',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#B9B28A',
    textAlign: 'center',
    fontWeight: '400',
    marginBottom: 20,
  },
  decorativeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 150,
    marginBottom: 20,
  },
  lineSegment: {
    flex: 1,
    height: 2,
    backgroundColor: '#B9B28A',
    marginHorizontal: 15,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#504B38',
  },
  seeAll: {
    color: '#B9B28A',
    fontWeight: '500',
  },
  featuredList: {
    paddingBottom: 10,
  },
  featuredItem: {
    width: width * 0.7,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EBE5C2',
  },
  featuredIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  featuredInfo: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
    color: '#504B38',
  },
  featuredDescription: {
    fontSize: 14,
    color: '#B9B28A',
    marginBottom: 10,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#504B38',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 5,
    color: '#B9B28A',
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#504B38',
    fontWeight: '500',
  },
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  toolCard: {
    width: '30%',
    alignItems: 'center',
  },
  toolIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  toolName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 3,
    color: '#504B38',
  },
  toolDescription: {
    fontSize: 10,
    color: '#B9B28A',
    textAlign: 'center',
  },
  specialOffer: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  specialOfferGradient: {
    padding: 20,
  },
  specialOfferContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specialOfferTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8F3D9',
    marginBottom: 5,
  },
  specialOfferText: {
    fontSize: 14,
    color: 'rgba(248, 243, 217, 0.9)',
  },
  modalContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerContainer: {
    width: width * 0.8,
    backgroundColor: '#F8F3D9',
    shadowColor: '#504B38',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
  },
  overlay: {
    backgroundColor: 'rgba(80, 75, 56, 0.5)',
  },
});

export default Home;