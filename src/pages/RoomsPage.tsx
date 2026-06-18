import { useState } from 'react';
import {
  Plus,
  Pencil,
  ToggleLeft,
  ToggleRight,
  Users,
  X,
  Check,
  Coffee,
  AlertTriangle,
} from 'lucide-react';
import { useRoomStore } from '../store/useRoomStore';
import { useBookingStore } from '../store/useBookingStore';
import type { Room } from '../types';

export default function RoomsPage() {
  const { rooms, addRoom, updateRoom, toggleRoomActive, deleteRoom } = useRoomStore();
  const { bookings } = useBookingStore();
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const activeCount = rooms.filter((r) => r.active).length;
  const inactiveCount = rooms.filter((r) => !r.active).length;

  const getBookingCount = (roomId: string) => {
    return bookings.filter(
      (b) => b.roomId === roomId && b.status === 'confirmed'
    ).length;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-soft border border-sandal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500">启用中</p>
              <p className="font-song text-3xl font-bold text-bamboo-600 mt-1">
                {activeCount}
                <span className="text-base font-normal text-ink-400 ml-1">间</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-bamboo-100 flex items-center justify-center">
              <Coffee className="text-bamboo-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-soft border border-sandal-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-ink-500">已停用</p>
              <p className="font-song text-3xl font-bold text-ink-400 mt-1">
                {inactiveCount}
                <span className="text-base font-normal text-ink-400 ml-1">间</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-ink-100 flex items-center justify-center">
              <ToggleLeft className="text-ink-400" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-sandal-900 to-sandal-800 rounded-xl p-5 shadow-card text-white">
          <p className="text-sm text-sandal-300">包间总数</p>
          <p className="font-song text-3xl font-bold text-gold-400 mt-1">
            {rooms.length}
            <span className="text-base font-normal text-sandal-300 ml-1">间</span>
          </p>
          <button
            onClick={() => {
              setEditingRoom(null);
              setIsAdding(true);
            }}
            className="w-full mt-3 px-4 py-2.5 rounded-lg bg-gold-500 text-sandal-900 font-medium hover:bg-gold-400 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            新增包间
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-sandal-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-sandal-200 bg-sandal-50/50">
          <h2 className="font-song text-lg font-bold text-sandal-900">包间列表</h2>
        </div>

        <div className="divide-y divide-sandal-100">
          {rooms.length === 0 ? (
            <div className="px-6 py-12 text-center text-ink-400">
              <Coffee className="mx-auto mb-3 opacity-50" size={32} />
              <p>暂无包间，请点击上方新增</p>
            </div>
          ) : (
            rooms.map((room) => {
              const bookingCount = getBookingCount(room.id);
              return (
                <div
                  key={room.id}
                  className={`px-6 py-5 flex items-center gap-6 transition-colors ${
                    !room.active ? 'bg-ink-50/30' : 'hover:bg-sandal-50/50'
                  }`}
                >
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      room.active
                        ? 'bg-gold-100 text-gold-600'
                        : 'bg-ink-100 text-ink-400'
                    }`}
                  >
                    <Coffee size={28} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3
                        className={`font-song text-lg font-bold ${
                          room.active ? 'text-sandal-900' : 'text-ink-400'
                        }`}
                      >
                        {room.name}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          room.active
                            ? 'bg-bamboo-100 text-bamboo-700'
                            : 'bg-ink-100 text-ink-500'
                        }`}
                      >
                        {room.active ? '启用' : '停用'}
                      </span>
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        room.active ? 'text-ink-500' : 'text-ink-400'
                      }`}
                    >
                      {room.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span
                        className={`flex items-center gap-1 ${
                          room.active ? 'text-ink-600' : 'text-ink-400'
                        }`}
                      >
                        <Users size={14} />
                        {room.capacity}人座
                      </span>
                      <span
                        className={room.active ? 'text-gold-600' : 'text-ink-400'}
                      >
                        低消 ¥{room.minConsumption}
                      </span>
                      {room.active && bookingCount > 0 && (
                        <span className="text-bamboo-600">
                          当前 {bookingCount} 单预订
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEditingRoom(room);
                        setIsAdding(false);
                      }}
                      className="p-2.5 text-ink-500 hover:text-ink-700 hover:bg-sandal-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => toggleRoomActive(room.id)}
                      className={`p-2.5 rounded-lg transition-colors ${
                        room.active
                          ? 'text-amber-500 hover:text-amber-700 hover:bg-amber-50'
                          : 'text-bamboo-500 hover:text-bamboo-700 hover:bg-bamboo-50'
                      }`}
                      title={room.active ? '停用' : '启用'}
                    >
                      {room.active ? (
                        <ToggleRight size={22} />
                      ) : (
                        <ToggleLeft size={22} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {(isAdding || editingRoom) && (
        <RoomFormModal
          room={editingRoom}
          onClose={() => {
            setIsAdding(false);
            setEditingRoom(null);
          }}
          onSave={(data) => {
            if (editingRoom) {
              updateRoom(editingRoom.id, data);
            } else {
              addRoom({ ...data, active: true });
            }
            setIsAdding(false);
            setEditingRoom(null);
          }}
          onDelete={
            editingRoom
              ? () => {
                  setShowDeleteConfirm(editingRoom.id);
                }
              : undefined
          }
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-elevated animate-scale-in p-6">
            <div className="flex items-start gap-3 text-red-600 mb-4">
              <AlertTriangle size={24} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-lg">确认删除包间？</p>
                <p className="text-sm text-red-500 mt-1">
                  删除后相关预订和账单数据仍会保留，但包间将不再显示
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-sandal-300 text-ink-700 text-sm font-medium hover:bg-sandal-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  deleteRoom(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                  setEditingRoom(null);
                  setIsAdding(false);
                }}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface RoomFormModalProps {
  room: Room | null;
  onClose: () => void;
  onSave: (data: Omit<Room, 'id' | 'active'>) => void;
  onDelete?: () => void;
}

function RoomFormModal({ room, onClose, onSave, onDelete }: RoomFormModalProps) {
  const [form, setForm] = useState({
    name: room?.name || '',
    capacity: room?.capacity || 4,
    minConsumption: room?.minConsumption || 288,
    description: room?.description || '',
  });

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError('请输入包间名称');
      return;
    }
    if (form.capacity < 1) {
      setError('容纳人数至少为1');
      return;
    }
    if (form.minConsumption < 0) {
      setError('最低消费不能为负数');
      return;
    }

    onSave({
      name: form.name.trim(),
      capacity: form.capacity,
      minConsumption: form.minConsumption,
      description: form.description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-elevated animate-scale-in overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-sandal-200 bg-sandal-50">
          <h3 className="font-song text-lg font-bold text-sandal-900">
            {room ? '编辑包间' : '新增包间'}
          </h3>
          <button
            onClick={onClose}
            className="text-ink-400 hover:text-ink-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              包间名称
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="如：清风阁"
              className="w-full px-4 py-2.5 rounded-lg border border-sandal-300 bg-white text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                <Users size={14} className="inline mr-1" />
                容纳人数
              </label>
              <input
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) =>
                  setForm({ ...form, capacity: parseInt(e.target.value) || 1 })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-sandal-300 bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                最低消费（元）
              </label>
              <input
                type="number"
                min="0"
                value={form.minConsumption}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minConsumption: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-2.5 rounded-lg border border-sandal-300 bg-white text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">
              包间描述
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="描述包间特色、风格等"
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-sandal-300 bg-white text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 transition-all resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg text-sm">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-lg border border-sandal-300 text-ink-700 font-medium hover:bg-sandal-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 rounded-lg bg-sandal-900 text-gold-400 font-medium hover:bg-sandal-800 transition-colors flex items-center justify-center gap-2"
            >
              <Check size={18} />
              {room ? '保存修改' : '确认新增'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
