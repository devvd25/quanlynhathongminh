/**
 * Screen: AdminDashboardScreen (Bảng điều khiển Quản trị viên)
 * Chuyên biệt dành cho Admin:
 * 1. Quản lý thiết bị IoT & Cấu hình Pinout Wokwi (DHT22, Relay, Servo, HC-SR04)
 * 2. Phân quyền thành viên gia đình (Admin vs Member)
 * 3. Cấu hình Gateway Wokwi & HiveMQ (URL, Port, Topic Prefix)
 * 4. Nhật ký kiểm toán hệ thống (Audit Logs)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeColors, Radii, Spacing } from '../constants/theme';
import { ManagedIotDevice, SystemAuditLog } from '../types/iot';
import { ManagedUser } from '../types/auth';
import { apiService } from '../services/apiService';
import { API_CONFIG } from '../constants/apiConfig';

interface AdminDashboardScreenProps {
  theme: ThemeColors;
}

type AdminTab = 'devices' | 'users' | 'gateway' | 'logs';

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ theme }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('devices');

  const [devices, setDevices] = useState<ManagedIotDevice[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [logs, setLogs] = useState<SystemAuditLog[]>([]);

  // Gateway form state
  const [backendUrl, setBackendUrl] = useState(API_CONFIG.BACKEND_BASE_URL);
  const [hivemqHost, setHivemqHost] = useState(API_CONFIG.HIVEMQ_HOST);
  const [topicPrefix, setTopicPrefix] = useState(API_CONFIG.TOPIC_PREFIX);

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    const [devs, usrs, lgs] = await Promise.all([
      apiService.getManagedDevices(),
      apiService.getManagedUsers(),
      apiService.getSystemLogs(),
    ]);
    setDevices(devs);
    setUsers(usrs);
    setLogs(lgs);
  };

  const handleSaveGateway = () => {
    apiService.setBaseUrl(backendUrl);
    Alert.alert('Thành công', 'Đã cập nhật cấu hình Gateway Backend & HiveMQ!');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Admin Title */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <MaterialCommunityIcons name="shield-crown" size={24} color={theme.primary} />
          <Text style={[styles.title, { color: theme.textPrimary }]}>Trung tâm Quản trị</Text>
        </View>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Quản lý toàn bộ thiết bị Wokwi ESP32, thành viên và cổng kết nối
        </Text>
      </View>

      {/* Admin Segment Tabs */}
      <View style={[styles.tabBar, { backgroundColor: theme.surfaceSubtle }]}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'devices' && { backgroundColor: theme.surface }]}
          onPress={() => setActiveTab('devices')}
        >
          <Text
            style={[
              styles.tabBtnText,
              { color: activeTab === 'devices' ? theme.primary : theme.textSecondary },
            ]}
          >
            Thiết bị ({devices.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'users' && { backgroundColor: theme.surface }]}
          onPress={() => setActiveTab('users')}
        >
          <Text
            style={[
              styles.tabBtnText,
              { color: activeTab === 'users' ? theme.primary : theme.textSecondary },
            ]}
          >
            Thành viên ({users.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'gateway' && { backgroundColor: theme.surface }]}
          onPress={() => setActiveTab('gateway')}
        >
          <Text
            style={[
              styles.tabBtnText,
              { color: activeTab === 'gateway' ? theme.primary : theme.textSecondary },
            ]}
          >
            Gateway IoT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'logs' && { backgroundColor: theme.surface }]}
          onPress={() => setActiveTab('logs')}
        >
          <Text
            style={[
              styles.tabBtnText,
              { color: activeTab === 'logs' ? theme.primary : theme.textSecondary },
            ]}
          >
            Nhật ký
          </Text>
        </TouchableOpacity>
      </View>

      {/* TAB 1: QUẢN LÝ THIẾT BỊ WOKWI */}
      {activeTab === 'devices' && (
        <View style={styles.tabContent}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
            Danh sách Module Phần Cứng (Wokwi ESP32 Pinout)
          </Text>

          {devices.map((dev) => (
            <View
              key={dev.id}
              style={[
                styles.deviceItemCard,
                { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
              ]}
            >
              <View style={styles.deviceItemTop}>
                <View style={styles.deviceItemLeft}>
                  <View style={[styles.devIconBox, { backgroundColor: theme.primaryLight }]}>
                    <MaterialCommunityIcons
                      name={
                        dev.category === 'dht22'
                          ? 'thermometer'
                          : dev.category === 'soil'
                          ? 'sprout'
                          : dev.category === 'ultrasonic'
                          ? 'radar'
                          : dev.category === 'led'
                          ? 'lightbulb'
                          : dev.category === 'relay'
                          ? 'water-pump'
                          : 'door-open'
                      }
                      size={20}
                      color={theme.primary}
                    />
                  </View>
                  <View>
                    <Text style={[styles.devName, { color: theme.textPrimary }]}>{dev.name}</Text>
                    <Text style={[styles.devPin, { color: theme.textSecondary }]}>
                      ESP32 GPIO Pin: <Text style={{ color: theme.primary, fontWeight: '700' }}>Pin {dev.gpioPin}</Text>
                    </Text>
                  </View>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: theme.surfaceSubtle }]}>
                  <Text style={[styles.statusBadgeText, { color: theme.textSecondary }]}>
                    {dev.status === 'standby' ? 'Chờ Wokwi' : 'Online'}
                  </Text>
                </View>
              </View>

              <View style={[styles.topicBox, { backgroundColor: theme.surfaceSubtle }]}>
                <Text style={[styles.topicLabel, { color: theme.textMuted }]}>MQTT Topic:</Text>
                <Text style={[styles.topicValue, { color: theme.textSecondary }]}>{dev.mqttTopic}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* TAB 2: QUẢN LÝ THÀNH VIÊN */}
      {activeTab === 'users' && (
        <View style={styles.tabContent}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
            Thành viên & Quyền điều khiển
          </Text>

          {users.map((u) => (
            <View
              key={u.id}
              style={[
                styles.deviceItemCard,
                { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
              ]}
            >
              <View style={styles.deviceItemTop}>
                <View style={styles.deviceItemLeft}>
                  <View
                    style={[
                      styles.devIconBox,
                      { backgroundColor: u.role === 'admin' ? theme.primaryLight : theme.successLight },
                    ]}
                  >
                    <Ionicons
                      name={u.role === 'admin' ? 'shield-checkmark' : 'person'}
                      size={20}
                      color={u.role === 'admin' ? theme.primary : theme.success}
                    />
                  </View>
                  <View>
                    <Text style={[styles.devName, { color: theme.textPrimary }]}>{u.name}</Text>
                    <Text style={[styles.devPin, { color: theme.textSecondary }]}>{u.email}</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: u.role === 'admin' ? theme.primaryLight : theme.surfaceSubtle },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: u.role === 'admin' ? theme.primary : theme.textSecondary, fontWeight: '700' },
                    ]}
                  >
                    {u.role.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.userPermRow}>
                <Text style={[styles.permText, { color: theme.textSecondary }]}>
                  Quyền mở cổng: {u.canControlDoor ? '✅ Có' : '❌ Không'}
                </Text>
                <Text style={[styles.permText, { color: theme.textSecondary }]}>
                  Cấu hình ngưỡng: {u.canConfigureSensors ? '✅ Có' : '❌ Không'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* TAB 3: CẤU HÌNH GATEWAY WOKWI & HIVEMQ */}
      {activeTab === 'gateway' && (
        <View style={styles.tabContent}>
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
            ]}
          >
            <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
              Cổng kết nối Backend (FastAPI / Node.js)
            </Text>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Backend Base URL (REST API):
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, color: theme.textPrimary },
                ]}
                value={backendUrl}
                onChangeText={setBackendUrl}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                HiveMQ Broker Host:
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, color: theme.textPrimary },
                ]}
                value={hivemqHost}
                onChangeText={setHivemqHost}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                MQTT Topic Prefix:
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, color: theme.textPrimary },
                ]}
                value={topicPrefix}
                onChangeText={setTopicPrefix}
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: theme.primary }]}
              onPress={handleSaveGateway}
            >
              <Text style={styles.saveBtnText}>Lưu cấu hình Gateway</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* TAB 4: NHẬT KÝ HỆ THỐNG */}
      {activeTab === 'logs' && (
        <View style={styles.tabContent}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
            Nhật ký kiểm toán sự kiện (Audit Trail)
          </Text>

          {logs.map((log) => (
            <View
              key={log.id}
              style={[
                styles.logCard,
                { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
              ]}
            >
              <View style={styles.logHeader}>
                <View style={styles.logTag}>
                  <Text style={[styles.logSource, { color: theme.primary }]}>[{log.source}]</Text>
                  <Text style={[styles.logActor, { color: theme.textPrimary }]}>{log.actor}</Text>
                </View>
                <Text style={[styles.logTime, { color: theme.textMuted }]}>{log.timestamp}</Text>
              </View>
              <Text style={[styles.logMessage, { color: theme.textSecondary }]}>{log.message}</Text>
            </View>
          ))}
        </View>
      )}
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
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    borderRadius: Radii.md,
    padding: 4,
    marginBottom: Spacing.base,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  tabContent: {
    paddingHorizontal: Spacing.base,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  deviceItemCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  deviceItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  deviceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  devIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  devName: {
    fontSize: 13,
    fontWeight: '700',
  },
  devPin: {
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  topicBox: {
    borderRadius: Radii.sm,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topicLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  topicValue: {
    fontSize: 11,
    fontFamily: 'monospace',
  },
  userPermRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  permText: {
    fontSize: 11,
  },
  sectionCard: {
    borderRadius: Radii.lg,
    borderWidth: 1,
    padding: Spacing.base,
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
    fontSize: 13,
  },
  saveBtn: {
    paddingVertical: 12,
    borderRadius: Radii.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  logCard: {
    borderRadius: Radii.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logSource: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  logActor: {
    fontSize: 12,
    fontWeight: '600',
  },
  logTime: {
    fontSize: 10,
  },
  logMessage: {
    fontSize: 12,
    lineHeight: 16,
  },
});
