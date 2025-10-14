// src/app/dashboard-user/components/NotificationModal.tsx
"use client";

import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface NotificationModalProps {
    open: boolean;
    onClose: () => void;
    onPayNow: (bookingId: string) => void; // callback untuk buka PaymentModal
    bookingId: string;
}

export default function NotificationModal({
    open,
    onClose,
    onPayNow,
    bookingId,
}: NotificationModalProps) {
    return (
        <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="flex items-center justify-center min-h-screen">
                <Dialog.Panel className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative">
                    <button
                        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                        onClick={onClose}
                    >
                        <X className="h-5 w-5" />
                    </button>

                    <Dialog.Title className="text-lg font-semibold text-gray-900 mb-4">
                        Notifikasi Pembayaran
                    </Dialog.Title>
                    <p className="text-gray-600 mb-6">
                        Booking kamu sedang diproses. Silakan lanjutkan ke halaman pembayaran untuk menyelesaikan.
                    </p>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100"
                        >
                            Nanti
                        </button>
                        <button
                            onClick={() => {
                                onClose(); 
                                onPayNow(bookingId); 
                            }}
                            className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                            Bayar Sekarang
                        </button>
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
}
