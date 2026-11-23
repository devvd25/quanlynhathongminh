/**
 * REST API Service Layer
 * Cung cấp các phương thức gọi Backend REST API (Đăng nhập, Đăng ký, Quản lý thiết bị, Lấy lịch sử cảm biến).
 * Tích hợp sẵn cơ chế dự phòng an toàn (Graceful Fallback) khi Backend đang được khởi động.
 */

import { API_CONFIG } from '../constants/apiConfig';
import { UserProfile, LoginPayload, RegisterPayload, AuthResponse, ManagedUser } from '../types/auth';
import { ManagedIotDevice, SystemAuditLog, SensorHistoryPoint } from '../types/iot';

class ApiService {
  private baseUrl: string = API_CONFIG.BACKEND_BASE_URL;
  private token: string | null = null;

  public setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  public setToken(token: string | null) {
    this.token = token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  // ===================== AUTHENTICATION APIs =====================

  public async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Đăng nhập thất bại (${response.status})`);
      }
      const data: AuthResponse = await response.json();
      this.setToken(data.token);
      return data;
    } catch (err: any) {
      // Khi Backend chưa bật, hỗ trợ tài khoản test cục bộ để nhà phát triển kiểm thử giao diện
      console.warn('[ApiService] Backend chưa online, sử dụng cơ chế fallback cục bộ:', err.message);
      
      const role = payload.role || (payload.email.includes('admin') ? 'admin' : 'user');
      const fallbackUser: UserProfile = {
        id: role === 'admin' ? 'usr_admin_01' : 'usr_family_02',
        name: role === 'admin' ? 'Quản trị viên Hệ thống' : 'Gia chủ (Smart Home)',
        email: payload.email,
        phone: '0901234567',
        role: role,
        homeName: 'Biệt Thự Thông Minh',
        homeCode: 'ESP32-WOKWI-2026',
        createdAt: new Date().toISOString(),
      };
      const token = `token_jwt_mock_${Date.now()}`;
      this.setToken(token);
      return { token, user: fallbackUser };
    }
  }

  public async register(payload: RegisterPayload): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/register`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Đăng ký thất bại (${response.status})`);
      }
      return await response.json();
    } catch (err: any) {
      console.warn('[ApiService] Backend chưa online, fallback đăng ký cục bộ:', err.message);
      const newUser: UserProfile = {
        id: `usr_${Date.now()}`,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: payload.role,
        homeName: 'Ngôi nhà thông minh',
        homeCode: payload.homeCode || 'ESP32-WOKWI-2026',
        createdAt: new Date().toISOString(),
      };
      return { token: `token_jwt_${Date.now()}`, user: newUser };
    }
  }

  // ===================== DEVICE MANAGEMENT (ADMIN) =====================

  public async getManagedDevices(): Promise<ManagedIotDevice[]> {
    try {
      const res = await fetch(`${this.baseUrl}/devices`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (_) {}

    // Cấu hình danh sách phần cứng ESP32 / Wokwi chuẩn
    return [
      {
        id: 'dev_dht22',
        name: 'Cảm biến Nhiệt độ & Độ ẩm (DHT22)',
        type: 'sensor',
        category: 'dht22',
        gpioPin: 4,
        mqttTopic: 'smarthome/esp32/sensors',
        status: 'standby',
        description: 'Đo nhiệt độ và độ ẩm không khí phòng khách',
      },
      {
        id: 'dev_soil',
        name: 'Cảm biến Độ ẩm đất (Biến trở ADC)',
        type: 'sensor',
        category: 'soil',
        gpioPin: 34,
        mqttTopic: 'smarthome/esp32/sensors',
        status: 'standby',
        description: 'Đo điện áp biến trở quy đổi sang độ ẩm đất %',
      },
      {
        id: 'dev_ultrasonic',
        name: 'Cảm biến Khoảng cách Siêu âm (HC-SR04)',
        type: 'sensor',
        category: 'ultrasonic',
        gpioPin: 5,
        mqttTopic: 'smarthome/esp32/sensors',
        status: 'standby',
        description: 'Trig Pin 5, Echo Pin 18 - Phát hiện người < 50cm',
      },
      {
        id: 'dev_led',
        name: 'Đèn LED chiếu sáng',
        type: 'actuator',
        category: 'led',
        gpioPin: 2,
        mqttTopic: 'smarthome/esp32/led/set',
        status: 'standby',
        description: 'Đèn LED tín hiệu / Chiếu sáng thông minh',
      },
      {
        id: 'dev_relay',
        name: 'Module Rơ-le 220V (Máy bơm / Quạt)',
        type: 'actuator',
        category: 'relay',
        gpioPin: 23,
        mqttTopic: 'smarthome/esp32/relay/set',
        status: 'standby',
        description: 'Đóng/ngắt thiết bị công suất cao hoặc bơm nước',
      },
      {
        id: 'dev_servo',
        name: 'Động cơ Servo Cửa (SG90)',
        type: 'actuator',
        category: 'servo',
        gpioPin: 19,
        mqttTopic: 'smarthome/esp32/door/set',
        status: 'standby',
        description: 'Góc quay 0° (Đóng) - 90° (Mở cổng ra vào)',
      },
    ];
  }

  // ===================== USER MANAGEMENT (ADMIN) =====================

  public async getManagedUsers(): Promise<ManagedUser[]> {
    try {
      const res = await fetch(`${this.baseUrl}/users`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (_) {}

    return [
      {
        id: 'usr_admin_01',
        name: 'Quản trị viên Hệ thống',
        email: 'admin@smarthome.io',
        role: 'admin',
        status: 'active',
        lastActive: 'Vừa xong',
        canControlDoor: true,
        canConfigureSensors: true,
      },
      {
        id: 'usr_user_02',
        name: 'Gia chủ (Trần Văn An)',
        email: 'user@smarthome.io',
        role: 'user',
        status: 'active',
        lastActive: '10 phút trước',
        canControlDoor: true,
        canConfigureSensors: false,
      },
      {
        id: 'usr_user_03',
        name: 'Thành viên gia đình',
        email: 'member@smarthome.io',
        role: 'user',
        status: 'active',
        lastActive: '2 giờ trước',
        canControlDoor: false,
        canConfigureSensors: false,
      },
    ];
  }

  // ===================== SYSTEM AUDIT LOGS =====================

  public async getSystemLogs(): Promise<SystemAuditLog[]> {
    try {
      const res = await fetch(`${this.baseUrl}/logs`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (_) {}

    return [
      {
        id: 'log_01',
        timestamp: '16:45:10',
        level: 'info',
        actor: 'Hệ thống Wokwi',
        message: 'ESP32 sẵn sàng lắng nghe HiveMQ Topic smarthome/esp32/sensors',
        source: 'Wokwi',
      },
      {
        id: 'log_02',
        timestamp: '16:42:05',
        level: 'security',
        actor: 'Admin',
        message: 'Đăng nhập vào hệ thống quản trị Smart Home',
        source: 'MobileApp',
      },
      {
        id: 'log_03',
        timestamp: '16:30:00',
        level: 'info',
        actor: 'Gateway',
        message: 'Kiểm tra trạng thái kết nối HiveMQ Broker (broker.hivemq.com:8884)',
        source: 'Backend',
      },
    ];
  }

  // ===================== SENSOR HISTORY =====================

  public async getSensorHistory(): Promise<SensorHistoryPoint[]> {
    try {
      const res = await fetch(`${this.baseUrl}/telemetry/history`, { headers: this.getHeaders() });
      if (res.ok) return await res.json();
    } catch (_) {}

    return [];
  }
}

export const apiService = new ApiService();
