import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  ScrollView,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AboutUs = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Alex Johnson',
      role: 'Founder & CEO',
      bio: 'Driving instructor with 15+ years experience. Passionate about road safety and creating confident drivers.',
      image: require('../assets/favicon.png'),
      github: 'https://github.com/alexjohnson'
    },
    {
      id: 2,
      name: 'Sarah Williams',
      role: 'Head Instructor',
      bio: 'Specializes in defensive driving techniques. Certified in advanced driver training programs.',
      image: require('../assets/favicon.png'),
      github: 'https://github.com/sarahwilliams'
    },
    {
      id: 3,
      name: 'Michael Chen',
      role: 'Tech Lead',
      bio: 'Develops our innovative learning platform to make driver education accessible and effective.',
      image: require('../assets/favicon.png'),
      github: 'https://github.com/michaelchen'
    },
    {
      id: 4,
      name: 'Emma Rodriguez',
      role: 'Customer Success',
      bio: 'Ensures every student has a seamless experience from sign-up to license.',
      image: require('../assets/favicon.png'),
      github: 'https://github.com/emmarodriguez'
    }
  ];

  const handleGithubPress = (url) => {
    // You'll need to implement linking functionality
    // For example using Linking from react-native:
    // Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    console.log("Opening GitHub profile:", url);
  };

  return (
    <LinearGradient
      colors={['#F8F3D9', '#EBE5C2']}
      style={styles.gradientContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <Image 
                source={require('../assets/driveSmartLogo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={styles.logoShadow} />
          </View>
          <Text style={styles.welcomeText}>Our Team</Text>
          <Text style={styles.subtitle}>Meet the passionate people behind Drive Smart Academy</Text>
          
          <View style={styles.decorativeLine}>
            <View style={styles.lineSegment} />
            <Ionicons name="people" size={20} color="#B9B28A" />
            <View style={styles.lineSegment} />
          </View>
        </View>
        
        {/* About Card */}
        <View style={styles.aboutCard}>
          <Text style={styles.sectionTitle}>Our Mission</Text>
          <Text style={styles.sectionText}>
            At Drive Smart Academy, we're committed to transforming new drivers into confident, 
            safety-conscious road users through innovative teaching methods and personalized instruction.
          </Text>
          
          <View style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Vision</Text>
          <Text style={styles.sectionText}>
            To be the leading digital platform in transforming driving culture by fostering a generation of smart, informed, and safety-conscious motorists through innovative, technology-driven learning and behavior tracking.
          </Text>
        </View>
        
        {/* Team Section */}
        <View style={styles.teamSection}>
          <Text style={styles.teamTitle}>Meet the Team</Text>
          
          {teamMembers.map((member) => (
            <View key={member.id} style={styles.memberCard}>
              <View style={styles.memberImageContainer}>
                <Image 
                  source={member.image}
                  style={styles.memberImage}
                  resizeMode="cover"
                />
                <View style={styles.memberImageOverlay} />
              </View>
              
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>{member.role}</Text>
                <Text style={styles.memberBio}>{member.bio}</Text>
                
                <View style={styles.socialLinks}>
                  <TouchableOpacity 
                    style={styles.socialIcon}
                    onPress={() => handleGithubPress(member.github)}
                  >
                    <Ionicons name="logo-github" size={18} color="#504B38" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.socialIcon}>
                    <Ionicons name="mail-outline" size={18} color="#504B38" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
        
        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Get in Touch</Text>
          <View style={styles.contactItem}>
            <Ionicons name="mail" size={20} color="#504B38" />
            <Text style={styles.contactText}>contact@drivesmart.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="call" size={20} color="#504B38" />
            <Text style={styles.contactText}>(555) 123-4567</Text>
          </View>
          <View style={styles.contactItem}>
            <Ionicons name="location" size={20} color="#504B38" />
            <Text style={styles.contactText}>123 Driving Lane, Cityville</Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: 40,
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
  aboutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    marginHorizontal: 20,
    marginBottom: 30,
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#504B38',
    marginBottom: 15,
  },
  sectionText: {
    fontSize: 16,
    color: '#504B38',
    lineHeight: 24,
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#EBE5C2',
    marginVertical: 20,
  },
  teamSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  teamTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#504B38',
    marginBottom: 25,
    textAlign: 'center',
  },
  memberCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  memberImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 15,
    overflow: 'hidden',
    marginRight: 15,
    position: 'relative',
  },
  memberImage: {
    width: '100%',
    height: '100%',
  },
  memberImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(248, 243, 217, 0.3)',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#504B38',
    marginBottom: 2,
  },
  memberRole: {
    fontSize: 14,
    color: '#B9B28A',
    fontWeight: '500',
    marginBottom: 8,
  },
  memberBio: {
    fontSize: 14,
    color: '#504B38',
    lineHeight: 20,
    marginBottom: 10,
  },
  socialLinks: {
    flexDirection: 'row',
    marginTop: 5,
  },
  socialIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8F3D9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  contactSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    padding: 25,
    marginHorizontal: 20,
    shadowColor: '#504B38',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#504B38',
    marginBottom: 20,
    textAlign: 'center',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  contactText: {
    fontSize: 16,
    color: '#504B38',
    marginLeft: 15,
  },
});

export default AboutUs;