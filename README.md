
## 📋 Yêu Cầu Hệ Thống

Trước khi chạy dự án, bạn cần đảm bảo máy tính đã cài đặt các phần mềm sau:

- **Node.js**: Phiên bản `>= 22.10.0`
- **Yarn**: Phiên bản `4.13.0` (Khuyên dùng bộ quản lý gói Yarn mặc định của dự án)

## 🚀 Hướng Dẫn Cài Đặt & Chạy

Để chạy dự án ở môi trường máy cá nhân (localhost), hãy thực hiện lần lượt các bước sau:

**Bước 1: Cài đặt thư viện**  
Mở terminal tại thư mục gốc của dự án (`f:\scaffold\myapp`) và chạy lệnh:
```bash
yarn install
```

**Bước 2: Khởi động mạng Blockchain ảo**  
Mở một cửa sổ terminal (thứ nhất) và khởi động mạng Hardhat cục bộ:
```bash
yarn chain
```
*Lệnh này tạo ra một mạng lưới blockchain giả lập trên máy bạn để test giao dịch mà không tốn tiền.*

**Bước 3: Triển khai Smart Contract**  
Mở một cửa sổ terminal mới (thứ hai) và chạy lệnh:
```bash
yarn deploy
```
*Lệnh này sẽ đưa (deploy) các hợp đồng thông minh (nằm trong thư mục `packages/hardhat/contracts`) lên mạng lưới ảo vừa tạo.*

**Bước 4: Khởi động giao diện Web (Frontend)**  
Mở cửa sổ terminal mới (thứ ba) và chạy:
```bash
yarn start
```
Truy cập ứng dụng của bạn tại: **[http://localhost:3000](http://localhost:3000)**

## 📂 Cấu Trúc Dự Án

Dự án này là một monorepo gồm 2 thành phần chính:

- `packages/nextjs`: Thư mục chứa giao diện web frontend, sử dụng công nghệ **Next.js 16 (Turbopack)**, kết hợp **Tailwind CSS**, và **viem/wagmi** để kết nối ví Web3.
- `packages/hardhat`: Thư mục chứa các hợp đồng thông minh (Smart Contracts) bằng ngôn ngữ **Solidity**.

## 🛠 Tính Năng Chính
- **Mint NFT**: Cho phép người dùng kết nối ví và đúc ra các tài sản NFT mới.
- **My NFTs**: Quản lý và xem bộ sưu tập các NFT mà ví đang sở hữu.
- **Marketplace**: Sàn giao dịch để trao đổi, mua bán NFT với những người dùng khác.
- **Debug Contracts**: Công cụ tích hợp sẵn cho phép tương tác, kiểm tra trực tiếp các hàm của Smart Contract ngay trên giao diện web.


