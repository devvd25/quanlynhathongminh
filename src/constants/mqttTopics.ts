/**
 * MQTT Topic Definitions
 * Đồng bộ với Firmware C++ trên ESP32 và Broker HiveMQ
 */

export const MQTT_CONFIG_DEFAULTS = {
  BROKER_HOST: 'broker.hivemq.com',
  BROKER_PORT: 8884, // WebSocket SSL port của HiveMQ Cloud / Public
  WEBSOCKET_PATH: '/mqtt',
  TOPIC_PREFIX: 'smarthome/esp32',
};

export const createMqttTopics = (prefix: string = MQTT_CONFIG_DEFAULTS.TOPIC_PREFIX) => ({
  //ESP32 -> App (Publish từ mạch, App Subscribe)
  TELEMETRY_SENSORS: `${prefix}/sensors`,      // Dữ liệu DHT22, đất, siêu âm
  SYSTEM_STATUS: `${prefix}/status`,            // Trạng thái sống (LWT), WiFi, IP
  ACTUATOR_STATE: `${prefix}/actuators/state`,  // Trạng thái xác nhận từ phần cứng

  // App -> ESP32 (App Publish lệnh điều khiển)
  SET_LED: `${prefix}/led/set`,                 // Lệnh "ON" / "OFF" hoặc JSON
  SET_RELAY: `${prefix}/relay/set`,             // Lệnh "ON" / "OFF"
  SET_DOOR: `${prefix}/door/set`,               // Lệnh điều khiển Servo góc 0°/90°
  SET_MODE: `${prefix}/mode/set`,               // Đổi chế độ Auto/Manual
  REQUEST_REFRESH: `${prefix}/refresh`,         // Yêu cầu ESP32 gửi lại telemetry ngay
});

export const MQTT_TOPICS = createMqttTopics();
