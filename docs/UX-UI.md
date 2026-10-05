# UX/UI Guidelines

Tài liệu này là nguồn sự thật cho mọi quyết định giao diện. Agent và dev phải đọc trước khi tạo hoặc sửa UI. Nếu cần phá quy tắc, ghi lý do trong PR và cập nhật tài liệu này.

## 1. Bối cảnh thiết kế

- **Sản phẩm**: web app quản lý phòng trọ. Bắt đầu 1 phòng, mở rộng nhiều phòng / nhiều nhà trọ.
- **Người dùng chính**: chủ trọ, thường đứng ngay tại phòng, cầm điện thoại, nhập chỉ số điện nước và xem ai đã đóng tiền chưa. Không phải dân kỹ thuật.
- **Việc quan trọng nhất**: mỗi tháng, ghi chỉ số → ra hóa đơn → biết ai đã trả, ai chưa. Mọi thứ khác phục vụ vòng lặp này.
- **Ngôn ngữ**: tiếng Việt là mặc định, có bản tiếng Anh.

## 2. Nguyên tắc

1. **Tháng này là trung tâm.** Màn hình đầu tiên trả lời ngay: tháng này đã nhập điện nước chưa, hóa đơn đã gửi chưa, đã thu chưa.
2. **Mobile-first, một tay.** Nút hành động chính nằm trong tầm ngón cái. Ô nhập số dùng bàn phím số.
3. **Số liệu là nhân vật chính.** Tiền và chỉ số điện nước phải dễ đọc nhất trên màn hình: kích thước lớn, căn thẳng cột, không bị trang trí che.
4. **Một phòng hay nhiều phòng, cùng một ngôn ngữ.** Giao diện 1 phòng không phải bản "rút gọn" mà là cùng bố cục với danh sách có đúng một mục. Thêm phòng không làm người dùng phải học lại.
5. **Giảm việc phải gõ.** Tự điền chỉ số cũ, đơn giá, kỳ hóa đơn. Người dùng chỉ nhập cái thay đổi.
6. **Màu truyền đạt trạng thái, không trang trí.** Màu chỉ xuất hiện khi nó có nghĩa (đã trả, sắp đến hạn, quá hạn). Phần còn lại giữ yên tĩnh.
7. **Không có dark pattern.** Xóa và hành động không hoàn tác phải xác nhận rõ, nêu hậu quả.

## 3. Hướng thị giác

Cảm giác: **sổ sách gọn gàng của một nhà trọ được chăm kỹ**: sạch, đáng tin, ấm vừa phải. Không phải dashboard SaaS xám xanh, không phải giao diện "tài chính" lạnh lùng.

Một điểm nhớ duy nhất: **Tờ hóa đơn tháng** (xem mục 7.1). Đây là thành phần được đầu tư thiết kế nhất. Mọi thứ xung quanh giữ tiết chế.

Tránh những lựa chọn mặc định thường gặp:

- Nền kem + serif + màu đất nung.
- Nền đen + một màu xanh/đỏ chói.
- Chia nội dung thành các thẻ bo góc giống hệt nhau, cùng một bóng mờ xám, nền gradient trang trí.
- Nhãn IN HOA giãn chữ phía trên mỗi tiêu đề, chuỗi nối bằng dấu chấm giữa (`A · B · C`), mũi tên `→` cuối mọi nút.
- Nhấn một từ trong tiêu đề bằng màu khác hoặc in nghiêng.

## 4. Design tokens

### 4.1 Màu

| Tên | Hex | Vai trò |
|---|---|---|
| Giấy | `#F5F8F6` | Nền trang |
| Mặt | `#FFFFFF` | Nền bảng, form, tờ hóa đơn |
| Mực | `#14231F` | Chữ chính |
| Lá | `#1D6B57` | Màu thương hiệu, nút chính, liên kết |
| Nghệ | `#D99A1E` | Điểm nhấn chú ý (sắp đến hạn, cần nhập) |
| Sương | `#DCE5E0` | Viền, đường phân cách, nền phụ |

Màu trạng thái (luôn đi kèm biểu tượng hoặc chữ, không dùng màu một mình):

| Trạng thái | Màu | Dùng cho |
|---|---|---|
| Thành công | `#2E7D4F` | Đã thanh toán |
| Cảnh báo | `#B7791F` | Sắp đến hạn, thiếu dữ liệu |
| Nguy hiểm | `#B42318` | Quá hạn, lỗi, xóa |
| Thông tin | `#2563A8` | Ghi chú, gợi ý |

Chữ phụ dùng `Mực` giảm độ đậm (`#4C5F59`), phải đạt tương phản tối thiểu 4.5:1 trên nền.

**Dark mode**: bắt buộc có. Nền `#0F1A17`, mặt `#16241F`, chữ `#E6EFEA`, Lá sáng lên thành `#4FB596`. Không đảo màu tự động; chỉnh tay từng token.

