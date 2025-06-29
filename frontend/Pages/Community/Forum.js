import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../../utils/api';

const { width, height } = Dimensions.get('window');

const Forum = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [failedImages, setFailedImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});

  const validateImageUrl = (url) => {
    if (!url || typeof url !== 'string') return null;
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return null;
    
    try {
      const urlObj = new URL(trimmedUrl);
      if (urlObj.protocol === 'http:') {
        urlObj.protocol = 'https:';
      }
      return urlObj.toString();
    } catch (error) {
      console.log('Invalid URL format:', url);
      return null;
    }
  };

  const fetchReports = async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(
        `${API_BASE_URL}/report/forum?page=${currentPage}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to fetch reports`);
      }

      const data = await response.json();
      const processedData = data.data.map(report => {
        const validPhotos = Array.isArray(report.photos) 
          ? report.photos
              .map(photo => validateImageUrl(photo))
              .filter(photo => photo !== null)
          : [];
        
        return {
          ...report,
          photos: validPhotos
        };
      });

      setReports(reset ? processedData : [...reports, ...processedData]);
      setHasMore(data.pagination.page < data.pagination.pages);
      if (reset) setPage(1);
    } catch (error) {
      console.error('Fetch reports error:', error);
      Alert.alert('Error', error.message || 'Failed to load reports');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports(true);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setFailedImages({});
    setLoadingImages({});
    fetchReports(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchReports();
    }
  };

  const handleImageError = (uri, error) => {
    setFailedImages(prev => ({ ...prev, [uri]: true }));
    setLoadingImages(prev => {
      const newLoadingImages = { ...prev };
      delete newLoadingImages[uri];
      return newLoadingImages;
    });
  };

  const handleImageLoad = (uri) => {
    setFailedImages(prev => {
      const newFailedImages = { ...prev };
      delete newFailedImages[uri];
      return newFailedImages;
    });
    setLoadingImages(prev => {
      const newLoadingImages = { ...prev };
      delete newLoadingImages[uri];
      return newLoadingImages;
    });
  };

  const handleImageLoadStart = (uri) => {
    setLoadingImages(prev => ({ ...prev, [uri]: true }));
  };

  const renderPhotoGrid = (photos, reportId) => {
    if (photos.length === 0) return null;

    if (photos.length === 1) {
      const photo = photos[0];
      const hasValidPhoto = photo && !failedImages[photo];
      
      if (!hasValidPhoto) return null;

      return (
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ReportDetail', { reportId })}
        >
          <View style={styles.mediaContainer}>
            <Image 
              source={{ uri: photo }}
              style={styles.postImage}
              resizeMode="cover"
              onError={(error) => handleImageError(photo, error)}
              onLoad={() => handleImageLoad(photo)}
              onLoadStart={() => handleImageLoadStart(photo)}
            />
            {loadingImages[photo] && (
              <View style={styles.imageLoadingOverlay}>
                <ActivityIndicator size="small" color="#504B38" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      );
    }

    const displayPhotos = photos.slice(0, 4);
    const remainingCount = photos.length - displayPhotos.length;

    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ReportDetail', { reportId })}
      >
        <View style={styles.photoGrid}>
          {displayPhotos.map((photo, index) => {
            const hasValidPhoto = photo && !failedImages[photo];
            if (!hasValidPhoto) return null;

            const isLastPhoto = index === displayPhotos.length - 1;
            const showOverlay = remainingCount > 0 && isLastPhoto;

            let gridItemStyle = styles.gridPhoto;
            if (photos.length === 2) {
              gridItemStyle = styles.gridPhotoHalf;
            } else if (photos.length === 3) {
              gridItemStyle = index === 0 ? styles.gridPhotoMain : styles.gridPhotoSmall;
            } else if (photos.length >= 4) {
              gridItemStyle = styles.gridPhotoQuarter;
            }

            return (
              <View key={index} style={gridItemStyle}>
                <Image 
                  source={{ uri: photo }}
                  style={styles.gridImage}
                  resizeMode="cover"
                  onError={(error) => handleImageError(photo, error)}
                  onLoad={() => handleImageLoad(photo)}
                  onLoadStart={() => handleImageLoadStart(photo)}
                />
                {loadingImages[photo] && (
                  <View style={styles.imageLoadingOverlay}>
                    <ActivityIndicator size="small" color="#504B38" />
                  </View>
                )}
                {showOverlay && (
                  <View style={styles.morePhotosOverlay}>
                    <Text style={styles.morePhotosText}>+{remainingCount}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </TouchableOpacity>
    );
  };

  const renderReportItem = ({ item }) => {
    const photos = item.photos || [];

    return (
      <View style={styles.reportCard}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="account-circle" size={40} color="#504B38" />
          </View>
          <View style={styles.userMeta}>
            <Text style={styles.username}>Community Member</Text>
            <Text style={styles.postTime}>
              {new Date(item.submittedAt).toLocaleDateString()} • 
              {new Date(item.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>

        <Text style={styles.postText}>{item.description}</Text>
        
        {renderPhotoGrid(photos, item._id)}

        <View style={styles.postFooter}>
          <View style={styles.reportMeta}>
            <Ionicons name="location-outline" size={16} color="#B9B28A" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
          {photos.length > 0 && (
            <View style={styles.photoIndicator}>
              <MaterialCommunityIcons name="camera" size={16} color="#B9B28A" />
              <Text style={styles.photoCountSmall}>{photos.length}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#504B38" />
        <Text style={styles.loadingText}>Loading community reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F8F3D9', '#EBE5C2']}
        style={styles.gradientContainer}
      >
        {/* Decorative Background Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <View style={styles.logoBackground}>
              <MaterialCommunityIcons name="car-connected" size={40} color="#504B38" />
            </View>
            <View style={styles.logoShadow} />
          </View>
          <Text style={styles.welcomeText}>DriveSafe Community</Text>
          <Text style={styles.subtitle}>Crowdsourced road safety reports</Text>
          
          <View style={styles.decorativeLine}>
            <View style={styles.lineSegment} />
            <Ionicons name="car-sport" size={20} color="#B9B28A" />
            <View style={styles.lineSegment} />
          </View>
        </View>

        <FlatList
          data={reports}
          renderItem={renderReportItem}
          keyExtractor={item => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#504B38']}
              tintColor="#504B38"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && page > 1 ? (
              <ActivityIndicator size="small" color="#504B38" style={styles.loadingMore} />
            ) : null
          }
          ListEmptyComponent={
            !loading && (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="forum" size={60} color="#B9B28A" />
                <Text style={styles.emptyText}>No reports yet</Text>
                <Text style={styles.emptySubtext}>Community reports will appear here</Text>
              </View>
            )
          }
        />
      </LinearGradient>
    </View>
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
  headerSection: {
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 30,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 2,
  },
  logoShadow: {
    position: 'absolute',
    top: 8,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(80, 75, 56, 0.1)',
    zIndex: 1,
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
    fontWeight: '400',
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
  listContent: {
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  avatar: {
    marginRight: 12,
  },
  userMeta: {
    justifyContent: 'center',
  },
  username: {
    fontWeight: '600',
    color: '#504B38',
    fontSize: 16,
  },
  postTime: {
    color: '#B9B28A',
    fontSize: 13,
    marginTop: 4,
  },
  postText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#504B38',
    marginBottom: 15,
  },
  mediaContainer: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    position: 'relative',
    backgroundColor: '#F8F3D9',
    shadowColor: '#504B38',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  postImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8F3D9',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    borderRadius: 15,
    overflow: 'hidden',
    gap: 2,
  },
  gridPhoto: {
    position: 'relative',
  },
  gridPhotoHalf: {
    width: '49%',
    height: 180,
  },
  gridPhotoQuarter: {
    width: '49%',
    height: 120,
  },
  gridPhotoMain: {
    width: '100%',
    height: 200,
    marginBottom: 2,
  },
  gridPhotoSmall: {
    width: '49%',
    height: 120,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F3D9',
  },
  morePhotosOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(80, 75, 56, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePhotosText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248, 243, 217, 0.8)',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationText: {
    color: '#B9B28A',
    fontSize: 13,
    marginLeft: 5,
    flex: 1,
  },
  photoIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoCountSmall: {
    color: '#B9B28A',
    fontSize: 12,
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F3D9',
  },
  loadingText: {
    marginTop: 15,
    color: '#504B38',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyText: {
    color: '#504B38',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#B9B28A',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  loadingMore: {
    marginVertical: 20,
  },
});

export default Forum;