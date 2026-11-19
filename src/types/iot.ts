/**
 * IoT Smart Home Type Definitions
 * Chuẩn hóa cấu trúc dữ liệu giao tiếp với ESP32 qua HiveMQ MQTT
 */

export type ConnectionState = 'connected' | 'disconnected' | 'connecting' | 'error';
export type DeviceState = 'ON' | 'OFF';
export type SoilStatus = 'dry' | 'optimal' | 'wet';
export type RelayDeviceType = 'pump' | 'fan' | 'heater' | 'appliance' | 'custom';

export interface IotConnectionStatus {
  esp32: ConnectionState;
  broker: ConnectionState;
  wifiRssi: number; // dBm (e.g. -62 dBm)
  ipAddress: string;
  pingMs: number;
  lastSeen: string;
}

export interface Dht22Data {
  temperature: number; // Celsius, VD: 24.5
  humidity: number;    // %, VD: 65.2
  heatIndex?: number;  // Chỉ số cảm nhận nhiệt
}

export interface SoilMoistureData {
  percentage: number;  // 0 - 100%
  rawValue: number;    // Giá trị ADC (0 - 4095 của ESP32)
  status: SoilStatus;  // 'dry' | 'optimal' | 'wet'
  statusText: string;  // "Khô - Cần tưới" | "Đủ ẩm" | "Rất ẩm"
}

export interface UltrasonicData {
  distanceCm: number;  // Khoảng cách đo được (cm)
  objectDetected: boolean; // True nếu <= threshold
  threshold: number;   // Ngưỡng phát hiện (mặc định 50cm)
}

export interface EnvironmentSensors {
  dht22: Dht22Data;
  soil: SoilMoistureData;
  ultrasonic: UltrasonicData;
  timestamp: number;
}

export interface LedActuator {
  id: string;
  name: string;
  state: DeviceState;
  brightness: number;  // 0 - 100
  isPending: boolean;  // Optimistic UI pending state
  lastUpdated: string;
}

export interface RelayActuator {
  id: string;
  name: string;
  deviceType: RelayDeviceType;
  state: DeviceState;
  isPending: boolean;
  powerWatts: number;
  lastUpdated: string;
}

export interface DoorServoActuator {
  angle: number;           // 0° (Đóng) hoặc 90° (Mở)
  isOpen: boolean;
  isAutoMode: boolean;     // Chế độ tự động theo cảm biến siêu âm (< 50cm)
  isOverride: boolean;     // Mở khẩn cấp từ xa
  isPending: boolean;
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
  isSimulation: boolean;
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
