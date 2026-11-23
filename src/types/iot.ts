/**
 * IoT Smart Home Type Definitions
 * Chuẩn hóa cấu trúc dữ liệu giao tiếp với ESP32 / Wokwi qua HiveMQ MQTT & Backend
 */

export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'standby' | 'error';
export type DeviceState = 'ON' | 'OFF';
export type SoilStatus = 'dry' | 'optimal' | 'wet' | 'unknown';
export type RelayDeviceType = 'pump' | 'fan' | 'heater' | 'appliance' | 'custom';

export interface IotConnectionStatus {
  esp32: ConnectionState;       // Trạng thái mạch ESP32 / Wokwi
  broker: ConnectionState;      // Trạng thái HiveMQ MQTT Broker
  backend: ConnectionState;     // Trạng thái Backend Server (FastAPI / Node.js)
  wifiRssi: number | null;      // dBm
  ipAddress: string | null;
  pingMs: number | null;
  lastSeen: string;
  source: 'wokwi' | 'hardware' | 'none';
}

export interface Dht22Data {
  temperature: number | null; // Celsius (null khi chờ Wokwi kết nối)
  humidity: number | null;    // %
  heatIndex?: number | null;
}

export interface SoilMoistureData {
  percentage: number | null;  // 0 - 100%
  rawValue: number | null;    // Giá trị ADC (0 - 4095)
  status: SoilStatus;
  statusText: string;         // "Chờ kết nối..." | "Đủ ẩm" | "Khô - Cần tưới"
}

export interface UltrasonicData {
  distanceCm: number | null;  // Khoảng cách đo được (cm)
  objectDetected: boolean;
  threshold: number;          // Mặc định 50cm
}

export interface EnvironmentSensors {
  dht22: Dht22Data;
  soil: SoilMoistureData;
  ultrasonic: UltrasonicData;
  timestamp: number | null;
  isLive: boolean; // false = đang chờ dữ liệu từ Wokwi / Backend
}

export interface LedActuator {
  id: string;
  name: string;
  state: DeviceState;
  brightness: number;  // 0 - 100
  isPending: boolean;  // Optimistic UI pending state
  gpioPin?: number;
  lastUpdated: string;
}

export interface RelayActuator {
  id: string;
  name: string;
  deviceType: RelayDeviceType;
  state: DeviceState;
  isPending: boolean;
  powerWatts: number;
  gpioPin?: number;
  lastUpdated: string;
}

export interface DoorServoActuator {
  angle: number;           // 0° (Đóng) hoặc 90° (Mở)
  isOpen: boolean;
  isAutoMode: boolean;     // Chế độ tự động theo cảm biến siêu âm (< 50cm)
  isOverride: boolean;     // Mở khẩn cấp từ xa
  isPending: boolean;
  gpioPin?: number;
  lastUpdated: string;
}

export interface ActuatorDevices {
  led: LedActuator;
  relay: RelayActuator;
  door: DoorServoActuator;
}

export interface AutomationConfig {
  autoWateringEnabled: boolean;
  soilMoistureThreshold: number; // Tự bật máy bơm nếu độ ẩm đất < ngưỡng này (%)
  autoDoorEnabled: boolean;
  doorDistanceThreshold: number;  // Tự mở cửa nếu khoảng cách < ngưỡng này (cm)
}

export interface MqttBrokerConfig {
  host: string;
  port: number;
  path: string;
  clientId: string;
  username?: string;
  password?: string;
  ssl: boolean;
  topicPrefix: string;
  backendApiUrl: string;
  wokwiProjectId?: string;
}

export interface SensorHistoryPoint {
  timestamp: string;
  timeLabel: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  distance: number;
}

export interface SmartHomeState {
  connection: IotConnectionStatus;
  sensors: EnvironmentSensors;
  actuators: ActuatorDevices;
  automation: AutomationConfig;
  config: MqttBrokerConfig;
  history: SensorHistoryPoint[];
}

// ================= ADMIN DÀNH CHO QUẢN LÝ THIẾT BỊ & WOKWI =================

export interface ManagedIotDevice {
  id: string;
  name: string;
  type: 'sensor' | 'actuator';
  category: 'dht22' | 'soil' | 'ultrasonic' | 'led' | 'relay' | 'servo';
  gpioPin: number;
  mqttTopic: string;
  status: 'online' | 'offline' | 'standby';
  description: string;
  lastReported?: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'security';
  actor: string;
  message: string;
  source: 'ESP32' | 'Wokwi' | 'MobileApp' | 'Backend';
}
