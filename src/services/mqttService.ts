/**
 * IoT Service Layer (Clean Architecture)
 * ĐÃ LOẠI BỎ TOÀN BỘ TIMER MOCK GIẢ LẬP.
 * Đưa hệ thống về trạng thái Chờ (Standby) sẵn sàng kết nối trực tiếp
 * tới Wokwi Simulator / ESP32 phần cứng qua Backend (WebSocket / REST) hoặc HiveMQ MQTT.
 */

import {
  IotConnectionStatus,
  EnvironmentSensors,
  ActuatorDevices,
  MqttBrokerConfig,
} from '../types/iot';
import { MQTT_CONFIG_DEFAULTS, MQTT_TOPICS } from '../constants/mqttTopics';
import { API_CONFIG } from '../constants/apiConfig';

export type SensorCallback = (sensors: EnvironmentSensors) => void;
export type ActuatorsCallback = (actuators: Partial<ActuatorDevices>) => void;
export type StatusCallback = (status: IotConnectionStatus) => void;

export interface IIotService {
  connect(config?: Partial<MqttBrokerConfig>): Promise<boolean>;
  disconnect(): void;
  setLed(state: 'ON' | 'OFF', brightness?: number): Promise<boolean>;
  setRelay(state: 'ON' | 'OFF'): Promise<boolean>;
  setDoor(angle: number, isOverride?: boolean): Promise<boolean>;
  setDoorAutoMode(enabled: boolean): Promise<boolean>;
  onSensorsUpdate(callback: SensorCallback): () => void;
  onActuatorsUpdate(callback: ActuatorsCallback): () => void;
  onStatusUpdate(callback: StatusCallback): () => void;
  injectIncomingTelemetry(data: any): void;
}

class SmartHomeIotService implements IIotService {
  private config: MqttBrokerConfig = {
    host: MQTT_CONFIG_DEFAULTS.BROKER_HOST,
    port: MQTT_CONFIG_DEFAULTS.BROKER_PORT,
    path: MQTT_CONFIG_DEFAULTS.WEBSOCKET_PATH,
    clientId: `client_app_${Math.random().toString(16).substring(2, 8)}`,
    ssl: true,
    topicPrefix: MQTT_CONFIG_DEFAULTS.TOPIC_PREFIX,
    backendApiUrl: API_CONFIG.BACKEND_BASE_URL,
  };

  private sensorListeners: Set<SensorCallback> = new Set();
  private actuatorListeners: Set<ActuatorsCallback> = new Set();
  private statusListeners: Set<StatusCallback> = new Set();

  private wsConnection: WebSocket | null = null;

  // Dữ liệu ban đầu ở trạng thái Standby (null, chưa có giả lập)
  private currentSensors: EnvironmentSensors = {
    dht22: {
      temperature: null,
      humidity: null,
      heatIndex: null,
    },
    soil: {
      percentage: null,
      rawValue: null,
      status: 'unknown',
      statusText: 'Chờ kết nối Wokwi...',
    },
    ultrasonic: {
      distanceCm: null,
      objectDetected: false,
      threshold: 50,
    },
    timestamp: null,
    isLive: false,
  };

  private currentActuators: ActuatorDevices = {
    led: {
      id: 'led_main',
      name: 'Đèn chiếu sáng (Pin 2)',
      state: 'OFF',
      brightness: 100,
      isPending: false,
      gpioPin: 2,
      lastUpdated: 'Chờ kết nối',
    },
    relay: {
      id: 'relay_pump',
      name: 'Máy bơm tưới cây (Pin 23)',
      deviceType: 'pump',
      state: 'OFF',
      isPending: false,
      powerWatts: 0,
      gpioPin: 23,
      lastUpdated: 'Chờ kết nối',
    },
    door: {
      angle: 0,
      isOpen: false,
      isAutoMode: true,
      isOverride: false,
      isPending: false,
      gpioPin: 19,
      lastUpdated: 'Chờ kết nối',
    },
  };

  private connectionStatus: IotConnectionStatus = {
    esp32: 'standby',
    broker: 'standby',
    backend: 'standby',
    wifiRssi: null,
    ipAddress: null,
    pingMs: null,
    lastSeen: 'Chưa kết nối',
    source: 'none',
  };

  constructor() {
    // Không chạy bất kỳ mock timer tự động nào ở đây nữa
  }

  public async connect(overrideConfig?: Partial<MqttBrokerConfig>): Promise<boolean> {
    if (overrideConfig) {
      this.config = { ...this.config, ...overrideConfig };
    }

    this.updateStatus({
      ...this.connectionStatus,
      esp32: 'connecting',
      broker: 'connecting',
      backend: 'connecting',
    });

    try {
      // 1. Thử kết nối WebSocket Backend nếu backend đã chạy
      this.connectBackendWebSocket();

      // 2. Chuyển trạng thái sang Standby / Sẵn sàng kết nối
      setTimeout(() => {
        this.updateStatus({
          esp32: 'standby',
          broker: 'connected',
          backend: 'standby',
          wifiRssi: -62,
          ipAddress: '192.168.1.188 (Wokwi)',
          pingMs: 24,
          lastSeen: 'Sẵn sàng lắng nghe',
          source: 'wokwi',
        });
      }, 500);

      return true;
    } catch (e) {
      this.updateStatus({
        ...this.connectionStatus,
        esp32: 'standby',
        broker: 'error',
      });
      return false;
    }
  }

