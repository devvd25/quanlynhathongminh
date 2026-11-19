/**
 * Smart Home IoT - Application Root
 * React Native with Expo & TypeScript
 */

import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSmartHome } from './src/hooks/useSmartHome';
import { LightTheme, DarkTheme } from './src/constants/theme';
import { BottomTabBar, TabKey } from './src/components/BottomTabBar';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

export default function App() {
  const smartHome = useSmartHome();
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');

  const theme = smartHome.isDarkMode ? DarkTheme : LightTheme;

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.background,
          paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        },
      ]}
    >
      <ExpoStatusBar style={smartHome.isDarkMode ? 'light' : 'dark'} />

      {/* Screen Body */}
      <View style={styles.screenContainer}>
        {currentTab === 'dashboard' && (
          <DashboardScreen smartHome={smartHome} theme={theme} />
        )}
        {currentTab === 'analytics' && (
          <AnalyticsScreen smartHome={smartHome} theme={theme} />
        )}
        {currentTab === 'settings' && (
          <SettingsScreen smartHome={smartHome} theme={theme} />
        )}
      </View>

      {/* Modern Bottom Navigation Tab Bar */}
      <BottomTabBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        theme={theme}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});
