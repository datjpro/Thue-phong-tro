'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../store/useAuth';
import { useChats } from '../../store/useChats';
import { useRooms } from '../../store/useRooms';
import { users } from '../../data/users';
import { X, Send, User } from 'lucide-react';
import { Button } from '../ui/Button';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  landlordId: string;
}

export default function ChatModal({ isOpen, onClose, roomId, landlordId }: ChatModalProps) {
  const { currentUser } = useAuth();
  const { messages, sendMessage } = useChats();
  const { rooms } = useRooms();
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const room = rooms.find(r => r.id === roomId);
  const landlord = users.find(u => u.id === landlordId);

  // Cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  if (!isOpen || !currentUser || !room || !landlord) return null;

  // Lấy các tin nhắn thuộc cuộc trò chuyện này
  // Thread: giữa currentUser và landlord, về phòng roomId
  const activeMessages = messages.filter(
    (m) =>
      m.roomId === roomId &&
      ((m.senderId === currentUser.id && m.receiverId === landlordId) ||
        (m.senderId === landlordId && m.receiverId === currentUser.id))
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const tenantMsg = inputText.trim();
    sendMessage(currentUser.id, landlordId, roomId, tenantMsg);
    setInputText('');

    // Giả lập câu trả lời từ chủ nhà sau 1.5s
    setTimeout(() => {
      const landlordReplies = [
        'Anh nhận được tin nhắn rồi nhé. Em muốn hẹn lịch qua xem trực tiếp phòng vào ngày nào?',
        'Chào em, phòng đó hiện tại vẫn còn trống và có thể dọn vào ngay. Em có tiện qua xem vào chiều nay không?',
        'Chào em, giá thuê đó đã bao gồm phí quản lý rồi nhé, chỉ tính riêng điện nước thôi em.',
        'Ok em, có gì cứ nhắn tin cho anh nhé. Anh rất mong được đón tiếp em.'
      ];
      const randomReply = landlordReplies[Math.floor(Math.random() * landlordReplies.length)];
      sendMessage(landlordId, currentUser.id, roomId, randomReply);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 md:p-6 pointer-events-none">
      {/* Container chat nổi ở góc phải dưới */}
      <div className="pointer-events-auto w-full max-w-sm md:max-w-md h-[450px] bg-card rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <img
              src={landlord.avatar}
              alt={landlord.name}
              className="w-9 h-9 rounded-full object-cover border border-white/20"
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold">{landlord.name}</span>
              <span className="text-[10px] opacity-80 font-medium">Chủ phòng: {room.title}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-primary-foreground cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Khối hội thoại */}
        <div className="flex-1 overflow-y-auto p-4 bg-muted/5 space-y-3 flex flex-col">
          {activeMessages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
                <User size={20} />
              </div>
              <p className="text-xs font-bold text-foreground">Bắt đầu cuộc trò chuyện</p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Hỏi chủ trọ về thông tin phòng, giờ giấc, hoặc đặt lịch hẹn xem phòng trực tiếp.
              </p>
            </div>
          ) : (
            activeMessages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs md:text-sm font-medium shadow-sm leading-relaxed ${
                      isMe
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-card text-foreground border border-border rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <span
                      className={`text-[9px] mt-1 block text-right font-medium ${
                        isMe ? 'text-primary-foreground/75' : 'text-muted-foreground'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input gõ tin nhắn */}
        <form onSubmit={handleSend} className="p-3 border-t border-border bg-card flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Nhập nội dung tin nhắn..."
            className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-foreground"
          />
          <Button type="submit" size="sm" className="h-10 w-10 p-0 flex items-center justify-center rounded-lg">
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
}
