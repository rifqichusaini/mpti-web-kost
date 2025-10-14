// src/app/dashboard-admin/manage-rooms/[kostId]/manage/[roomId]/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient } from '@supabase/supabase-js';
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Home, DollarSign, CheckCircle, XCircle } from "lucide-react";
import RoomAvailabilityCheckbox from "@/app/dashboard-admin/manage-rooms/components/RoomAvailabilityCheckbox";
import DeleteRoomButton from "@/app/dashboard-admin/manage-rooms/components/DeleteRoomButton";

export default async function ManageRoomPage({
    params,
}: {
    params: { kostId: string; roomId: string };
}) {
    const supabase = createServerComponentClient({ cookies });
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login/admin");
    }

    const { data: room, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("id", params.roomId)
        .eq("kost_id", params.kostId)
        .single();

    if (error || !room) {
        return (
            <div className="flex flex-col p-6">
                <div className="p-6 text-center text-red-600">
                    Kamar tidak ditemukan.
                </div>
                <div className="self-end">
                    <Link 
                        href={`/dashboard-admin/manage-rooms?kost_id=${params.kostId}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                        ← Kembali ke Daftar Kamar
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <Link
                href="/dashboard-admin/manage-rooms"
                className="inline-flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
            </Link>
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Home className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Kelola Kamar</h1>
                        <p className="text-gray-600">Kamar {room.room_number}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                        <h2 className="text-lg font-semibold text-gray-900">Informasi Kamar</h2>
                    </div>

                    <form
                        action={async (formData) => {
                            "use server";
                            
                            const supabase = createServerComponentClient({ cookies });
                            const supabaseAdmin = createClient(
                                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                                process.env.SUPABASE_SERVICE_ROLE_KEY!
                            );

                            const roomNumber = formData.get("room_number") as string;
                            const price = Number(formData.get("price"));
                            const facilities = formData.get("facilities") as string;
                            const isAvailable = formData.get("is_available") === "on";

                            try {
                                // Jika kamar berubah dari terisi ke tersedia
                                if (isAvailable && !room.is_available) {
                                    console.log('Kamar berubah dari terisi ke tersedia, menghapus data terkait...');
                                    
                                    // 1. Hapus booking_requests DULU (ini yang missing!)
                                    const { error: deleteBookingError } = await supabaseAdmin
                                        .from("booking_requests")
                                        .delete()
                                        .eq("room_id", params.roomId);

                                    if (deleteBookingError && deleteBookingError.code !== 'PGRST116') {
                                        console.error('Error menghapus booking requests:', deleteBookingError);
                                        throw new Error('Gagal menghapus booking requests');
                                    }

                                    // 2. Hapus payments jika ada
                                    const { error: deletePaymentsError } = await supabaseAdmin
                                        .from("payments")
                                        .delete()
                                        .eq("room_id", params.roomId);

                                    if (deletePaymentsError && deletePaymentsError.code !== 'PGRST116') {
                                        console.error('Error menghapus payments:', deletePaymentsError);
                                    }

                                    // 3. Baru hapus penyewa
                                    const { error: deleteError, count } = await supabaseAdmin
                                        .from("penyewa")
                                        .delete()
                                        .eq("room_id", params.roomId)
                                        .eq("kost_id", params.kostId);

                                    if (deleteError) {
                                        console.error('Error menghapus penyewa:', deleteError);
                                        throw new Error('Gagal menghapus penyewa dari kamar');
                                    }

                                    console.log(`Berhasil menghapus ${count || 0} penyewa dari kamar`);
                                }

                                // Update data kamar
                                const { error: updateError } = await supabase
                                    .from("rooms")
                                    .update({
                                        room_number: roomNumber,
                                        price,
                                        facilities,
                                        is_available: isAvailable,
                                    })
                                    .eq("id", params.roomId);

                                if (updateError) {
                                    console.error('Error update kamar:', updateError);
                                    throw new Error('Gagal mengupdate data kamar');
                                }

                                console.log('Kamar berhasil diupdate');
                                
                            } catch (error) {
                                console.error('Error dalam proses update:', error);
                            }

                            redirect(`/dashboard-admin/manage-rooms`);
                        }}
                        className="p-6 space-y-6 text-black"
                    >
                        {/* Nomor Kamar */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                <span className="flex items-center space-x-2">
                                    <Home className="w-4 h-4" />
                                    <span>Nomor Kamar</span>
                                </span>
                            </label>
                            <input
                                type="text"
                                name="room_number"
                                defaultValue={room.room_number}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                placeholder="Contoh: A101, 201, etc."
                            />
                        </div>

                        {/* Harga */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                <span className="flex items-center space-x-2">
                                    <DollarSign className="w-4 h-4" />
                                    <span>Harga Sewa Bulanan</span>
                                </span>
                            </label>

                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                                <input
                                    type="number"
                                    name="price"
                                    defaultValue={room.price} 
                                    required
                                    min={0}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                />
                            </div>

                            {room.price !== undefined && room.price !== null && (
                                <p className="text-sm text-gray-500 mt-2">
                                    {Number(room.price).toLocaleString('id-ID')} per bulan
                                </p>
                            )}
                        </div>

                        {/* Fasilitas */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Fasilitas Kamar
                            </label>
                            <textarea
                                name="facilities"
                                defaultValue={room.facilities || ""}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                                placeholder="Pisahkan dengan koma. Contoh: WiFi, AC, Kamar Mandi Dalam, TV"
                            />
                        </div>

                        {/* Ketersediaan */}
                        <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                            <RoomAvailabilityCheckbox
                                defaultChecked={room.is_available}
                                label={room.is_available ? "Kamar Tersedia" : "Kamar Terisi"}
                            />
                        </div>
                        
                        {/* Status Indicator */}
                        <div className={`p-3 rounded-lg text-center ${room.is_available
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}>
                            <p className="text-sm font-medium">
                                {room.is_available
                                    ? '✅ Kamar ini saat ini tersedia untuk disewa'
                                    : '⏳ Kamar ini sedang ditempati'
                                }
                            </p>
                        </div>

                        {/* Warning untuk penghapusan penyewa */}
                        {!room.is_available && (
                            <div className="p-3 rounded-lg bg-orange-50 border border-orange-200">
                                <p className="text-sm text-orange-700">
                                    ⚠️ <strong>Perhatian:</strong> Jika Anda menandai kamar sebagai tersedia, 
                                    semua penyewa yang terdaftar di kamar ini akan dihapus secara otomatis.
                                </p>
                            </div>
                        )}

                        {/* Tombol Aksi */}
                        <div className="space-y-3 pt-4">
                            {/* Tombol Update */}
                            <div className="flex space-x-4">
                                <Link
                                    href="/dashboard-admin/manage-rooms"
                                    className="flex-1 flex items-center justify-center py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Batal
                                </Link>
                                
                                <button
                                    type="submit"
                                    className="flex-1 flex items-center justify-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 font-medium shadow-lg"
                                >
                                    Simpan Perubahan
                                </button>
                            </div>

                            
                            {/* Divider */}
                            <div className="border-t border-gray-200 pt-3">
                                <p className="text-xs text-gray-500 text-center mb-3">Zona Berbahaya</p>
                            </div>
                        </div>
                    </form>

                    {/* Form Hapus Kamar - Terpisah dari form utama */}
                    <div className="px-6 pb-6">
                        <form
                            action={async () => {
                                "use server";
                                
                                // Service role client untuk operasi admin
                                const supabaseAdmin = createClient(
                                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                                    process.env.SUPABASE_SERVICE_ROLE_KEY!
                                );

                                try {
                                    // 1. Hapus semua booking requests dari kamar ini
                                    const { error: deleteBookingError } = await supabaseAdmin
                                        .from("booking_requests")
                                        .delete()
                                        .eq("room_id", params.roomId);

                                    if (deleteBookingError && deleteBookingError.code !== 'PGRST116') {
                                        console.error('Error menghapus booking requests:', deleteBookingError);
                                        throw new Error('Gagal menghapus booking requests dari kamar');
                                    }

                                    // 2. Hapus dari tabel bookings jika ada
                                    const { error: deleteBookingsError } = await supabaseAdmin
                                        .from("bookings")
                                        .delete()
                                        .eq("room_id", params.roomId);

                                    if (deleteBookingsError && deleteBookingsError.code !== 'PGRST116') {
                                        console.error('Error menghapus bookings:', deleteBookingsError);
                                        throw new Error('Gagal menghapus bookings dari kamar');
                                    }

                                    // 3. Hapus dari tabel payments jika ada
                                    const { error: deletePaymentsError } = await supabaseAdmin
                                        .from("payments")
                                        .delete()
                                        .eq("room_id", params.roomId);

                                    if (deletePaymentsError && deletePaymentsError.code !== 'PGRST116') {
                                        console.error('Error menghapus payments:', deletePaymentsError);
                                    }

                                    // 4. Hapus semua penyewa dari kamar ini
                                    const { error: deleteTenantsError } = await supabaseAdmin
                                        .from("penyewa")
                                        .delete()
                                        .eq("room_id", params.roomId)
                                        .eq("kost_id", params.kostId);

                                    if (deleteTenantsError && deleteTenantsError.code !== 'PGRST116') {
                                        console.error('Error menghapus penyewa:', deleteTenantsError);
                                        throw new Error('Gagal menghapus penyewa dari kamar');
                                    }

                                    // 5. Hapus kamar
                                    const { error: deleteRoomError } = await supabaseAdmin
                                        .from("rooms")
                                        .delete()
                                        .eq("id", params.roomId)
                                        .eq("kost_id", params.kostId);

                                    if (deleteRoomError) {
                                        console.error('Error menghapus kamar:', deleteRoomError);
                                        throw new Error('Gagal menghapus kamar');
                                    }

                                    console.log('Kamar berhasil dihapus');
                                    
                                } catch (error) {
                                    console.error('Error dalam proses penghapusan:', error);
                                    // Bisa ditambahkan redirect ke error page
                                }

                                // Redirect kembali ke halaman manage rooms
                                redirect(`/dashboard-admin/manage-rooms`);
                            }}
                        >
                            
                            <DeleteRoomButton 
                            roomId={room.id}  // Pass room ID dari database
                            roomNumber={room.room_number} 
                            />

                            <p className="text-xs text-gray-500 text-center mt-2">
                                ⚠️ Tindakan ini akan menghapus kamar dan semua data terkait secara permanen
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}