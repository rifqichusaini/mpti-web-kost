// src/app/dashboard-user/components/BookingForm.tsx
'use client';

import { useState, useActionState } from 'react';
import { createBookingRequest } from '@/app/dashboard-user/actions';
import SubmitForm from "./SubmitForm";

interface BookingFormProps {
    roomId: string;
    kostId: string;
    onSuccess: () => void;
}

export function BookingForm({ roomId, kostId, onSuccess }: BookingFormProps) {
    const [duration, setDuration] = useState(1);
    
    const initialState = { success: false, message: '' };
    const [state, formAction] = useActionState(createBookingRequest, initialState);

    // Handle success callback - akan dipanggil setelah notifikasi
    const handleSuccessCallback = () => {
        onSuccess();
    };

    return (
        <form className="space-y-4" action={formAction}>
            <input type="hidden" name="room_id" value={roomId} />
            <input type="hidden" name="kost_id" value={kostId} />
            <input type="hidden" name="duration" value={duration.toString()} />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Durasi Sewa (Bulan)
                </label>
                <input
                    type="number"
                    name="duration_input"
                    min="1"
                    max="36"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 text-black"
                    placeholder="Masukkan durasi sewa dalam bulan"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">
                    Minimal 1 bulan, maksimal 36 bulan
                </p>
            </div>

            <SubmitForm formState={state} onSuccess={handleSuccessCallback} />
        </form>
    );
}