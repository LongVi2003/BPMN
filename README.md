# Dự án BPMN-JS với Camuda Docker
Đây là một dự án BPMN được xây dụng bằng bpmn-js chạy bằng API của Camuda Docker
## Tính Năng
- Tạo, chỉnh sửa và quản lí các sơ đồ Diagram BPMN.
- Giao diện dễ sử dụng.
- Tích hợp các bảng thuộc tính (`bpmn-js-properties-panel`).
- Tính năng Camuda Form
- Tính năng xuất và nhập file BPMN XML, lưu lại diagram và Deployed Diagram
- Hiển thị Process Definition Deployed và Thêm, Xóa, Sửa Process
- Process Definition Detail và Variables
- Tính năng Camunda Tasklist: hiển thị các Tasklist và Start Process
- Complete các biểu mẫu form tasklist
## Giao diện
- Giao diện chính
  ![image](https://github.com/user-attachments/assets/750e3978-7b0e-4407-8ebe-057fe8990c81)
- Process
  ![image](https://github.com/user-attachments/assets/ed9dd352-6ed6-4fad-8412-85914a85848c)
- Camunda Tasklist
  ![image](https://github.com/user-attachments/assets/69918f74-3445-4aca-8613-fa57ff402eff)

## Yêu Cầu
- **Node js** (phiên bản 14.x hoặc cao hơn)
- **Docker** với Camuda Docker
Đây là một dự án BPMN được xây dụng bằng bpmn-js chạy bằng API của Camuda Docker
## Yêu Cầu
- **Node js** (phiên bản 14.x hoặc cao hơn)
- **Docker**  (docker pull camunda/camunda-bpm-platform:run-latest
               docker run -d --name camunda -p 8080:8080 camunda/camunda-bpm-platform:run-latest)
## Cách Chạy Dự Án
- npm install
- npm run dev (frontend)
- node index.js (backend)
- Đăng Nhập (demo:demo)
- Chạy với Docker
