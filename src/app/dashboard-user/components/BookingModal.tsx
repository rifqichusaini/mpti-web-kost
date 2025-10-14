//src/app/dashboard-user/components/BookingModal.tsx
"use client";

import type { Room } from "@/types/room";
import { BookingForm } from "@/app/dashboard-user/components/BookingForm";

interface BookingModalProps {
    room: Room | null;
    onClose: () => void;
}

export default function BookingModal({ room, onClose }: BookingModalProps) {
    if (!room) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-emerald-600 rounded-t-xl p-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">
                            Pesan Kamar {room.room_number}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-emerald-100 transition-colors p-1 rounded-full hover:bg-emerald-700"
                        >
                            ✕
                        </button>
                    </div>
                    <p className="text-emerald-100 mt-1">Durasi Sewa (Bulan)</p>
                </div>

                <div className="p-6">
                    <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-emerald-700">
                                Kamar {room.room_number}
                            </span>
                            <span className="text-lg font-bold text-emerald-600">
                                Rp {room.price.toLocaleString("id-ID")}/bulan
                            </span>
                        </div>
                        <p className="text-sm text-emerald-600">
                            Fasilitas: {room.facilities || "Standard"}
                        </p>
                    </div>

                    <BookingForm
                        roomId={room.id ?? ""}
                        kostId={room.kost_id ?? ""}
                        onSuccess={onClose}
                    />

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500">
                            Dengan mengirim permintaan, Anda menyetujui syarat dan ketentuan
                            yang berlaku
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
