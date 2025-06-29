import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { WEATHER_API_KEY } from '../../utils/weatherApi';

const { width, height } = Dimensions.get('window');

const WindyMapEmbedURL = "https://embed.windy.com/embed2.html?lat=14.5995&lon=120.9842&detailLat=14.5995&detailLon=120.9842&width=100%25&height=100%25&zoom=10&level=surface&overlay=wind&menu=&message=true&marker=&calendar=&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1";

const getWeatherAlerts = (weatherData) => {
  const alerts = [];
  if (!weatherData) return alerts;

  const weather = weatherData.weather?.[0]?.main.toLowerCase() || '';
  const rainVolume = weatherData.rain?.['1h'] || 0;
  const windSpeedKmh = Math.round((weatherData.wind?.speed || 0) * 3.6);
  
  if (weather.includes('rain')) {
    if (rainVolume > 10) {
      alerts.push({
        id: 'heavy-rain',
        type: 'weather',
        location: 'Metro Manila',
        description: `Heavy rain (${rainVolume}mm/h) - Flooding likely on EDSA, C5, and low-lying areas`,
        severity: 'high',
        time: 'Current'
      });
    } else if (rainVolume > 5) {
      alerts.push({
        id: 'moderate-rain',
        type: 'weather',
        location: 'Metro Manila',
        description: `Moderate rain (${rainVolume}mm/h) - Reduced visibility and slippery roads`,
        severity: 'moderate',
        time: 'Current'
      });
    }
  }

  if (weather.includes('thunderstorm')) {
    alerts.push({
      id: 'thunderstorm',
      type: 'weather',
      location: 'Metro Manila Area',
      description: 'Thunderstorm alert - Possible flash floods and dangerous driving conditions',
      severity: 'high',
      time: 'Current'
    });
  }

  if (windSpeedKmh > 40) {
    alerts.push({
      id: 'high-wind',
      type: 'weather',
      location: 'Bridges/Coastal Roads',
      description: `Strong winds (${windSpeedKmh}km/h) - Dangerous for high-profile vehicles`,
      severity: 'high',
      time: 'Current'
    });
  } else if (windSpeedKmh > 25) {
    alerts.push({
      id: 'moderate-wind',
      type: 'weather',
      location: 'Open Highways',
      description: `Moderate winds (${windSpeedKmh}km/h) - Keep firm grip on steering wheel`,
      severity: 'moderate',
      time: 'Current'
    });
  }

  return alerts;
};

const drivingTips = {
  rainy: {
    title: "Rainy Conditions",
    icon: "rainy",
    tips: [
      "Reduce speed by 20-30% - Roads are most slippery when rain first starts",
      "Turn on headlights (MMDA requirement during heavy rain)",
      "Avoid EDSA low-lying areas (Guadalupe, Magallanes prone to flooding)",
      "Double following distance - 4 seconds minimum",
      "Watch for motorcycles swerving to avoid potholes"
    ]
  },
  foggy: {
    title: "Low Visibility",
    icon: "cloudy",
    tips: [
      "Use fog lights if available (especially on SLEX/NLEX)",
      "Reduce speed to match visibility distance",
      "Follow road markings - Don't follow taillights blindly",
      "Keep windows slightly open to hear other vehicles",
      "Avoid sudden stops - Signal early when slowing down"
    ]
  },
  windy: {
    title: "Windy Conditions",
    icon: "partly-sunny",
    tips: [
      "Secure loose items in truck beds and roof racks",
      "Extra caution on Skyway and coastal roads (CCLEX, Cavitex)",
      "Two-hand grip on wheel when passing trucks/buses",
      "Watch for debris - Especially after typhoons",
      "Avoid using cruise control in gusty conditions"
    ]
  },
  hot: {
    title: "Hot Weather",
    icon: "sunny",
    tips: [
      "Check tire pressure - Heat increases pressure",
      "Watch for overheated vehicles on inclines (Skyway, Marcos Highway)",
      "Stay hydrated - Keep water in your vehicle",
      "Use sunshades to prevent steering wheel burns",
      "Be alert for sudden afternoon thunderstorms"
    ]
  }
};

