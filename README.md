# Hệ Thống Quản Lý Cho Thuê Phòng Trọ

Ứng dụng web hiện đại, tinh gọn phục vụ **quản lý phòng trọ**, thiết kế theo triết lý **sổ sách gọn gàng của một nhà trọ được chăm sóc kỹ lưỡng**: sạch sẽ, ấm áp, đáng tin cậy và tối ưu trải nghiệm cho chủ trọ thao tác một tay trên điện thoại di động ngay tại phòng.

Hệ thống được thiết kế theo kiến trúc module hóa: giai đoạn đầu phục vụ hoàn hảo cho mô hình **1 phòng**, nhưng toàn bộ lược đồ dữ liệu và logic nghiệp vụ đã sẵn sàng mở rộng cho **nhiều phòng, nhiều nhà trọ** mà không cần cấu trúc lại mã nguồn.

---

## Mục Lục

1. [Điểm Nhấn và Triết Lý Thiết Kế](#1-điểm-nhấn-và-triết-lý-thiết-kế)
2. [Ngăn Xếp Công Nghệ (Tech Stack)](#2-ngăn-xếp-công-nghệ-tech-stack)
3. [Cấu Trúc Thư Mục](#3-cấu-trúc-thư-mục)
4. [Các Tính Năng Chính](#4-các-tính-năng-chính)
5. [Quy Tắc Dữ Liệu và Nghiệp Vụ Cốt Lõi](#5-quy-tắc-dữ-liệu-và-nghiệp-vụ-cốt-lõi)
6. [Thiết Kế UI/UX và Design Tokens](#6-thiết-kế-uiux-và-design-tokens)
7. [Hướng Dẫn Cài Đặt và Khởi Chạy](#7-hướng-dẫn-cài-đặt-và-khởi-chạy)
8. [Quy Trình Phát Triển Git và Quản Lý Nhánh (Git Flow)](#8-quy-trình-phát-triển-git-và-quản-lý-nhánh-git-flow)

---

## 1. Điểm Nhấn và Triết Lý Thiết Kế

- **Tháng này là trung tâm**: Màn hình đầu tiên trả lời ngay: tháng này đã ghi điện nước chưa, hóa đơn đã gửi chưa, ai đã đóng tiền, ai chưa đóng.
- **Mobile-first, thao tác một tay**: Vùng tương tác và nút bấm chính đặt trong tầm với ngón cái (chiều cao tối thiểu 44–48px). Các ô nhập số tự động kích hoạt bàn phím số (`inputMode="numeric"`).
- **Tờ hóa đơn tháng - Điểm chạm cảm xúc**: Thiết kế độc bản mô phỏng hóa đơn giấy truyền thống với đường kẻ chấm, con dấu trạng thái (*Đã thu*, *Chưa thu*, *Quá hạn*), hỗ trợ in ấn trực tiếp hoặc xuất PDF.
- **1 phòng hay nhiều phòng, chung một trải nghiệm**: Với 1 phòng, hệ thống tự động chuyển hướng mượt mà đến chi tiết phòng; khi thêm phòng mới, giao diện chuyển sang danh sách quản trị mà người dùng không cần học lại cách sử dụng.
- **Bảo toàn dữ liệu tài chính**: Toàn bộ đơn giá, số điện nước và phụ phí được lưu **snapshot** tại thời điểm chốt hóa đơn. Thay đổi giá trong tương lai tuyệt đối không làm ảnh hưởng hóa đơn các tháng trước.

---

## 2. Ngăn Xếp Công Nghệ (Tech Stack)

| Thành phần | Công nghệ / Thư viện | Mục đích |
|---|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) | Server Components, Server Actions, Dynamic Rendering |
| **Giao diện** | React 19, Tailwind CSS v4, Radix UI | Hệ thống design token tùy biến, accessible headless primitives |
| **Cơ sở dữ liệu** | PostgreSQL 17 + Drizzle ORM | Truy vấn an toàn kiểu (type-safe), migration tự động qua `drizzle-kit` |
| **Xác thực** | Better Auth | Quản lý phiên, bảo mật tài khoản chủ trọ |
| **Validation** | Zod v4, React Hook Form | Xác thực dữ liệu 2 chiều (Client form + Server Action) |
| **Đa ngôn ngữ** | next-intl | Hỗ trợ song ngữ Tiếng Việt (mặc định) và Tiếng Anh |
| **Thông báo** | Sonner | Thông báo toast phản hồi tức thì, hỗ trợ nút "Hoàn tác" (Undo) |
| **Icons** | Lucide React | Bộ biểu tượng nét mảnh, kích thước chuẩn 16/20/24 |
| **Kiểm thử** | Vitest, Playwright | Unit test thuật toán tính tiền điện nước, kiểm thử E2E |
| **Linter & Formatter** | Biome | Kiểm tra cú pháp và định dạng mã nguồn siêu tốc |
| **Gói & Môi trường** | pnpm 11, Docker Compose | Quản lý dependency chặt chẽ, khởi chạy DB cục bộ |

---

## 3. Cấu Trúc Thư Mục

```text
src/
├── app/                        # Next.js App Router (Layouts, Routing)
│   ├── (auth)/login/           # Màn hình đăng nhập tài khoản chủ trọ
│   ├── (dashboard)/            # Không gian quản trị chính
│   │   ├── page.tsx            # Tổng quan tháng hiện tại (Dashboard KPI)
│   │   ├── rooms/              # Danh sách phòng & tạo phòng mới
│   │   ├── rooms/[id]/         # Chi tiết phòng, nhập chỉ số, lịch sử hóa đơn
│   │   ├── invoices/           # Danh sách và chi tiết hóa đơn, ghi nhận thanh toán
│   │   ├── tenants/            # Danh bạ người thuê phòng
│   │   ├── contracts/          # Hợp đồng thuê phòng, kết thúc hợp đồng
│   │   ├── maintenance/        # Yêu cầu bảo trì, sửa chữa thiết bị
│   │   ├── settings/           # Cài đặt giá điện nước mặc định, ngày hạn
│   │   └── more/               # Menu mở rộng trên điện thoại (ngôn ngữ, giao diện, đăng xuất)
│   ├── api/auth/[...all]/      # Route API xác thực Better Auth
│   ├── globals.css             # Design tokens Tailwind CSS v4 (Light/Dark mode)
│   └── layout.tsx              # Root Layout kết hợp phông chữ Be Vietnam Pro
├── features/                   # Mô-đun nghiệp vụ độc lập
│   ├── rooms/                  # Actions, queries, schemas, components quản lý phòng
│   ├── tenants/                # Actions, queries, schemas quản lý người thuê
│   ├── contracts/              # Nghiệp vụ ký và kết thúc hợp đồng thuê
│   ├── invoices/               # Thuật toán tính tiền, nhập chỉ số, thanh toán
│   ├── maintenance/            # Tiếp nhận và cập nhật tiến độ sửa chữa
│   └── settings/               # Cập nhật thông số nhà trọ
├── components/                 # Các thành phần tái sử dụng
│   ├── ui/                     # Button, Input, Sheet, Label cơ bản
│   └── shared/                 # InvoiceSheet, StatusBadge, NumberInput, Field, AppNav...
├── db/                         # Dữ liệu & Cơ sở dữ liệu
│   ├── index.ts                # Khởi tạo kết nối Drizzle client
│   ├── schema/                 # Lược đồ quan hệ từng bảng (PostgreSQL)
│   └── seed.ts                 # Script khởi tạo 1 nhà trọ + 1 phòng mẫu + chủ trọ
├── i18n/                       # Cấu hình đa ngôn ngữ (next-intl)
│   ├── messages/vi.json        # Bản dịch Tiếng Việt (chính)
│   ├── messages/en.json        # Bản dịch Tiếng Anh
│   └── request.ts              # Loader thông điệp theo phiên người dùng
└── lib/                        # Thư viện tiện ích dùng chung
    ├── env.ts                  # Kiểm tra biến môi trường qua Zod
    ├── money.ts                # Định dạng tiền tệ VND (`3.397.500 ₫`)
    ├── dates.ts                # Xử lý ngày tháng theo múi giờ `Asia/Ho_Chi_Minh`
    ├── session.ts              # Bảo vệ Server Action theo ngữ cảnh nhà trọ
    └── use-submit.ts           # Hook xử lý gửi biểu mẫu kèm phản hồi Toast
```

---

## 4. Các Tính Năng Chính

### 4.1. Tổng Quan Kỳ Hiện Tại (Dashboard KPI)
- Thống kê thời gian thực: số phòng cần ghi chỉ số, số phòng chưa đóng tiền, số hóa đơn quá hạn, tổng số tiền còn phải thu.
- Tự động cảnh báo các phòng đang trống để chủ trọ kịp thời đăng tin tìm người thuê.

### 4.2. Nhập Chỉ Số Điện Nước & Tự Động Tạo Hóa Đơn
- Bảng trượt (Bottom Sheet) trên di động: tự động điền và khóa chỉ số cũ kỳ trước.
- **Tính tiền tức thì**: hiển thị công thức ngay khi gõ phím (`85 số × 3.500 ₫ = 297.500 ₫`).
- Cảnh báo trực quan nếu mức tiêu thụ tăng cao đột biến hoặc chỉ số mới nhỏ hơn chỉ số cũ.
- Tích hợp chế độ **"Thay đồng hồ"** cho phép đặt lại số cũ linh hoạt.
- Tự động lưu bản nháp cục bộ (Local Draft) tránh mất dữ liệu khi mất mạng hoặc vô tình tắt trình duyệt.

### 4.3. Tờ Hóa Đơn Tháng & Ghi Nhận Thanh Toán
- Hiển thị hóa đơn chuẩn mực, rõ ràng từng hạng mục: tiền phòng, tiền điện, tiền nước, phụ phí kèm giải trình.
- Đóng dấu trạng thái: **Chưa thu** (vàng nghệ), **Đã thu** (xanh lá cây với hiệu ứng đóng dấu đóng mộc sống động), **Quá hạn** (đỏ cảnh báo).
- Hỗ trợ in ấn (Print CSS) ẩn các thanh điều hướng để in ra giấy hoặc lưu tệp PDF gửi khách thuê.
- Ghi nhận thanh toán: tự động gợi ý số tiền còn thiếu, hỗ trợ trả từng phần, chọn hình thức tiền mặt hoặc chuyển khoản.
- Nút **Hoàn tác (Undo)** nhanh trong 8 giây nếu lỡ ghi nhận nhầm.

### 4.4. Quản Lý Người Thuê & Hợp Đồng
- Lưu trữ danh bạ người thuê: họ tên, số điện thoại, số định danh CCCD.
- Ký hợp đồng gắn nhiều người thuê vào cùng một phòng, xác định người đại diện ký kết.
- Tự động tính tiền phòng theo tỷ lệ số ngày thực tế đối với tháng nhận phòng hoặc tháng trả phòng giữa chừng.
- Kết thúc hợp đồng đưa phòng về trạng thái còn trống và lưu trữ lịch sử thuê.

### 4.5. Báo Hỏng & Yêu Cầu Sửa Chữa
- Ghi nhận hỏng hóc từ người thuê theo từng phòng (máy lạnh, vòi nước, bóng đèn...).
- Cập nhật tiến độ theo 3 trạng thái: *Mới báo* → *Đang xử lý* → *Đã xong*.

### 4.6. Cài Đặt Nhà Trọ & Đa Ngôn Ngữ
- Tùy chỉnh đơn giá điện (`₫/số`), đơn giá nước (`₫/khối`), ngày đến hạn thanh toán trong tháng.
- Chuyển đổi ngôn ngữ Tiếng Việt / Tiếng Anh linh hoạt.
- Chế độ hiển thị Giao diện Sáng (Light Mode) / Giao diện Tối (Dark Mode) được căn chỉnh màu sắc cẩn thận.

---

## 5. Quy Tắc Dữ Liệu và Nghiệp Vụ Cốt Lõi

1. **Phạm vi `propertyId`**: Mọi bảng dữ liệu nghiệp vụ đều sở hữu khóa ngoại `propertyId`. Mọi thao tác truy vấn, cập nhật đều kiểm tra quyền hạn của tài khoản trên nhà trọ tương ứng.
2. **Tiền tệ chuẩn số nguyên**: Tiền VND lưu trữ dưới dạng số nguyên (`integer`), tuyệt đối không dùng số thực `float` để loại trừ hoàn toàn sai số làm tròn. Hiển thị qua hàm tập trung `formatMoney()`.
3. **Snapshot hóa đơn**: Khi hóa đơn được phát hành, toàn bộ đơn giá điện, nước, ngày hạn và tiền phòng được cố định vĩnh viễn vào bản ghi hóa đơn đó.
4. **Múi giờ Việt Nam**: Thời gian lưu trữ tại DB theo chuẩn UTC, khi tính toán và hiển thị cho người dùng luôn quy chiếu theo múi giờ `Asia/Ho_Chi_Minh` (`lib/dates.ts`).
5. **Xóa mềm (Soft Delete)**: Các bản ghi liên quan trực tiếp đến lịch sử tài chính (người thuê, hợp đồng, hóa đơn, thanh toán) sử dụng trường `deletedAt` để bảo toàn dữ liệu phục vụ đối soát.

---

## 6. Thiết Kế UI/UX và Design Tokens

Hệ thống token màu sắc tuân thủ quy chuẩn `docs/UX-UI.md`:

| Token | Tên màu | Mã Hex (Sáng) | Mã Hex (Tối) | Ứng dụng |
|---|---|---|---|---|
| `--color-giay` | Giấy | `#F5F8F6` | `#0F1A17` | Nền trang tổng thể |
| `--color-mat` | Mặt | `#FFFFFF` | `#16241F` | Nền bảng, panel form, tờ hóa đơn |
| `--color-muc` | Mực | `#14231F` | `#E6EFEA` | Màu chữ chính, độ tương phản cao |
| `--color-muc-phu` | Mực phụ | `#4C5F59` | `#9FB4AC` | Chú thích, tiêu đề cột |
| `--color-la` | Lá | `#1D6B57` | `#4FB596` | Màu nhận diện thương hiệu, nút hành động chính |
| `--color-nghe` | Nghệ | `#D99A1E` | `#E8B04A` | Điểm nhấn cần chú ý (sắp đến hạn, cần nhập) |
| `--color-suong` | Sương | `#DCE5E0` | `#2A3B35` | Đường viền, đường phân tách |
| `--color-success` | Thành công | `#2E7D4F` | `#5FC283` | Đã thanh toán, hoàn thành |
| `--color-warning` | Cảnh báo | `#B7791F` | `#E0A94A` | Thiếu dữ liệu, đang bảo trì |
| `--color-danger` | Nguy hiểm | `#B42318` | `#F0776B` | Quá hạn, báo lỗi, hủy bỏ |

---

## 7. Hướng Dẫn Cài Đặt và Khởi Chạy

### Yêu Cầu Môi Trường
- **Node.js**: phiên bản `>= 20.x` (đã kiểm thử tương thích tốt với Node 24).
- **pnpm**: phiên bản `>= 9.x` (khuyến nghị `pnpm v11`). **Không** sử dụng `npm` hoặc `yarn`.
- **Docker & Docker Compose**: dùng để chạy PostgreSQL container cục bộ (hoặc có sẵn cơ sở dữ liệu PostgreSQL từ xa).

### Các Bước Thực Hiện

#### 1. Cài đặt các gói phụ thuộc
```bash
pnpm install
```

#### 2. Cấu hình biến môi trường
Tạo tệp `.env` dựa trên `.env.example`:
```bash
cp .env.example .env
```
Các thông số cấu hình chính trong `.env`:
```ini
DATABASE_URL=postgres://postgres:postgres@localhost:5433/thue_phong_tro
BETTER_AUTH_SECRET=chuoi-ngau-nhien-bao-mat-toi-thieu-32-ky-tu-123456
BETTER_AUTH_URL=http://localhost:3000
SEED_OWNER_EMAIL=chutro@example.com
SEED_OWNER_PASSWORD=chutro12345
```

#### 3. Khởi chạy cơ sở dữ liệu PostgreSQL
Khởi động container qua Docker Compose:
```bash
docker compose up -d
```
*(Cổng mặc định của cơ sở dữ liệu được cấu hình là `5433` để tránh trùng lặp với các dịch vụ Postgres mặc định khác trên máy)*.

#### 4. Áp dụng lược đồ cơ sở dữ liệu (Migration)
```bash
pnpm db:migrate
```

#### 5. Khởi tạo dữ liệu mẫu ban đầu (Seed)
Tạo sẵn tài khoản chủ trọ, 1 nhà trọ và 1 phòng mẫu (`Phòng 101`):
```bash
pnpm db:seed
```
- **Tài khoản đăng nhập**: `chutro@example.com`
- **Mật khẩu**: `chutro12345`

#### 6. Khởi động môi trường phát triển
```bash
pnpm dev
```
Mở trình duyệt tại địa chỉ: `http://localhost:3000` và đăng nhập bằng tài khoản mẫu trên.

#### 7. Các lệnh kiểm tra chất lượng mã nguồn
Trước khi thực hiện commit hoặc tạo Pull Request, toàn bộ các kiểm tra sau phải vượt qua thành công:
```bash
pnpm lint        # Kiểm tra quy chuẩn mã nguồn với Biome
pnpm typecheck   # Kiểm tra kiểu dữ liệu với TypeScript compiler
pnpm test        # Chạy toàn bộ Unit Tests với Vitest
pnpm build       # Kiểm tra quá trình đóng gói production build của Next.js
```

---

## 8. Quy Trình Phát Triển Git và Quản Lý Nhánh (Git Flow)

Dự án áp dụng mô hình phân nhánh và commit chuẩn mực theo phương pháp Git Flow chuyên nghiệp:

### 8.1. Các Nhánh Chính
- **`main`**: Nhánh nguồn sự thật, chỉ chứa mã nguồn ổn định, đã qua kiểm thử và sẵn sàng cho môi trường production. Tuyệt đối không commit trực tiếp lên `main`.
- **`dev`**: Nhánh phát triển trung tâm. Mọi tính năng, sửa lỗi đều xuất phát từ `dev` và hợp nhất (merge) trở lại vào `dev`.

### 8.2. Quy Tắc Tạo Nhánh Theo Nhiệm Vụ (Task Branches)
Mỗi khi bắt đầu một nhiệm vụ, tạo nhánh mới xuất phát từ nhánh `dev` theo tiền tố định danh:
- `feature/<tên-nhiệm-vụ>`: Phát triển tính năng mới (ví dụ: `feature/nhap-chi-so-hoa-don`).
- `fix/<tên-nhiệm-vụ>`: Sửa chữa lỗi phát sinh (ví dụ: `fix/tinh-sai-so-ngay-thang-2`).
- `chore/<tên-nhiệm-vụ>`: Cấu hình hệ thống, dọn dẹp thư viện, nâng cấp phụ thuộc.
- `docs/<tên-nhiệm-vụ>`: Cập nhật tài liệu, hướng dẫn sử dụng.
- `refactor/<tên-nhiệm-vụ>`: Tái cấu trúc mã nguồn mà không làm thay đổi hành vi nghiệp vụ.

### 8.3. Quy Chuẩn Commit Bằng Tiếng Việt Có Dấu
Thông điệp commit phải viết bằng **Tiếng Việt có dấu**, tuân theo cấu trúc Conventional Commits:

```text
<loại-commit>: <mô tả ngắn gọn hành động bằng tiếng Việt có dấu>

[Tùy chọn: nội dung chi tiết lý do và ngữ cảnh thay đổi]
```

**Ví dụ:**
- `feat: thiết kế cơ sở dữ liệu và migration hệ thống`
- `feat: xây dựng thuật toán tính tiền điện nước và kiểm thử đơn vị`
- `feat: xây dựng thành phần giao diện tờ hóa đơn và chức năng in`
- `fix: sửa lỗi tính tiền phòng cho hợp đồng bắt đầu giữa tháng`
- `docs: bổ sung tài liệu hướng dẫn readme chi tiết và quy trình git flow`

### 8.4. Chu Trình Phát Triển 1 Nhiệm Vụ Chuẩn
1. Chuyển về nhánh `dev` và lấy mã nguồn mới nhất:
   ```bash
   git checkout dev
   git pull origin dev
   ```
2. Tạo nhánh nhiệm vụ mới:
   ```bash
   git checkout -b feature/ten-nhiệm-vụ-moi
   ```
3. Lập trình và kiểm thử cục bộ (`pnpm lint && pnpm typecheck && pnpm test`).
4. Commit với thông điệp Tiếng Việt rõ ràng:
   ```bash
   git add .
   git commit -m "feat: mô tả chi tiết công việc đã thực hiện"
   ```
5. Chuyển về `dev` và hợp nhất nhánh nhiệm vụ:
   ```bash
   git checkout dev
   git merge --no-ff feature/ten-nhiệm-vụ-moi -m "merge: tích hợp nhánh feature/ten-nhiệm-vụ-moi vào dev"
   ```
6. Khi tích hợp đủ tính năng cho một bản phát hành, hợp nhất `dev` vào `main`:
   ```bash
   git checkout main
   git merge --no-ff dev -m "release: phát hành phiên bản quản lý phòng trọ giai đoạn 1"
   ```
