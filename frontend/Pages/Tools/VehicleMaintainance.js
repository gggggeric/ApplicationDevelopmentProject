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
  Dimensions,
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

const maintenanceItems = [
  {
    id: '1',
    title: 'Oil Change',
    description: 'Regular engine oil and filter replacement',
    icon: 'oil',
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Tire Rotation',
    description: 'Rotate tires for even wear',
    icon: 'git-compare',
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'Brake Inspection',
    description: 'Check brake pads and rotors',
    icon: 'alert-circle',
    status: 'urgent'
  },
  {
    id: '4',
    title: 'Air Filter',
    description: 'Replace cabin and engine air filters',
    icon: 'airplane',
    status: 'upcoming'
  },
  {
    id: '5',
    title: 'Battery Check',
    description: 'Test battery voltage and connections',
    icon: 'battery-charging',
    status: 'normal'
  },
];

const VehicleMaintenance = ({ navigation }) => {
  const [currentMileage, setCurrentMileage] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [checkedItems, setCheckedItems] = useState({});

  const handleAddMileage = () => {
    if (!currentMileage.trim()) return;
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setCurrentMileage('');
    }, 1500);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const toggleCheckItem = (itemId) => {
    setCheckedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const renderMaintenanceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.maintenanceItem}
      onPress={() => toggleCheckItem(item.id)}
    >
      <View style={[
        styles.itemIconContainer,
        item.status === 'urgent' && styles.urgentIconContainer
      ]}>
        <Ionicons 
          name={item.icon} 
          size={24} 
          color={item.status === 'urgent' ? '#F8F3D9' : '#504B38'} 
        />
      </View>
      <View style={styles.itemTextContainer}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemDescription}>{item.description}</Text>
      </View>
      <View style={styles.checkboxContainer}>
        <View style={[
          styles.checkbox,
          checkedItems[item.id] && styles.checkedBox
        ]}>
          {checkedItems[item.id] && (
            <Ionicons name="checkmark" size={16} color="#F8F3D9" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

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
            <Text style={styles.welcomeText}>Vehicle Maintenance</Text>
            <Text style={styles.subtitle}>Keep your vehicle in top condition for safe driving</Text>
            
            {/* Decorative Line */}
            <View style={styles.decorativeLine}>
              <View style={styles.lineSegment} />
              <Ionicons name="car-sport" size={20} color="#B9B28A" />
              <View style={styles.lineSegment} />
            </View>
          </View>
          
          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Maintenance List Section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Maintenance Checklist</Text>
              <Text style={styles.sectionSubtitle}>Mark items as completed</Text>
            </View>

            <FlatList
              data={maintenanceItems}
              renderItem={renderMaintenanceItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />

            {/* History Button */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('MaintenanceHistory')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>View Maintenance History</Text>
              <Ionicons name="time" size={20} color="#504B38" />
            </TouchableOpacity>
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
  sectionHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#504B38',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#B9B28A',
    textAlign: 'center',
    fontWeight: '400',
  },
  listContainer: {
    paddingBottom: 20,
  },
  maintenanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F3D9',
    borderRadius: 18,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  itemIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: '#EBE5C2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  urgentIconContainer: {
    backgroundColor: '#E74C3C',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#504B38',
    marginBottom: 3,
  },
  itemDescription: {
    fontSize: 13,
    color: '#B9B28A',
  },
  checkboxContainer: {
    marginLeft: 10,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#504B38',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#504B38',
    borderColor: '#504B38',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F3D9',
    borderRadius: 18,
    padding: 15,
    marginTop: 10,
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  secondaryButtonText: {
    color: '#504B38',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 10,
  },
});

export default VehicleMaintenance;