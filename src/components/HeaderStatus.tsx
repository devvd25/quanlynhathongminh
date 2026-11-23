/**
 * Component: HeaderStatus
 * Header giao diện Smart Home & Badge đồng bộ màn hình OLED Wokwi ESP32
 * (WiFi: OK | MQTT: OK), hiển thị IP, Ping và nút Reconnect.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { IotConnectionStatus } from '../types/iot';
import { UserProfile } from '../types/auth';
import { ThemeColors, Radii, Spacing } from '../constants/theme';

interface HeaderStatusProps {
  connection: IotConnectionStatus;
  user?: UserProfile | null;
  theme: ThemeColors;
  isDarkMode: boolean;
  isRefreshing: boolean;
  onReconnect: () => void;
  onToggleTheme: () => void;
  onProfilePress?: () => void;
}

export const HeaderStatus: React.FC<HeaderStatusProps> = ({
  connection,
  user,
  theme,
  isDarkMode,
  isRefreshing,
  onReconnect,
  onToggleTheme,
  onProfilePress,
}) => {
  const isEspConnected = connection.esp32 === 'connected';
  const isBrokerConnected = connection.broker === 'connected';
  const isStandby = connection.esp32 === 'standby';

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Chào buổi sáng!' : currentHour < 18 ? 'Chào buổi chiều!' : 'Chào buổi tối!';

  return (
    <View style={styles.container}>
      {/* Hàng 1: Tiêu đề, Lời chào & Tên Người Dùng/Vai Trò */}
      <View style={styles.topRow}>
        <TouchableOpacity style={styles.greetingContainer} onPress={onProfilePress} activeOpacity={0.8}>
          <View style={styles.titleWithIcon}>
            <Text style={[styles.homeTitle, { color: theme.textPrimary }]}>
              {user?.homeName || 'Nhà của tôi'}
            </Text>
            {user?.role === 'admin' ? (
              <View style={[styles.roleBadge, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.roleText, { color: theme.primary }]}>ADMIN</Text>
              </View>
            ) : (
              <View style={[styles.roleBadge, { backgroundColor: theme.successLight }]}>
                <Text style={[styles.roleText, { color: theme.success }]}>GIA CHỦ</Text>
              </View>
            )}
          </View>
          <Text style={[styles.greetingSubtitle, { color: theme.textSecondary }]}>
            {greeting} {user?.name ? user.name : 'Chào mừng bạn trở lại.'}
          </Text>
        </TouchableOpacity>

        {/* Nút Đổi Theme & Nút Reconnect */}
        <View style={styles.actionsGroup}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={onToggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDarkMode ? 'sunny-outline' : 'moon-outline'}
              size={18}
              color={isDarkMode ? '#FBBF24' : theme.textPrimary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              { backgroundColor: theme.primaryLight, borderColor: theme.border },
            ]}
            onPress={onReconnect}
            disabled={isRefreshing}
            activeOpacity={0.7}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Ionicons name="refresh" size={18} color={theme.primary} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Hàng 2: Bảng trạng thái OLED System Sync (ESP32 Wokwi + HiveMQ MQTT) */}
      <View
        style={[
          styles.oledSyncCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            shadowColor: theme.shadowColor,
          },
        ]}
      >
        <View style={styles.oledHeader}>
          <View style={styles.hardwareBadge}>
            <MaterialCommunityIcons name="chip" size={16} color={theme.primary} />
            <Text style={[styles.hardwareText, { color: theme.textPrimary }]}>
              ESP32 Wokwi Simulator
            </Text>
          </View>
          <View style={styles.pingBadge}>
            <View
              style={[
                styles.dotIndicator,
                {
                  backgroundColor: isEspConnected
                    ? theme.success
                    : isStandby
                    ? theme.warning
                    : theme.danger,
                },
              ]}
            />
            <Text style={[styles.pingText, { color: theme.textSecondary }]}>
              {isStandby
                ? 'Sẵn sàng kết nối'
                : isEspConnected
                ? `${connection.pingMs || 25} ms • Wokwi OK`
                : 'Mất kết nối'}
            </Text>
          </View>
        </View>

        {/* Dòng mô phỏng chuẩn màn hình OLED: WiFi: OK | MQTT: OK */}
        <View style={[styles.oledScreenBox, { backgroundColor: isDarkMode ? '#050811' : '#0F172A' }]}>
          <View style={styles.oledLineItem}>
            <Ionicons
              name="wifi"
              size={14}
              color={isEspConnected ? '#10B981' : isStandby ? '#FBBF24' : '#EF4444'}
            />
            <Text style={styles.oledLabel}>WiFi:</Text>
            <Text
              style={[
                styles.oledValue,
                { color: isEspConnected ? '#34D399' : isStandby ? '#FBBF24' : '#F87171' },
              ]}
            >
              {isEspConnected ? 'Wokwi OK' : isStandby ? 'STANDBY' : 'OFFLINE'}
            </Text>
          </View>

          <View style={styles.oledDivider} />

          <View style={styles.oledLineItem}>
            <MaterialCommunityIcons
              name="cloud-sync-outline"
              size={14}
              color={isBrokerConnected ? '#38BDF8' : '#FBBF24'}
            />
            <Text style={styles.oledLabel}>MQTT:</Text>
            <Text
              style={[
                styles.oledValue,
                { color: isBrokerConnected ? '#38BDF8' : '#FBBF24' },
              ]}
            >
              {isBrokerConnected ? 'HiveMQ Sẵn sàng' : 'STANDBY'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  greetingContainer: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  homeTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  greetingSubtitle: {
    fontSize: 13,
    marginTop: 3,
    lineHeight: 18,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: Radii.full,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  oledSyncCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  oledHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  hardwareBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hardwareText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotIndicator: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  pingText: {
    fontSize: 11,
    fontWeight: '500',
  },
  oledScreenBox: {
    borderRadius: Radii.sm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  oledLineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  oledLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  oledValue: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  oledDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#334155',
  },
});
