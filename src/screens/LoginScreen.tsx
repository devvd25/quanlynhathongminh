/**
 * Screen: LoginScreen (Đăng nhập)
 * Hỗ trợ Đăng nhập cho cả Gia chủ (User) và Quản trị viên (Admin)
 * Tích hợp nút Đăng nhập nhanh 1 chạm để thuận tiện kiểm thử giao diện
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { ThemeColors, Radii, Spacing } from '../constants/theme';
import { UserRole } from '../types/auth';

interface LoginScreenProps {
  auth: ReturnType<typeof useAuth>;
  theme: ThemeColors;
  onNavigateRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  auth,
  theme,
  onNavigateRegister,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('user');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }
    await auth.login({ email, password, role: selectedRole });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo & Header */}
        <View style={styles.header}>
          <View style={[styles.logoCircle, { backgroundColor: theme.primaryLight }]}>
            <MaterialCommunityIcons name="home-automation" size={44} color={theme.primary} />
          </View>
          <Text style={[styles.appTitle, { color: theme.textPrimary }]}>Smart Home IoT</Text>
          <Text style={[styles.appSubtitle, { color: theme.textSecondary }]}>
            Hệ thống Quản lý Nhà Thông minh ESP32 & Wokwi
          </Text>
        </View>

        {/* Auth Card */}
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
          <Text style={[styles.cardHeading, { color: theme.textPrimary }]}>Đăng nhập</Text>
          <Text style={[styles.cardDesc, { color: theme.textMuted }]}>
            Chọn vai trò và nhập thông tin để truy cập hệ thống
          </Text>

          {/* Role Segment Selector */}
          <View style={[styles.roleSelector, { backgroundColor: theme.surfaceSubtle }]}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === 'user' && {
                  backgroundColor: theme.surface,
                  shadowColor: theme.shadowColor,
                  elevation: 2,
                },
              ]}
              onPress={() => setSelectedRole('user')}
            >
              <Ionicons
                name="person-outline"
                size={16}
                color={selectedRole === 'user' ? theme.primary : theme.textSecondary}
              />
              <Text
                style={[
                  styles.roleOptionText,
                  { color: selectedRole === 'user' ? theme.primary : theme.textSecondary },
                ]}
              >
                Gia chủ (User)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                selectedRole === 'admin' && {
                  backgroundColor: theme.surface,
                  shadowColor: theme.shadowColor,
                  elevation: 2,
                },
              ]}
              onPress={() => setSelectedRole('admin')}
            >
              <MaterialCommunityIcons
                name="shield-crown-outline"
                size={18}
                color={selectedRole === 'admin' ? theme.primary : theme.textSecondary}
              />
              <Text
                style={[
                  styles.roleOptionText,
                  { color: selectedRole === 'admin' ? theme.primary : theme.textSecondary },
                ]}
              >
                Quản trị (Admin)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email đăng nhập:</Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
              ]}
            >
              <Ionicons name="mail-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.textPrimary }]}
                placeholder={selectedRole === 'admin' ? 'admin@smarthome.io' : 'user@smarthome.io'}
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Mật khẩu:</Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
              ]}
            >
              <Ionicons name="lock-closed-outline" size={18} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInput, { color: theme.textPrimary }]}
                placeholder="••••••••"
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={theme.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          {auth.authError && (
            <Text style={[styles.errorText, { color: theme.danger }]}>{auth.authError}</Text>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            disabled={auth.isLoading}
            activeOpacity={0.8}
          >
            {auth.isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Đăng nhập</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Login Buttons (Kiểm thử nhanh không cần gõ phím) */}
          <View style={styles.quickLoginDivider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={[styles.quickLoginTitle, { color: theme.textMuted }]}>
              HOẶC ĐĂNG NHẬP NHANH
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          <View style={styles.quickButtonsRow}>
            <TouchableOpacity
              style={[
                styles.quickBtn,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
              ]}
              onPress={() => auth.quickLogin('user')}
            >
              <Ionicons name="person" size={14} color={theme.success} />
              <Text style={[styles.quickBtnText, { color: theme.textPrimary }]}>Vào vai Gia Chủ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickBtn,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border },
              ]}
              onPress={() => auth.quickLogin('admin')}
            >
              <MaterialCommunityIcons name="shield-crown" size={16} color={theme.primary} />
              <Text style={[styles.quickBtnText, { color: theme.textPrimary }]}>Vào vai Quản Trị</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Register Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>
            Chưa có tài khoản kết nối ngôi nhà?{' '}
          </Text>
          <TouchableOpacity onPress={onNavigateRegister}>
            <Text style={[styles.registerLink, { color: theme.primary }]}>Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    borderRadius: Radii.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    marginBottom: Spacing.base,
  },
  roleSelector: {
    flexDirection: 'row',
    borderRadius: Radii.md,
    padding: 4,
    marginBottom: Spacing.base,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radii.sm,
    gap: 6,
  },
  roleOptionText: {
    fontSize: 13,
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: Spacing.base,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
  },
  errorText: {
    fontSize: 12,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  primaryButton: {
    height: 48,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  quickLoginDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.base,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  quickLoginTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  quickButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radii.sm,
    borderWidth: 1,
    gap: 6,
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  footerText: {
    fontSize: 13,
  },
  registerLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
