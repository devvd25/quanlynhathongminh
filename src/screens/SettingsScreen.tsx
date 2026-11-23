/**
 * Screen: SettingsScreen (Cài đặt & Cấu hình)
 * 1. Form cấu hình HiveMQ Broker (Host, Port, Topic Prefix)
 * 2. Cấu hình Quy tắc Tự động hóa (Ngưỡng tưới đất, Ngưỡng mở cửa)
 * 3. Trạng thái kết nối Wokwi ESP32 & Backend
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSmartHome } from '../hooks/useSmartHome';
import { ThemeColors, Radii, Spacing } from '../constants/theme';
import { MQTT_CONFIG_DEFAULTS } from '../constants/mqttTopics';

interface SettingsScreenProps {
  smartHome: ReturnType<typeof useSmartHome>;
  theme: ThemeColors;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ smartHome, theme }) => {
  const {
    connection,
    automation,
    updateAutomationConfig,
    reconnect,
  } = smartHome;

  // Broker Form States
  const [brokerHost, setBrokerHost] = useState(MQTT_CONFIG_DEFAULTS.BROKER_HOST);
  const [brokerPort, setBrokerPort] = useState(MQTT_CONFIG_DEFAULTS.BROKER_PORT.toString());
  const [topicPrefix, setTopicPrefix] = useState(MQTT_CONFIG_DEFAULTS.TOPIC_PREFIX);

  // Automation Thresholds
  const [soilThreshold, setSoilThreshold] = useState(automation.soilMoistureThreshold);
  const [doorThreshold, setDoorThreshold] = useState(automation.doorDistanceThreshold);
  const [autoWatering, setAutoWatering] = useState(automation.autoWateringEnabled);
  const [autoDoor, setAutoDoor] = useState(automation.autoDoorEnabled);

  const handleSaveAutomation = () => {
    updateAutomationConfig({
      autoWateringEnabled: autoWatering,
      soilMoistureThreshold: soilThreshold,
      autoDoorEnabled: autoDoor,
      doorDistanceThreshold: doorThreshold,
    });
    Alert.alert('Thành công', 'Đã lưu cấu hình tự động hóa!');
  };

  const handleSaveBroker = () => {
    reconnect();
    Alert.alert('Thành công', 'Đã cập nhật thông tin Broker và đang kết nối lại...');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Cài đặt & Cấu hình</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Quản lý kết nối MQTT Broker và Ngưỡng tự động hóa phần cứng Wokwi
        </Text>
      </View>

      {/* TRẠNG THÁI WOKWI / ESP32 */}
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={[styles.sectionIconBox, { backgroundColor: theme.primaryLight }]}>
            <MaterialCommunityIcons name="chip" size={20} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Phần cứng Wokwi ESP32</Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              {connection.esp32 === 'connected'
                ? 'Đã kết nối với Wokwi ESP32'
                : 'Sẵn sàng kết nối Wokwi khi Backend & HiveMQ online'}
            </Text>
          </View>
          <View
            style={[
              styles.connectionIndicator,
              { backgroundColor: connection.esp32 === 'connected' ? theme.success : theme.warning },
            ]}
          />
        </View>
      </View>

      {/* CẤU HÌNH TỰ ĐỘNG HÓA */}
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Quy tắc Tự động hóa (Automation)
        </Text>

        {/* Quy tắc 1: Tự bật máy bơm tưới */}
        <View style={styles.ruleItem}>
          <View style={styles.ruleTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.ruleTitle, { color: theme.textPrimary }]}>
                Tự động tưới cây khi đất khô
              </Text>
              <Text style={[styles.ruleDesc, { color: theme.textSecondary }]}>
                Kích hoạt Rơ-le máy bơm (Pin 23) khi độ ẩm đất &lt; {soilThreshold}%
              </Text>
            </View>
            <Switch
              value={autoWatering}
              onValueChange={setAutoWatering}
              trackColor={{ false: theme.surfaceSubtle, true: theme.pumpTeal }}
              thumbColor="#FFFFFF"
            />
          </View>

          {autoWatering && (
            <View style={styles.thresholdRow}>
              <Text style={[styles.thresholdLabel, { color: theme.textSecondary }]}>
                Ngưỡng độ ẩm kích hoạt:
              </Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: theme.surfaceSubtle }]}
                  onPress={() => setSoilThreshold((prev) => Math.max(10, prev - 5))}
                >
                  <Ionicons name="remove" size={16} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.stepperValue, { color: theme.textPrimary }]}>
                  {soilThreshold}%
                </Text>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: theme.surfaceSubtle }]}
                  onPress={() => setSoilThreshold((prev) => Math.min(80, prev + 5))}
                >
                  <Ionicons name="add" size={16} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        {/* Quy tắc 2: Tự động mở cửa theo cảm biến siêu âm */}
        <View style={styles.ruleItem}>
          <View style={styles.ruleTop}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.ruleTitle, { color: theme.textPrimary }]}>
                Tự động mở cửa ra vào
              </Text>
              <Text style={[styles.ruleDesc, { color: theme.textSecondary }]}>
                Xoay Servo (Pin 19) 90° khi HC-SR04 phát hiện vật cản &lt; {doorThreshold}cm
              </Text>
            </View>
            <Switch
              value={autoDoor}
              onValueChange={setAutoDoor}
              trackColor={{ false: theme.surfaceSubtle, true: theme.doorPurple }}
              thumbColor="#FFFFFF"
            />
          </View>

          {autoDoor && (
            <View style={styles.thresholdRow}>
              <Text style={[styles.thresholdLabel, { color: theme.textSecondary }]}>
                Khoảng cách kích hoạt:
              </Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: theme.surfaceSubtle }]}
                  onPress={() => setDoorThreshold((prev) => Math.max(20, prev - 10))}
                >
                  <Ionicons name="remove" size={16} color={theme.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.stepperValue, { color: theme.textPrimary }]}>
                  {doorThreshold} cm
                </Text>
                <TouchableOpacity
                  style={[styles.stepperBtn, { backgroundColor: theme.surfaceSubtle }]}
                  onPress={() => setDoorThreshold((prev) => Math.min(150, prev + 10))}
                >
                  <Ionicons name="add" size={16} color={theme.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.primary }]}
          onPress={handleSaveAutomation}
          activeOpacity={0.8}
        >
          <Text style={styles.saveBtnText}>Lưu quy tắc tự động</Text>
        </TouchableOpacity>
      </View>

      {/* CẤU HÌNH HIVEMQ BROKER */}
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Cấu hình HiveMQ MQTT Broker
        </Text>

        <View style={styles.formGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>MQTT Broker Host:</Text>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border },
            ]}
            value={brokerHost}
            onChangeText={setBrokerHost}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>WebSocket Port:</Text>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border },
            ]}
            value={brokerPort}
            onChangeText={setBrokerPort}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Topic Prefix:</Text>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.surfaceSubtle, color: theme.textPrimary, borderColor: theme.border },
            ]}
            value={topicPrefix}
            onChangeText={setTopicPrefix}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, borderWidth: 1 }]}
          onPress={handleSaveBroker}
          activeOpacity={0.8}
        >
          <Text style={[styles.saveBtnText, { color: theme.textPrimary }]}>
            Cập nhật & Thử kết nối lại
          </Text>
        </TouchableOpacity>
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
  sectionCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  connectionIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  ruleItem: {
    marginVertical: 4,
  },
  ruleTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  ruleDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  thresholdLabel: {
    fontSize: 12,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 45,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  saveBtn: {
    marginTop: Spacing.base,
    paddingVertical: 12,
    borderRadius: Radii.md,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
});
