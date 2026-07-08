'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Palette, Info, RefreshCw, Layout, Layers, HelpCircle } from 'lucide-react';
import { Room } from '@/data/rooms';

// Component con chứa mô hình 3D thực tế
function RoomModel({
  room,
  wallColor,
  bedColor,
  furnitureColor,
  customWidth,
  customLength,
  customHeight
}: {
  room?: Room;
  wallColor: string;
  bedColor: string;
  furnitureColor: string;
  customWidth?: number;
  customLength?: number;
  customHeight?: number;
}) {
  // Tính kích thước căn phòng dựa trên diện tích room.area hoặc các thông số tùy biến
  const area = room?.area || 25;
  const type = room?.type || 'phong-tro';
  const amenities = room?.amenities || [];

  // Chiều rộng và dài tự động tính từ diện tích (clamped giữa 3.8 và 5.5)
  const defaultDim = Math.max(3.8, Math.min(5.5, Math.sqrt(area) * 0.75));
  const width = customWidth || defaultDim;
  const length = customLength || defaultDim;
  const height = customHeight || 2.8;

  // Tiện ích
  const hasAC = amenities.includes('dieu-hoa') || true;
  const hasFridge = amenities.includes('tu-lanh') || true; // Hiện thị tủ lạnh cho đầy đủ
  const hasWashingMachine = amenities.includes('may-giat');

  return (
    <group position={[0, -height / 3, 0]} rotation={[0, -Math.PI / 4, 0]}>
      {/* 1. SÀN NHÀ (Floor) */}
      <mesh receiveShadow position={[0, -0.075, 0]}>
        <boxGeometry args={[width, 0.15, length]} />
        <meshStandardMaterial color="#e5dcd0" roughness={0.7} />
      </mesh>

      {/* 2. TƯỜNG TRÁI (Left Wall) */}
      <mesh receiveShadow castShadow position={[-width / 2 - 0.075, height / 2, 0]}>
        <boxGeometry args={[0.15, height, length]} />
        <meshStandardMaterial color={wallColor} roughness={0.5} />
      </mesh>

      {/* 3. TƯỜNG PHẢI (Right Wall) */}
      <mesh receiveShadow castShadow position={[0, height / 2, -length / 2 - 0.075]}>
        <boxGeometry args={[width, height, 0.15]} />
        <meshStandardMaterial color={wallColor} roughness={0.5} />
      </mesh>

      {/* 4. CỬA SỔ (Window) */}
      <group position={[0, height * 0.6, -length / 2 - 0.035]}>
        <mesh castShadow>
          <boxGeometry args={[1.5, 1.1, 0.08]} />
          <meshStandardMaterial color="#3e2723" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.015]}>
          <planeGeometry args={[1.4, 1.0]} />
          <meshStandardMaterial color="#e0f7fa" emissive="#80deea" emissiveIntensity={0.3} roughness={0.1} />
        </mesh>
      </group>

      {/* 5. PHÒNG VỆ SINH KHÉP KÍN (NVS / Bathroom) ở góc sau bên trái */}
      <group>
        {/* Vách ngăn kính mờ góc Toilet */}
        {/* Vách ngang */}
        <mesh position={[-width / 2 + 0.6, height / 2, -length / 2 + 1.25]} castShadow>
          <boxGeometry args={[1.2, height, 0.06]} />
          <meshStandardMaterial color="#b0bec5" transparent opacity={0.3} roughness={0.1} />
        </mesh>
        {/* Vách dọc */}
        <mesh position={[-width / 2 + 1.2, height / 2, -length / 2 + 0.625]} castShadow>
          <boxGeometry args={[0.06, height, 1.25]} />
          <meshStandardMaterial color="#b0bec5" transparent opacity={0.3} roughness={0.1} />
        </mesh>

        {/* Thiết bị bên trong phòng vệ sinh */}
        {/* Bồn cầu (Toilet bowl) */}
        <group position={[-width / 2 + 0.4, 0.2, -length / 2 + 0.4]}>
          {/* Bệ ngồi */}
          <mesh castShadow>
            <cylinderGeometry args={[0.18, 0.16, 0.4, 16]} />
            <meshStandardMaterial color="#fafafa" roughness={0.1} />
          </mesh>
          {/* Két nước */}
          <mesh castShadow position={[-0.1, 0.4, 0]}>
            <boxGeometry args={[0.16, 0.4, 0.32]} />
            <meshStandardMaterial color="#fafafa" roughness={0.1} />
          </mesh>
        </group>

        {/* Bồn rửa mặt (Sink/Lavabo) */}
        <group position={[-width / 2 + 0.4, 0.75, -length / 2 + 0.95]}>
          {/* Bàn đá nâng đỡ */}
          <mesh castShadow position={[0, -0.05, 0]}>
            <boxGeometry args={[0.35, 0.08, 0.35]} />
            <meshStandardMaterial color="#37474f" roughness={0.6} />
          </mesh>
          {/* Chậu rửa */}
          <mesh castShadow position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.14, 0.1, 0.1, 16]} />
            <meshStandardMaterial color="#fafafa" roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* 6. KHU VỰC BẾP NẤU ĂN (Kitchen Counter) ở góc sau bên phải */}
      <group position={[width / 2 - 0.75, 0.42, -length / 2 + 1.1]}>
        {/* Kệ bếp nấu */}
        <mesh castShadow>
          <boxGeometry args={[0.65, 0.84, 1.4]} />
          <meshStandardMaterial color="#eceff1" roughness={0.4} />
        </mesh>
        {/* Mặt bếp đá hoa cương đen */}
        <mesh position={[0, 0.43, 0]} castShadow>
          <boxGeometry args={[0.67, 0.04, 1.42]} />
          <meshStandardMaterial color="#212121" roughness={0.1} />
        </mesh>
        {/* Bồn rửa chén (Sink) */}
        <mesh position={[0, 0.455, 0.3]} castShadow>
          <boxGeometry args={[0.35, 0.01, 0.45]} />
          <meshStandardMaterial color="#78909c" metalness={0.7} roughness={0.2} />
        </mesh>
        {/* Tủ treo tường phía trên */}
        <mesh position={[0.05, 1.35, 0]} castShadow>
          <boxGeometry args={[0.45, 0.55, 1.4]} />
          <meshStandardMaterial color={furnitureColor} roughness={0.7} />
        </mesh>
      </group>

      {/* 7. GIƯỜNG NGỦ (Bed) ở góc trước bên trái */}
      {type === 'o-ghep' ? (
        /* GIƯỜNG TẦNG KTX */
        <group position={[-width / 2 + 1.0, 0.7, length / 2 - 1.1]}>
          {/* 4 Trụ giường */}
          {[-0.8, 0.8].map((x) =>
            [-0.8, 0.8].map((z) => (
              <mesh key={`${x}-${z}`} castShadow position={[x, 0.3, z]}>
                <boxGeometry args={[0.07, 2.0, 0.07]} />
                <meshStandardMaterial color={furnitureColor} roughness={0.7} />
              </mesh>
            ))
          )}
          {/* Tầng Dưới */}
          <group position={[0, -0.2, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.5, 0.15, 1.5]} />
              <meshStandardMaterial color={furnitureColor} roughness={0.7} />
            </mesh>
            <mesh castShadow position={[0, 0.1, 0]}>
              <boxGeometry args={[1.42, 0.18, 1.42]} />
              <meshStandardMaterial color={bedColor} roughness={0.8} />
            </mesh>
          </group>
          {/* Tầng Trên */}
          <group position={[0, 0.9, 0]}>
            <mesh castShadow>
              <boxGeometry args={[1.5, 0.15, 1.5]} />
              <meshStandardMaterial color={furnitureColor} roughness={0.7} />
            </mesh>
            <mesh castShadow position={[0, 0.1, 0]}>
              <boxGeometry args={[1.42, 0.18, 1.42]} />
              <meshStandardMaterial color={bedColor} roughness={0.8} />
            </mesh>
          </group>
        </group>
      ) : (
        /* GIƯỜNG ĐƠN / GIƯỜNG ĐÔI */
        <group position={[-width / 2 + 1.0, 0.2, length / 2 - 1.1]}>
          <mesh castShadow>
            <boxGeometry args={[1.6, 0.3, 1.6]} />
            <meshStandardMaterial color={furnitureColor} roughness={0.7} />
          </mesh>
          <mesh castShadow position={[0, 0.2, 0]}>
            <boxGeometry args={[1.5, 0.22, 1.5]} />
            <meshStandardMaterial color="#fafafa" roughness={0.9} />
          </mesh>
          <mesh castShadow position={[0, 0.22, 0.2]}>
            <boxGeometry args={[1.52, 0.21, 1.15]} />
            <meshStandardMaterial color={bedColor} roughness={0.8} />
          </mesh>
          <mesh castShadow position={[0, 0.32, -0.52]}>
            <boxGeometry args={[0.8, 0.1, 0.35]} />
            <meshStandardMaterial color="#e0e0e0" roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* 8. BÀN LÀM VIỆC (Desk) ở góc trước bên phải */}
      <group position={[width / 2 - 0.9, 0.35, length / 2 - 0.8]}>
        <mesh castShadow position={[0, 0.18, 0]}>
          <boxGeometry args={[1.1, 0.05, 0.65]} />
          <meshStandardMaterial color={furnitureColor} roughness={0.7} />
        </mesh>
        <mesh castShadow position={[-0.48, -0.09, 0]}>
          <boxGeometry args={[0.05, 0.48, 0.55]} />
          <meshStandardMaterial color={furnitureColor} roughness={0.7} />
        </mesh>
        <mesh castShadow position={[0.48, -0.09, 0]}>
          <boxGeometry args={[0.05, 0.48, 0.55]} />
          <meshStandardMaterial color={furnitureColor} roughness={0.7} />
        </mesh>
        {/* Laptop nhỏ */}
        <mesh position={[0, 0.22, 0]}>
          <boxGeometry args={[0.26, 0.02, 0.18]} />
          <meshStandardMaterial color="#607d8b" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* 9. TỦ LẠNH (Fridge) */}
      {hasFridge && (
        <group position={[width / 2 - 0.35, 0.6, -length / 2 + 2.1]}>
          <mesh castShadow>
            <boxGeometry args={[0.5, 1.2, 0.5]} />
            <meshStandardMaterial color="#90a4ae" metalness={0.5} roughness={0.3} />
          </mesh>
        </group>
      )}

      {/* 10. TỦ QUẦN ÁO (Wardrobe) */}
      <mesh castShadow position={[-width / 2 + 0.55, 0.85, length / 2 - 2.4]}>
        <boxGeometry args={[0.7, 1.7, 0.5]} />
        <meshStandardMaterial color={furnitureColor} roughness={0.7} />
      </mesh>

      {/* 11. MÁY LẠNH/ĐIỀU HÒA (AC) */}
      {hasAC && (
        <mesh position={[0, height - 0.35, -length / 2 - 0.015]} castShadow>
          <boxGeometry args={[0.75, 0.2, 0.18]} />
          <meshStandardMaterial color="#fafafa" roughness={0.6} />
        </mesh>
      )}

      {/* 12. THẢM TRẢI SÀN (Rug) */}
      <mesh position={[0, 0.005, 0.3]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.5, 1.0]} />
        <meshStandardMaterial color="#a1887f" roughness={0.9} />
      </mesh>
    </group>
  );
}

