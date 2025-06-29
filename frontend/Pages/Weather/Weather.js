// Weather.js
import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const WindyMapEmbedURL = "https://embed.windy.com/embed2.html?lat=14.5995&lon=120.9842&detailLat=14.5995&detailLon=120.9842&width=100%25&height=100%25&zoom=5&level=surface&overlay=wind&menu=&message=true&marker=&calendar=&pressure=&type=map&location=coordinates&detail=&metricWind=default&metricTemp=default&radarRange=-1";

export default function Weather() {
  return (
    <View style={styles.container}>
      <WebView 
        source={{ uri: WindyMapEmbedURL }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        originWhitelist={['*']}
        mixedContentMode="always"
        allowsFullscreenVideo
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
