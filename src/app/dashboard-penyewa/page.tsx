// src/app/dashboard-penyewa/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LogoutButton from './LogoutButton';
import { Home, Calendar, CreditCard, MapPin, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface TenantInfo {
  id: string;
  room_number: string;
  kost_name: string;
  kost_address: string;
  due_date: string;
  price: number;
  facilities: string;
}

// Supabase Admin client dengan service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function TenantDashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login/user');
  }

  // Ambil data penyewa menggunakan admin client
  const { data: tenant, error: tenantError } = await supabaseAdmin
    .from('penyewa')
    .select('id, due_date, room_id, kost_id')
    .eq('penyewa_id', user.id)
    .maybeSingle();

  if (tenantError) {
    console.error('Tenant fetch error:', tenantError);
  }

  if (!tenant) {
    // Jika bukan penyewa, redirect ke dashboard user biasa
    redirect('/dashboard-user');
  }

  // Ambil data room
  const { data: room, error: roomError } = await supabaseAdmin
    .from('rooms')
    .select('room_number, price, facilities')
    .eq('id', tenant.room_id)
    .maybeSingle();

  if (roomError) {
    console.error('Room fetch error:', roomError);
  }

  // Ambil data kost menggunakan admin client (bypass RLS)
  const { data: kost, error: kostError } = await supabaseAdmin
    .from('kosts')
    .select('name, address')
    .eq('id', tenant.kost_id)
    .maybeSingle();

  if (kostError) {
    console.error('Kost fetch error:', kostError);
  }

  if (!room || !kost) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Data Tidak Lengkap</h2>
          <p className="text-gray-600 mb-4">
            {!room && 'Data kamar tidak ditemukan. '}
            {!kost && 'Data kost tidak ditemukan. '}
            Hubungi admin untuk bantuan.
          </p>
          <a
            href="/dashboard-user"
            className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }

  const tenantInfo: TenantInfo = {
    id: tenant.id,
    room_number: room.room_number,
    kost_name: kost.name,
    kost_address: kost.address,
    due_date: tenant.due_date,
    price: room.price,
    facilities: room.facilities || 'Tidak ada informasi fasilitas',
  };

  // Hitung hari sampai jatuh tempo
  const dueDate = new Date(tenant.due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - today.getTime();
  const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isNearDue = daysUntilDue <= 7 && daysUntilDue > 0;
  const isOverdue = daysUntilDue < 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Penyewa</h1>
              <p className="text-sm text-gray-600">Informasi kost Anda</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Status Card */}
        <div className={`rounded-2xl p-6 mb-6 ${
          isOverdue 
            ? 'bg-red-50 border-2 border-red-200'
            : isNearDue
            ? 'bg-yellow-50 border-2 border-yellow-200'
            : 'bg-emerald-50 border-2 border-emerald-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isOverdue ? 'bg-red-100' : isNearDue ? 'bg-yellow-100' : 'bg-emerald-100'
              }`}>
                <CreditCard className={`w-6 h-6 ${
                  isOverdue ? 'text-red-600' : isNearDue ? 'text-yellow-600' : 'text-emerald-600'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {isOverdue ? 'Pembayaran Terlambat' : isNearDue ? 'Segera Jatuh Tempo' : 'Status Aktif'}
                </h3>
                <p className={`text-sm ${
                  isOverdue ? 'text-red-600' : isNearDue ? 'text-yellow-600' : 'text-emerald-600'
                }`}>
                  {isOverdue 
                    ? `Terlambat ${Math.abs(daysUntilDue)} hari`
                    : `${daysUntilDue} hari lagi`
                  }
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
              isOverdue 
                ? 'bg-red-100 text-red-700'
                : isNearDue
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {isOverdue ? 'OVERDUE' : 'PAID'}
            </div>
          </div>
          
          {(isOverdue || isNearDue) && (
            <div className={`mt-4 p-3 rounded-lg ${
              isOverdue ? 'bg-red-100' : 'bg-yellow-100'
            }`}>
              <p className={`text-sm ${
                isOverdue ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {isOverdue 
                  ? 'Harap segera lakukan pembayaran untuk menghindari denda atau pemutusan kontrak.'
                  : 'Jatuh tempo pembayaran sudah dekat. Segera lakukan pembayaran.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Info Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Kost Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Informasi Kost</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase">Nama Kost</p>
                <p className="text-sm font-semibold text-gray-900">{tenantInfo.kost_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Nomor Kamar</p>
                <p className="text-sm font-semibold text-gray-900">{tenantInfo.room_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Fasilitas</p>
                <p className="text-sm text-gray-700">{tenantInfo.facilities}</p>
              </div>
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Lokasi</h3>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 uppercase">Alamat</p>
                <p className="text-sm text-gray-700">{tenantInfo.kost_address}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Informasi Pembayaran</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Biaya per Bulan</p>
              <p className="text-xl font-bold text-gray-900">
                Rp {tenantInfo.price.toLocaleString('id-ID')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Jatuh Tempo</p>
              <p className="text-xl font-bold text-gray-900">
                {new Date(tenantInfo.due_date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Sisa Waktu</p>
              <p className={`text-xl font-bold ${
                isOverdue ? 'text-red-600' : isNearDue ? 'text-yellow-600' : 'text-emerald-600'
              }`}>
                {isOverdue ? `Terlambat ${Math.abs(daysUntilDue)} hari` : `${daysUntilDue} hari`}
              </p>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Butuh bantuan?</strong> Hubungi pemilik kost jika ada pertanyaan mengenai pembayaran atau fasilitas.
          </p>
        </div>
      </div>
    </div>
  );
}