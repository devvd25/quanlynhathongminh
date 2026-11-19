/**
 * Custom Hook: useSmartHome
 * Quản lý tập trung toàn bộ State, Optimistic UI và giao tiếp với Service Layer.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  SmartHomeState,
  IotConnectionStatus,
  EnvironmentSensors,
  ActuatorDevices,
  SensorHistoryPoint,
  AutomationConfig,
  MqttBrokerConfig,
  RelayDeviceType,
} from '../types/iot';
import { smartHomeService } from '../services/mqttService';

const INITIAL_AUTOMATION: AutomationConfig = {
  autoWateringEnabled: true,
  soilMoistureThreshold: 35, // Dưới 35% tự động kích hoạt máy bơm tưới
  autoDoorEnabled: true,
  doorDistanceThreshold: 50,  // Dưới 50cm tự động mở cửa
};

export const useSmartHome = () => {
  // 1. Connection State
  const [connection, setConnection] = useState<IotConnectionStatus>({
    esp32: 'connected',
    broker: 'connected',
    wifiRssi: -60,
    ipAddress: '192.168.1.188',
    pingMs: 35,
    lastSeen: 'Vừa xong',
  });

  // 2. Sensor State
  const [sensors, setSensors] = useState<EnvironmentSensors>({
    dht22: { temperature: 26.5, humidity: 58.0, heatIndex: 27.0 },
    soil: { percentage: 75, rawValue: 3075, status: 'optimal', statusText: 'Đủ ẩm' },
    ultrasonic: { distanceCm: 120, objectDetected: false, threshold: 50 },
    timestamp: Date.now(),
  });

  // 3. Actuator State
  const [actuators, setActuators] = useState<ActuatorDevices>({
    led: {
      id: 'led_living_room',
      name: 'Đèn chiếu sáng chính',
      state: 'ON',
      brightness: 80,
      isPending: false,
      lastUpdated: '09:30',
    },
    relay: {
      id: 'relay_pump',
      name: 'Máy bơm tưới cây',
      deviceType: 'pump',
      state: 'OFF',
      isPending: false,
      powerWatts: 0,
      lastUpdated: '09:28',
    },
    door: {
      angle: 0,
      isOpen: false,
      isAutoMode: true,
      isOverride: false,
      isPending: false,
      lastUpdated: '09:25',
    },
  });

  // 4. Automation & Config State
  const [automation, setAutomation] = useState<AutomationConfig>(INITIAL_AUTOMATION);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 5. Historical Data Buffer (dành cho Analytics & Biểu đồ)
  const [history, setHistory] = useState<SensorHistoryPoint[]>(() => {
    // Khởi tạo một số điểm mẫu đẹp mắt ban đầu
    const points: SensorHistoryPoint[] = [];
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
      const time = new Date(now - i * 5 * 60 * 1000);
      points.push({
        timestamp: time.toISOString(),
        timeLabel: time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        temperature: 25.5 + Math.sin(i) * 1.5,
        humidity: 60 + Math.cos(i) * 4,
        soilMoisture: 72 + (i % 3) * 2,
        distance: 110 + (i % 2) * 15,
      });
    }
    return points;
  });

  // Ref giữ automation config để check auto watering không bị stale closure
  const automationRef = useRef(automation);
  useEffect(() => {
    automationRef.current = automation;
  }, [automation]);

  // Lắng nghe cập nhật từ Service
  useEffect(() => {
    const unsubSensors = smartHomeService.onSensorsUpdate((newSensors) => {
      setSensors(newSensors);

      // Cập nhật lịch sử (giới hạn tối đa 20 điểm)
      setHistory((prev) => {
        const now = new Date();
        const newPoint: SensorHistoryPoint = {
          timestamp: now.toISOString(),
          timeLabel: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          temperature: newSensors.dht22.temperature,
          humidity: newSensors.dht22.humidity,
          soilMoisture: newSensors.soil.percentage,
          distance: newSensors.ultrasonic.distanceCm,
        };
        const next = [...prev, newPoint];
        if (next.length > 20) next.shift();
        return next;
      });

      // Tự động kích hoạt quy tắc: nếu độ ẩm đất < ngưỡng cấu hình -> Tự bật máy bơm tưới
      if (
        automationRef.current.autoWateringEnabled &&
        newSensors.soil.percentage < automationRef.current.soilMoistureThreshold
      ) {
        setActuators((current) => {
          if (current.relay.state === 'OFF' && !current.relay.isPending) {
            smartHomeService.setRelay('ON');
            return {
              ...current,
              relay: { ...current.relay, state: 'ON', powerWatts: 75 },
            };
          }
          return current;
        });
      }
    });

    const unsubActuators = smartHomeService.onActuatorsUpdate((newActuators) => {
      setActuators((prev) => ({
        ...prev,
        ...newActuators,
      }));
    });

    const unsubStatus = smartHomeService.onStatusUpdate((newStatus) => {
      setConnection(newStatus);
    });

    return () => {
      unsubSensors();
      unsubActuators();
      unsubStatus();
    };
  }, []);

  // ===================== ACTION DISPATCHERS (OPTIMISTIC UI) =====================

  /**
   * Bật / Tắt Đèn LED (Phản hồi tức thì Optimistic UI)
   */
  const toggleLed = useCallback(async () => {
    const nextState = actuators.led.state === 'ON' ? 'OFF' : 'ON';

    // 1. Cập nhật UI ngay lập tức
    setActuators((prev) => ({
      ...prev,
      led: {
        ...prev.led,
        state: nextState,
        isPending: true,
      },
    }));

    try {
      // 2. Gửi lệnh qua MQTT Service
      await smartHomeService.setLed(nextState);
    } catch (err) {
      // Rollback nếu có lỗi
      setActuators((prev) => ({
        ...prev,
        led: {
          ...prev.led,
          state: prev.led.state === 'ON' ? 'OFF' : 'ON',
          isPending: false,
        },
      }));
    } finally {
      setActuators((prev) => ({
        ...prev,
        led: { ...prev.led, isPending: false },
      }));
    }
  }, [actuators.led.state]);

  /**
   * Điều chỉnh độ sáng đèn LED (0 - 100%)
   */
  const setLedBrightness = useCallback(async (brightness: number) => {
    setActuators((prev) => ({
      ...prev,
      led: { ...prev.led, brightness },
    }));
    await smartHomeService.setLed(actuators.led.state, brightness);
  }, [actuators.led.state]);

  /**
   * Bật / Tắt Rơ-le (Máy bơm / Thiết bị công suất)
   */
  const toggleRelay = useCallback(async () => {
    const nextState = actuators.relay.state === 'ON' ? 'OFF' : 'ON';
    const watts = nextState === 'ON' ? (actuators.relay.deviceType === 'pump' ? 75 : 45) : 0;

    // Optimistic Update
    setActuators((prev) => ({
      ...prev,
      relay: {
        ...prev.relay,
        state: nextState,
        powerWatts: watts,
        isPending: true,
      },
    }));

    try {
      await smartHomeService.setRelay(nextState);
    } catch (err) {
      setActuators((prev) => ({
        ...prev,
        relay: {
          ...prev.relay,
          state: prev.relay.state === 'ON' ? 'OFF' : 'ON',
          isPending: false,
        },
      }));
    } finally {
      setActuators((prev) => ({
        ...prev,
        relay: { ...prev.relay, isPending: false },
      }));
    }
  }, [actuators.relay.state, actuators.relay.deviceType]);

  /**
   * Đổi loại thiết bị Rơ-le (VD: từ Quạt sang Máy bơm tưới cây)
   */
  const updateRelayConfig = useCallback((deviceType: RelayDeviceType, name: string) => {
    setActuators((prev) => ({
      ...prev,
      relay: {
        ...prev.relay,
        deviceType,
        name,
      },
    }));
  }, []);

  /**
   * Mở khẩn cấp từ xa (Override Servo 90°)
   */
  const toggleDoorOverride = useCallback(async () => {
    const nextOverride = !actuators.door.isOverride;
    const targetAngle = nextOverride ? 90 : 0;
    const targetIsOpen = targetAngle === 90;

    setActuators((prev) => ({
      ...prev,
      door: {
        ...prev.door,
        isOverride: nextOverride,
        isOpen: targetIsOpen,
        angle: targetAngle,
        isPending: true,
      },
    }));

    try {
      await smartHomeService.setDoor(targetAngle, nextOverride);
    } catch (err) {
      // rollback
    } finally {
      setActuators((prev) => ({
        ...prev,
        door: { ...prev.door, isPending: false },
      }));
    }
  }, [actuators.door.isOverride]);

  /**
   * Bật/Tắt chế độ mở cửa tự động theo cảm biến siêu âm
   */
  const setDoorAutoMode = useCallback(async (enabled: boolean) => {
    setActuators((prev) => ({
      ...prev,
      door: { ...prev.door, isAutoMode: enabled },
    }));
    await smartHomeService.setDoorAutoMode(enabled);
  }, []);

  /**
   * Tải lại / Kết nối lại HiveMQ & ESP32
   */
  const reconnect = useCallback(async () => {
    setIsRefreshing(true);
    await smartHomeService.connect();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  }, []);

  /**
   * Cập nhật quy tắc tự động hóa
   */
  const updateAutomationConfig = useCallback((config: Partial<AutomationConfig>) => {
    setAutomation((prev) => ({ ...prev, ...config }));
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  return {
    connection,
    sensors,
    actuators,
    automation,
    history,
    isRefreshing,
    isDarkMode,
    isSimulation: smartHomeService.isSimulated(),
    toggleLed,
    setLedBrightness,
    toggleRelay,
    updateRelayConfig,
    toggleDoorOverride,
    setDoorAutoMode,
    reconnect,
    updateAutomationConfig,
    toggleTheme,
    setSimulationMode: (val: boolean) => smartHomeService.setSimulationMode(val),
  };
};
