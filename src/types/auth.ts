/**
 * Authentication & User Role Types
 * Hỗ trợ phân quyền Người dùng (User / Gia chủ) và Quản trị viên (Admin)
 */

export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  homeName: string;
  homeCode: string; // Mã kết nối mạch Wokwi / ESP32 (VD: "ESP32-WOKWI-8899")
  createdAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  password: string;
  homeCode: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'suspended';
  lastActive: string;
  canControlDoor: boolean;
  canConfigureSensors: boolean;
}
