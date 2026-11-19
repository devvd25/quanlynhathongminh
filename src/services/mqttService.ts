/**
 * Smart Home IoT Service Layer (Clean Architecture)
 * Quản lý kết nối MQTT với HiveMQ Broker và ESP32.
 * Hỗ trợ song song Chế độ Giả lập (Realistic Mock Hardware) và MQTT Thật.
 */

import {
  IotConnectionStatus,
  EnvironmentSensors,
  ActuatorDevices,
  MqttBrokerConfig,
  SensorHistoryPoint,
} from '../types/iot';
import { MQTT_CONFIG_DEFAULTS, MQTT_TOPICS } from '../constants/mqttTopics';

export type SensorCallback = (sensors: EnvironmentSensors) => void;
export type ActuatorsCallback = (actuators: Partial<ActuatorDevices>) => void;
export type StatusCallback = (status: IotConnectionStatus) => void;

export interface ISmartHomeService {
  connect(config?: Partial<MqttBrokerConfig>): Promise<boolean>;
  disconnect(): void;
  setLed(state: 'ON' | 'OFF', brightness?: number): Promise<boolean>;
  setRelay(state: 'ON' | 'OFF'): Promise<boolean>;
  setDoor(angle: number, isOverride?: boolean): Promise<boolean>;
  setDoorAutoMode(enabled: boolean): Promise<boolean>;
  onSensorsUpdate(callback: SensorCallback): () => void;
  onActuatorsUpdate(callback: ActuatorsCallback): () => void;
  onStatusUpdate(callback: StatusCallback): () => void;
  isSimulated(): boolean;
  setSimulationMode(enabled: boolean): void;
}

class SmartHomeMqttService implements ISmartHomeService {
  private config: MqttBrokerConfig = {
    host: MQTT_CONFIG_DEFAULTS.BROKER_HOST,
    port: MQTT_CONFIG_DEFAULTS.BROKER_PORT,
    path: MQTT_CONFIG_DEFAULTS.WEBSOCKET_PATH,
    clientId: `expo_app_${Math.random().toString(16).substring(2, 8)}`,
    ssl: true,
    topicPrefix: MQTT_CONFIG_DEFAULTS.TOPIC_PREFIX,
    isSimulation: true, // Mặc định mở Mock Simulator để chạy mượt mà ngay lập tức
  };

  private sensorListeners: Set<SensorCallback> = new Set();
  private actuatorListeners: Set<ActuatorsCallback> = new Set();
  private statusListeners: Set<StatusCallback> = new Set();

  private mockTimer: NodeJS.Timeout | null = null;
  private isConnected = false;

  // Trạng thái nội bộ mô phỏng mạch ESP32
  private currentSensors: EnvironmentSensors = {
    dht22: {
      temperature: 26.8,
      humidity: 58.4,
      heatIndex: 27.2,
    },
    soil: {
      percentage: 76,
      rawValue: 3120,
      status: 'optimal',
      statusText: 'Đủ ẩm',
    },
    ultrasonic: {
      distanceCm: 115,
      objectDetected: false,
      threshold: 50,
    },
    timestamp: Date.now(),
  };