export default function Weather() {
  const [alerts, setAlerts] = useState([]);
  const [isAlertModalVisible, setAlertModalVisible] = useState(false);
  const [isTipModalVisible, setTipModalVisible] = useState(false);
  const [currentWeatherCondition, setCurrentWeatherCondition] = useState('rainy');
  const [loading, setLoading] = useState(true);
  const [weatherData, setWeatherData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 1800000);
    return () => clearInterval(interval);
  }, []);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!WEATHER_API_KEY) {
        throw new Error('Weather API key not configured');
      }
      
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=14.5995&lon=120.9842&appid=${WEATHER_API_KEY}&units=metric`;
      
      const response = await fetch(weatherUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          throw new Error('Invalid API key - Please check your weather API configuration');
        } else {
          throw new Error(`Weather API error: ${errorText}`);
        }
      }
      
      const data = await response.json();
      setWeatherData(data);
      setAlerts(getWeatherAlerts(data));
      determineWeatherCondition(data);
      setLastUpdated(new Date().toLocaleTimeString());
      
    } catch (error) {
      console.error("Weather fetch error:", error);
      setError(error.message);
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const determineWeatherCondition = (data) => {
    const weather = data.weather?.[0]?.main.toLowerCase() || '';
    const temp = data.main?.temp || 25;
    
    if (weather.includes('rain') || weather.includes('thunderstorm')) {
      setCurrentWeatherCondition('rainy');
    } else if (weather.includes('cloud') || weather.includes('fog') || weather.includes('haze')) {
      setCurrentWeatherCondition('foggy');
    } else if (data.wind?.speed > 5) {
      setCurrentWeatherCondition('windy');
    } else if (temp > 32) {
      setCurrentWeatherCondition('hot');
    } else {
      setCurrentWeatherCondition('rainy');
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return '#ff6b6b';
      case 'moderate': return '#ffa502';
      case 'low': return '#51cf66';
      default: return '#51cf66';
    }
  };

  const renderWeatherSummary = () => {
    if (!weatherData) {
      return (
        <View style={styles.weatherSummary}>
          {error ? (
            <Text style={styles.errorText}>Weather data unavailable</Text>
          ) : (
            <Text style={styles.weatherText}>Loading weather data...</Text>
          )}
        </View>
      );
    }
    
    const temp = Math.round(weatherData.main.temp);
    const condition = weatherData.weather[0].description;
    const rain = weatherData.rain?.['1h'] || 0;
    const wind = Math.round(weatherData.wind.speed * 3.6);
    
    return (
      <View style={styles.weatherSummary}>
        <View style={styles.weatherRow}>
          <Ionicons name="thermometer" size={16} color="#504B38" />
          <Text style={styles.weatherText}>{temp}°C</Text>
          
          <Ionicons name="water" size={16} color="#504B38" style={styles.weatherIcon} />
          <Text style={styles.weatherText}>{weatherData.main.humidity}%</Text>
          
          <Ionicons name="speedometer" size={16} color="#504B38" style={styles.weatherIcon} />
          <Text style={styles.weatherText}>{wind}km/h</Text>
        </View>
        
        <Text style={styles.weatherCondition}>{condition}</Text>
        
        {rain > 0 && (
          <View style={styles.weatherRow}>
            <Ionicons name="rainy" size={16} color="#504B38" />
            <Text style={styles.weatherText}>{rain}mm rain last hour</Text>
          </View>
        )}
        
        <Text style={styles.updateText}>Updated: {lastUpdated}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F3D9', '#EBE5C2']}
        style={styles.gradientContainer}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.welcomeText}>DriveSmart Alerts</Text>
          <Text style={styles.subtitle}>Weather-based road advisories</Text>
          
          <View style={styles.decorativeLine}>
            <View style={styles.lineSegment} />
            <Ionicons name="car-sport" size={20} color="#B9B28A" />
            <View style={styles.lineSegment} />
          </View>
          
          {renderWeatherSummary()}
        </View>

        {/* Map Card */}
        <View style={styles.mapCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Metro Manila Weather Map</Text>
            <TouchableOpacity onPress={fetchWeatherData} disabled={loading}>
              {loading ? (
                <ActivityIndicator size="small" color="#504B38" />
              ) : (
                <Ionicons name="refresh" size={20} color="#504B38" />
              )}
            </TouchableOpacity>
          </View>
          
          <View style={styles.mapWrapper}>
            <WebView 
              source={{ uri: WindyMapEmbedURL }}
              style={styles.webview}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              startInLoadingState={true}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={[styles.actionButton, alerts.length > 0 && styles.alertActive]}
            onPress={() => setAlertModalVisible(true)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#504B38" />
            ) : (
              <>
                <Ionicons 
                  name="warning" 
                  size={24} 
                  color={alerts.length > 0 ? '#ff6b6b' : '#504B38'} 
                />
                <Text style={[
                  styles.actionText,
                  alerts.length > 0 && styles.alertActiveText
                ]}>
                  {alerts.length > 0 ? `Alerts (${alerts.length})` : 'No Alerts'}
                </Text>
              </>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setTipModalVisible(true)}
          >
            <Ionicons name="car-sport" size={24} color="#504B38" />
            <Text style={styles.actionText}>Driving Tips</Text>
          </TouchableOpacity>
        </View>

        {/* Alerts Modal */}
        <Modal 
          isVisible={isAlertModalVisible} 
          onBackdropPress={() => setAlertModalVisible(false)}
          animationIn="fadeInUp"
          animationOut="fadeOutDown"
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Current Weather Alerts</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#504B38" />
                <Text style={styles.loadingText}>Checking latest conditions...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
                <Text style={styles.errorTitle}>Weather Service Unavailable</Text>
                <Text style={styles.errorDescription}>{error}</Text>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={fetchWeatherData}
                >
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : alerts.length === 0 ? (
              <View style={styles.noAlertsContainer}>
                <Ionicons name="checkmark-circle" size={48} color="#51cf66" />
                <Text style={styles.noAlertsText}>No active weather alerts</Text>
                <Text style={styles.noAlertsSubtext}>Road conditions are normal</Text>
              </View>
            ) : (
              <ScrollView style={styles.scrollContainer}>
                {alerts.map(alert => (
                  <View 
                    key={alert.id} 
                    style={[
                      styles.alertItem, 
                      { borderLeftColor: getSeverityColor(alert.severity) }
                    ]}
                  >
                    <View style={styles.alertHeader}>
                      <View style={styles.alertBadge}>
                        <Text style={styles.alertType}>{alert.type.toUpperCase()}</Text>
                      </View>
                      <Text style={styles.alertSeverity}>
                        {alert.severity.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.alertLocation}>{alert.location}</Text>
                    <Text style={styles.alertDescription}>{alert.description}</Text>
                    <Text style={styles.alertTime}>{alert.time}</Text>
                  </View>
                ))}
              </ScrollView>
            )}
            
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setAlertModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        
        {/* Driving Tips Modal */}
        <Modal 
          isVisible={isTipModalVisible} 
          onBackdropPress={() => setTipModalVisible(false)}
          animationIn="fadeInUp"
          animationOut="fadeOutDown"
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Weather-Specific Driving Tips</Text>
            
            <View style={styles.weatherOptions}>
              {Object.keys(drivingTips).map(condition => (
                <TouchableOpacity 
                  key={condition}
                  style={[
                    styles.weatherOption, 
                    currentWeatherCondition === condition && styles.selectedWeatherOption
                  ]}
                  onPress={() => setCurrentWeatherCondition(condition)}
                >
                  <Ionicons 
                    name={drivingTips[condition].icon} 
                    size={24} 
                    color={currentWeatherCondition === condition ? '#fff' : '#504B38'} 
                  />
                  <Text style={[
                    styles.weatherOptionText,
                    currentWeatherCondition === condition && styles.selectedWeatherText
                  ]}>
                    {drivingTips[condition].title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <ScrollView style={styles.tipsScrollContainer}>
              {drivingTips[currentWeatherCondition].tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={18} color="#504B38" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </ScrollView>
            
            <View style={styles.tipFooter}>
              <Text style={styles.tipFooterText}>Adjust driving for current conditions</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.closeModalButton}
              onPress={() => setTipModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 30,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#504B38',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#B9B28A',
    textAlign: 'center',
    marginBottom: 20,
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
  weatherSummary: {
    marginTop: 15,
    alignItems: 'center',
  },
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  weatherIcon: {
    marginLeft: 15,
  },
  weatherText: {
    color: '#504B38',
    fontSize: 14,
    marginLeft: 5,
  },
  weatherCondition: {
    color: '#504B38',
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 5,
    textTransform: 'capitalize',
  },
  updateText: {
    color: '#B9B28A',
    fontSize: 12,
    marginTop: 5,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
  mapCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
    padding: 20,
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#504B38',
  },
  mapWrapper: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
    height: height * 0.4,
  },
  webview: {
    flex: 1,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 30,
    paddingBottom: 25,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#F8F3D9',
    borderRadius: 15,
    padding: 15,
    width: width * 0.4,
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  alertActive: {
    borderWidth: 1,
    borderColor: '#ff6b6b',
  },
  alertActiveText: {
    color: '#ff6b6b',
    fontWeight: '600',
  },
  actionText: {
    color: '#504B38',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 25,
    maxHeight: height * 0.7,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#504B38',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: '#504B38',
    marginTop: 10,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 30,
  },
  errorTitle: {
    color: '#ff6b6b',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    textAlign: 'center',
  },
  errorDescription: {
    color: '#504B38',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#504B38',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 15,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noAlertsContainer: {
    alignItems: 'center',
    padding: 30,
  },
  noAlertsText: {
    color: '#504B38',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  noAlertsSubtext: {
    color: '#B9B28A',
    fontSize: 14,
    marginTop: 5,
  },
  scrollContainer: {
    marginBottom: 15,
  },
  alertItem: {
    padding: 15,
    marginBottom: 12,
    backgroundColor: '#F8F3D9',
    borderRadius: 12,
    borderLeftWidth: 5,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  alertBadge: {
    backgroundColor: '#504B38',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  alertType: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertSeverity: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  alertLocation: {
    fontWeight: 'bold',
    fontSize: 16,
    marginVertical: 3,
    color: '#504B38',
  },
  alertDescription: {
    color: '#504B38',
    fontSize: 14,
    lineHeight: 20,
  },
  alertTime: {
    color: '#B9B28A',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
    textAlign: 'right',
  },
  weatherOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  weatherOption: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F8F3D9',
    borderWidth: 1,
    borderColor: '#EBE5C2',
    flex: 1,
    marginHorizontal: 5,
  },
  selectedWeatherOption: {
    backgroundColor: '#504B38',
    borderColor: '#504B38',
  },
  weatherOptionText: {
    marginTop: 5,
    fontSize: 12,
    color: '#504B38',
    fontWeight: '500',
  },
  selectedWeatherText: {
    color: '#FFFFFF',
  },
  tipsScrollContainer: {
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 5,
  },
  tipText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#504B38',
    flex: 1,
    lineHeight: 22,
  },
  tipFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EBE5C2',
    paddingTop: 10,
    marginBottom: 10,
  },
  tipFooterText: {
    color: '#B9B28A',
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  closeModalButton: {
    backgroundColor: '#504B38',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});