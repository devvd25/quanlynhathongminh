# Smart Home IoT Mobile App (ESP32 Wokwi & HiveMQ Ready)

Ứng dụng quản lý nhà thông minh được phát triển bằng **React Native (Expo + TypeScript)** theo chuẩn **Clean Architecture**, phân quyền đa người dùng (**User / Gia chủ** & **Admin / Quản trị viên**), tích hợp màn hình Đăng ký, Đăng nhập và đưa toàn bộ hệ thống về trạng thái **Sẵn sàng kết nối Wokwi Simulator & HiveMQ MQTT**.

---

## 1. Cấu trúc thư mục dự án

```
quanlynhathongminh/
├── app.json                          # Cấu hình Expo Application
├── package.json                      # Dependencies
├── tsconfig.json                     # Cấu hình TypeScript & Path Alias (@/*)
├── App.tsx                           # Root: Quản lý Authentication Stack & Role-Based Navigation
└── src/
    ├── types/
    │   ├── iot.ts                    # Chuẩn dữ liệu IoT, Cảm biến (nullable/standby), Actuators
    │   └── auth.ts                   # Interface UserProfile, UserRole (user | admin), AuthPayloads
    ├── constants/
    │   ├── theme.ts                  # Design Tokens: Light & Dark Mode, Colors, Border Radii, Shadows
    │   ├── mqttTopics.ts             # Định nghĩa Topic MQTT chuẩn kết nối ESP32 - HiveMQ
    │   └── apiConfig.ts              # Cấu hình Endpoint Backend REST/WS, HiveMQ & Wokwi Pinout
    ├── services/
    │   ├── apiService.ts             # REST API Client: Auth, Quản lý thiết bị, Người dùng, Audit Logs
    │   └── mqttService.ts            # IoT Client: Standby/Live WebSocket & HiveMQ (ĐÃ BỎ FAKE TIMER)
    ├── hooks/
    │   ├── useAuth.ts                # Custom Hook: Quản lý đăng nhập, đăng ký, chuyển đổi vai trò
    │   └── useSmartHome.ts           # Custom Hook: Quản lý State IoT sẵn sàng nhận Data thật
    ├── components/
    │   ├── HeaderStatus.tsx          # Lời chào, Tên người dùng, Badge OLED Wokwi (WiFi / MQTT)
    │   ├── SensorCard.tsx            # Grid 3 thẻ cảm biến: DHT22 Nhiệt độ, DHT22 Độ ẩm, Độ ẩm đất
    │   ├── DeviceControlCard.tsx     # Thẻ công tắc lớn: Đèn LED phát sáng, Rơ-le Module đa năng
    │   ├── DoorStatusCard.tsx        # Cửa thông minh: HC-SR04 siêu âm (Trig/Echo) + Servo 90°
    │   └── BottomTabBar.tsx          # Bottom Tab Bar tự thích ứng theo vai trò (User vs Admin)
    └── screens/
        ├── LoginScreen.tsx           # Màn hình Đăng nhập (kèm nút Đăng nhập nhanh User & Admin)
        ├── RegisterScreen.tsx        # Màn hình Đăng ký (Họ tên, Email, Phone, Mã kết nối Wokwi)
        ├── DashboardScreen.tsx       # Màn hình chính Dashboard cho Gia chủ & Admin
        ├── AnalyticsScreen.tsx       # Màn hình Thống kê & Biểu đồ lịch sử (Sẵn sàng hứng Backend)
        ├── AdminDashboardScreen.tsx  # Trung tâm Quản trị Admin: Pinout Wokwi, Phân quyền, Gateway, Logs
        ├── ProfileScreen.tsx         # Thông tin tài khoản, Đổi Dark/Light mode, Đăng xuất
        └── SettingsScreen.tsx        # Cấu hình HiveMQ Broker & Ngưỡng tự động hóa
```

---

## 2. Bảng Phân Quyền Vai Trò (User vs Admin)

| Tính năng | Gia chủ (User) | Quản trị viên (Admin) |
|---|:---:|:---:|
| **Xem cảm biến môi trường (DHT22, Đất)** | ✅ Có | ✅ Có |
| **Điều khiển đèn LED & Rơ-le máy bơm** | ✅ Có | ✅ Có |
| **Giám sát cửa siêu âm HC-SR04 & Mở cửa khẩn cấp** | ✅ Có | ✅ Có |
| **Xem biểu đồ thống kê môi trường** | ✅ Có | ✅ Có |
| **Xem hồ sơ cá nhân & Đổi giao diện Dark/Light** | ✅ Có | ✅ Có |
| **Quản lý thiết bị & Cấu hình Pinout Wokwi** | ❌ Ẩn | ✅ Toàn quyền |
| **Quản lý thành viên gia đình & Phân quyền mở cửa** | ❌ Ẩn | ✅ Toàn quyền |
| **Cấu hình Gateway Backend API & HiveMQ Broker** | ❌ Ẩn | ✅ Toàn quyền |
| **Xem nhật ký kiểm toán hệ thống (Audit Logs)** | ❌ Ẩn | ✅ Toàn quyền |

> **Mẹo kiểm thử:** Tại màn hình Đăng nhập (hoặc trang Tài khoản), ứng dụng có sẵn 2 nút **"Vào vai Gia Chủ"** và **"Vào vai Quản Trị"** để bạn chuyển đổi kiểm tra giao diện 1 chạm mà không cần gõ mật khẩu.

---

## 3. Sơ đồ Chân Phần Cứng (Wokwi ESP32 Pinout)

Hệ thống đã chuẩn hóa sơ đồ nối dây tương thích hoàn toàn với Wokwi Diagram:
- **Cảm biến DHT22 (Nhiệt độ & Độ ẩm):** GPIO Pin 4
- **Cảm biến Độ ẩm đất (Biến trở ADC):** GPIO Pin 34 (ADC1_CH6)
- **Cảm biến Siêu âm HC-SR04:** Trigger Pin 5, Echo Pin 18
- **Đèn LED Chiếu sáng:** GPIO Pin 2
- **Module Rơ-le (Máy bơm / Thiết bị công suất):** GPIO Pin 23
- **Động cơ Servo Cửa (SG90):** GPIO Pin 19
- **Màn hình OLED 0.96 inch I2C:** SDA Pin 21, SCL Pin 22

---

## 4. Trạng thái kết nối khi chưa có Backend & HiveMQ

- Ứng dụng **không còn chạy timer nhảy số giả**.
- Các thẻ cảm biến hiển thị số đo dạng chờ (`--.- °C`, `--.- %`, `-- cm`) cùng nhãn **"Chờ kết nối Wokwi / ESP32"**.
- Trạng thái hệ thống hiển thị **"STANDBY - Sẵn sàng kết nối"**.
- Tầng Service cung cấp phương thức `injectIncomingTelemetry(data)` và kết nối sẵn WebSocket `ws://localhost:8000/ws/telemetry`. Khi Backend hoặc mạch Wokwi bắt đầu gửi dữ liệu qua WebSocket/MQTT, giao diện sẽ lập tức hiển thị dữ liệu thật mà không cần sửa thêm code giao diện!
