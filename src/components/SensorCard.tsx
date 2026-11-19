/**
 * Component: SensorCards (Khu vực Giám sát Môi trường)
 * Thiết kế Grid 3 thẻ trực quan:
 * 1. Nhiệt độ phòng (DHT22): Cảnh báo màu đỏ/cam khi > 35°C
 * 2. Độ ẩm không khí (DHT22): Màu xanh dương dịu mát, chỉ số thoải mái
 * 3. Độ ẩm đất (Biến trở): Phần trăm + chữ cảnh báo "Khô - Cần tưới" / "Đủ ẩm"
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { EnvironmentSensors } from '../types/iot';
import { ThemeColors, Radii, Spacing } from '../constants/theme';

interface SensorCardsProps {
  sensors: EnvironmentSensors;
  theme: ThemeColors;
}

export const SensorCards: React.FC<SensorCardsProps> = ({ sensors, theme }) => {
  const { dht22, soil } = sensors;

  // Tính toán màu sắc cảnh báo theo nhiệt độ DHT22
  const isHighTemp = dht22.temperature > 35.0;
  const isWarmTemp = dht22.temperature > 30.0 && !isHighTemp;

  const tempColor = isHighTemp ? theme.danger : isWarmTemp ? theme.warning : theme.success;
  const tempBg = isHighTemp ? theme.dangerLight : isWarmTemp ? theme.warningLight : theme.successLight;

  // Tính toán thanh tiến trình nhiệt độ (scale từ 15°C đến 45°C)
  const tempProgress = Math.min(100, Math.max(0, ((dht22.temperature - 15) / (45 - 15)) * 100));

  // Trạng thái độ ẩm đất
  const isSoilDry = soil.status === 'dry';
  const soilColor = isSoilDry ? theme.warning : theme.success;
  const soilBg = isSoilDry ? theme.warningLight : theme.successLight;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Cảm biến môi trường</Text>
        <View style={styles.realtimeBadge}>
          <View style={[styles.pulseDot, { backgroundColor: theme.primary }]} />
          <Text style={[styles.realtimeText, { color: theme.textSecondary }]}>Real-time (2s)</Text>
        </View>
      </View>

      <View style={styles.cardsRow}>
        {/* CARD 1: NHIỆT ĐỘ PHÒNG (DHT22) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: isHighTemp ? theme.danger : theme.border,
              borderWidth: isHighTemp ? 1.5 : 1,
              shadowColor: theme.shadowColor,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: tempBg }]}>
              <Ionicons
                name={isHighTemp ? 'flame' : 'thermometer-outline'}
                size={18}
                color={tempColor}
              />
            </View>
            {isHighTemp && (
              <View style={[styles.miniAlertPill, { backgroundColor: theme.dangerLight }]}>
                <Text style={[styles.miniAlertText, { color: theme.danger }]}>NÓNG</Text>
              </View>
            )}
          </View>

          <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>Nhiệt độ phòng</Text>

          <View style={styles.valueRow}>
            <Text style={[styles.mainValue, { color: tempColor }]}>
              {dht22.temperature.toFixed(1)}
            </Text>
            <Text style={[styles.unitText, { color: tempColor }]}>°C</Text>
          </View>

          {/* Mini progress bar */}
          <View style={[styles.progressBarTrack, { backgroundColor: theme.surfaceSubtle }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${tempProgress}%`, backgroundColor: tempColor },
              ]}
            />
          </View>

          <Text style={[styles.subValueText, { color: theme.textMuted }]}>
            {dht22.temperature > 35 ? 'Cảnh báo nhiệt cao' : 'DHT22 • Ổn định'}
          </Text>
        </View>

        {/* CARD 2: ĐỘ ẨM KHÔNG KHÍ (DHT22) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              shadowColor: theme.shadowColor,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: theme.infoLight }]}>
              <Ionicons name="water-outline" size={18} color={theme.info} />
            </View>
          </View>

          <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>Độ ẩm không khí</Text>

          <View style={styles.valueRow}>
            <Text style={[styles.mainValue, { color: theme.info }]}>
              {dht22.humidity.toFixed(1)}
            </Text>
            <Text style={[styles.unitText, { color: theme.info }]}>%</Text>
          </View>

          {/* Mini progress bar */}
          <View style={[styles.progressBarTrack, { backgroundColor: theme.surfaceSubtle }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(100, dht22.humidity)}%`, backgroundColor: theme.info },
              ]}
            />
          </View>

          <Text style={[styles.subValueText, { color: theme.textMuted }]}>
            {dht22.humidity < 45 ? 'Hơi khô' : dht22.humidity > 70 ? 'Khá ẩm' : 'Lý tưởng'}
          </Text>
        </View>

        {/* CARD 3: ĐỘ ẨM ĐẤT (BIẾN TRỞ ADC) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface,
              borderColor: isSoilDry ? theme.warning : theme.border,
              borderWidth: isSoilDry ? 1.5 : 1,
              shadowColor: theme.shadowColor,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: soilBg }]}>
              <MaterialCommunityIcons
                name={isSoilDry ? 'watering-can-outline' : 'sprout'}
                size={18}
                color={soilColor}
              />
            </View>
            <View style={[styles.miniStatusBadge, { backgroundColor: soilBg }]}>
              <Text style={[styles.miniStatusText, { color: soilColor }]} numberOfLines={1}>
                {soil.status === 'dry' ? 'Khô' : 'Tốt'}
              </Text>
            </View>
          </View>

          <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>Độ ẩm đất</Text>

          <View style={styles.valueRow}>
            <Text style={[styles.mainValue, { color: soilColor }]}>
              {soil.percentage}
            </Text>
            <Text style={[styles.unitText, { color: soilColor }]}>%</Text>
          </View>

          {/* Mini progress bar */}
          <View style={[styles.progressBarTrack, { backgroundColor: theme.surfaceSubtle }]}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${soil.percentage}%`, backgroundColor: soilColor },
              ]}
            />
          </View>

          <Text
            style={[
              styles.subValueText,
              { color: isSoilDry ? theme.warning : theme.textMuted, fontWeight: isSoilDry ? '600' : '400' },
            ]}
            numberOfLines={1}
          >
            {soil.statusText}
          </Text>
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
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  realtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  realtimeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    flex: 1,
    borderRadius: Radii.lg,
    padding: Spacing.sm + 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: Radii.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAlertPill: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniAlertText: {
    fontSize: 9,
    fontWeight: '800',
  },
  miniStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.full,
  },
  miniStatusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginBottom: 6,
  },
  mainValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  subValueText: {
    fontSize: 10,
  },
});