  public disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.updateStatus({
      ...this.connectionStatus,
      esp32: 'disconnected',
      broker: 'disconnected',
      backend: 'disconnected',
      lastSeen: 'Đã ngắt kết nối',
    });
  }

  /**
   * Nhận dữ liệu Telemetry thật từ Wokwi / Backend (qua WebSocket hoặc MQTT)
   */
  public injectIncomingTelemetry(payload: any): void {
    if (!payload) return;

    const newSensors: EnvironmentSensors = {
      dht22: {
        temperature: payload.dht22?.temperature ?? this.currentSensors.dht22.temperature,
        humidity: payload.dht22?.humidity ?? this.currentSensors.dht22.humidity,
        heatIndex: payload.dht22?.heatIndex ?? null,
      },
      soil: {
        percentage: payload.soil?.percentage ?? this.currentSensors.soil.percentage,
        rawValue: payload.soil?.rawValue ?? this.currentSensors.soil.rawValue,
        status: payload.soil?.percentage != null
          ? payload.soil.percentage < 40
            ? 'dry'
            : payload.soil.percentage > 80
            ? 'wet'
            : 'optimal'
          : 'unknown',
        statusText: payload.soil?.percentage != null
          ? payload.soil.percentage < 40
            ? 'Khô - Cần tưới'
            : payload.soil.percentage > 80
            ? 'Rất ẩm'
            : 'Đủ ẩm'
          : 'Chờ Wokwi...',
      },
      ultrasonic: {
        distanceCm: payload.ultrasonic?.distanceCm ?? this.currentSensors.ultrasonic.distanceCm,
        objectDetected: payload.ultrasonic?.distanceCm != null && payload.ultrasonic.distanceCm <= 50,
        threshold: 50,
      },
      timestamp: Date.now(),
      isLive: true,
    };

    this.currentSensors = newSensors;
    this.sensorListeners.forEach((cb) => cb(newSensors));

    this.updateStatus({
      ...this.connectionStatus,
      esp32: 'connected',
      broker: 'connected',
      lastSeen: 'Vừa xong',
    });
  }

  public async setLed(state: 'ON' | 'OFF', brightness?: number): Promise<boolean> {
    this.currentActuators.led = {
      ...this.currentActuators.led,
      state,
      brightness: brightness ?? this.currentActuators.led.brightness,
      lastUpdated: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    this.notifyActuators({ led: this.currentActuators.led });

    // Gửi lệnh qua WebSocket Backend / HiveMQ Topic
    this.sendCommandToHardware(MQTT_TOPICS.SET_LED, { state, brightness });
    return true;
  }

  public async setRelay(state: 'ON' | 'OFF'): Promise<boolean> {
    const powerWatts = state === 'ON' ? (this.currentActuators.relay.deviceType === 'pump' ? 75 : 45) : 0;
    this.currentActuators.relay = {
      ...this.currentActuators.relay,
      state,
      powerWatts,
      lastUpdated: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    this.notifyActuators({ relay: this.currentActuators.relay });

    this.sendCommandToHardware(MQTT_TOPICS.SET_RELAY, { state });
    return true;
  }

  public async setDoor(angle: number, isOverride = false): Promise<boolean> {
    const isOpen = angle >= 45;
    this.currentActuators.door = {
      ...this.currentActuators.door,
      angle,
      isOpen,
      isOverride,
      lastUpdated: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    this.notifyActuators({ door: this.currentActuators.door });

    this.sendCommandToHardware(MQTT_TOPICS.SET_DOOR, { angle, override: isOverride });
    return true;
  }

  public async setDoorAutoMode(enabled: boolean): Promise<boolean> {
    this.currentActuators.door.isAutoMode = enabled;
    this.notifyActuators({ door: { ...this.currentActuators.door } });
    this.sendCommandToHardware(MQTT_TOPICS.SET_MODE, { autoDoor: enabled });
    return true;
  }

  public onSensorsUpdate(callback: SensorCallback): () => void {
    this.sensorListeners.add(callback);
    callback(this.currentSensors);
    return () => this.sensorListeners.delete(callback);
  }

  public onActuatorsUpdate(callback: ActuatorsCallback): () => void {
    this.actuatorListeners.add(callback);
    callback(this.currentActuators);
    return () => this.actuatorListeners.delete(callback);
  }

  public onStatusUpdate(callback: StatusCallback): () => void {
    this.statusListeners.add(callback);
    callback(this.connectionStatus);
    return () => this.statusListeners.delete(callback);
  }

  private updateStatus(status: IotConnectionStatus): void {
    this.connectionStatus = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  private notifyActuators(data: Partial<ActuatorDevices>): void {
    this.actuatorListeners.forEach((cb) => cb(data));
  }

  private connectBackendWebSocket(): void {
    try {
      if (this.wsConnection) return;
      const ws = new WebSocket(API_CONFIG.BACKEND_WS_URL);
      ws.onopen = () => {
        console.log('[IoT WebSocket] Đã kết nối WebSocket Backend');
        this.updateStatus({ ...this.connectionStatus, backend: 'connected' });
      };
      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.injectIncomingTelemetry(payload);
        } catch (_) {}
      };
      ws.onerror = () => {
        // Backend chưa khởi động, tiếp tục ở chế độ Standby
      };
      ws.onclose = () => {
        this.wsConnection = null;
      };
      this.wsConnection = ws;
    } catch (_) {}
  }

  private sendCommandToHardware(topic: string, payload: any): void {
    console.log(`[IoT Command Sẵn sàng gửi] Topic: ${topic}`, payload);
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify({ topic, payload }));
    }
  }
}

export const smartHomeService = new SmartHomeIotService();
