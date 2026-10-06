export interface RoomTypeOption {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export const ROOM_TYPES: RoomTypeOption[] = [
  {
    id: "standard",
    name: "Phòng tiêu chuẩn",
    description: "Phòng khép kín cơ bản",
    icon: "DoorClosed",
  },
  {
    id: "balcony",
    name: "Có ban công",
    description: "Ban công riêng thoáng mát",
    icon: "SunMedium",
  },
  {
    id: "mezzanine",
    name: "Có gác lửng",
    description: "Gác xép tăng diện tích sinh hoạt",
    icon: "Layers",
  },
  {
    id: "studio",
    name: "Studio",
    description: "Căn hộ mini / Đầy đủ tiện nghi",
    icon: "Sparkles",
  },
  {
    id: "window",
    name: "Cửa sổ lớn",
    description: "Cửa sổ thoáng đón ánh sáng tự nhiên",
    icon: "AppWindow",
  },
  {
    id: "duplex",
    name: "Duplex cao cấp",
    description: "Không gian thông tầng sang trọng",
    icon: "Building",
  },
];

export function getRoomTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case "balcony":
      return "Có ban công";
    case "mezzanine":
      return "Có gác lửng";
    case "studio":
      return "Studio";
    case "window":
      return "Cửa sổ thoáng";
    case "duplex":
      return "Duplex";
    case "dormitory":
      return "KTX";
    case "sleepbox":
      return "Sleepbox";
    default:
      return "Tiêu chuẩn";
  }
}

export type AssetCategory = "electrical" | "furniture" | "sanitary" | "security" | "other";

export interface CatalogAssetItem {
  name: string;
  category: AssetCategory;
  defaultQuantity: number;
  isPopular: boolean;
}

export interface AssetCategoryGroup {
  category: AssetCategory;
  title: string;
  icon: string;
  items: CatalogAssetItem[];
}

export const PREDEFINED_ROOM_ASSETS: AssetCategoryGroup[] = [
  {
    category: "electrical",
    title: "Điện lạnh & Thiết bị điện",
    icon: "Zap",
    items: [
      { name: "Điều hòa / Máy lạnh", category: "electrical", defaultQuantity: 1, isPopular: true },
      { name: "Tủ lạnh", category: "electrical", defaultQuantity: 1, isPopular: true },
      { name: "Bình nóng lạnh", category: "electrical", defaultQuantity: 1, isPopular: true },
      { name: "Máy giặt riêng", category: "electrical", defaultQuantity: 1, isPopular: false },
      {
        name: "Quạt treo tường / Quạt trần",
        category: "electrical",
        defaultQuantity: 1,
        isPopular: true,
      },
      {
        name: "Bếp từ / Bếp hồng ngoại",
        category: "electrical",
        defaultQuantity: 1,
        isPopular: false,
      },
      { name: "Máy hút mùi bếp", category: "electrical", defaultQuantity: 1, isPopular: false },
    ],
  },
  {
    category: "furniture",
    title: "Nội thất phòng & Giường ngủ",
    icon: "BedDouble",
    items: [
      { name: "Giường ngủ & Nệm", category: "furniture", defaultQuantity: 1, isPopular: true },
      { name: "Tủ quần áo (2-3 cánh)", category: "furniture", defaultQuantity: 1, isPopular: true },
      { name: "Bàn làm việc & Ghế", category: "furniture", defaultQuantity: 1, isPopular: true },
      { name: "Rèm cửa chống nắng", category: "furniture", defaultQuantity: 1, isPopular: true },
      { name: "Kệ đầu giường", category: "furniture", defaultQuantity: 1, isPopular: false },
      { name: "Kệ để giày dép", category: "furniture", defaultQuantity: 1, isPopular: false },
      { name: "Gương soi toàn thân", category: "furniture", defaultQuantity: 1, isPopular: false },
    ],
  },
  {
    category: "sanitary",
    title: "Khu vực Bếp & Vệ sinh",
    icon: "Droplets",
    items: [
      {
        name: "Bộ thiết bị vệ sinh (Lavabo, bồn cầu, vòi sen)",
        category: "sanitary",
        defaultQuantity: 1,
        isPopular: true,
      },
      { name: "Gương phòng tắm", category: "sanitary", defaultQuantity: 1, isPopular: true },
      {
        name: "Kệ bếp / Tủ bếp trên & dưới",
        category: "sanitary",
        defaultQuantity: 1,
        isPopular: true,
      },
      { name: "Chậu rửa chén inox", category: "sanitary", defaultQuantity: 1, isPopular: true },
    ],
  },
  {
    category: "security",
    title: "An ninh, Đo đếm & Tiện ích",
    icon: "ShieldCheck",
    items: [
      {
        name: "Khóa cửa thông minh (Vân tay / Thẻ từ)",
        category: "security",
        defaultQuantity: 1,
        isPopular: true,
      },
      {
        name: "Đồng hồ công tơ điện tử riêng",
        category: "security",
        defaultQuantity: 1,
        isPopular: true,
      },
      { name: "Đồng hồ nước riêng", category: "security", defaultQuantity: 1, isPopular: true },
      {
        name: "Bộ phát Wifi riêng trong phòng",
        category: "security",
        defaultQuantity: 1,
        isPopular: false,
      },
      { name: "Giàn phơi đồ ban công", category: "security", defaultQuantity: 1, isPopular: false },
    ],
  },
];
