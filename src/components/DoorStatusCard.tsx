/**
 * Component: DoorStatusCard (Khu vực Giám sát & Điều khiển Cửa thông minh)
 * Kết hợp Cảm biến siêu âm HC-SR04 & Động cơ Servo 180°:
 * 1. Hiển thị góc quay cửa (0° Đóng - 90° Mở)
 * 2. Đo khoảng cách vật cản siêu âm HC-SR04 (Trig Pin 5, Echo Pin 18)
 * 3. Badge "Chế độ Tự động (< 50cm)" + Nút gạt "Mở khẩn cấp từ xa" (Override)
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { DoorServoActuator, UltrasonicData } from '../types/iot';
import { ThemeColors, Radii, Spacing } from '../constants/theme';

interface DoorStatusCardProps {
  door: DoorServoActuator;
  ultrasonic: UltrasonicData;
  theme: ThemeColors;
  onToggleOverride: () => void;
  onToggleAutoMode: (enabled: boolean) => void;
}

export const DoorStatusCard: React.FC<DoorStatusCardProps> = ({
  door,
  ultrasonic,
  theme,
  onToggleOverride,
  onToggleAutoMode,
}) => {
  const hasDistance = ultrasonic.distanceCm !== null;
  const isNear = hasDistance && ultrasonic.objectDetected;
  const isOpen = door.isOpen || door.angle >= 45;

  const distanceBarPercent = hasDistance
    ? Math.min(100, Math.max(5, (ultrasonic.distanceCm! / 200) * 100))
    : 0;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Cửa thông minh & An ninh</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
          HC-SR04 (Pin 5/18) + Servo (Pin 19)
        </Text>
      </View>

      <View
        style={[
          styles.mainCard,
          {
            backgroundColor: theme.surface,
            borderColor: isNear ? theme.primary : theme.border,
            shadowColor: theme.shadowColor,
          },
        ]}
      >
        {/* Phần 1: Trạng thái cửa và Động cơ Servo */}
        <View style={styles.topRow}>
          <View style={styles.doorIdentity}>
            <View
              style={[
                styles.doorIconBox,
                {
                  backgroundColor: isOpen ? theme.successLight : theme.doorPurpleLight,
                  borderColor: isOpen ? theme.success : theme.doorPurple,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={isOpen ? 'door-open' : 'door-closed-lock'}
                size={26}
                color={isOpen ? theme.success : theme.doorPurple}
              />
            </View>
            <View>
              <Text style={[styles.doorTitle, { color: theme.textPrimary }]}>
                Cổng chính ra vào (Servo Pin 19)
              </Text>
              <View style={styles.servoAngleRow}>
                <View
                  style={[
                    styles.angleDot,
                    { backgroundColor: isOpen ? theme.success : theme.textMuted },
                  ]}
                />
                <Text
                  style={[
                    styles.doorStateText,
                    { color: isOpen ? theme.success : theme.textSecondary },
                  ]}
                >
                  {isOpen ? `Đang Mở (${door.angle}°)` : `Đang Đóng (${door.angle}°)`}
                </Text>
              </View>
            </View>
          </View>

          {/* Badge chế độ tự động */}
          <TouchableOpacity
            style={[
              styles.autoBadge,
              {
                backgroundColor: door.isAutoMode ? theme.primaryLight : theme.surfaceSubtle,
                borderColor: door.isAutoMode ? theme.primary : theme.border,
              },
            ]}
            onPress={() => onToggleAutoMode(!door.isAutoMode)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={door.isAutoMode ? 'flash' : 'flash-off-outline'}
              size={12}
              color={door.isAutoMode ? theme.primary : theme.textMuted}
            />
            <Text
              style={[
                styles.autoBadgeText,
                { color: door.isAutoMode ? theme.primary : theme.textMuted },
              ]}
            >
              {door.isAutoMode ? 'Tự động (< 50cm)' : 'Thủ công'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Phần 2: Cảm biến siêu âm HC-SR04 */}
        <View
          style={[
            styles.radarBox,
            {
              backgroundColor: isNear ? theme.primaryLight : theme.surfaceSubtle,
              borderColor: isNear ? theme.primary : 'transparent',
            },
          ]}
        >
          <View style={styles.radarHeader}>
            <View style={styles.radarLabelGroup}>
              <MaterialCommunityIcons
                name="radar"
                size={16}
                color={isNear ? theme.primary : theme.textSecondary}
              />
              <Text style={[styles.radarLabel, { color: theme.textSecondary }]}>
                Khoảng cách vật cản (HC-SR04)
              </Text>
            </View>
            <Text
              style={[
                styles.distanceHighlight,
                { color: isNear ? theme.primary : theme.textPrimary },
              ]}
            >
              {hasDistance ? `${ultrasonic.distanceCm} cm` : '-- cm'}
            </Text>
          </View>

          {/* Thanh trực quan radar */}
          <View style={[styles.radarBarTrack, { backgroundColor: theme.surfaceVariant }]}>
            <View
              style={[
                styles.radarBarFill,
                {
                  width: `${distanceBarPercent}%`,
                  backgroundColor: isNear ? theme.warning : theme.primary,
                },
              ]}
            />
            {/* Vạch ngưỡng 50cm */}
            <View style={[styles.thresholdMarker, { left: '25%' }]} />
          </View>

          <View style={styles.radarFooter}>
            <Text style={[styles.radarFooterText, { color: theme.textMuted }]}>
              {hasDistance
                ? isNear
                  ? '⚠️ Phát hiện người lại gần (< 50cm) - Sẵn sàng kích hoạt mở cửa'
                  : 'An toàn, không có người trong phạm vi 50cm'
                : 'Chờ nhận tín hiệu siêu âm từ Wokwi / ESP32...'}
            </Text>
          </View>
        </View>

        {/* Phần 3: Nút gạt Mở khẩn cấp từ xa (Override) */}
        <View style={[styles.overrideSection, { borderTopColor: theme.border }]}>
          <View style={styles.overrideInfo}>
            <View style={styles.overrideTitleRow}>
              <Ionicons name="key-outline" size={16} color={theme.textPrimary} />
              <Text style={[styles.overrideTitle, { color: theme.textPrimary }]}>
                Mở khẩn cấp từ xa (Override)
              </Text>
            </View>
            <Text style={[styles.overrideSubtitle, { color: theme.textSecondary }]}>
              Ghi đè cảm biến, xoay Servo 90° để mở cổng
            </Text>
          </View>

          <View style={styles.overrideSwitch}>
            {door.isPending ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <Switch
                value={door.isOverride}
                onValueChange={onToggleOverride}
                trackColor={{ false: theme.surfaceSubtle, true: theme.danger }}
                thumbColor="#FFFFFF"
              />
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  mainCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.base,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  doorIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  doorIconBox: {
    width: 46,
    height: 46,
    borderRadius: Radii.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doorTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  servoAngleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  angleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  doorStateText: {
    fontSize: 12,
    fontWeight: '600',
  },
  autoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  autoBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  radarBox: {
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  radarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  radarLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  radarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  distanceHighlight: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  radarBarTrack: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 6,
  },
  radarBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  thresholdMarker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#EF4444',
  },
  radarFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radarFooterText: {
    fontSize: 11,
    fontWeight: '500',
  },
  overrideSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: Spacing.md,
  },
  overrideInfo: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  overrideTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  overrideTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  overrideSubtitle: {
    fontSize: 11,
  },
  overrideSwitch: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
});
