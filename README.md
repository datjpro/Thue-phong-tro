# Hệ Thống Quản Lý Cho Thuê Phòng Trọ (Rental Property Management)

Ứng dụng web hiện đại, tinh gọn phục vụ **quản lý phòng trọ và căn hộ dịch vụ**, thiết kế theo triết lý **sổ sách gọn gàng của một nhà trọ được chăm sóc chu đáo**: sạch sẽ, trực quan, tin cậy và tối ưu hóa cho thao tác một tay trên điện thoại di động ngay tại phòng.

Hệ thống được thiết kế theo kiến trúc module hóa đa tầng: giai đoạn đầu phục vụ hoàn hảo cho mô hình **1 phòng**, nhưng toàn bộ lược đồ dữ liệu và logic nghiệp vụ đã sẵn sàng mở rộng cho **nhiều phòng, nhiều nhà trọ** mà không cần cấu trúc lại mã nguồn.

---

## Mục Lục

1. [Điểm Nhấn & Triết Lý Thiết Kế](#1-điểm-nhấn--triết-lý-thiết-kế)
2. [Ngăn Xếp Công Nghệ (Tech Stack)](#2-ngăn-xếp-công-nghệ-tech-stack)
3. [Cấu Trúc Thư Mục](#3-cấu-trúc-thư-mục)
4. [Các Phân Hệ Tính Năng Chi Tiết](#4-các-phân-hệ-tính-năng-chi-tiết)
   - [4.1. Tổng quan Kỳ Hiện Tại (Dashboard KPI)](#41-tổng-quan-kỳ-hiện-tại-dashboard-kpi)
   - [4.2. Quản Lý Phòng & Bàn Giao Thiết Bị](#42-quản-lý-phòng--bàn-giao-thiết-bị)
   - [4.3. Quản Lý Bảng Giá Dịch Vụ & Phụ Phí](#43-quản-lý-bảng-giá-dịch-vụ--phụ-phí)
   - [4.4. Nhập Chỉ Số & Hóa Đơn Trả Sau](#44-nhập-chỉ-số--hóa-đơn-trả-sau)
   - [4.5. Quản Lý Khách Thuê & Hợp Đồng Thuê](#45-quản-lý-khách-thuê--hợp-đồng-thuê)
   - [4.6. Tiếp Nhận Phản Ánh & Báo Sửa Chữa](#46-tiếp-nhận-phản-ánh--báo-sửa-chữa)
   - [4.7. Báo Cáo Doanh Thu & Tài Chính](#47-báo-cáo-doanh-thu--tài-chính)
   - [4.8. Cổng Người Thuê (Tenant Portal)](#48-cổng-người-thuê-tenant-portal)
   - [4.9. Tùy Biến Giao Diện & Đa Ngôn Ngữ](#49-tùy-biến-giao-diện--đa-ngôn-ngữ)
5. [Quy Tắc Dữ Liệu & Nghiệp Vụ Cốt Lõi](#5-quy-tắc-dữ-liệu--nghiệp-vụ-cốt-lõi)
6. [Hệ Thống Design Tokens & Giao Diện](#6-hệ-thống-design-tokens--giao-diện)
7. [Hướng Dẫn Cài Đặt & Khởi Chạy](#7-hướng-dẫn-cài-đặt--khởi-chạy)
8. [Quy Trình Phát Triển Git (Git Flow)](#8-quy-trình-phát-triển-git-git-flow)

---

## 1. Điểm Nhấn & Triết Lý Thiết Kế

- **Tháng này là trung tâm**: Màn hình đầu tiên trả lời ngay lập tức: tháng này đã ghi điện nước chưa, hóa đơn đã gửi chưa, ai đã đóng tiền, ai còn nợ và tổng số tiền cần thu là bao nhiêu.
- **Mobile-first, tối ưu thao tác một tay**: Vùng tương tác, nút bấm chính và Sheet trượt đặt trong tầm với ngón tay cái (chiều cao tối thiểu 44–48px). Các ô nhập số tự động bật bàn phím số (`inputMode="numeric"`).
- **Tờ hóa đơn tháng - Điểm chạm cảm xúc**: Thiết kế mô phỏng hóa đơn giấy truyền thống với đường kẻ chấm viền, con dấu trạng thái mộc đỏ/xanh (*Đã thu*, *Chưa thu*, *Quá hạn*), tích hợp nút in nhiệt / xuất PDF gửi khách qua Zalo/Tin nhắn.
- **Mô hình Trả Sau toàn bộ (Post-paid)**: Đầu tháng chốt chỉ số và thu tiền phòng + điện nước + phụ phí của tháng vừa qua, chuẩn xác theo thói quen vận hành thực tế tại Việt Nam.
- **Bảo toàn dữ liệu tài chính (Snapshot)**: Toàn bộ đơn giá điện, nước, phụ phí và tiền phòng được lưu **snapshot** tại thời điểm xuất hóa đơn. Thay đổi giá sau này tuyệt đối không làm ảnh hưởng hóa đơn cũ.
- **1 phòng hay nhiều phòng, chung một trải nghiệm**: Tự động linh hoạt giữa chế độ xem chi tiết phòng (khi chỉ có 1 phòng) và bảng quản trị phân tầng/dãy trực quan (khi có nhiều phòng).

---

## 2. Ngăn Xếp Công Nghệ (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Mục đích sử dụng |
|---|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) | Server Components, Server Actions, Dynamic Rendering |
| **Ngôn ngữ** | TypeScript (Strict Mode) | An toàn kiểu tĩnh 100%, tự phát hiện lỗi lúc biên dịch |
| **Giao diện** | React 19, Tailwind CSS v4, Radix UI | Hệ thống Design Token hiện đại, headless primitives trợ năng |
| **Cơ sở dữ liệu** | PostgreSQL 17 + Drizzle ORM | Type-safe SQL client, migration tự động qua `drizzle-kit` |
| **Xác thực** | Better Auth | Phân quyền chủ trọ / quản lý / khách thuê, bảo mật phiên làm việc |
| **Validation** | Zod v4, React Hook Form | Xác thực dữ liệu 2 đầu (Client Form & Server Action) |
| **Đa ngôn ngữ** | next-intl | Hỗ trợ song ngữ Tiếng Việt (mặc định) & Tiếng Anh |
| **Thông báo** | Sonner | Toast phản hồi tức thì, hỗ trợ nút "Hoàn tác" (Undo) |
| **Icons** | Lucide React | Hệ thống icon chuẩn mực, sắc nét |
| **Kiểm thử** | Vitest, Playwright | Unit test thuật toán tính tiền điện nước, E2E test luồng chính |
| **Linter & Formatter** | Biome | Kiểm tra cú pháp và định dạng mã nguồn tốc độ cao |
| **Môi trường & Gói** | pnpm 11, Docker Compose | Quản lý gói chặt chẽ, Docker Postgres cho môi trường local |

---

## 3. Cấu Trúc Thư Mục

```text
src/
├── app/                        # Next.js App Router (Layouts & Pages mỏng)
│   ├── (auth)/login/           # Màn hình đăng nhập tài khoản
│   ├── (dashboard)/            # Không gian quản trị và cổng người dùng
│   │   ├── page.tsx            # Tổng quan tháng hiện tại (Dashboard KPI)
│   │   ├── rooms/              # Danh sách phòng & tạo/chỉnh sửa phòng
│   │   ├── rooms/[id]/         # Chi tiết phòng, bàn giao thiết bị, lịch sử hóa đơn
│   │   ├── invoices/           # Quản lý hóa đơn, nhập chỉ số, xuất phiếu thu
│   │   ├── tenants/            # Danh bạ khách thuê, quét CCCD, xuất file tạm trú
│   │   ├── contracts/          # Danh sách hợp đồng, in mẫu hợp đồng chuẩn
│   │   ├── reports/            # Báo cáo doanh thu, tài chính, tỷ lệ lấp đầy
│   │   ├── maintenance/        # Tiếp nhận phản ánh & báo hỏng thiết bị
│   │   ├── settings/           # Cài đặt giá điện, nước, bảng giá dịch vụ
│   │   └── more/               # Menu mở rộng trên điện thoại (ngôn ngữ, giao diện...)
│   ├── api/auth/[...all]/      # Route API xác thực Better Auth
│   ├── globals.css             # Hệ thống Design Tokens Tailwind CSS v4
│   └── layout.tsx              # Root Layout tích hợp phông chữ Be Vietnam Pro
├── features/                   # Mô-đun nghiệp vụ độc lập (Feature-driven)
│   ├── rooms/                  # Quản lý phòng, sơ đồ tầng, chuyển trạng thái
│   ├── assets/                 # Quản lý trang thiết bị & biên bản bàn giao
│   ├── services/               # Quản lý bảng giá dịch vụ phụ phí (WiFi, rác, xe...)
│   ├── tenants/                # Khách thuê, OCR CCCD, xuất file tạm trú
│   ├── contracts/              # Hợp đồng thuê phòng, thanh lý, xuất văn bản
│   ├── invoices/               # Thuật toán tính tiền, tạo hóa đơn hàng loạt, phiếu thu
│   ├── maintenance/            # Phản ánh tiếng ồn, an ninh, vệ sinh, sửa chữa
│   ├── reports/                # Tổng hợp thống kê doanh thu & chi phí
│   └── settings/               # Thông số nhà trọ & thông tin chủ trọ
├── components/                 # Các thành phần giao diện tái sử dụng
│   ├── ui/                     # Button, Input, Sheet, Dialog, Select cơ bản
│   └── shared/                 # InvoiceSheet, ContractSheet, StatusBadge, BirthDatePicker...
├── db/                         # Lược đồ & kết nối cơ sở dữ liệu
│   ├── schema/                 # Mỗi bảng PostgreSQL tương ứng 1 file riêng biệt
│   ├── index.ts                # Khởi tạo Drizzle client
│   └── seed.ts                 # Dữ liệu mẫu 3 tháng liên tiếp, phòng, người thuê
├── i18n/                       # Cấu hình đa ngôn ngữ (next-intl)
│   ├── messages/vi.json        # Bản dịch Tiếng Việt (mặc định)
│   └── messages/en.json        # Bản dịch Tiếng Anh
└── lib/                        # Thư viện tiện ích dùng chung
    ├── env.ts                  # Validate biến môi trường qua Zod
    ├── money.ts                # Định dạng tiền tệ VND (`3.500.000 ₫`)
    ├── dates.ts                # Xử lý ngày tháng theo múi giờ `Asia/Ho_Chi_Minh`
    ├── audit.ts                # Ghi nhận nhật ký hoạt động (Audit Trail)
    ├── rate-limit.ts           # Giới hạn tần suất gọi thao tác (Rate limiting)
    └── session.ts              # Kiểm tra quyền hạn theo ngữ cảnh nhà trọ
```

---

## 4. Các Phân Hệ Tính Năng Chi Tiết

### 4.1. Tổng quan Kỳ Hiện Tại (Dashboard KPI)
- **Thống kê thời gian thực**: Số phòng cần ghi chỉ số, số phòng chưa thanh toán, số hóa đơn quá hạn, tổng tiền đã thu và tổng tiền còn phải thu trong kỳ.
- **Thẻ hành động nhanh**: Truy cập tức thì vào nhập chỉ số điện nước, tạo hóa đơn hàng loạt, thêm người thuê mới hoặc xem yêu cầu sửa chữa cần xử lý gấp.
- **Cảnh báo phòng trống**: Tự động thông báo danh sách các phòng đang để trống để chủ trọ kịp thời đăng tin tìm khách.

### 4.2. Quản Lý Phòng & Bàn Giao Thiết Bị
- **Sắp xếp theo Tầng / Dãy**: Hiển thị dạng lưới trực quan (Grid) hoặc danh sách (List), phân nhóm theo Tầng 1, Tầng 2...
- **Chuyển đổi trạng thái phòng**: Cho phép chuyển linh hoạt giữa *Đang cho thuê*, *Sẵn sàng đón khách (Trống)* và *Đang sửa chữa/Bảo trì*.
- **Quản lý trang thiết bị & Tài sản phòng**:
  - Theo dõi danh mục thiết bị trong từng phòng: Máy lạnh, Tủ lạnh, Giường nệm, Bình nóng lạnh, Bàn ghế... kèm giá trị và tình trạng sử dụng.
  - Tạo và in **Biên bản bàn giao tài sản** khi khách nhận phòng và đối soát khi trả phòng.

### 4.3. Quản Lý Bảng Giá Dịch Vụ & Phụ Phí
- **Danh mục dịch vụ phong phú**: Wi-Fi / Internet, Vệ sinh & Rác, Giữ xe máy, Máy giặt chung, Thang máy, Phí dịch vụ tòa nhà...
- **Hình thức thu linh hoạt**:
  - Thu cố định theo **Phòng / tháng** (ví dụ: Internet 100.000 ₫/phòng).
  - Thu theo **Người / tháng** (ví dụ: Rác & vệ sinh 30.000 ₫/người).
  - Thu theo **Lượt phát sinh** (ví dụ: Giữ xe 120.000 ₫/xe).
- **Tự động điền phụ phí**: Tự động áp dụng bảng giá dịch vụ vào hóa đơn hàng tháng của từng phòng dựa trên số lượng người ở thực tế.

### 4.4. Nhập Chỉ Số & Hóa Đơn Trả Sau
- **Mô hình Trả Sau**: Đầu tháng tính tiền phòng, tiền điện, nước và dịch vụ của tháng vừa qua.
- **Tính tiền phòng giữa tháng**: Tự động tính tiền phòng theo tỷ lệ số ngày thực tế khi khách bắt đầu thuê hoặc trả phòng giữa chừng.
- **Bottom Sheet nhập chỉ số**: Tự động hiển thị chỉ số cũ, tính tiền tức thì ngay khi gõ số (`85 số × 3.500 ₫ = 297.500 ₫`). Cảnh báo khi mức tiêu thụ tăng cao đột biến và hỗ trợ chức năng **"Thay đồng hồ"**.
- **Tạo hóa đơn hàng loạt (Batch Invoice Generation)**: Cho phép tạo và phát hành hóa đơn cho toàn bộ các phòng chỉ trong 1 thao tác.
- **Tờ hóa đơn tháng**:
  - Giao diện mô phỏng phiếu thu truyền thống với tem mộc con dấu (*Đã thu*, *Chưa thu*, *Quá hạn*).
  - Tối ưu in ấn (Print CSS) và chia sẻ nhanh qua tin nhắn, Zalo.
- **Ghi nhận thanh toán**: Hỗ trợ chuyển khoản ngân hàng, tiền mặt, thanh toán từng phần; nút **Hoàn tác (Undo)** trong 8 giây nếu bấm nhầm.

### 4.5. Quản Lý Khách Thuê & Hợp Đồng Thuê
- **Danh bạ khách thuê**: Lưu trữ họ tên, số điện thoại, số CCCD, ngày sinh, quê quán, phân loại đại diện phòng và thành viên ở cùng.
- **Bộ chọn ngày sinh tiện lợi**: Nhập nhanh bằng số `dd/mm/yyyy` kết hợp popover chọn nhanh năm sinh/tháng sinh.
- **Quét CCCD/CMND bằng OCR**: Tự động nhận diện thông tin cá nhân từ ảnh chụp mặt trước/mặt sau thẻ căn cước.
- **Xuất file Đăng ký Tạm trú**: Xuất danh sách khách thuê theo mẫu chuẩn gửi Công an khu vực (định dạng Excel/CSV bảo toàn đầu số 0 và số CCCD).
- **Quản lý hợp đồng**: Ký hợp đồng, quy định tiền đặt cọc, kỳ hạn đóng tiền, in **Văn bản Hợp đồng thuê nhà** chuẩn pháp lý.

### 4.6. Tiếp Nhận Phản Ánh & Báo Sửa Chữa
- **Phân loại phản ánh đa dạng**:
  - 🔊 *Tiếng ồn / Giờ giấc*: Hát hò karaoke, làm ồn quá khuya, tụ tập đông người.
  - 🗑️ *Vệ sinh / Rác thải*: Để rác trước cửa phòng, hành lang bẩn, mùi lạ.
  - 🛡️ *An ninh & Nội quy*: Quên khóa cửa cổng, đỗ xe lấn lối, người lạ ra vào.
  - 🔧 *Sửa chữa thiết bị*: Hỏng đèn, rò rỉ nước, máy lạnh, cống nghẹt.
  - 💬 *Góp ý & Khác*: Phản ánh chất lượng dịch vụ, Wi-Fi chập chờn.
- **Tính năng nâng cao**: Bộ gợi ý phản ánh nhanh, gắn cờ khẩn cấp (`Urgent`), chế độ gửi ẩn danh bảo mật danh tính người gửi.
- **Hộp thoại Xử lý & Phản hồi**: Chủ trọ cập nhật tiến độ (*Mới tiếp nhận* → *Đang xử lý* → *Đã hoàn tất* / *Từ chối*), ghi nhận chi phí sửa chữa và gửi phản hồi cho người thuê.

### 4.7. Báo Cáo Doanh Thu & Tài Chính
- **Thống kê doanh thu**: Tổng hợp doanh thu theo tháng, quý và năm.
- **Bóc tách nguồn thu & chi phí**: Phân tích tỷ trọng thu từ tiền phòng, tiền điện, tiền nước, dịch vụ phụ phí và chi phí bảo trì phát sinh.
- **Tỷ lệ lấp đầy**: Đánh giá hiệu suất khai thác phòng trống qua từng thời kỳ.

### 4.8. Cổng Người Thuê (Tenant Portal)
- Khi khách thuê đăng nhập, hệ thống tự động hiển thị không gian riêng của phòng mình.
- Xem chi tiết phòng, người ở cùng, hợp đồng và hóa đơn tháng.
- Gửi yêu cầu phản ánh / báo hỏng trực tiếp và theo dõi phản hồi giải quyết từ chủ trọ.

### 4.9. Tùy Biến Giao Diện & Đa Ngôn Ngữ
- **Chủ đề màu sắc (Theme Presets)**: Xanh Lá Mộc mạc, Xanh Đại dương, Cam Ấm cúng, Tím Hiện đại, Than Tối giản.
- Hỗ trợ chế độ Giao diện Sáng (Light Mode) và Giao diện Tối (Dark Mode) sắc nét.
- Song ngữ Tiếng Việt (mặc định) & Tiếng Anh (`next-intl`).

---

## 5. Quy Tắc Dữ Liệu & Nghiệp Vụ Cốt Lõi

1. **Phạm vi `propertyId`**: Mọi bảng dữ liệu nghiệp vụ đều có khóa ngoại `propertyId`. Mọi câu lệnh truy vấn, tạo mới, sửa đổi đều lọc bắt buộc theo `propertyId` để đảm bảo cô lập dữ liệu tuyệt đối giữa các nhà trọ.
2. **Tiền tệ chuẩn số nguyên VND**: Tiền lưu trữ kiểu `integer`/`bigint` (không dùng số thực `float` để loại bỏ hoàn toàn sai số làm tròn), định dạng hiển thị duy nhất qua `lib/money.ts`.
3. **Snapshot hóa đơn**: Khi phát hành hóa đơn, toàn bộ đơn giá điện, nước, phụ phí, tiền phòng và ngày hạn được lưu cố định vào bản ghi. Thay đổi cài đặt giá sau này không làm thay đổi các hóa đơn đã tạo.
4. **Múi giờ Việt Nam**: Thời gian lưu tại DB theo chuẩn UTC, mọi phép tính ngày tháng và hiển thị đều quy về múi giờ `Asia/Ho_Chi_Minh` (`lib/dates.ts`).
5. **Xóa mềm (Soft Delete)**: Các thực thể tài chính và pháp lý quan trọng (hợp đồng, hóa đơn, thanh toán, khách thuê) sử dụng `deletedAt` để bảo toàn lịch sử phục vụ kiểm toán và đối soát.

---

## 6. Hệ Thống Design Tokens & Giao Diện

Hệ thống token màu sắc tuân thủ quy chuẩn `docs/UX-UI.md`:

| Token | Tên màu | Mã Hex (Sáng) | Mã Hex (Tối) | Ứng dụng |
|---|---|---|---|---|
| `--color-giay` | Giấy | `#F5F8F6` | `#0F1A17` | Nền trang tổng thể |
| `--color-mat` | Mặt | `#FFFFFF` | `#16241F` | Nền thẻ, bảng, biểu mẫu, tờ hóa đơn |
| `--color-muc` | Mực | `#14231F` | `#E6EFEA` | Chữ chính, độ tương phản cao |
| `--color-muc-phu` | Mực phụ | `#4C5F59` | `#9FB4AC` | Chú thích, nhãn phụ, tiêu đề phụ |
| `--color-la` | Lá | `#1D6B57` | `#4FB596` | Màu nhận diện chính, nút bấm quan trọng |
| `--color-nghe` | Nghệ | `#D99A1E` | `#E8B04A` | Điểm nhấn chú ý (chờ thu, cần nhập số) |
| `--color-suong` | Sương | `#DCE5E0` | `#2A3B35` | Đường viền, đường phân cách |
| `--color-success` | Thành công | `#2E7D4F` | `#5FC283` | Đã thanh toán, hoàn thành |
| `--color-warning` | Cảnh báo | `#B7791F` | `#E0A94A` | Đang sửa chữa, nhắc nhở |
| `--color-danger` | Nguy hiểm | `#B42318` | `#F0776B` | Quá hạn, hủy bỏ, sự cố khẩn cấp |

---

## 7. Hướng Dẫn Cài Đặt & Khởi Chạy

### Yêu Cầu Hệ Thống
- **Node.js**: `>= 20.x` (khuyến nghị Node 22 hoặc 24 LTS).
- **pnpm**: `>= 9.x` (khuyến nghị `pnpm v11`). **Tuyệt đối không** dùng `npm` hoặc `yarn`.
- **Docker & Docker Compose**: Để chạy PostgreSQL container cục bộ (hoặc kết nối DB Postgres có sẵn).

### Các Bước Cài Đặt

#### 1. Cài đặt các gói phụ thuộc
```bash
pnpm install
```

#### 2. Thiết lập biến môi trường
Tạo tệp `.env` từ `.env.example`:
```bash
cp .env.example .env
```
Cấu hình mẫu trong `.env`:
```ini
DATABASE_URL=postgres://postgres:postgres@localhost:5433/thue_phong_tro
BETTER_AUTH_SECRET=chuoi-ngau-nhien-bao-mat-toi-thieu-32-ky-tu-123456
BETTER_AUTH_URL=http://localhost:3000
SEED_OWNER_EMAIL=chutro@example.com
SEED_OWNER_PASSWORD=chutro12345
```

#### 3. Khởi chạy cơ sở dữ liệu PostgreSQL
```bash
docker compose up -d
```
*(Cơ sở dữ liệu mặc định chạy trên cổng `5433` để không xung đột với các phiên bản Postgres khác trên máy)*.

#### 4. Áp dụng lược đồ cơ sở dữ liệu (Migration)
```bash
pnpm db:migrate
```

#### 5. Nạp dữ liệu mẫu ban đầu (Seed)
Nạp dữ liệu mẫu gồm 1 nhà trọ, danh sách phòng, khách thuê, hợp đồng và hóa đơn 3 tháng liên tiếp:
```bash
pnpm db:seed
```
- **Tài khoản Chủ trọ**: `chutro@example.com` / Mật khẩu: `chutro12345`
- **Tài khoản Khách thuê**: `nguyenvana@gmail.com` / Mật khẩu: `khach12345`

#### 6. Khởi chạy ứng dụng
```bash
pnpm dev
```
Truy cập ứng dụng tại `http://localhost:3000`.

#### 7. Kiểm tra chất lượng mã nguồn
Trước khi tạo commit hoặc Pull Request, chạy bộ lệnh kiểm tra:
```bash
pnpm lint        # Kiểm tra chuẩn mã nguồn bằng Biome
pnpm typecheck   # Kiểm tra kiểu dữ liệu TypeScript
pnpm test        # Chạy Unit Tests bằng Vitest
pnpm build       # Kiểm tra đóng gói Production Build (Turbopack)
```

---

## 8. Quy Trình Phát Triển Git (Git Flow)

Dự án áp dụng mô hình phân nhánh và commit chuẩn mực theo Git Flow:

- **`main`**: Nhánh production chính thức, chỉ chứa mã nguồn ổn định tuyệt đối.
- **`dev`**: Nhánh phát triển trung tâm. Tất cả tính năng và bản sửa lỗi đều bắt đầu từ `dev` và hợp nhất trở lại `dev`.
- **Nhánh nhiệm vụ**:
  - `feature/<tên-tính-năng>`: Phát triển tính năng mới.
  - `fix/<tên-lỗi>`: Sửa lỗi phát sinh.
  - `chore/<tác-vụ>`: Cấu hình, nâng cấp thư viện.
  - `docs/<tài-liệu>`: Cập nhật tài liệu hướng dẫn.

### Chu Trình Làm Việc Tiêu Chuẩn:
```bash
# 1. Lấy mã nguồn mới nhất từ dev
git checkout dev
git pull origin dev

# 2. Tạo nhánh tính năng
git checkout -b feat/ten-tinh-nang-moi

# 3. Lập trình và kiểm tra chất lượng
pnpm lint ; pnpm typecheck ; pnpm test

# 4. Commit với thông điệp Tiếng Việt rõ ràng
git add .
git commit -m "feat(module): mô tả ngắn gọn công việc bằng tiếng Việt có dấu"

# 5. Hợp nhất vào dev
git checkout dev
git merge --no-ff feat/ten-tinh-nang-moi -m "merge: tích hợp feat/ten-tinh-nang-moi vào dev"

# 6. Đẩy lên repository
git push origin dev
```
