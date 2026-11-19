/**
 * Component: DeviceControlCards (Khu vực Điều khiển Thiết bị từ xa)
 * Thẻ công tắc lớn (Interactive Toggle Cards) phong cách Modern Smart Home:
 * 1. Đèn chiếu sáng (LED): Nút bật/tắt, bóng đèn phát sáng vàng, thanh chỉnh độ sáng
 * 2. Rơ-le Module: Nút bật/tắt, cho phép đổi tên/loại thiết bị (Máy bơm tưới cây / Quạt / Bình nóng lạnh)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LedActuator, RelayActuator, RelayDeviceType } from '../types/iot';
import { ThemeColors, Radii, Spacing } from '../constants/theme';

interface DeviceControlCardsProps {
  led: LedActuator;
  relay: RelayActuator;
  theme: ThemeColors;
  onToggleLed: () => void;
  onSetLedBrightness: (val: number) => void;
  onToggleRelay: () => void;
  onUpdateRelayConfig: (type: RelayDeviceType, name: string) => void;
}

export const DeviceControlCards: React.FC<DeviceControlCardsProps> = ({
  led,
  relay,
  theme,
  onToggleLed,
  onSetLedBrightness,
  onToggleRelay,
  onUpdateRelayConfig,
}) => {
  const isLedOn = led.state === 'ON';
  const isRelayOn = relay.state === 'ON';

  const [isRelayModalVisible, setRelayModalVisible] = useState(false);

  // Danh sách các loại thiết bị cho Relay Module
  const relayOptions: { type: RelayDeviceType; name: string; icon: string }[] = [
    { type: 'pump', name: 'Máy bơm tưới cây', icon: 'water-pump' },
    { type: 'fan', name: 'Quạt làm mát', icon: 'fan' },
    { type: 'heater', name: 'Bình nước nóng', icon: 'water-boiler' },
    { type: 'appliance', name: 'Thiết bị công suất', icon: 'power-plug' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Điều khiển thiết bị</Text>
        <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>ESP32 Actuators</Text>
      </View>

      <View style={styles.cardsGrid}>
        {/* CARD 1: ĐÈN CHIẾU SÁNG (LED) */}
        <View
          style={[
            styles.deviceCard,
            {
              backgroundColor: isLedOn ? (theme.lampGoldLight) : theme.surface,
              borderColor: isLedOn ? theme.lampGold : theme.border,
              shadowColor: theme.shadowColor,
            },
          ]}
        >
          {/* Card Header: Icon + Switch */}
          <View style={styles.cardTopRow}>
            <View
              style={[
                styles.deviceIconCircle,
                {
                  backgroundColor: isLedOn ? theme.lampGold : theme.surfaceSubtle,
                  shadowColor: isLedOn ? theme.lampGold : 'transparent',
                  shadowOpacity: isLedOn ? 0.4 : 0,
                  shadowRadius: 8,
                  elevation: isLedOn ? 4 : 0,
                },
              ]}
            >
              <Ionicons
                name={isLedOn ? 'bulb' : 'bulb-outline'}
                size={24}
                color={isLedOn ? '#FFFFFF' : theme.textSecondary}
              />
            </View>

            <View style={styles.switchWrapper}>
              {led.isPending ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Switch
                  value={isLedOn}
                  onValueChange={onToggleLed}
                  trackColor={{ false: theme.surfaceSubtle, true: theme.primary }}
                  thumbColor="#FFFFFF"
                />
              )}
            </View>
          </View>

          {/* Info */}
          <Text style={[styles.deviceName, { color: theme.textPrimary }]} numberOfLines={1}>
            {led.name}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicatorDot,
                { backgroundColor: isLedOn ? theme.success : theme.textMuted },
              ]}
            />
            <Text style={[styles.deviceStatusText, { color: isLedOn ? theme.success : theme.textMuted }]}>
              {led.isPending ? 'Đang gửi lệnh...' : isLedOn ? `Đang bật • ${led.brightness}%` : 'Đang tắt'}
            </Text>
          </View>

          {/* Slider độ sáng mini trực quan */}
          {isLedOn && (
            <View style={styles.brightnessControl}>
              <View style={styles.brightnessLabels}>
                <Ionicons name="sunny-outline" size={12} color={theme.textSecondary} />
                <Text style={[styles.brightnessText, { color: theme.textSecondary }]}>
                  Độ sáng: {led.brightness}%
                </Text>
              </View>
              <View style={styles.brightnessBar}>
                {[25, 50, 75, 100].map((step) => (
                  <TouchableOpacity
                    key={step}
                    style={[
                      styles.stepButton,
                      {
                        backgroundColor:
                          led.brightness >= step ? theme.lampGold : theme.surfaceVariant,
                      },
                    ]}
                    onPress={() => onSetLedBrightness(step)}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* CARD 2: RƠ-LE MODULE (MÁY BƠM / THIẾT BỊ ĐIỆN CÔNG SUẤT) */}
        <View
          style={[
            styles.deviceCard,
            {
              backgroundColor: isRelayOn ? theme.pumpTealLight : theme.surface,
              borderColor: isRelayOn ? theme.pumpTeal : theme.border,
              shadowColor: theme.shadowColor,
            },
          ]}
        >
          {/* Card Header: Icon + Switch */}
          <View style={styles.cardTopRow}>
            <TouchableOpacity
              style={[
                styles.deviceIconCircle,
                {
                  backgroundColor: isRelayOn ? theme.pumpTeal : theme.surfaceSubtle,
                  shadowColor: isRelayOn ? theme.pumpTeal : 'transparent',
                  shadowOpacity: isRelayOn ? 0.35 : 0,
                  shadowRadius: 8,
                  elevation: isRelayOn ? 4 : 0,
                },
              ]}
              onPress={() => setRelayModalVisible(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={
                  relay.deviceType === 'pump'
                    ? 'water-pump'
                    : relay.deviceType === 'fan'
                    ? 'fan'
                    : 'power-socket-eu'
                }
                size={22}
                color={isRelayOn ? '#FFFFFF' : theme.textSecondary}
              />
            </TouchableOpacity>

            <View style={styles.switchWrapper}>
              {relay.isPending ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Switch
                  value={isRelayOn}
                  onValueChange={onToggleRelay}
                  trackColor={{ false: theme.surfaceSubtle, true: theme.pumpTeal }}
                  thumbColor="#FFFFFF"
                />
              )}
            </View>
          </View>

          {/* Info & Rename Trigger */}
          <TouchableOpacity
            onPress={() => setRelayModalVisible(true)}
            style={styles.nameRow}
            activeOpacity={0.7}
          >
            <Text style={[styles.deviceName, { color: theme.textPrimary }]} numberOfLines={1}>
              {relay.name}
            </Text>
            <Ionicons name="create-outline" size={14} color={theme.textMuted} style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusIndicatorDot,
                { backgroundColor: isRelayOn ? theme.success : theme.textMuted },
              ]}
            />
            <Text style={[styles.deviceStatusText, { color: isRelayOn ? theme.success : theme.textMuted }]}>
              {relay.isPending ? 'Đang gửi lệnh...' : isRelayOn ? `Đang chạy • ${relay.powerWatts}W` : 'Đang tắt'}
            </Text>
          </View>

          {/* Quick Info Box */}
          <View style={[styles.relayTypeBadge, { backgroundColor: theme.surfaceSubtle }]}>
            <MaterialCommunityIcons name="flash-outline" size={13} color={theme.textSecondary} />
            <Text style={[styles.relayTypeText, { color: theme.textSecondary }]}>
              Relay 220V/10A • {relay.deviceType.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      {/* MODAL ĐỔI LOẠI THIẾT BỊ RƠ-LE */}
      <Modal
        visible={isRelayModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRelayModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              Chọn loại thiết bị Rơ-le
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Đổi icon và tên gọi thiết bị điều khiển bởi module Relay
            </Text>

            <View style={styles.optionsList}>
              {relayOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.type}
                  style={[
                    styles.optionItem,
                    {
                      borderColor: relay.deviceType === opt.type ? theme.primary : theme.border,
                      backgroundColor:
                        relay.deviceType === opt.type ? theme.primaryLight : theme.surfaceSubtle,
                    },
                  ]}
                  onPress={() => {
                    onUpdateRelayConfig(opt.type, opt.name);
                    setRelayModalVisible(false);
                  }}
                >
                  <MaterialCommunityIcons
                    name={opt.icon as any}
                    size={20}
                    color={relay.deviceType === opt.type ? theme.primary : theme.textPrimary}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      {
                        color:
                          relay.deviceType === opt.type ? theme.primary : theme.textPrimary,
                        fontWeight: relay.deviceType === opt.type ? '700' : '500',
                      },
                    ]}
                  >
                    {opt.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: theme.surfaceSubtle }]}
              onPress={() => setRelayModalVisible(false)}
            >
              <Text style={[styles.modalCloseText, { color: theme.textPrimary }]}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  cardsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  deviceCard: {
    flex: 1,
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.base,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    minHeight: 165,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  deviceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchWrapper: {
    minWidth: 44,
    alignItems: 'flex-end',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: Spacing.sm,
  },
  statusIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  deviceStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  brightnessControl: {
    marginTop: 4,
  },
  brightnessLabels: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  brightnessText: {
    fontSize: 10,
    fontWeight: '500',
  },
  brightnessBar: {
    flexDirection: 'row',
    gap: 4,
    height: 6,
  },
  stepButton: {
    flex: 1,
    borderRadius: 3,
  },
  relayTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: Radii.sm,
    marginTop: 4,
  },
  relayTypeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    width: '100%',
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.base,
  },
  optionsList: {
    gap: 10,
    marginBottom: Spacing.base,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    gap: 12,
  },
  optionText: {
    fontSize: 14,
  },
  modalCloseButton: {
    paddingVertical: 12,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
