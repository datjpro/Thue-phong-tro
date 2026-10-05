# AGENTS.md

Hướng dẫn cho AI coding agent (Claude Code, Codex, Cursor, Copilot...) khi làm việc trong repo này. Đọc hết file này trước khi viết code. Với mọi việc liên quan giao diện, **đọc thêm `docs/UX-UI.md`**.

## 1. Dự án là gì

Web app **quản lý phòng trọ**. Giai đoạn đầu phục vụ **1 phòng**, nhưng kiến trúc và dữ liệu phải sẵn sàng cho **nhiều phòng, nhiều nhà trọ** mà không phải viết lại.

Người dùng chính: chủ trọ (thường dùng điện thoại, nhập chỉ số điện nước tại phòng). Về sau có thể thêm quản lý và người thuê.

Nghiệp vụ cốt lõi: phòng, người thuê, hợp đồng, chỉ số điện nước, hóa đơn hàng tháng, thanh toán, báo sửa chữa.

## 2. Stack

- Next.js (App Router) + React + TypeScript (strict)
- Tailwind CSS v4 + shadcn/ui
- PostgreSQL + Drizzle ORM (`drizzle-kit` cho migration)
- Better Auth
- Zod (validate mọi dữ liệu vào), React Hook Form
- TanStack Query (chỉ khi thật sự cần client state)
- next-intl (VI mặc định, EN)
- Vitest (unit) + Playwright (e2e)
- Biome (lint + format)

## 3. Package manager: chỉ dùng pnpm

- Luôn dùng `pnpm`. **Không** chạy `npm install`, `yarn`, `npx`. Dùng `pnpm dlx` thay cho `npx`.
- Không tạo hoặc commit `package-lock.json` / `yarn.lock`. Chỉ `pnpm-lock.yaml`.
- Thêm dependency: `pnpm add <pkg>` / `pnpm add -D <pkg>`. Ghim phiên bản rõ ràng khi có thể.
- Trước khi thêm thư viện mới, kiểm tra xem stack hiện tại đã làm được chưa.

## 4. Lệnh thường dùng

```bash
pnpm install            # cài dependency
pnpm dev                # chạy dev server
pnpm build              # build production
pnpm lint               # Biome check
pnpm typecheck          # tsc --noEmit
pnpm test               # Vitest
pnpm test:e2e           # Playwright
pnpm db:generate        # drizzle-kit generate (tạo migration)
pnpm db:migrate         # áp dụng migration
pnpm db:seed            # seed 1 nhà trọ + 1 phòng mẫu
pnpm db:studio          # Drizzle Studio
```

Trước khi báo hoàn thành một thay đổi: `pnpm lint && pnpm typecheck && pnpm test` phải xanh.

## 5. Cấu trúc thư mục

```
src/
├── app/                # routing, layout, page (mỏng, chỉ ghép feature)
│   ├── (auth)/
│   └── (dashboard)/    # rooms, tenants, contracts, utilities, invoices, payments, maintenance, settings
├── features/           # logic theo nghiệp vụ, mỗi feature tự chứa
│   └── <feature>/      # actions.ts, queries.ts, schemas.ts, components/
├── components/
│   ├── ui/             # shadcn/ui (hạn chế sửa trực tiếp)
│   └── shared/         # DataTable, PageHeader, EmptyState...
├── db/
│   ├── schema/         # mỗi bảng một file
│   └── seed.ts
├── lib/                # auth, env, money, utils
└── i18n/
```

Quy tắc đặt code:

- `app/` chỉ chứa routing và ghép giao diện. Logic nghiệp vụ nằm trong `features/`.
- Một feature không import nội bộ của feature khác. Cần dùng chung thì đưa lên `lib/` hoặc `components/shared/`.
- Component dùng ở 2 feature trở lên mới được chuyển sang `components/shared/`.

## 6. Quy tắc dữ liệu (quan trọng nhất để mở rộng)

