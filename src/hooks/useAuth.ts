/**
 * Custom Hook: useAuth
 * Quản lý trạng thái Đăng nhập, Đăng ký và Phân quyền Người dùng (User / Admin)
 */

import { useState, useCallback } from 'react';
import { UserProfile, UserRole, LoginPayload, RegisterPayload } from '../types/auth';
import { apiService } from '../services/apiService';

export const useAuth = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const login = useCallback(async (payload: LoginPayload): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await apiService.login(payload);
      setUser(response.user);
      setToken(response.token);
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Đăng nhập không thành công');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await apiService.register(payload);
      setUser(response.user);
      setToken(response.token);
      return true;
    } catch (err: any) {
      setAuthError(err.message || 'Đăng ký không thành công');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    apiService.setToken(null);
  }, []);

  // Hỗ trợ chuyển đổi nhanh giữa User và Admin để tiện kiểm thử giao diện
  const switchRole = useCallback((newRole: UserRole) => {
    setUser((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        role: newRole,
        name: newRole === 'admin' ? 'Quản trị viên Hệ thống' : 'Gia chủ (Trần Văn An)',
      };
    });
  }, []);

  // Đăng nhập nhanh 1 chạm cho User hoặc Admin
  const quickLogin = useCallback(async (role: UserRole) => {
    await login({
      email: role === 'admin' ? 'admin@smarthome.io' : 'user@smarthome.io',
      password: 'password123',
      role,
    });
  }, [login]);

  return {
    user,
    token,
    role: user?.role || null,
    isAdmin: user?.role === 'admin',
    isAuthenticated: !!user,
    isLoading,
    authError,
    login,
    register,
    logout,
    switchRole,
    quickLogin,
  };
};
