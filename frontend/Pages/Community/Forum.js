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
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../../utils/api';

const { width } = Dimensions.get('window');

const Forum = ({ navigation }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchReports = async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;
      const token = await AsyncStorage.getItem('userToken');
      
      const response = await fetch(
        `${API_BASE_URL}/report/forum?page=${currentPage}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to fetch reports');

      setReports(reset ? data.data : [...reports, ...data.data]);
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
    fetchReports(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchReports();
    }
  };

  const renderReportItem = ({ item }) => (
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
      
      {item.photos?.length > 0 && (
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => navigation.navigate('ReportDetail', { reportId: item._id })}
        >
          <View style={styles.mediaContainer}>
            <Image 
              source={{ uri: item.photos[0] }} 
              style={styles.postImage} 
              resizeMode="cover"
            />
            {item.photos.length > 1 && (
              <View style={styles.photoCountBadge}>
                <Text style={styles.photoCountText}>+{item.photos.length - 1}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.postFooter}>
        <View style={styles.reportMeta}>
          <Ionicons name="location-outline" size={16} color="#657786" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
    </View>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA000';
      case 'reviewed': return '#2196F3';
      case 'resolved': return '#4CAF50';
      default: return '#504B38';
    }
  };

  if (loading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Community Header */}
      <View style={styles.communityHeader}>
        <Image 
          source={require('../../assets/community.jpg')} 
          style={styles.coverPhoto}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'transparent']}
          style={styles.coverOverlay}
        />
        
        <View style={styles.communityInfo}>
          <View style={styles.communityIconContainer}>
            <MaterialCommunityIcons name="car-connected" size={40} color="#FFFFFF" />
          </View>
          <Text style={styles.communityTitle}>DriveSafe Community</Text>
          <Text style={styles.communitySubtitle}>Crowdsourced road safety reports</Text>
        </View>
      </View>

      {/* Reports List */}
      <FlatList
        data={reports}
        renderItem={renderReportItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#1DA1F2']}
            tintColor="#1DA1F2"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading && page > 1 ? (
            <ActivityIndicator size="small" color="#1DA1F2" style={styles.loadingMore} />
          ) : null
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="forum" size={60} color="#E1E8ED" />
              <Text style={styles.emptyText}>No reports yet</Text>
              <Text style={styles.emptySubtext}>Community reports will appear here</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F8FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F8FA',
  },
  communityHeader: {
    height: 180,
    position: 'relative',
    marginBottom: 10,
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  communityInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  communityIconContainer: {
    backgroundColor: '#1DA1F2',
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  communityTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  communitySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  listContent: {
    paddingBottom: 20,
  },
  reportCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  userMeta: {
    justifyContent: 'center',
  },
  username: {
    fontWeight: 'bold',
    color: '#14171A',
    fontSize: 16,
  },
  postTime: {
    color: '#657786',
    fontSize: 13,
    marginTop: 2,
  },
  postText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#14171A',
    marginBottom: 12,
  },
  mediaContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: 200,
  },
  photoCountBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  photoCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#657786',
    fontSize: 13,
    marginLeft: 5,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#14171A',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#657786',
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
  },
  loadingMore: {
    marginVertical: 20,
  },
});

export default Forum;