// Component chính
export default function Room3DView({ room }: { room?: Room }) {
  const [mounted, setMounted] = useState(false);
  const [wallColor, setWallColor] = useState('#cfd8dc'); // Sơn xám nhạt tối giản
  const [bedColor, setBedColor] = useState('#b39ddb');  // Drap tím nhạt
  const [furnitureColor, setFurnitureColor] = useState('#8d6e63'); // Gỗ sồi ấm

  // Admin Customizer States
  const [adminWidth, setAdminWidth] = useState(4.2);
  const [adminLength, setAdminLength] = useState(4.2);
  const [adminHeight, setAdminHeight] = useState(2.8);

  const wallColors = [
    { value: '#cfd8dc', name: 'Xám Tối Giản' },
    { value: '#b2dfdb', name: 'Xanh Ngọc' },
    { value: '#ffecb3', name: 'Vàng Kem' },
    { value: '#d7ccc8', name: 'Hồng Đất' }
  ];

  const bedColors = [
    { value: '#b39ddb', name: 'Tím Oải Hương' },
    { value: '#81c784', name: 'Xanh Lá Mạ' },
    { value: '#ff8a80', name: 'Cam San Hô' },
    { value: '#4fc3f7', name: 'Xanh Da Trời' }
  ];

  const furnitureColors = [
    { value: '#8d6e63', name: 'Gỗ Sồi Ấm' },
    { value: '#5d4037', name: 'Gỗ Óc Chó' },
    { value: '#37474f', name: 'Sắt Sơn Đen' }
  ];

  useEffect(() => {
    setMounted(true);
    
    if (room) {
      if (room.type === 'chung-cu-mini') {
        setWallColor('#cfd8dc');
        setBedColor('#b39ddb');
      } else if (room.type === 'o-ghep') {
        setWallColor('#b2dfdb');
        setBedColor('#4fc3f7');
      }
    }
  }, [room]);

  if (!mounted) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-muted/20 border border-border rounded-xl animate-pulse">
        <div className="text-center">
          <RefreshCw className="animate-spin text-primary mx-auto mb-2" size={32} />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Đang tải mô hình căn phòng 3D...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col lg:flex-row gap-6 w-full p-5 bg-card/60 backdrop-blur-xl border border-border/80 rounded-2xl shadow-lg">
      
      {/* KHỐI HIỂN THỊ CANVAS 3D */}
      <div className="flex-grow h-[420px] bg-muted/10 rounded-xl overflow-hidden border border-border/50 relative shadow-inner">
        <Canvas shadows camera={{ position: [5.2, 4.5, 5.2], fov: 38 }}>
          <ambientLight intensity={0.65} />
          <directionalLight
            castShadow
            position={[4, 10, 4]}
            intensity={1.3}
            shadow-mapSize={[1024, 1024]}
          />
          <pointLight position={[-4, 4, -4]} intensity={0.4} color="#ffe0b2" />
          
          <Suspense fallback={null}>
            <RoomModel
              room={room}
              wallColor={wallColor}
              bedColor={bedColor}
              furnitureColor={furnitureColor}
              customWidth={room ? undefined : adminWidth}
              customLength={room ? undefined : adminLength}
              customHeight={room ? undefined : adminHeight}
            />
          </Suspense>
          <OrbitControls 
            enableZoom={true} 
            maxPolarAngle={Math.PI / 2.15} 
            minDistance={3.2}
            maxDistance={8.5}
          />
        </Canvas>
        
        {/* Hướng dẫn tương tác */}
        <div className="absolute bottom-3.5 left-3.5 bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm border border-border/60 text-muted-foreground">
          <Info size={12} className="text-primary" />
          Giữ chuột trái để xoay 360° • Cuộn chuột để Phóng to / Thu nhỏ
        </div>
      </div>

      {/* BẢNG ĐIỀU KHIỂN */}
      <div className="w-full lg:w-72 flex flex-col justify-between gap-5.5 shrink-0">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Palette size={16} className="text-primary" />
            <h4 className="font-black text-xs text-foreground uppercase tracking-wider">
              {room ? 'Mô phỏng phòng 3D' : 'Tùy biến kích thước 3D'}
            </h4>
          </div>

          {/* HIỂN THỊ THÔNG SỐ ĐỘNG NẾU CÓ DỮ LIỆU PHÒNG */}
          {room && (
            <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-1.5 text-xs text-foreground font-semibold">
              <span className="text-[9px] text-primary font-black uppercase tracking-wider flex items-center gap-1">
                <Layout size={12} />
                Thông số bản vẽ phòng
              </span>
              <div className="flex justify-between text-[11px] mt-1 font-bold">
                <span>Diện tích mặt sàn:</span>
                <span className="text-primary font-extrabold">{room.area} m²</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold">
                <span>Thiết kế căn hộ:</span>
                <span className="text-foreground font-extrabold">Bếp & NVS khép kín</span>
              </div>
              <div className="flex justify-between text-[11px] font-bold">
                <span>Cơ cấu phòng:</span>
                <span className="text-foreground font-extrabold capitalize">
                  {room.type === 'chung-cu-mini' ? 'Căn hộ Studio' : room.type === 'o-ghep' ? 'KTX giường tầng' : 'Phòng đơn'}
                </span>
              </div>
            </div>
          )}

          {/* ĐIỀU CHỈNH KÍCH THƯỚC DÀNH CHO ADMIN / CHẾ ĐỘ TỰ DO */}
          {!room && (
            <div className="flex flex-col gap-4 p-3.5 rounded-xl border border-border/80 bg-muted/10">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Layers size={12} />
                Thông số phòng (Kéo chỉnh)
              </span>
              
              {/* Chiều rộng */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-bold text-foreground">
                  <span>Chiều rộng sàn:</span>
                  <span className="text-primary font-black">{adminWidth.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min={3.8}
                  max={5.5}
                  step={0.1}
                  value={adminWidth}
                  onChange={(e) => setAdminWidth(Number(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Chiều dài */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-bold text-foreground">
                  <span>Chiều dài sàn:</span>
                  <span className="text-primary font-black">{adminLength.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min={3.8}
                  max={5.5}
                  step={0.1}
                  value={adminLength}
                  onChange={(e) => setAdminLength(Number(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              {/* Chiều cao */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-bold text-foreground">
                  <span>Chiều cao trần:</span>
                  <span className="text-primary font-black">{adminHeight.toFixed(1)} m</span>
                </div>
                <input
                  type="range"
                  min={2.4}
                  max={3.4}
                  step={0.1}
                  value={adminHeight}
                  onChange={(e) => setAdminHeight(Number(e.target.value))}
                  className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          )}

          {/* Chọn màu sơn tường */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Màu sơn tường:</span>
            <div className="flex gap-2">
              {wallColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setWallColor(color.value)}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                    wallColor === color.value ? 'border-primary scale-110 shadow-md ring-2 ring-primary/20' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Chọn màu drap chăn ga */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Màu chăn ga drap:</span>
            <div className="flex gap-2">
              {bedColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setBedColor(color.value)}
                  className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                    bedColor === color.value ? 'border-primary scale-110 shadow-md ring-2 ring-primary/20' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Chọn chất liệu gỗ */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Chất liệu gỗ đồ đạc:</span>
            <div className="flex flex-col gap-1.5">
              {furnitureColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setFurnitureColor(color.value)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-bold rounded-xl border text-left transition-all cursor-pointer ${
                    furnitureColor === color.value
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border bg-background/50 hover:bg-muted text-foreground'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-md" style={{ backgroundColor: color.value }} />
                  <span>{color.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
