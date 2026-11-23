/**
 * Screen: ProfileScreen (Hồ sơ & Tài khoản)
 * Hiển thị thông tin cá nhân, vai trò (User/Admin), mã kết nối nhà Wokwi
 * và cho phép chuyển đổi nhanh vai trò để test giao diện
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { ThemeColors, Radii, Spacing } from '../constants/theme';

interface ProfileScreenProps {
  auth: ReturnType<typeof useAuth>;
  theme: ThemeColors;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  auth,
  theme,
  isDarkMode,
  onToggleTheme,
}) => {
  const { user, isAdmin, logout, switchRole } = auth;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Profile Card */}
      <View
        style={[
          styles.profileCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            shadowColor: theme.shadowColor,
          },
        ]}
      >
        <View style={styles.avatarRow}>
          <View style={[styles.avatarBox, { backgroundColor: theme.primaryLight }]}>
            <Ionicons
              name={isAdmin ? 'shield-checkmark' : 'person'}
              size={36}
              color={theme.primary}
            />
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>
              {user?.name || 'Gia chủ thông minh'}
            </Text>
            <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
              {user?.email || 'user@smarthome.io'}
            </Text>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: isAdmin ? theme.primaryLight : theme.successLight },
              ]}
            >
              <Text style={[styles.roleText, { color: isAdmin ? theme.primary : theme.success }]}>
                {isAdmin ? 'QUẢN TRỊ VIÊN HỆ THỐNG' : 'THÀNH VIÊN GIA ĐÌNH (USER)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Thông tin kết nối Smart Home */}
        <View style={[styles.homeInfoBox, { backgroundColor: theme.surfaceSubtle }]}>
          <View style={styles.homeInfoRow}>
            <Text style={[styles.homeInfoLabel, { color: theme.textSecondary }]}>Tên ngôi nhà:</Text>
            <Text style={[styles.homeInfoValue, { color: theme.textPrimary }]}>
              {user?.homeName || 'Biệt Thự Thông Minh'}
            </Text>
          </View>
          <View style={styles.homeInfoRow}>
            <Text style={[styles.homeInfoLabel, { color: theme.textSecondary }]}>
              Mã mạch Wokwi/ESP32:
            </Text>
            <Text style={[styles.homeInfoCode, { color: theme.primary }]}>
              {user?.homeCode || 'ESP32-WOKWI-2026'}
            </Text>
          </View>
        </View>
      </View>

      {/* QUICK ROLE SWITCHER (Tiện lợi để kiểm thử cả 2 giao diện User & Admin) */}
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
          Chuyển đổi vai trò kiểm thử
        </Text>
        <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>
          Chuyển đổi qua lại giữa vai trò Gia chủ và Quản trị viên để kiểm tra các quyền điều khiển
        </Text>

        <View style={styles.roleButtonsRow}>
          <TouchableOpacity
            style={[
              styles.switchRoleBtn,
              {
                backgroundColor: !isAdmin ? theme.successLight : theme.surfaceSubtle,
                borderColor: !isAdmin ? theme.success : theme.border,
              },
            ]}
            onPress={() => switchRole('user')}
          >
            <Ionicons
              name="person-outline"
              size={18}
              color={!isAdmin ? theme.success : theme.textSecondary}
            />
            <Text
              style={[
                styles.switchRoleText,
                { color: !isAdmin ? theme.success : theme.textSecondary },
              ]}
            >
              Vào vai Gia Chủ (User)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.switchRoleBtn,
              {
                backgroundColor: isAdmin ? theme.primaryLight : theme.surfaceSubtle,
                borderColor: isAdmin ? theme.primary : theme.border,
              },
            ]}
            onPress={() => switchRole('admin')}
          >
            <MaterialCommunityIcons
              name="shield-crown-outline"
              size={18}
              color={isAdmin ? theme.primary : theme.textSecondary}
            />
            <Text
              style={[
                styles.switchRoleText,
                { color: isAdmin ? theme.primary : theme.textSecondary },
              ]}
            >
              Vào vai Quản Trị (Admin)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Cài đặt giao diện & Giao diện tối */}
      <View
        style={[
          styles.sectionCard,
          { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadowColor },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Cài đặt ứng dụng</Text>

        <TouchableOpacity style={styles.settingItem} onPress={onToggleTheme}>
          <View style={styles.settingItemLeft}>
            <Ionicons
              name={isDarkMode ? 'moon' : 'sunny'}
              size={20}
              color={isDarkMode ? '#FBBF24' : theme.textPrimary}
            />
            <Text style={[styles.settingItemText, { color: theme.textPrimary }]}>
              Chế độ {isDarkMode ? 'Giao diện Tối (Dark Mode)' : 'Giao diện Sáng (Light Mode)'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.settingItem}>
          <View style={styles.settingItemLeft}>
            <MaterialCommunityIcons name="chip" size={20} color={theme.primary} />
            <Text style={[styles.settingItemText, { color: theme.textPrimary }]}>
              Phiên bản ứng dụng: 2.0.0 (Wokwi Ready)
            </Text>
          </View>
        </View>
      </View>

      {/* Nút Đăng xuất */}
      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}
        onPress={logout}
      >
        <Ionicons name="log-out-outline" size={20} color={theme.danger} />
        <Text style={[styles.logoutText, { color: theme.danger }]}>Đăng xuất khỏi tài khoản</Text>
      </TouchableOpacity>
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
  profileCard: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: Spacing.md,
  },
  avatarBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
  },
  homeInfoBox: {
    borderRadius: Radii.md,
    padding: Spacing.md,
    gap: 6,
  },
  homeInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homeInfoLabel: {
    fontSize: 12,
  },
  homeInfoValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  homeInfoCode: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    marginBottom: Spacing.md,
  },
  roleButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  switchRoleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: 6,
  },
  switchRoleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingItemText: {
    fontSize: 13,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: Radii.md,
    borderWidth: 1,
    gap: 8,
    marginTop: Spacing.sm,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
