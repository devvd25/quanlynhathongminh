/**
 * API & Gateway Configuration
 * Cấu hình kết nối Backend REST/WebSocket, Wokwi Simulator và HiveMQ
 */

import { Platform } from 'react-native';

// Khi chạy trên Android Emulator: 10.0.2.2 trỏ về localhost máy tính.
// Khi chạy trên iOS / Web: localhost hoặc IP mạng LAN (ví dụ: 192.168.1.x)
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_CONFIG = {
  // Backend Server (FastAPI / Express / NestJS)
  BACKEND_BASE_URL: `http://${DEFAULT_HOST}:8000/api/v1`,
  BACKEND_WS_URL: `ws://${DEFAULT_HOST}:8000/ws/telemetry`,

  // HiveMQ Public Broker WebSocket
  HIVEMQ_HOST: 'broker.hivemq.com',
  HIVEMQ_WS_PORT: 8884, // SSL WebSocket
  HIVEMQ_WS_PATH: '/mqtt',
  TOPIC_PREFIX: 'smarthome/esp32',

  // Cấu hình Wokwi ESP32 Pinout mặc định
  WOKWI_DEFAULT_PINOUT: {
    DHT22_PIN: 4,
    SOIL_ADC_PIN: 34,
    HC_SR04_TRIG: 5,
    HC_SR04_ECHO: 18,
    LED_PIN: 2,
    RELAY_PIN: 23,
    SERVO_PIN: 19,
    OLED_SDA: 21,
    OLED_SCL: 22,
  },

  TIMEOUT_MS: 5000,
};
