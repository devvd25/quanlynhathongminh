/**
 * Screen: AnalyticsScreen (Lịch sử & Thống kê)
 * Biểu đồ theo dõi Nhiệt độ, Độ ẩm và Khoảng cách theo thời gian.
 * Sẵn sàng kết nối REST API / Database Backend (FastAPI / Node.js).
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSmartHome } from '../hooks/useSmartHome';
import { ThemeColors, Radii, Spacing } from '../constants/theme';

interface AnalyticsScreenProps {
  smartHome: ReturnType<typeof useSmartHome>;
  theme: ThemeColors;
}

const { width } = Dimensions.get('window');

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ smartHome, theme }) => {
  const { history, sensors } = smartHome;
  const [selectedMetric, setSelectedMetric] = useState<'temp' | 'hum' | 'soil'>('temp');

  // Tính toán số liệu thống kê từ buffer history
  const temps = history.map((p) => p.temperature);
  const maxTemp = temps.length ? Math.max(...temps).toFixed(1) : '28.0';
  const minTemp = temps.length ? Math.min(...temps).toFixed(1) : '24.0';
  const avgTemp = temps.length
    ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1)
    : '26.0';

  const currentValues =
    selectedMetric === 'temp'
      ? history.map((h) => h.temperature)
      : selectedMetric === 'hum'
      ? history.map((h) => h.humidity)
      : history.map((h) => h.soilMoisture);

  const maxValue = currentValues.length ? Math.max(...currentValues) : 100;
  const minValue = currentValues.length ? Math.min(...currentValues) : 0;
  const range = maxValue - minValue || 1;

  const metricColor =
    selectedMetric === 'temp' ? theme.danger : selectedMetric === 'hum' ? theme.info : theme.success;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Thống kê & Lịch sử</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Dữ liệu đồng bộ từ ESP32 và sẵn sàng tích hợp Backend Database
        </Text>
      </View>

      {/* Metric Selector Tabs */}
      <View style={[styles.selectorContainer, { backgroundColor: theme.surfaceSubtle }]}>
        <TouchableOpacity
          style={[
            styles.selectorTab,
            selectedMetric === 'temp' && { backgroundColor: theme.surface, shadowColor: theme.shadowColor },
          ]}
          onPress={() => setSelectedMetric('temp')}
        >
          <Ionicons
            name="thermometer-outline"
            size={16}
            color={selectedMetric === 'temp' ? theme.danger : theme.textSecondary}
          />
          <Text
            style={[
              styles.selectorText,
              { color: selectedMetric === 'temp' ? theme.textPrimary : theme.textSecondary },
            ]}
          >
            Nhiệt độ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectorTab,
            selectedMetric === 'hum' && { backgroundColor: theme.surface, shadowColor: theme.shadowColor },
          ]}
          onPress={() => setSelectedMetric('hum')}
        >
          <Ionicons
            name="water-outline"
            size={16}
            color={selectedMetric === 'hum' ? theme.info : theme.textSecondary}
          />
          <Text
            style={[
              styles.selectorText,
              { color: selectedMetric === 'hum' ? theme.textPrimary : theme.textSecondary },
            ]}
          >
            Độ ẩm khí
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.selectorTab,
            selectedMetric === 'soil' && { backgroundColor: theme.surface, shadowColor: theme.shadowColor },
          ]}
          onPress={() => setSelectedMetric('soil')}
        >
          <MaterialCommunityIcons
            name="sprout"
            size={16}
            color={selectedMetric === 'soil' ? theme.success : theme.textSecondary}
          />
          <Text
            style={[
              styles.selectorText,
              { color: selectedMetric === 'soil' ? theme.textPrimary : theme.textSecondary },
            ]}
          >
            Độ ẩm đất
          </Text>
        </TouchableOpacity>
      </View>

      {/* BIỂU ĐỒ TRỰC QUAN (Custom Line Chart Canvas/Bar Visualizer) */}
      <View
        style={[
          styles.chartCard,
          { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
        ]}
      >
        <View style={styles.chartHeader}>
          <View>
            <Text style={[styles.chartTitle, { color: theme.textPrimary }]}>
              {selectedMetric === 'temp'
                ? 'Biểu đồ Nhiệt độ DHT22 (°C)'
                : selectedMetric === 'hum'
                ? 'Biểu đồ Độ ẩm Không khí (%)'
                : 'Biểu đồ Độ ẩm Đất (%)'}
            </Text>
            <Text style={[styles.chartLiveIndicator, { color: theme.textMuted }]}>
              Cập nhật mỗi 2 giây • {history.length} điểm ghi nhận
            </Text>
          </View>
          <Text style={[styles.chartCurrentValue, { color: metricColor }]}>
            {selectedMetric === 'temp'
              ? `${sensors.dht22.temperature.toFixed(1)}°C`
              : selectedMetric === 'hum'
              ? `${sensors.dht22.humidity.toFixed(1)}%`
              : `${sensors.soil.percentage}%`}
          </Text>
        </View>

        {/* Biểu đồ cột/vùng dạng Modern Wave Graphic */}
        <View style={styles.chartArea}>
          {history.map((pt, idx) => {
            const val =
              selectedMetric === 'temp'
                ? pt.temperature
                : selectedMetric === 'hum'
                ? pt.humidity
                : pt.soilMoisture;
            const heightPercent = Math.min(100, Math.max(15, ((val - minValue) / range) * 100));

            return (
              <View key={idx} style={styles.barCol}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${heightPercent}%`,
                        backgroundColor: metricColor,
                        opacity: 0.35 + (idx / history.length) * 0.65,
                      },
                    ]}
                  />
                </View>
                {idx % 4 === 0 && (
                  <Text style={[styles.timeTick, { color: theme.textMuted }]}>
                    {pt.timeLabel.substring(0, 5)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Chú thích Backend */}
        <View style={[styles.backendNote, { backgroundColor: theme.surfaceSubtle }]}>
          <MaterialCommunityIcons name="database-arrow-down-outline" size={16} color={theme.primary} />
          <Text style={[styles.backendNoteText, { color: theme.textSecondary }]}>
            REST API Endpoint: GET /api/v1/sensors/history?range=24h
          </Text>
        </View>
      </View>

      {/* STATS SUMMARY CARDS */}
      <View style={styles.statsGrid}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
          ]}
        >
          <View style={[styles.statIconBox, { backgroundColor: theme.dangerLight }]}>
            <Ionicons name="arrow-up" size={16} color={theme.danger} />
          </View>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>{maxTemp} °C</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Cao nhất hôm nay</Text>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
          ]}
        >
          <View style={[styles.statIconBox, { backgroundColor: theme.infoLight }]}>
            <Ionicons name="arrow-down" size={16} color={theme.info} />
          </View>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>{minTemp} °C</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Thấp nhất hôm nay</Text>
        </View>

        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
          ]}
        >
          <View style={[styles.statIconBox, { backgroundColor: theme.successLight }]}>
            <Ionicons name="stats-chart" size={16} color={theme.success} />
          </View>
          <Text style={[styles.statValue, { color: theme.textPrimary }]}>{avgTemp} °C</Text>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Nhiệt độ trung bình</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  header: {
    marginBottom: Spacing.base,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  selectorContainer: {
    flexDirection: 'row',
    borderRadius: Radii.md,
    padding: 4,
    marginBottom: Spacing.base,
  },
  selectorTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: Radii.sm,
    gap: 6,
  },
  selectorText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.base,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  chartLiveIndicator: {
    fontSize: 11,
    marginTop: 2,
  },
  chartCurrentValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  chartArea: {
    height: 160,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: 8,
    height: '85%',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    borderRadius: 4,
  },
  timeTick: {
    fontSize: 9,
    position: 'absolute',
    bottom: -18,
  },
  backendNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: Spacing.sm,
    borderRadius: Radii.sm,
    marginTop: Spacing.md,
  },
  backendNoteText: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 9,
    textAlign: 'center',
  },
});
