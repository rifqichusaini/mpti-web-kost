// src/app/dashboard-admin/manage-rooms/add/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import RoomForm from './components/RoomForm';
import { AlertCircle } from 'lucide-react';

export default async function TambahKamarPage({ 
    searchParams 
}: { 
    searchParams: { kost_id?: string } 
}) {
    const supabase = await createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login/admin');
    }

    const kostId = searchParams.kost_id;

    // Jika ada kost_id di URL, ambil kost spesifik tersebut
    if (kostId) {
        const { data: kost, error } = await supabase
            .from('kosts')
            .select('id, name')
            .eq('id', kostId)
            .eq('owner_id', user.id) // Pastikan kost ini milik user yang login
            .single();

        // Jika kost tidak ditemukan atau bukan milik user
        if (error || !kost) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-10 h-10 text-red-600" />
                            </div>
                            
                            <h1 className="text-2xl font-bold text-gray-900 mb-3">
                                Kost Tidak Ditemukan
                            </h1>
                            
                            <p className="text-gray-600 mb-6">
                                Kost yang Anda cari tidak ditemukan atau Anda tidak memiliki akses.
                            </p>

                            <Link
                                href="/dashboard-admin"
                                className="w-full inline-block bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 rounded-xl transition-all duration-200 font-medium"
                            >
                                Kembali ke Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            );
        }

        // Render form dengan kost spesifik
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            Tambahkan Kamar Baru
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Tambahkan kamar baru untuk <span className="font-semibold text-emerald-600">{kost.name}</span>
                        </p>
                    </div>
                    <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
                        <div className="p-8">
                            <RoomForm kostId={kost.id} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Jika tidak ada kost_id, ambil semua kost milik user untuk dipilih
    const { data: kosts, error } = await supabase
        .from('kosts')
        .select('id, name')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

    // Jika tidak punya properti
    if (error || !kosts || kosts.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-10 h-10 text-red-600" />
                        </div>
                        
                        <h1 className="text-2xl font-bold text-gray-900 mb-3">
                            Tidak Ada Properti
                        </h1>
                        
                        <p className="text-gray-600 mb-6">
                            Anda belum memiliki properti kost. Silakan tambahkan properti terlebih dahulu.
                        </p>

                        <div className="space-y-3 p-4">
                            <Link
                                href="/coming-soon"
                                className="w-full inline-block bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                            >
                                Tambah Properti
                            </Link>
                            
                            <Link
                                href="/dashboard-admin"
                                className="w-full inline-block bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 rounded-xl transition-all duration-200 font-medium"
                            >
                                Kembali ke Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Tambahkan Kamar Baru
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Pilih properti dan tambahkan kamar baru
                    </p>
                </div>
                <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 overflow-hidden">
                    <div className="p-8">
                        {/* Pass semua kosts ke RoomForm, bukan hanya 1 */}
                        {/* <RoomForm kosts={kosts} /> */}
                        <RoomForm kostId={kosts[0].id} kostName={kosts[0].name} />
                    </div>
                </div>
            </div>
        </div>
    );
}