### 4.2 Typography

- **Một họ chữ: Be Vietnam Pro** (thiết kế riêng cho tiếng Việt, dấu thanh rõ và không bị cắt). Dự phòng: `system-ui, sans-serif`.
- Trọng lượng: 400 (nội dung), 500 (nhãn, nút), 700 (tiêu đề, số tiền).
- Số liệu luôn bật `font-variant-numeric: tabular-nums` để các cột thẳng hàng.
- Thang cỡ chữ:

| Cấp | Cỡ / dòng | Dùng cho |
|---|---|---|
| Số lớn | 32 / 40, 700 | Tổng tiền hóa đơn |
| Tiêu đề trang | 24 / 32, 700 | Tên trang |
| Tiêu đề mục | 18 / 26, 600 | Nhóm nội dung |
| Nội dung | 16 / 24, 400 | Mặc định (không nhỏ hơn 16 trên mobile cho ô nhập) |
| Phụ | 14 / 20, 400 | Mô tả, chú thích |
| Nhỏ | 12 / 16, 500 | Chỉ dùng cho metadata phụ |

- Độ dài dòng tối đa ~70 ký tự cho đoạn văn.
- Không viết hoa toàn bộ để làm nhãn. Dùng sentence case.

### 4.3 Khoảng cách, bo góc, đổ bóng

- Đơn vị cơ sở 4px. Dùng thang 4 / 8 / 12 / 16 / 24 / 32 / 48.
- Bo góc có thứ bậc, không dùng một giá trị cho tất cả: ô nhập và nút 8px, bảng và panel 12px, tờ hóa đơn 4px (giữ cảm giác giấy), avatar tròn.
- Phân cấp bằng **viền và khoảng trắng** trước, đổ bóng sau. Chỉ dùng bóng cho lớp nổi (dropdown, dialog, sheet).

### 4.4 Cấu hình Tailwind v4

Khai báo token trong `src/app/globals.css`, không hard-code hex trong component:

```css
@import "tailwindcss";

@theme {
  --font-sans: "Be Vietnam Pro", system-ui, sans-serif;

  --color-giay: #F5F8F6;
  --color-mat: #FFFFFF;
  --color-muc: #14231F;
  --color-muc-phu: #4C5F59;
  --color-la: #1D6B57;
  --color-nghe: #D99A1E;
  --color-suong: #DCE5E0;

  --color-success: #2E7D4F;
  --color-warning: #B7791F;
  --color-danger: #B42318;
  --color-info: #2563A8;

  --radius-control: 8px;
  --radius-panel: 12px;
  --radius-sheet: 4px;
}

:root[data-theme="dark"] {
  --color-giay: #0F1A17;
  --color-mat: #16241F;
  --color-muc: #E6EFEA;
  --color-la: #4FB596;
}
```

Map các biến này vào token của shadcn/ui (`--background`, `--primary`, `--border`...) thay vì dùng màu mặc định của shadcn.

## 5. Bố cục và điều hướng

### 5.1 Khung chung

- **Mobile (< 768px)**: thanh điều hướng dưới cùng với 4 mục: Tổng quan, Phòng, Hóa đơn, Thêm. Nút hành động chính (ví dụ "Nhập chỉ số") nằm ngay trong tầm ngón cái.
- **Desktop (≥ 1024px)**: sidebar trái thu gọn được, nội dung chính tối đa 1200px, căn trái.
- Căn lề: nội dung **căn trái**. Chỉ căn giữa các trạng thái rỗng và màn hình đăng nhập. Số tiền trong bảng căn phải.

### 5.2 Giai đoạn 1 phòng

```
┌──────────────────────────────┐
│ Phòng 101                    │
│ Đang cho thuê · Nguyễn Văn A │
├──────────────────────────────┤
│ Tháng 10/2026                │
│ ┌──────────────────────────┐ │
│ │ Tờ hóa đơn tháng         │ │
│ │ Tiền phòng    3.000.000  │ │
│ │ Điện (85 số)    297.500  │ │
│ │ Nước (4 khối)   100.000  │ │
│ │ ───────────────────────  │ │
│ │ Tổng        3.397.500 ₫  │ │
│ │ [Chưa thu]  Hạn 05/11    │ │
│ └──────────────────────────┘ │
│ [ Nhập chỉ số điện nước ]    │
└──────────────────────────────┘
```

`/rooms` tự chuyển thẳng tới chi tiết phòng khi chỉ có một phòng. Điều hướng "Phòng" vẫn tồn tại trong menu nhưng không cần bước chọn.

### 5.3 Giai đoạn nhiều phòng