1. **Mọi bảng nghiệp vụ đều có `propertyId`** và mọi query phải lọc theo nó. Không có query nào "lấy tất cả phòng" mà thiếu phạm vi `propertyId`.
2. Dù chỉ có 1 phòng, **không hard-code** tên phòng, ID phòng hay giả định "chỉ có một phòng" trong logic. Giao diện 1 phòng chỉ là cách hiển thị (ví dụ redirect `/rooms` sang chi tiết phòng khi chỉ có 1 phòng).
3. **Tiền là số nguyên VND** (kiểu `integer`/`bigint`), không dùng float. Định dạng hiển thị đi qua `lib/money.ts`.
4. **Hóa đơn lưu snapshot** các khoản (tiền phòng, đơn giá điện, đơn giá nước, phí khác) tại thời điểm tạo. Đổi giá sau này không được làm thay đổi hóa đơn cũ.
5. Quan hệ: `properties → rooms → contracts ↔ tenants`, `contracts → invoices → payments`, `rooms → meter_readings`, `rooms → maintenance_requests`. Một phòng có nhiều hợp đồng theo thời gian.
6. Thời gian lưu UTC, hiển thị theo múi giờ `Asia/Ho_Chi_Minh`.
7. Mọi thay đổi schema đi qua migration của Drizzle. Không sửa DB bằng tay, không sửa migration đã áp dụng.
8. Xóa mềm (`deletedAt`) cho dữ liệu có liên quan tài chính (hợp đồng, hóa đơn, thanh toán).

## 7. Quy ước code

- TypeScript strict. Không dùng `any`; nếu bắt buộc, ghi chú lý do.
- Ưu tiên **Server Components** và **Server Actions**. Chỉ thêm `"use client"` khi cần state, effect hoặc API trình duyệt.
- Mọi Server Action: kiểm tra đăng nhập → kiểm tra quyền trên `propertyId` → validate bằng Zod → thao tác DB → `revalidatePath`/`revalidateTag`. Trả về kiểu kết quả rõ ràng (`{ ok: true, data } | { ok: false, error }`), không ném lỗi thô ra giao diện.
- Zod schema đặt trong `features/<x>/schemas.ts` và dùng chung cho form lẫn server.
- Biến môi trường đi qua `lib/env.ts` (validate bằng Zod). Không dùng `process.env` rải rác.
- Không commit secret. Cập nhật `.env.example` khi thêm biến mới.
- Tên file: `kebab-case`. Component: `PascalCase`. Hàm/biến: `camelCase`. Bảng DB: `snake_case`.
- Chuỗi hiển thị cho người dùng đặt trong `i18n/messages/{vi,en}.json`, không hard-code trong JSX.
- Comment giải thích **vì sao**, không lặp lại code đang làm gì.

## 8. Giao diện

- Mọi UI tuân theo `docs/UX-UI.md` (token màu, typography, bố cục, copy, trạng thái, accessibility).
- Dùng component shadcn/ui làm nền, tùy biến qua design token, không hard-code màu hay khoảng cách.
- Mobile-first: mọi màn hình phải dùng được trên điện thoại trước.

## 9. Testing

- Logic tính toán (đặc biệt `features/invoices/calculate.ts`) phải có unit test: điện nước, tiền thừa/thiếu, làm tròn, tháng đầu/tháng cuối của hợp đồng.
- Luồng chính có e2e test: đăng nhập → nhập chỉ số → tạo hóa đơn → ghi nhận thanh toán.
- Sửa bug thì thêm test tái hiện bug trước.

## 10. Git và PR

- Commit theo Conventional Commits (`feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`).
- Mỗi PR một mục đích, kèm mô tả ngắn và ảnh chụp màn hình nếu thay đổi giao diện.
- Không push thẳng lên `main`.

## 11. Cách làm việc của agent

- Với yêu cầu mơ hồ hoặc ảnh hưởng schema, **hỏi lại trước** khi làm.
- Thay đổi nhỏ, tập trung vào đúng yêu cầu; không refactor lan man.
- Cần đổi schema thì nêu rõ tác động tới dữ liệu hiện có và cách migrate.
- Khi không chắc API của thư viện mới nhất, đọc tài liệu chính thức thay vì đoán theo trí nhớ.
- Nếu một quy tắc trong file này cản trở công việc, nêu rõ và đề xuất sửa file này thay vì lặng lẽ bỏ qua.

## 12. Lộ trình (để biết điều gì sắp tới)

1. **MVP (1 phòng)**: auth, seed 1 phòng, nhập điện nước, tạo hóa đơn tháng, ghi nhận thanh toán, lịch sử.
2. **Mở rộng nhẹ**: nhiều người thuê, hợp đồng, báo sửa chữa, xuất PDF, nhắc đóng tiền.
3. **Nhiều phòng / nhiều nhà trọ**: danh sách phòng, dashboard tổng hợp, phân quyền.
4. **Nâng cao**: tách monorepo bằng pnpm workspaces (`apps/web`, `packages/db`, `packages/ui`) nếu thêm app mobile hoặc cổng người thuê.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
