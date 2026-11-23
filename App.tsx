/**
 * Smart Home IoT - Application Root
 * React Native với Expo & TypeScript
 * Hỗ trợ Đăng nhập, Đăng ký, Phân quyền Người dùng (User / Admin)
 * và Sẵn sàng kết nối Wokwi ESP32 / HiveMQ / Backend Server
 */

import React, { useState } from 'react';
import { StyleSheet, View, SafeAreaView, Platform, StatusBar } from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useSmartHome } from './src/hooks/useSmartHome';
import { useAuth } from './src/hooks/useAuth';
import { LightTheme, DarkTheme } from './src/constants/theme';
import { BottomTabBar, TabKey } from './src/components/BottomTabBar';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';

export default function App() {
  const smartHome = useSmartHome();
  const auth = useAuth();

  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');

  const theme = smartHome.isDarkMode ? DarkTheme : LightTheme;

  // 1. Nếu chưa đăng nhập: Hiển thị màn hình Đăng nhập hoặc Đăng ký
  if (!auth.isAuthenticated) {
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
        {authScreen === 'login' ? (
          <LoginScreen
            auth={auth}
            theme={theme}
            onNavigateRegister={() => setAuthScreen('register')}
          />
        ) : (
          <RegisterScreen
            auth={auth}
            theme={theme}
            onNavigateLogin={() => setAuthScreen('login')}
          />
        )}
      </SafeAreaView>
    );
  }

  // 2. Khi đã đăng nhập: Hiển thị Ứng dụng chính với Bottom Tabs theo phân quyền
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
          <DashboardScreen
            smartHome={smartHome}
            auth={auth}
            theme={theme}
            onNavigateProfile={() => setCurrentTab('profile')}
          />
        )}
        {currentTab === 'analytics' && (
          <AnalyticsScreen smartHome={smartHome} theme={theme} />
        )}
        {currentTab === 'admin' && auth.isAdmin && (
          <AdminDashboardScreen theme={theme} />
        )}
        {currentTab === 'profile' && (
          <ProfileScreen
            auth={auth}
            theme={theme}
            isDarkMode={smartHome.isDarkMode}
            onToggleTheme={smartHome.toggleTheme}
          />
        )}
      </View>

      {/* Modern Bottom Navigation Tab Bar (Tự động thích ứng User / Admin) */}
      <BottomTabBar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        isAdmin={auth.isAdmin}
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
