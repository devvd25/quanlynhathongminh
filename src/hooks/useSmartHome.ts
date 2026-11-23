/**
 * Custom Hook: useSmartHome
 * Quản lý tập trung State phần cứng ESP32 / Wokwi và HiveMQ Broker.
 * ĐÃ LOẠI BỎ MOCK TIMER GIẢ LẬP - SẴN SÀNG NHẬN DATA THẬT.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  IotConnectionStatus,
  EnvironmentSensors,
  ActuatorDevices,
  SensorHistoryPoint,
  AutomationConfig,
  RelayDeviceType,
} from '../types/iot';
import { smartHomeService } from '../services/mqttService';

const INITIAL_AUTOMATION: AutomationConfig = {
  autoWateringEnabled: true,
  soilMoistureThreshold: 35,
  autoDoorEnabled: true,
  doorDistanceThreshold: 50,
};

export const useSmartHome = () => {
  // Trạng thái kết nối (Khởi đầu ở chế độ Standby sẵn sàng kết nối)
  const [connection, setConnection] = useState<IotConnectionStatus>({
    esp32: 'standby',
    broker: 'standby',
    backend: 'standby',
    wifiRssi: null,
    ipAddress: null,
    pingMs: null,
    lastSeen: 'Chờ kết nối Wokwi...',
    source: 'none',
  });

  // Cảm biến môi trường (null khi chưa có dữ liệu từ Wokwi / ESP32)
  const [sensors, setSensors] = useState<EnvironmentSensors>({
    dht22: { temperature: null, humidity: null, heatIndex: null },
    soil: { percentage: null, rawValue: null, status: 'unknown', statusText: 'Chờ kết nối Wokwi...' },
    ultrasonic: { distanceCm: null, objectDetected: false, threshold: 50 },
    timestamp: null,
    isLive: false,
  });

  // Thiết bị điều khiển
  const [actuators, setActuators] = useState<ActuatorDevices>({
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
  });

  const [automation, setAutomation] = useState<AutomationConfig>(INITIAL_AUTOMATION);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [history, setHistory] = useState<SensorHistoryPoint[]>([]);

  // Lắng nghe cập nhật từ SmartHome IoT Service (khi Wokwi/Backend/HiveMQ gửi data tới)
  useEffect(() => {
    const unsubSensors = smartHomeService.onSensorsUpdate((newSensors) => {
      setSensors(newSensors);

      if (newSensors.isLive && newSensors.dht22.temperature != null) {
        setHistory((prev) => {
          const now = new Date();
          const newPoint: SensorHistoryPoint = {
            timestamp: now.toISOString(),
            timeLabel: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            temperature: newSensors.dht22.temperature!,
            humidity: newSensors.dht22.humidity || 0,
            soilMoisture: newSensors.soil.percentage || 0,
            distance: newSensors.ultrasonic.distanceCm || 0,
          };
          const next = [...prev, newPoint];
          if (next.length > 20) next.shift();
          return next;
        });
      }
    });

    const unsubActuators = smartHomeService.onActuatorsUpdate((newActuators) => {
      setActuators((prev) => ({ ...prev, ...newActuators }));
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

  // Điều khiển Đèn LED
  const toggleLed = useCallback(async () => {
    const nextState = actuators.led.state === 'ON' ? 'OFF' : 'ON';
    setActuators((prev) => ({
      ...prev,
      led: { ...prev.led, state: nextState, isPending: true },
    }));
    await smartHomeService.setLed(nextState);
    setActuators((prev) => ({ ...prev, led: { ...prev.led, isPending: false } }));
  }, [actuators.led.state]);

  const setLedBrightness = useCallback(async (brightness: number) => {
    setActuators((prev) => ({ ...prev, led: { ...prev.led, brightness } }));
    await smartHomeService.setLed(actuators.led.state, brightness);
  }, [actuators.led.state]);

  // Điều khiển Rơ-le (Máy bơm / Quạt)
  const toggleRelay = useCallback(async () => {
    const nextState = actuators.relay.state === 'ON' ? 'OFF' : 'ON';
    const watts = nextState === 'ON' ? (actuators.relay.deviceType === 'pump' ? 75 : 45) : 0;
    setActuators((prev) => ({
      ...prev,
      relay: { ...prev.relay, state: nextState, powerWatts: watts, isPending: true },
    }));
    await smartHomeService.setRelay(nextState);
    setActuators((prev) => ({ ...prev, relay: { ...prev.relay, isPending: false } }));
  }, [actuators.relay.state, actuators.relay.deviceType]);

  const updateRelayConfig = useCallback((deviceType: RelayDeviceType, name: string) => {
    setActuators((prev) => ({
      ...prev,
      relay: { ...prev.relay, deviceType, name },
    }));
  }, []);

  // Điều khiển Cửa Servo & Override
  const toggleDoorOverride = useCallback(async () => {
    const nextOverride = !actuators.door.isOverride;
    const targetAngle = nextOverride ? 90 : 0;
    setActuators((prev) => ({
      ...prev,
      door: {
        ...prev.door,
        isOverride: nextOverride,
        isOpen: targetAngle === 90,
        angle: targetAngle,
        isPending: true,
      },
    }));
    await smartHomeService.setDoor(targetAngle, nextOverride);
    setActuators((prev) => ({ ...prev, door: { ...prev.door, isPending: false } }));
  }, [actuators.door.isOverride]);

  const setDoorAutoMode = useCallback(async (enabled: boolean) => {
    setActuators((prev) => ({ ...prev, door: { ...prev.door, isAutoMode: enabled } }));
    await smartHomeService.setDoorAutoMode(enabled);
  }, []);

  // Nút Kết nối lại / Thử kết nối Wokwi & HiveMQ
  const reconnect = useCallback(async () => {
    setIsRefreshing(true);
    await smartHomeService.connect();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  }, []);

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
    toggleLed,
    setLedBrightness,
    toggleRelay,
    updateRelayConfig,
    toggleDoorOverride,
    setDoorAutoMode,
    reconnect,
    updateAutomationConfig,
    toggleTheme,
  };
};
