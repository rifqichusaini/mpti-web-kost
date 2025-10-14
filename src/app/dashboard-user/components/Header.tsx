// src/app/dashboard-user/components/Header.tsx
"use client";

import { Bell } from "lucide-react";

interface HeaderProps {
    notifications: number;
    onOpenNotif: () => void; 
}

export default function Header({ notifications, onOpenNotif }: HeaderProps) {
    return (
        <header className="flex items-center justify-between py-6">
            <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
                    Cari Kamar Kos
                </h1>
                <p className="mt-1 text-lg text-gray-600">
                    Selamat datang! Temukan kamar yang sesuai dengan kebutuhan Anda
                </p>
            </div>
            <div className="flex items-center gap-4">
                <button
                    className="relative p-2 rounded-full hover:bg-gray-100 transition"
                    onClick={onOpenNotif}
                >
                    <Bell className="h-6 w-6 text-gray-700" />
                    {notifications > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                            {notifications > 9 ? "9+" : notifications}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}
