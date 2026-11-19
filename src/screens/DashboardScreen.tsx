/**
 * Screen: DashboardScreen (Màn hình chính)
 * Tích hợp toàn bộ Header, Cảm biến môi trường (DHT22, Đất),
 * Thiết bị điều khiển (LED, Relay) và Cửa thông minh (HC-SR04, Servo).
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { HeaderStatus } from '../components/HeaderStatus';
import { SensorCards } from '../components/SensorCard';
import { DeviceControlCards } from '../components/DeviceControlCard';
import { DoorStatusCard } from '../components/DoorStatusCard';
import { useSmartHome } from '../hooks/useSmartHome';
import { ThemeColors, Radii, Spacing } from '../constants/theme';

interface DashboardScreenProps {
  smartHome: ReturnType<typeof useSmartHome>;
  theme: ThemeColors;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ smartHome, theme }) => {
  const {
    connection,
    sensors,
    actuators,
    isRefreshing,
    isDarkMode,
    reconnect,
    toggleTheme,
    toggleLed,
    setLedBrightness,
    toggleRelay,
    updateRelayConfig,
    toggleDoorOverride,
    setDoorAutoMode,
  } = smartHome;

  const [activeRoomTab, setActiveRoomTab] = useState<'all' | 'living' | 'garden' | 'gate'>('all');

  // Đếm số thiết bị đang bật
  const activeDevicesCount =
    (actuators.led.state === 'ON' ? 1 : 0) +
    (actuators.relay.state === 'ON' ? 1 : 0) +
    (actuators.door.isOpen ? 1 : 0);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={reconnect}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    >
      {/* 1. HEADER & OLED BADGE */}
      <HeaderStatus
        connection={connection}
        theme={theme}
        isDarkMode={isDarkMode}
        isRefreshing={isRefreshing}
        onReconnect={reconnect}
        onToggleTheme={toggleTheme}
      />

      {/* 2. SUMMARY PILLS (Phong cách ảnh mẫu: Số thiết bị bật, Nhiệt độ, An toàn) */}
      <View style={styles.pillsRow}>
        <View
          style={[
            styles.summaryPill,
            { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
          ]}
        >
          <View style={[styles.pillIconBox, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="power" size={14} color={theme.primary} />
          </View>
          <View>
            <Text style={[styles.pillValue, { color: theme.textPrimary }]}>{activeDevicesCount} Thiết bị</Text>
            <Text style={[styles.pillLabel, { color: theme.textMuted }]}>Đang hoạt động</Text>
          </View>
        </View>

        <View
          style={[
            styles.summaryPill,
            { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
          ]}
        >
          <View style={[styles.pillIconBox, { backgroundColor: theme.successLight }]}>
            <Ionicons name="leaf-outline" size={14} color={theme.success} />
          </View>
          <View>
            <Text style={[styles.pillValue, { color: theme.textPrimary }]}>
              {sensors.dht22.temperature.toFixed(0)}°C
            </Text>
            <Text style={[styles.pillLabel, { color: theme.textMuted }]}>Nhiệt độ phòng</Text>
          </View>
        </View>

        <View
          style={[
            styles.summaryPill,
            { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
          ]}
        >
          <View style={[styles.pillIconBox, { backgroundColor: theme.infoLight }]}>
            <Ionicons name="shield-checkmark-outline" size={14} color={theme.info} />
          </View>
          <View>
            <Text style={[styles.pillValue, { color: theme.textPrimary }]}>An toàn</Text>
            <Text style={[styles.pillLabel, { color: theme.textMuted }]}>Hệ thống OK</Text>
          </View>
        </View>
      </View>

      {/* 3. ROOM CATEGORY FILTER CHIPS */}
      <View style={styles.roomFilterRow}>
        {[
          { key: 'all', label: 'Tất cả' },
          { key: 'living', label: 'Phòng khách' },
          { key: 'garden', label: 'Sân vườn' },
          { key: 'gate', label: 'Cổng chính' },
        ].map((tab) => {
          const isSelected = activeRoomTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.roomChip,
                {
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderColor: isSelected ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setActiveRoomTab(tab.key as any)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.roomChipText,
                  { color: isSelected ? '#FFFFFF' : theme.textSecondary, fontWeight: isSelected ? '700' : '500' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 4. REAL-TIME SENSORS (DHT22 & Độ ẩm đất) */}
      <SensorCards sensors={sensors} theme={theme} />

      {/* 5. REMOTE ACTUATORS (Đèn LED & Relay Máy bơm) */}
      <DeviceControlCards
        led={actuators.led}
        relay={actuators.relay}
        theme={theme}
        onToggleLed={toggleLed}
        onSetLedBrightness={setLedBrightness}
        onToggleRelay={toggleRelay}
        onUpdateRelayConfig={updateRelayConfig}
      />

      {/* 6. DOOR & SECURITY (HC-SR04 & Động cơ Servo) */}
      <DoorStatusCard
        door={actuators.door}
        ultrasonic={sensors.ultrasonic}
        theme={theme}
        onToggleOverride={toggleDoorOverride}
        onToggleAutoMode={setDoorAutoMode}
      />

      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Spacing.xl,
  },
  pillsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: 8,
    marginBottom: Spacing.md,
  },
  summaryPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  pillIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  pillLabel: {
    fontSize: 9,
    fontWeight: '500',
  },
  roomFilterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: 8,
    marginBottom: Spacing.md,
  },
  roomChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  roomChipText: {
    fontSize: 12,
  },
});