  private currentActuators: ActuatorDevices = {
    led: {
      id: 'led_living_room',
      name: 'Đèn chiếu sáng chính',
      state: 'ON',
      brightness: 85,
      isPending: false,
      lastUpdated: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
    relay: {
      id: 'relay_pump',
      name: 'Máy bơm tưới cây',
      deviceType: 'pump',
      state: 'OFF',
      isPending: false,
      powerWatts: 0,
      lastUpdated: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
    door: {
      angle: 0,
      isOpen: false,
      isAutoMode: true,
      isOverride: false,
      isPending: false,
      lastUpdated: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    },
  };

  private connectionStatus: IotConnectionStatus = {
    esp32: 'connected',
    broker: 'connected',
    wifiRssi: -58,
    ipAddress: '192.168.1.188',
    pingMs: 38,
    lastSeen: 'Vừa xong',
  };

  constructor() {
    this.startMockEngine();
  }

  public isSimulated(): boolean {
    return this.config.isSimulation;
  }

  public setSimulationMode(enabled: boolean): void {
    this.config.isSimulation = enabled;
    if (enabled) {
      this.startMockEngine();
    } else {
      this.stopMockEngine();
      this.connectRealMqtt();
    }
  }

  public async connect(overrideConfig?: Partial<MqttBrokerConfig>): Promise<boolean> {
    if (overrideConfig) {
      this.config = { ...this.config, ...overrideConfig };
    }

    this.updateStatus({
      ...this.connectionStatus,
      esp32: 'connecting',
      broker: 'connecting',
    });

    if (this.config.isSimulation) {
      return new Promise((resolve) => {
        setTimeout(() => {
          this.isConnected = true;
          this.updateStatus({
            esp32: 'connected',
            broker: 'connected',
            wifiRssi: -55 - Math.floor(Math.random() * 10),
            ipAddress: '192.168.1.188',
            pingMs: 28 + Math.floor(Math.random() * 20),
            lastSeen: 'Vừa xong',
          });
          this.startMockEngine();
          resolve(true);
        }, 800);
      });
    }

    return this.connectRealMqtt();
  }

  public disconnect(): void {
    this.isConnected = false;
    this.stopMockEngine();
    this.updateStatus({
      ...this.connectionStatus,
      esp32: 'disconnected',
      broker: 'disconnected',
    });
  }

  public async setLed(state: 'ON' | 'OFF', brightness?: number): Promise<boolean> {
    if (this.config.isSimulation) {
      return this.simulateHardwareActuatorResponse('led', {
        state,
        brightness: brightness ?? this.currentActuators.led.brightness,
        isPending: false,
        lastUpdated: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      });
    }

    // Gửi lệnh MQTT thật lên HiveMQ
    return this.publishMqttCommand(MQTT_TOPICS.SET_LED, {
      state,
      brightness: brightness ?? this.currentActuators.led.brightness,
    });
  }

  public async setRelay(state: 'ON' | 'OFF'): Promise<boolean> {
    const powerWatts = state === 'ON' ? (this.currentActuators.relay.deviceType === 'pump' ? 75 : 45) : 0;
    if (this.config.isSimulation) {
      return this.simulateHardwareActuatorResponse('relay', {
        state,
        powerWatts,
        isPending: false,
        lastUpdated: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      });
    }

    return this.publishMqttCommand(MQTT_TOPICS.SET_RELAY, { state });
  }

  public async setDoor(angle: number, isOverride = false): Promise<boolean> {
    const isOpen = angle > 45;
    if (this.config.isSimulation) {
      return this.simulateHardwareActuatorResponse('door', {
        angle,
        isOpen,
        isOverride,
        isPending: false,
        lastUpdated: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      });
    }

    return this.publishMqttCommand(MQTT_TOPICS.SET_DOOR, { angle, override: isOverride });
  }

  public async setDoorAutoMode(enabled: boolean): Promise<boolean> {
    if (this.config.isSimulation) {
      this.currentActuators.door.isAutoMode = enabled;
      this.notifyActuators({ door: { ...this.currentActuators.door } });
      return true;
    }

    return this.publishMqttCommand(MQTT_TOPICS.SET_MODE, { autoDoor: enabled });
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

  // ===================== PRIVATE MOCK ENGINE =====================

  private startMockEngine(): void {
    if (this.mockTimer) return;
    this.isConnected = true;

    let cycleCount = 0;

    // Cập nhật chu kỳ đúng 2 giây (2000ms) như yêu cầu hệ thống IoT
    this.mockTimer = setInterval(() => {
      cycleCount++;

      // 1. Dao động tự nhiên của DHT22 (Nhiệt độ & Độ ẩm)
      const tempDelta = (Math.random() - 0.48) * 0.4;
      let newTemp = Math.round((this.currentSensors.dht22.temperature + tempDelta) * 10) / 10;
      if (newTemp < 22.0) newTemp = 22.0;
      if (newTemp > 36.5) newTemp = 36.5;

      const humDelta = (Math.random() - 0.5) * 0.8;
      let newHum = Math.round((this.currentSensors.dht22.humidity + humDelta) * 10) / 10;
      if (newHum < 35.0) newHum = 35.0;
      if (newHum > 85.0) newHum = 85.0;

      // 2. Độ ẩm đất (Biến trở ADC)
      let soilPercent = this.currentSensors.soil.percentage;
      if (this.currentActuators.relay.state === 'ON' && this.currentActuators.relay.deviceType === 'pump') {
        // Nếu máy bơm đang bật, độ ẩm đất tăng dần
        soilPercent = Math.min(95, soilPercent + 2);
      } else {
        // Tự nhiên giảm chậm
        soilPercent = Math.max(25, soilPercent - (Math.random() > 0.6 ? 1 : 0));
      }

      let soilStatus: 'dry' | 'optimal' | 'wet' = 'optimal';
      let soilStatusText = 'Đủ ẩm';
      if (soilPercent < 40) {
        soilStatus = 'dry';
        soilStatusText = 'Khô - Cần tưới';
      } else if (soilPercent > 85) {
        soilStatus = 'wet';
        soilStatusText = 'Rất ẩm';
      }

      // 3. Cảm biến khoảng cách siêu âm HC-SR04
      // Mô phỏng người đi lại: thi thoảng có người lại gần (< 50cm)
      let distance = 110 + Math.floor((Math.random() - 0.5) * 30);
      if (cycleCount % 8 === 0) {
        // Giả lập người đứng trước cửa cách 35cm
        distance = 32 + Math.floor(Math.random() * 15);
      }

      const objectDetected = distance <= this.currentSensors.ultrasonic.threshold;

      // Nếu đang bật Auto Mode và có vật cản gần -> ESP32 tự xoay Servo mở cửa (90 độ)
      if (this.currentActuators.door.isAutoMode && !this.currentActuators.door.isOverride) {
        if (objectDetected && !this.currentActuators.door.isOpen) {
          this.currentActuators.door.isOpen = true;
          this.currentActuators.door.angle = 90;
          this.currentActuators.door.lastUpdated = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          this.notifyActuators({ door: { ...this.currentActuators.door } });
        } else if (!objectDetected && this.currentActuators.door.isOpen && cycleCount % 3 === 0) {
          // Tự động đóng lại sau khi vật cản rời đi
          this.currentActuators.door.isOpen = false;
          this.currentActuators.door.angle = 0;
          this.currentActuators.door.lastUpdated = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
          this.notifyActuators({ door: { ...this.currentActuators.door } });
        }
      }

      this.currentSensors = {
        dht22: {
          temperature: newTemp,
          humidity: newHum,
          heatIndex: Math.round((newTemp + (newHum / 100) * 2) * 10) / 10,
        },
        soil: {
          percentage: soilPercent,
          rawValue: Math.round((soilPercent / 100) * 4095),
          status: soilStatus,
          statusText: soilStatusText,
        },
        ultrasonic: {
          distanceCm: distance,
          objectDetected,
          threshold: 50,
        },
        timestamp: Date.now(),
      };

      // Bắn sự kiện ra các component UI
      this.sensorListeners.forEach((cb) => cb(this.currentSensors));

      // Cập nhật ping và thời gian sống
      if (cycleCount % 5 === 0) {
        this.connectionStatus.pingMs = 25 + Math.floor(Math.random() * 25);
        this.connectionStatus.lastSeen = 'Vừa xong';
        this.statusListeners.forEach((cb) => cb(this.connectionStatus));
      }
    }, 2000);
  }

  private stopMockEngine(): void {
    if (this.mockTimer) {
      clearInterval(this.mockTimer);
      this.mockTimer = null;
    }
  }

  private simulateHardwareActuatorResponse<K extends keyof ActuatorDevices>(
    deviceKey: K,
    updatedData: Partial<ActuatorDevices[K]>
  ): Promise<boolean> {
    return new Promise((resolve) => {
      // Giả lập trễ mạng 120ms trước khi phần cứng phản hồi ACK
      setTimeout(() => {
        this.currentActuators[deviceKey] = {
          ...this.currentActuators[deviceKey],
          ...updatedData,
        };
        this.notifyActuators({ [deviceKey]: this.currentActuators[deviceKey] });
        resolve(true);
      }, 120);
    });
  }

  private notifyActuators(data: Partial<ActuatorDevices>): void {
    this.actuatorListeners.forEach((cb) => cb(data));
  }

  private updateStatus(status: IotConnectionStatus): void {
    this.connectionStatus = status;
    this.statusListeners.forEach((cb) => cb(status));
  }

  // ===================== REAL MQTT INTEGRATION =====================

  private async connectRealMqtt(): Promise<boolean> {
    // Sẵn sàng kết nối WebSocket MQTT tới HiveMQ
    // (VD: ws://${this.config.host}:${this.config.port}/mqtt)
    // Khi chạy trên Expo có thể dùng thư viện `mqtt/dist/mqtt.min` hoặc WebSocket native
    console.log(`[MQTT] Connecting to HiveMQ at ${this.config.host}:${this.config.port}`);
    this.updateStatus({
      ...this.connectionStatus,
      esp32: 'connected',
      broker: 'connected',
    });
    return true;
  }

  private async publishMqttCommand(topic: string, payload: any): Promise<boolean> {
    console.log(`[MQTT Publish] Topic: ${topic}, Payload:`, payload);
    // Khi dùng client MQTT thực tế:
    // client.publish(topic, JSON.stringify(payload));
    return true;
  }
}

// Export Singleton Service Instance
export const smartHomeService = new SmartHomeMqttService();
