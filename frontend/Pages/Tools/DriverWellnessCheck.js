import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Dimensions,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, LocaleConfig } from 'react-native-calendars';

const { width, height } = Dimensions.get('window');

// Configure calendar locale
LocaleConfig.locales['en'] = {
  monthNames: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  monthNamesShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today'
};
LocaleConfig.defaultLocale = 'en';

const DriverWellnessCheck = ({ navigation }) => {
  // Wellness checklist state
  const [checklist, setChecklist] = useState({
    adequateSleep: false,
    properHydration: false,
    healthyMeal: false,
    stressLevel: false,
    medicationCheck: false,
    physicalComfort: false
  });

  // Tips modal visibility
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [currentTipCategory, setCurrentTipCategory] = useState('fatigue');
  
  // Calendar state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showCalendar, setShowCalendar] = useState(false);

  // Toggle checklist items
  const toggleChecklistItem = (item) => {
    setChecklist(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  // Safety tips data
  const safetyTips = {
    fatigue: [
      "Get at least 7-8 hours of sleep before driving",
      "Take a 15-20 minute power nap if feeling drowsy",
      "Avoid driving during your body's natural sleep hours (2-4am)",
      "Use the 2-hour rule: Take a break every 2 hours",
      "Keep the vehicle cool (18-21°C) to maintain alertness"
    ],
    distractions: [
      "Put your phone on Do Not Disturb mode",
      "Pre-set GPS and climate controls before driving",
      "Avoid eating while driving",
      "Secure all loose items in the vehicle",
      "Pull over if you need to attend to children/pets"
    ],
    physical: [
      "Adjust seat position for proper posture",
      "Do simple stretches during breaks",
      "Stay hydrated with water (avoid sugary drinks)",
      "Wear comfortable clothing and shoes",
      "Use lumbar support if available"
    ],
    mental: [
      "Practice deep breathing if feeling stressed",
      "Listen to calming music or podcasts",
      "Avoid driving when emotionally upset",
      "Plan your route to avoid stressful traffic",
      "Allow extra time so you don't feel rushed"
    ]
  };

  // Calculate completion percentage
  const completionPercentage = Math.round(
    (Object.values(checklist).filter(Boolean).length / Object.keys(checklist).length) * 100
  );

  // Format date for display
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
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
                <Ionicons name="heart" size={40} color="#504B38" />
              </View>
              <View style={styles.logoShadow} />
            </View>
            <Text style={styles.welcomeText}>Driver Wellness Check</Text>
            <Text style={styles.subtitle}>Ensure you're ready for a safe driving experience</Text>
            
            {/* Date Picker */}
            <TouchableOpacity 
              style={styles.datePickerContainer}
              onPress={() => setShowCalendar(true)}
            >
              <Ionicons name="calendar" size={20} color="#504B38" />
              <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
              <Ionicons name="chevron-down" size={16} color="#504B38" />
            </TouchableOpacity>
            
            {/* Calendar Modal */}
            <Modal
              visible={showCalendar}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setShowCalendar(false)}
            >
              <View style={styles.calendarModalContainer}>
                <View style={styles.calendarModalContent}>
                  <Calendar
                    current={selectedDate}
                    onDayPress={(day) => {
                      setSelectedDate(day.dateString);
                      setShowCalendar(false);
                    }}
                    markedDates={{
                      [selectedDate]: { selected: true, selectedColor: '#504B38' }
                    }}
                    theme={{
                      backgroundColor: '#F8F3D9',
                      calendarBackground: '#F8F3D9',
                      textSectionTitleColor: '#504B38',
                      selectedDayBackgroundColor: '#504B38',
                      selectedDayTextColor: '#F8F3D9',
                      todayTextColor: '#B9B28A',
                      dayTextColor: '#504B38',
                      textDisabledColor: '#D3D3D3',
                      dotColor: '#B9B28A',
                      selectedDotColor: '#F8F3D9',
                      arrowColor: '#504B38',
                      monthTextColor: '#504B38',
                      indicatorColor: '#504B38',
                      textDayFontWeight: '400',
                      textMonthFontWeight: '600',
                      textDayHeaderFontWeight: '500',
                      textDayFontSize: 14,
                      textMonthFontSize: 18,
                      textDayHeaderFontSize: 14
                    }}
                  />
                  <TouchableOpacity
                    style={styles.calendarCloseButton}
                    onPress={() => setShowCalendar(false)}
                  >
                    <Text style={styles.calendarCloseButtonText}>Close</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

            {/* Decorative Line */}
            <View style={styles.decorativeLine}>
              <View style={styles.lineSegment} />
              <Ionicons name="heart-circle-outline" size={20} color="#B9B28A" />
              <View style={styles.lineSegment} />
            </View>
          </View>
          
          {/* Wellness Card */}
          <View style={styles.wellnessCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today's Readiness</Text>
              <Text style={styles.cardSubtitle}>Complete your wellness checklist</Text>
            </View>
            
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={['#504B38', '#B9B28A']}
                  style={[styles.progressBarFill, { width: `${completionPercentage}%` }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={styles.percentageText}>{completionPercentage}% Complete</Text>
            </View>

            {/* Checklist Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Readiness Checklist</Text>
              
              {/* Checklist Items */}
              {Object.entries(checklist).map(([key, value]) => (
                <TouchableOpacity 
                  key={key} 
                  style={[
                    styles.checklistItem,
                    value && styles.checklistItemActive
                  ]}
                  onPress={() => toggleChecklistItem(key)}
                >
                  <View style={styles.checklistIcon}>
                    <Ionicons 
                      name={value ? "checkmark-circle" : "ellipse-outline"} 
                      size={24} 
                      color={value ? "#504B38" : "#B9B28A"} 
                    />
                  </View>
                  <View style={styles.checklistTextContainer}>
                    <Text style={styles.checklistTitle}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Text>
                    <Text style={styles.checklistDescription}>
                      {getChecklistDescription(key)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Wellness Tips Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Wellness Tips</Text>
              <View style={styles.tipCategories}>
                <TouchableOpacity 
                  style={[
                    styles.tipCategory,
                    currentTipCategory === 'fatigue' && styles.activeTipCategory
                  ]}
                  onPress={() => setCurrentTipCategory('fatigue')}
                >
                  <Ionicons 
                    name="bed-outline" 
                    size={20} 
                    color={currentTipCategory === 'fatigue' ? '#FFFFFF' : '#504B38'} 
                  />
                  <Text 
                    style={[
                      styles.tipCategoryText,
                      currentTipCategory === 'fatigue' && styles.activeTipCategoryText
                    ]}
                  >
                    Fatigue
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.tipCategory,
                    currentTipCategory === 'distractions' && styles.activeTipCategory
                  ]}
                  onPress={() => setCurrentTipCategory('distractions')}
                >
                  <Ionicons 
                    name="phone-portrait-outline" 
                    size={20} 
                    color={currentTipCategory === 'distractions' ? '#FFFFFF' : '#504B38'} 
                  />
                  <Text 
                    style={[
                      styles.tipCategoryText,
                      currentTipCategory === 'distractions' && styles.activeTipCategoryText
                    ]}
                  >
                    Distractions
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.tipCategory,
                    currentTipCategory === 'physical' && styles.activeTipCategory
                  ]}
                  onPress={() => setCurrentTipCategory('physical')}
                >
                  <Ionicons 
                    name="body-outline" 
                    size={20} 
                    color={currentTipCategory === 'physical' ? '#FFFFFF' : '#504B38'} 
                  />
                  <Text 
                    style={[
                      styles.tipCategoryText,
                      currentTipCategory === 'physical' && styles.activeTipCategoryText
                    ]}
                  >
                    Physical
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.tipCategory,
                    currentTipCategory === 'mental' && styles.activeTipCategory
                  ]}
                  onPress={() => setCurrentTipCategory('mental')}
                >
                  <Ionicons 
                    name="happy-outline" 
                    size={20} 
                    color={currentTipCategory === 'mental' ? '#FFFFFF' : '#504B38'} 
                  />
                  <Text 
                    style={[
                      styles.tipCategoryText,
                      currentTipCategory === 'mental' && styles.activeTipCategoryText
                    ]}
                  >
                    Mental
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Current Tips List */}
              <View style={styles.tipsList}>
                {safetyTips[currentTipCategory].map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <View style={styles.tipBullet}>
                      <Ionicons name="checkmark-circle" size={16} color="#504B38" />
                    </View>
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* More Info Button */}
            <TouchableOpacity
              style={styles.infoButton}
              onPress={() => setShowTipsModal(true)}
            >
              <LinearGradient
                colors={['#504B38', '#B9B28A']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.buttonContent}>
                  <Text style={styles.infoButtonText}>More Wellness Information</Text>
                  <View style={styles.buttonIconContainer}>
                    <Ionicons name="information-circle-outline" size={20} color="#F8F3D9" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Tips Modal */}
        <Modal
          visible={showTipsModal}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setShowTipsModal(false)}
        >
          <LinearGradient
            colors={['#F8F3D9', '#EBE5C2']}
            style={styles.modalContainer}
          >
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Driver Wellness Guide</Text>
                <TouchableOpacity 
                  onPress={() => setShowTipsModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#504B38" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalContent}>
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Fatigue Prevention</Text>
                  <View style={styles.modalImagePlaceholder}>
                    <Ionicons name="bed" size={48} color="#B9B28A" />
                  </View>
                  <Text style={styles.modalText}>
                    Driver fatigue is a major cause of accidents. Recognize the warning signs:
                    frequent yawning, heavy eyelids, difficulty focusing, and missing exits.
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Physical Readiness</Text>
                  <View style={styles.modalImagePlaceholder}>
                    <Ionicons name="body" size={48} color="#B9B28A" />
                  </View>
                  <Text style={styles.modalText}>
                    Maintain proper posture and take regular breaks to stretch. Dehydration
                    can cause fatigue, so drink water regularly during your trip.
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Mental Preparedness</Text>
                  <Text style={styles.modalText}>
                    Your mental state significantly impacts driving performance. Avoid driving
                    when angry, stressed, or emotionally distracted. Practice mindfulness
                    techniques to stay focused.
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Emergency Preparedness</Text>
                  <Text style={styles.modalText}>
                    Always have emergency contacts saved in your phone. Know the symptoms of
                    medical emergencies like heart attacks or strokes that could impair driving.
                  </Text>
                </View>
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

// Helper function for checklist descriptions
const getChecklistDescription = (key) => {
  const descriptions = {
    adequateSleep: "Did you get at least 7 hours of sleep?",
    properHydration: "Have you drank enough water today?",
    healthyMeal: "Have you eaten a nutritious meal recently?",
    stressLevel: "Are you feeling calm and focused?",
    medicationCheck: "Any medications that might cause drowsiness?",
    physicalComfort: "Are you free from pain/discomfort?"
  };
  return descriptions[key] || "";
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
  // Date Picker Styles
  datePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 25,
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: 16,
    color: '#504B38',
    fontWeight: '500',
    marginHorizontal: 8,
  },
  // Calendar Modal Styles
  calendarModalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(80, 75, 56, 0.5)',
  },
  calendarModalContent: {
    backgroundColor: '#F8F3D9',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 15,
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  calendarCloseButton: {
    backgroundColor: '#504B38',
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  calendarCloseButtonText: {
    color: '#F8F3D9',
    fontSize: 16,
    fontWeight: '600',
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
  wellnessCard: {
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
    marginBottom: 25,
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
  progressContainer: {
    marginBottom: 25,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#F8F3D9',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  percentageText: {
    fontSize: 14,
    color: '#504B38',
    fontWeight: '600',
    alignSelf: 'flex-end',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#504B38',
    marginBottom: 15,
    marginLeft: 5,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F3D9',
    borderRadius: 14,
    padding: 15,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  checklistItemActive: {
    backgroundColor: '#EBE5C2',
    borderColor: '#B9B28A',
  },
  checklistIcon: {
    marginRight: 15,
  },
  checklistTextContainer: {
    flex: 1,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#504B38',
    textTransform: 'capitalize',
    marginBottom: 3,
  },
  checklistDescription: {
    fontSize: 13,
    color: '#6E7F8D',
  },
  tipCategories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  tipCategory: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8F3D9',
    marginHorizontal: 5,
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  activeTipCategory: {
    backgroundColor: '#504B38',
  },
  tipCategoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#504B38',
    marginTop: 5,
  },
  activeTipCategoryText: {
    color: 'white',
  },
  tipsList: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 15,
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipBullet: {
    marginRight: 10,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#504B38',
    lineHeight: 20,
  },
  infoButton: {
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 15,
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
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButtonText: {
    color: '#F8F3D9',
    fontSize: 16,
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
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#504B38',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalSection: {
    marginBottom: 25,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  modalSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#504B38',
    marginBottom: 10,
  },
  modalImagePlaceholder: {
    width: '100%',
    height: 150,
    marginVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F8F3D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 15,
    color: '#504B38',
    lineHeight: 22,
  },
});

export default DriverWellnessCheck;