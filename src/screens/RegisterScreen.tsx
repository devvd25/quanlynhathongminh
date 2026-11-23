/**
 * Screen: RegisterScreen (Đăng ký tài khoản)
 * Đăng ký tài khoản Gia chủ hoặc Quản trị viên
 * Đi kèm mã kết nối ngôi nhà (Smart Home Pairing Code)
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

interface RegisterScreenProps {
  auth: ReturnType<typeof useAuth>;
  theme: ThemeColors;
  onNavigateLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  auth,
  theme,
  onNavigateLogin,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [homeCode, setHomeCode] = useState('ESP32-WOKWI-2026');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      alert('Vui lòng điền đầy đủ họ tên, email và mật khẩu');
      return;
    }
    if (password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp');
      return;
    }

    await auth.register({
      name,
      email,
      phone,
      homeCode,
      password,
      role,
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onNavigateLogin}>
            <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Tạo tài khoản mới</Text>
          <View style={{ width: 22 }} />
        </View>

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
          {/* Vai trò */}
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
            Chọn vai trò đăng ký:
          </Text>
          <View style={[styles.roleSelector, { backgroundColor: theme.surfaceSubtle }]}>
            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'user' && {
                  backgroundColor: theme.surface,
                  shadowColor: theme.shadowColor,
                  elevation: 2,
                },
              ]}
              onPress={() => setRole('user')}
            >
              <Ionicons
                name="person-outline"
                size={16}
                color={role === 'user' ? theme.primary : theme.textSecondary}
              />
              <Text
                style={[
                  styles.roleOptionText,
                  { color: role === 'user' ? theme.primary : theme.textSecondary },
                ]}
              >
                Gia chủ (User)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleOption,
                role === 'admin' && {
                  backgroundColor: theme.surface,
                  shadowColor: theme.shadowColor,
                  elevation: 2,
                },
              ]}
              onPress={() => setRole('admin')}
            >
              <MaterialCommunityIcons
                name="shield-crown-outline"
                size={18}
                color={role === 'admin' ? theme.primary : theme.textSecondary}
              />
              <Text
                style={[
                  styles.roleOptionText,
                  { color: role === 'admin' ? theme.primary : theme.textSecondary },
                ]}
              >
                Quản trị (Admin)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form fields */}
          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Họ và tên:</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, color: theme.textPrimary },
              ]}
              placeholder="Nguyễn Văn A"
              placeholderTextColor={theme.textMuted}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Email:</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, color: theme.textPrimary },
              ]}
              placeholder="example@gmail.com"
              placeholderTextColor={theme.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Số điện thoại:</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, color: theme.textPrimary },
              ]}
              placeholder="0912345678"
              placeholderTextColor={theme.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Mã kết nối nhà (Wokwi / ESP32 House Code):
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, color: theme.textPrimary },
              ]}
              placeholder="ESP32-WOKWI-2026"
              placeholderTextColor={theme.textMuted}
              value={homeCode}
              onChangeText={setHomeCode}
              autoCapitalize="characters"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Mật khẩu:</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, color: theme.textPrimary },
              ]}
              placeholder="Ít nhất 6 ký tự"
              placeholderTextColor={theme.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Xác nhận mật khẩu:</Text>
            <TextInput
              style={[
                styles.textInput,
                { backgroundColor: theme.surfaceSubtle, borderColor: theme.border, color: theme.textPrimary },
              ]}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor={theme.textMuted}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.primary }]}
            onPress={handleRegister}
            disabled={auth.isLoading}
            activeOpacity={0.8}
          >
            {auth.isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Hoàn tất Đăng ký</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textSecondary }]}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={onNavigateLogin}>
            <Text style={[styles.loginLink, { color: theme.primary }]}>Đăng nhập</Text>
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
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.base,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
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
  sectionHeading: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
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
    height: 46,
    fontSize: 14,
  },
  primaryButton: {
    height: 48,
    borderRadius: Radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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
  loginLink: {
    fontSize: 13,
    fontWeight: '700',
  },
});
