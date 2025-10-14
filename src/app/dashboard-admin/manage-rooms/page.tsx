// src/app/dashboard-admin/manage-rooms/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
    Plus,
    Home,
    CheckCircle,
    XCircle,
    Wifi,
    Car,
    Tv,
    AirVent,
    Settings,
    AlertCircle,
    Building2,
    MapPin,
    ArrowRight
} from 'lucide-react';

interface Room {
    id: string;
    room_number: string;
    price: number;
    facilities: string;
    is_available: boolean;
    description?: string;
}

interface Kost {
    id: string;
    name: string;
    address: string;
}

export default async function ManageRoomsPage({
    searchParams,
}: {
    searchParams: { kost_id?: string };
}) {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login/admin');
    }

    const { data: kosts, error } = await supabase
        .from('kosts')
        .select('id, name, address')
        .eq('owner_id', user.id)
        .order('name', { ascending: true });

    // Tampilkan error jika tidak punya properti
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
                            Anda belum memiliki properti kost. Silakan tambahkan properti terlebih dahulu untuk dapat mengelola kamar.
                        </p>

                        <div className="space-y-3">
                            <Link
                                href="/dashboard-admin/manage-rooms/add-property"
                                className="w-full inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Tambah Properti</span>
                            </Link>
                            
                            <Link
                                href="/dashboard-admin"
                                className="w-full inline-flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 rounded-xl transition-all duration-200 font-medium"
                            >
                                <span>Kembali ke Dashboard</span>
                            </Link>
                        </div>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700">
                                    <strong>Error:</strong> {error.message}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Jika punya lebih dari 1 kost DAN belum pilih kost_id, tampilkan pilihan
    if (kosts.length > 1 && !searchParams.kost_id) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pilih Properti</h1>
                        <p className="text-gray-600">Pilih properti kost yang ingin Anda kelola</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {kosts.map((kost: Kost) => (
                            <Link
                                key={kost.id}
                                href={`/dashboard-admin/manage-rooms?kost_id=${kost.id}`}
                                className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 overflow-hidden"
                            >
                                <div className="h-48 bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                                    <Building2 className="w-16 h-16 text-emerald-600" />
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                                        {kost.name}
                                    </h3>
                                    <div className="flex items-start space-x-2 text-gray-600 mb-4">
                                        <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                                        <p className="text-sm">{kost.address}</p>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <span className="text-sm font-medium text-emerald-600 group-hover:text-emerald-700">
                                            Kelola Properti
                                        </span>
                                        <ArrowRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Card untuk Tambah Properti Baru */}
                        <Link
                            href="/dashboard-admin/manage-rooms/add-property"
                            className="group bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-sm border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 overflow-hidden flex items-center justify-center min-h-[320px]"
                        >
                            <div className="text-center p-6">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-200 transition-colors">
                                    <Plus className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">
                                    Tambah Properti Baru
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Daftarkan properti kost baru Anda
                                </p>
                            </div>
                        </Link>
                    </div>

                    <div className="mt-8">
                        <Link
                            href="/dashboard-admin"
                            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <span>← Kembali ke Dashboard</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Ambil kost yang dipilih (atau kost pertama jika hanya 1)
    const selectedKostId = searchParams.kost_id || kosts[0].id;
    const kost = kosts.find(k => k.id === selectedKostId) || kosts[0];

    // Ambil rooms untuk kost yang dipilih
    const { data: rooms, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .eq('kost_id', kost.id)
        .order('room_number');

    if (roomsError) {
        console.error('Error fetching rooms:', roomsError.message);
    }

    const getFacilityIcon = (facility: string) => {
        const facilityIcons: { [key: string]: any } = {
            'wifi': Wifi,
            'parkir': Car,
            'tv': Tv,
            'ac': AirVent,
            'kamar mandi dalam': CheckCircle,
            'dapur': CheckCircle,
            'laundry': CheckCircle
        };

        for (const [key, icon] of Object.entries(facilityIcons)) {
            if (facility.toLowerCase().includes(key)) {
                return icon;
            }
        }
        return CheckCircle;
    };

    const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) => (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-600">{label}</p>
                    <p className="text-lg font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );

    const totalRooms = rooms?.length || 0;
    const availableRooms = rooms?.filter(room => room.is_available).length || 0;
    const occupiedRooms = totalRooms - availableRooms;

    return (
        <div className="space-y-6 p-6">
            {/* Header dengan navigasi kembali dan pilih kost */}
            {kosts.length > 1 && (
                <div className="mb-4">
                    <Link
                        href="/dashboard-admin/manage-rooms"
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                        <span>Pilih Properti Lain</span>
                    </Link>
                </div>
            )}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{kost.name}</h1>
                    <div className="flex items-center space-x-2 text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        <p>{kost.address}</p>
                    </div>
                </div>

                <div className="flex space-x-3">
                    <Link
                        href="/dashboard-admin/manage-rooms/add-property"
                        className="inline-flex items-center space-x-2 bg-white border-2 border-emerald-600 text-emerald-600 px-6 py-3 rounded-xl hover:bg-emerald-50 transition-all duration-200 font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Tambah Properti</span>
                    </Link>
                    <Link
                        href={`/dashboard-admin/manage-rooms/add?kost_id=${kost.id}`}
                        className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Tambah Kamar Baru</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                    icon={Home}
                    label="Total Kamar"
                    value={totalRooms}
                    color="bg-blue-500"
                />
                <StatCard
                    icon={CheckCircle}
                    label="Tersedia"
                    value={availableRooms}
                    color="bg-emerald-500"
                />
                <StatCard
                    icon={XCircle}
                    label="Terisi"
                    value={occupiedRooms}
                    color="bg-amber-500"
                />
            </div>

            <div className="mt-8">
                {rooms && rooms.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {rooms.map((room: Room) => (
                            <div
                                key={room.id}
                                className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 hover:border-emerald-200 overflow-hidden"
                            >
                                <div className={`p-6 border-b ${room.is_available ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">Kamar {room.room_number}</h3>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${room.is_available
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                    {room.is_available ? (
                                                        <>
                                                            <CheckCircle className="w-3 h-3" />
                                                            <span>Tersedia</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-3 h-3" />
                                                            <span>Terisi</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-600">Harga Bulanan</p>
                                            <p className="text-lg font-bold text-emerald-600">
                                                Rp {room.price.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        <span>Fasilitas Kamar</span>
                                    </h4>

                                    {room.facilities && room.facilities.split(',').length > 0 ? (
                                        <div className="grid grid-cols-2 gap-2">
                                            {room.facilities.split(',').map((facility, index) => {
                                                const FacilityIcon = getFacilityIcon(facility.trim());
                                                return (
                                                    <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <FacilityIcon className="w-3 h-3 text-emerald-600" />
                                                        <span>{facility.trim()}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">Tidak ada fasilitas tambahan</p>
                                    )}

                                    {room.description && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600 line-clamp-2">{room.description}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="px-6 pb-6">
                                    <Link
                                        href={`/dashboard-admin/manage-rooms/${kost.id}/manage/${room.id}`}
                                        className="w-full inline-flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium group-hover:bg-emerald-50 group-hover:text-emerald-700"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Kelola Kamar</span>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="max-w-md mx-auto">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Home className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Belum Ada Kamar</h3>
                            <p className="text-gray-600 mb-6">
                                Mulai dengan menambahkan kamar pertama ke properti kost Anda.
                            </p>
                            <Link
                                href={`/dashboard-admin/manage-rooms/add?kost_id=${kost.id}`}
                                className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-3 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg font-medium"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Tambah Kamar Pertama</span>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            {rooms && rooms.length > 0 && (
                <div className="mt-8 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-semibold text-gray-900">Ringkasan Properti</h4>
                            <p className="text-sm text-gray-600">
                                {availableRooms} dari {totalRooms} kamar tersedia untuk disewa
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}