```
┌─ Sidebar ─┬────────────────────────────────────────┐
│ Tổng quan │ Nhà trọ: [Nhà trọ A ▾]   Tháng 10/2026 │
│ Phòng     │ Còn trống 2 · Chưa thu 3 · Quá hạn 1   │
│ Người thuê│ ┌────────────────────────────────────┐ │
│ Hợp đồng  │ │ Phòng │ Người thuê │ Tình trạng HĐ │ │
│ Hóa đơn   │ │ 101   │ Nguyễn A   │ Đã thu        │ │
│ Sửa chữa  │ │ 102   │ Trần B     │ Quá hạn       │ │
│ Cài đặt   │ └────────────────────────────────────┘ │
└───────────┴────────────────────────────────────────┘
```

- Bộ chọn nhà trọ chỉ hiện khi có từ 2 nhà trọ trở lên.
- Danh sách phòng là bảng có lọc theo tình trạng (trống, đang thuê, chưa thu, quá hạn). Trên mobile bảng chuyển thành danh sách dòng.

## 6. Luồng chính

### 6.1 Nhập chỉ số điện nước (luồng quan trọng nhất)

1. Mở phòng → nút chính "Nhập chỉ số".
2. Sheet từ dưới lên, chỉ số cũ đã điền sẵn và khóa; người dùng chỉ nhập số mới.
3. Tính tiền hiển thị **ngay khi gõ** ("85 số × 3.500 ₫ = 297.500 ₫").
4. Cảnh báo mềm nếu chỉ số mới nhỏ hơn chỉ số cũ hoặc tăng bất thường, nhưng không chặn (có thể là thay đồng hồ).
5. Nút "Lưu và tạo hóa đơn". Sau khi lưu, toast "Đã lưu chỉ số" và chuyển tới hóa đơn vừa tạo.

### 6.2 Ghi nhận thanh toán

- Từ hóa đơn: nút "Ghi nhận thanh toán", mặc định điền đủ số tiền còn lại, cho sửa nếu trả một phần, chọn hình thức (tiền mặt, chuyển khoản).
- Sau khi lưu, trạng thái hóa đơn đổi ngay và có thể hoàn tác trong vài giây.

### 6.3 Thêm phòng mới (khi mở rộng)

- Biểu mẫu ngắn: tên phòng, tầng, diện tích, giá thuê. Mọi trường khác để sau.
- Sau khi tạo, đưa người dùng thẳng tới bước tạo hợp đồng.

## 7. Thành phần đặc trưng

### 7.1 Tờ hóa đơn tháng (điểm nhớ của sản phẩm)

- Nền `Mặt`, viền `Sương` mảnh, bo góc 4px, đặt trên nền `Giấy` để có cảm giác tờ giấy.
- Các khoản là dòng "nhãn ……… số tiền", số căn phải, tabular-nums.
- Đường kẻ trước dòng tổng; tổng dùng cấp "Số lớn".
- Con dấu trạng thái ở góc: **Chưa thu** (Nghệ), **Đã thu** (Thành công), **Quá hạn** (Nguy hiểm). Luôn kèm chữ và biểu tượng.
- Có thể in và xuất PDF với cùng bố cục.
- Đây là chỗ duy nhất được phép có chi tiết trang trí; mọi nơi khác giữ đơn giản.

### 7.2 Huy hiệu trạng thái

Dạng viên thuốc nhỏ: biểu tượng + chữ. Không dùng màu một mình. Một bộ trạng thái dùng thống nhất cho toàn app (phòng, hóa đơn, hợp đồng, yêu cầu sửa chữa).

### 7.3 Ô nhập số tiền và chỉ số

- `inputMode="numeric"`, tự thêm dấu chấm ngăn cách hàng nghìn, hậu tố đơn vị (`₫`, `số`, `khối`) nằm trong ô.
- Cao tối thiểu 48px trên mobile.

### 7.4 Bảng dữ liệu

- Hàng cao 48–56px, tiêu đề cột sentence case, số căn phải.
- Hỗ trợ lọc, sắp xếp, tìm kiếm khi có nhiều hơn vài chục dòng; ở giai đoạn 1 phòng không hiển thị bộ lọc thừa.
- Trên mobile: mỗi dòng thành một khối gồm tên, trạng thái, số tiền.

## 8. Trạng thái giao diện

Mỗi màn hình phải thiết kế đủ 5 trạng thái:

| Trạng thái | Quy tắc |
|---|---|
| Đang tải | Skeleton đúng hình dạng nội dung, không dùng spinner toàn trang |
| Rỗng | Nói rõ điều gì còn thiếu và **một hành động tiếp theo** |
| Lỗi | Nói chuyện gì xảy ra và cách sửa; không xin lỗi chung chung |
| Thành công | Toast ngắn, dùng đúng động từ của nút vừa bấm |
| Một phần | Dữ liệu thiếu hoặc quá hạn được đánh dấu rõ, không ẩn đi |

