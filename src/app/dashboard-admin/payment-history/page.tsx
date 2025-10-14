// app/dashboard-admin/payment-history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Eye, Calendar, User, Home, DollarSign, AlertCircle, Building2 } from "lucide-react";
import Link from "next/link";

interface Payment {
    id: string;
    penyewa_id: string;
    kost_id: string;
    room_id: string;
    amount: number;
    due_date: string;
    proof_url: string;
    status: string;
    created_at: string;
}

interface UserProfile {
    id: string;
    email: string;
}

interface Room {
    id: string;
    room_number: string;
}

interface Kost {
    id: string;
    name: string;
    address: string;
}

export default function PaymentHistoryPage() {
    const supabase = createClientComponentClient();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
    const [kosts, setKosts] = useState<Kost[]>([]);
    const [selectedKostId, setSelectedKostId] = useState<string | 'all'>('all');
    const [users, setUsers] = useState<Record<string, UserProfile>>({});
    const [rooms, setRooms] = useState<Record<string, Room>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Get current user
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                
                if (authError || !user) {
                    setError("Anda harus login terlebih dahulu");
                    setLoading(false);
                    return;
                }

                // Get kost milik owner yang sedang login
                const { data: kostsData, error: kostsError } = await supabase
                    .from("kosts")
                    .select("id, name, address")
                    .eq("owner_id", user.id)
                    .order("name", { ascending: true });

                if (kostsError) {
                    console.error("Error fetching kosts:", kostsError);
                    setError("Gagal mengambil data properti");
                    setLoading(false);
                    return;
                }

                if (!kostsData || kostsData.length === 0) {
                    setKosts([]);
                    setPayments([]);
                    setFilteredPayments([]);
                    setLoading(false);
                    return;
                }

                setKosts(kostsData);

                // Set default selected kost
                if (kostsData.length === 1) {
                    setSelectedKostId(kostsData[0].id);
                } else {
                    setSelectedKostId('all');
                }

                // Ambil semua kost_id milik owner
                const kostIds = kostsData.map(k => k.id);

                // Get payments hanya untuk kost milik owner ini
                const { data: paymentsData, error: paymentsError } = await supabase
                    .from("payments")
                    .select("*")
                    .in("kost_id", kostIds)
                    .order("created_at", { ascending: false });

                if (paymentsError) {
                    console.error("Error fetching payments:", paymentsError);
                    setError("Gagal mengambil data pembayaran");
                    setLoading(false);
                    return;
                }

                if (!paymentsData || paymentsData.length === 0) {
                    setPayments([]);
                    setFilteredPayments([]);
                    setLoading(false);
                    return;
                }

                setPayments(paymentsData);

                // Fetch user profiles
                const userIds = [...new Set(paymentsData.map((p) => p.penyewa_id))];
                const { data: usersData, error: usersError } = await supabase
                    .from("profiles")
                    .select("id, email")
                    .in("id", userIds);

                if (usersError) console.error("Error fetching users:", usersError);

                const userMap: Record<string, UserProfile> = {};
                usersData?.forEach((u) => {
                    if (u.id) userMap[u.id] = u;
                });
                setUsers(userMap);

                // Fetch rooms
                const roomIds = [...new Set(paymentsData.map((p) => p.room_id))];
                const { data: roomsData, error: roomsError } = await supabase
                    .from("rooms")
                    .select("id, room_number")
                    .in("id", roomIds);

                if (roomsError) console.error("Error fetching rooms:", roomsError);

                const roomMap: Record<string, Room> = {};
                roomsData?.forEach((r) => {
                    if (r.id) roomMap[r.id] = r;
                });
                setRooms(roomMap);

            } catch (err) {
                console.error("Unexpected error:", err);
                setError("Terjadi kesalahan yang tidak terduga");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [supabase]);

    // Filter payments berdasarkan kost yang dipilih
    useEffect(() => {
        if (selectedKostId === 'all') {
            setFilteredPayments(payments);
        } else {
            setFilteredPayments(payments.filter(p => p.kost_id === selectedKostId));
        }
    }, [selectedKostId, payments]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'overdue':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-green-100 text-green-800 border-green-200';
        }
    };

    const handleKostChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedKostId(e.target.value);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-8 max-w-md mx-auto">
                            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <Link 
                                href="/dashboard-admin"
                                className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                Kembali ke Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (kosts.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Riwayat Pembayaran</h1>
                        <p className="text-gray-600 mt-2">Kelola dan pantau semua transaksi pembayaran</p>
                    </div>
                    <div className="text-center py-12">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
                            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Properti</h3>
                            <p className="text-gray-500 mb-4">Anda belum memiliki properti kost. Silakan tambahkan properti terlebih dahulu.</p>
                            <Link
                                href="/dashboard-admin/manage-rooms/add-property"
                                className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                Tambah Properti
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (filteredPayments.length === 0 && payments.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Riwayat Pembayaran</h1>
                        <p className="text-gray-600 mt-2">Kelola dan pantau semua transaksi pembayaran</p>
                    </div>

                    {/* Dropdown jika lebih dari 1 kost */}
                    {kosts.length > 1 && (
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter Berdasarkan Properti
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedKostId}
                                    onChange={handleKostChange}
                                    className="w-full md:w-80 px-4 py-3 pr-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer text-gray-900 font-medium"
                                >
                                    <option value="all">Semua Properti</option>
                                    {kosts.map((kost) => (
                                        <option key={kost.id} value={kost.id}>
                                            {kost.name}
                                        </option>
                                    ))}
                                </select>
                                <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    )}

                    <div className="text-center py-12">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
                            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada pembayaran</h3>
                            <p className="text-gray-500">Tidak ada riwayat pembayaran yang tercatat untuk properti Anda saat ini.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Riwayat Pembayaran</h1>
                    <p className="text-gray-600 mt-2">Kelola dan pantau semua transaksi pembayaran dari properti Anda</p>
                </div>

                {/* Dropdown Filter - Hanya tampil jika lebih dari 1 kost */}
                {kosts.length > 1 && (
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filter Berdasarkan Properti
                        </label>
                        <div className="relative">
                            <select
                                value={selectedKostId}
                                onChange={handleKostChange}
                                className="w-full md:w-80 px-4 py-3 pr-10 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none cursor-pointer text-gray-900 font-medium shadow-sm hover:border-emerald-400 transition-colors"
                            >
                                <option value="all">Semua Properti ({payments.length} pembayaran)</option>
                                {kosts.map((kost) => (
                                    <option key={kost.id} value={kost.id}>
                                        {kost.name} ({payments.filter(p => p.kost_id === kost.id).length} pembayaran)
                                    </option>
                                ))}
                            </select>
                            <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                )}

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Total Pembayaran</p>
                        <p className="text-2xl font-bold text-gray-900">{filteredPayments.length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Lunas</p>
                        <p className="text-2xl font-bold text-emerald-600">
                            {filteredPayments.filter(p => p.status === 'paid').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Pending</p>
                        <p className="text-2xl font-bold text-yellow-600">
                            {filteredPayments.filter(p => p.status === 'pending').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Terlambat</p>
                        <p className="text-2xl font-bold text-red-600">
                            {filteredPayments.filter(p => p.status === 'overdue').length}
                        </p>
                    </div>
                </div>

                {/* Payments Table */}
                {filteredPayments.length > 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        {kosts.length > 1 && selectedKostId === 'all' && (
                                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                                <div className="flex items-center space-x-2">
                                                    <Building2 className="w-4 h-4" />
                                                    <span>Properti</span>
                                                </div>
                                            </th>
                                        )}
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4" />
                                                <span>Penyewa</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            <div className="flex items-center space-x-2">
                                                <Home className="w-4 h-4" />
                                                <span>Kamar</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            <div className="flex items-center space-x-2">
                                                <DollarSign className="w-4 h-4" />
                                                <span>Jumlah</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                                            <div className="flex items-center space-x-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>Jatuh Tempo</span>
                                            </div>
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Bukti</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredPayments.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            {kosts.length > 1 && selectedKostId === 'all' && (
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {kosts.find(k => k.id === p.kost_id)?.name || '-'}
                                                        </p>
                                                    </div>
                                                </td>
                                            )}
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {users[p.penyewa_id]?.email || 'Unknown'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        Kamar {rooms[p.room_id]?.room_number || '-'}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-gray-900">
                                                    Rp {p.amount.toLocaleString("id-ID")}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="text-gray-700">
                                                        {new Date(p.due_date).toLocaleDateString("id-ID")}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(p.status)}`}>
                                                    {p.status === 'paid' ? 'Lunas' :
                                                        p.status === 'pending' ? 'Pending' :
                                                            p.status === 'overdue' ? 'Terlambat' : p.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {p.proof_url ? (
                                                    <a
                                                        href={supabase.storage.from("payment_file").getPublicUrl(p.proof_url).data.publicUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span>Lihat</span>
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md mx-auto">
                            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada pembayaran</h3>
                            <p className="text-gray-500">
                                Tidak ada riwayat pembayaran untuk properti yang dipilih.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}