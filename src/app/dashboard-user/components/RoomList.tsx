//src/app/dashboard-user/components/RoomList.tsx
"use client";

import type { Room } from "@/types/room";
import RoomCard from "./RoomCard";

interface RoomListProps {
    rooms: Room[];
    onSelect: (room: Room) => void;
}

export default function RoomList({ rooms, onSelect }: RoomListProps) {
    if (rooms.length === 0) {
        return (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                    </svg>
                </div>
                <p className="text-xl font-semibold text-gray-500 mb-2">
                    Mohon maaf, saat ini tidak ada kamar yang tersedia.
                </p>
                <p className="text-gray-400">Silakan coba lagi nanti.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
                <RoomCard key={room.id} room={room} onSelect={onSelect} />
            ))}
        </div>
    );
}
