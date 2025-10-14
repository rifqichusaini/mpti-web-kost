//src/app/dashboard-user/components/RoomCard.tsx
"use client";

import type { Room } from "@/types/room";

interface RoomCardProps {
    room: Room;
    onSelect: (room: Room) => void;
}

export default function RoomCard({ room, onSelect }: RoomCardProps) {
    return (
        <div className="transform rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">
                    Kamar {room.room_number}
                </h3>
                <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${room.is_available
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                >
                    {room.is_available ? "Tersedia" : "Terisi"}
                </span>
            </div>

            <div className="mt-4">
                <p className="text-2xl font-bold text-emerald-600">
                    Rp {room.price.toLocaleString("id-ID")}
                    <span className="text-sm font-normal text-gray-500">/bulan</span>
                </p>
            </div>

            <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Fasilitas:</h4>
                <div className="flex flex-wrap gap-2">
                    {room.facilities ? (
                        room.facilities.split(",").map((fac, i) => (
                            <span
                                key={i}
                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                            >
                                {fac.trim()}
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500 text-sm">
                            Tidak ada fasilitas khusus
                        </span>
                    )}
                </div>
            </div>

            {room.is_available ? (
                <button
                    onClick={() => onSelect(room)}
                    className="w-full mt-6 bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                    Sewa Kamar Ini
                </button>
            ) : (
                <button
                    className="w-full mt-6 bg-gray-300 text-gray-600 font-semibold py-3 px-4 rounded-lg cursor-not-allowed shadow-sm"
                    disabled
                >
                    Kamar Sudah Terisi
                </button>
            )}
        </div>
    );
}