Ví dụ trạng thái rỗng: "Chưa có hóa đơn tháng này. Nhập chỉ số điện nước để tạo hóa đơn."

## 9. Nội dung và giọng văn

- Viết bằng tiếng Việt đời thường, gọi sự vật theo cách chủ trọ nói: "tiền phòng", "chỉ số điện", "người thuê", không dùng thuật ngữ hệ thống.
- Nút nói đúng việc sẽ xảy ra: "Lưu chỉ số", "Gửi hóa đơn", "Ghi nhận thanh toán". Không dùng "Gửi", "OK", "Xác nhận" trống.
- Một hành động giữ cùng một tên xuyên suốt: nút "Gửi hóa đơn" thì toast là "Đã gửi hóa đơn".
- Câu lỗi nêu nguyên nhân và cách khắc phục: "Chỉ số mới nhỏ hơn chỉ số cũ (120). Kiểm tra lại hoặc chọn 'Thay đồng hồ'."
- Sentence case, không viết hoa toàn bộ, không chèn biểu tượng cảm xúc vào giao diện nghiệp vụ.
- Định dạng:
  - Tiền: `3.397.500 ₫` (dấu chấm ngăn nghìn, qua `lib/money.ts`).
  - Ngày: `05/11/2026`; tháng: `Tháng 10/2026`.
  - Chỉ số điện: `85 số` (kWh) và nước: `4 khối` (m³).

## 10. Chuyển động

- Không có hiệu ứng tự chạy để trang trí. Không fade-and-slide cho từng mục, không hover động trên mọi thẻ.
- Chuyển động chỉ để phản hồi hành động: mở sheet, mở rộng dòng, đổi trạng thái hóa đơn.
- Thời lượng 150–250ms, easing nhẹ. Tôn trọng `prefers-reduced-motion`.
- Duy nhất một khoảnh khắc được nhấn: con dấu "Đã thu" xuất hiện khi ghi nhận thanh toán xong.

## 11. Accessibility

- Tương phản chữ đạt WCAG AA (4.5:1, chữ lớn 3:1).
- Focus hiển thị rõ cho mọi phần tử tương tác; có thể thao tác hoàn toàn bằng bàn phím.
- Vùng bấm tối thiểu 44×44px.
- Không truyền đạt thông tin chỉ bằng màu.
- Mọi ô nhập có `label` thật; lỗi gắn với ô qua `aria-describedby`.
- Toast và cập nhật động dùng `aria-live` phù hợp.
- Kiểm tra với cỡ chữ hệ thống tăng 150% và với chế độ tối.

## 12. Responsive

| Breakpoint | Hành vi |
|---|---|
| < 640px | Một cột, thanh điều hướng dưới, bảng thành danh sách |
| 640–1023px | Hai cột khi có ích, điều hướng dưới hoặc rail |
| ≥ 1024px | Sidebar, bảng đầy đủ, hai cột (nội dung + chi tiết) |

Thiết kế và kiểm tra ở 375px trước, rồi mở rộng.

## 12b. Hiệu năng cảm nhận

- Cập nhật lạc quan (optimistic) cho ghi nhận thanh toán và đổi trạng thái.
- Giữ chỉ số đang nhập khi mất mạng, đồng bộ lại khi có mạng (nháp cục bộ).
- Ảnh và biểu đồ tải lười; trang chính không phụ thuộc thư viện biểu đồ nặng.

## 13. Cách dùng shadcn/ui

- Dùng component gốc: `Button`, `Input`, `Form`, `Sheet`, `Dialog`, `Table`, `Badge`, `Toast (Sonner)`, `Select`, `Tabs`.
- Tùy biến qua token ở mục 4, không sửa tay màu trong từng component.
- Component riêng của dự án (`InvoiceSheet`, `StatusBadge`, `MoneyInput`, `MeterInput`) đặt trong `components/shared/` hoặc trong feature tương ứng.
- Icon dùng một bộ duy nhất (`lucide-react`), kích thước 16/20/24.

## 14. Checklist trước khi merge UI

- [ ] Dùng được trên 375px bằng một tay
- [ ] Đủ 5 trạng thái (tải, rỗng, lỗi, thành công, một phần)
- [ ] Màu lấy từ token, có dark mode
- [ ] Tiền, ngày, chỉ số đúng định dạng mục 9
- [ ] Số căn phải, tabular-nums
- [ ] Trạng thái không chỉ truyền bằng màu
- [ ] Điều hướng bàn phím và focus rõ
- [ ] Chuỗi nằm trong file i18n (VI + EN)
- [ ] Hoạt động tốt khi chỉ có 1 phòng **và** khi có nhiều phòng
- [ ] Không thêm hiệu ứng trang trí ngoài mục 10
