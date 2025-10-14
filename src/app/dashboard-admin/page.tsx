"use client";

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Users,
    Home,
    Calendar,
    DollarSign,
    TrendingUp,
    Clock,
    CheckCircle,
    XCircle,
    Book
} from 'lucide-react';

export default function DashboardAdminSummaryPage() {
    const router = useRouter();
    const supabase = createClientComponentClient();
    
    const [isLoading, setIsLoading] = useState(true);
    interface BookingData {
        id: string;
        status: string;
        created_at: string;
    }

    interface PaymentData {
        id: string;
        amount: number;
        status: string;
        created_at: string;
    }

    const [stats, setStats] = useState<{
        totalKosts: number;
        totalRooms: number;
        availableRooms: number;
        occupiedRooms: number;
        totalBookings: number;
        pendingBookings: number;
        approvedBookings: number;
        totalRevenue: number;
        pendingPayments: number;
        recentBookings: BookingData[];
        recentPayments: PaymentData[];
    }>({
        totalKosts: 0,
        totalRooms: 0,
        availableRooms: 0,
        occupiedRooms: 0,
        totalBookings: 0,
        pendingBookings: 0,
        approvedBookings: 0,
        totalRevenue: 0,
        pendingPayments: 0,
        recentBookings: [],
        recentPayments: []
    });

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.push('/login/admin');
                return;
            }   

            const { data: kosts } = await supabase
                .from('kosts')
                .select('id, name')
                .eq('owner_id', user.id);

            const kostIds = kosts?.map(kost => kost.id) || [];

            const { data: rooms } = await supabase
                .from('rooms')
                .select('id, is_available')
                .in('kost_id', kostIds);

            const { data: bookings } = await supabase
                .from('booking_requests')
                .select('id, status, created_at')
                .in('kost_id', kostIds);

            const { data: payments } = await supabase
                .from('payments')
                .select('id, amount, status, created_at')
                .in('kost_id', kostIds);

            const totalKosts = kosts?.length || 0;
            const totalRooms = rooms?.length || 0;
            const availableRooms = rooms?.filter(room => room.is_available === true).length || 0;
            const occupiedRooms = rooms?.filter(room => room.is_available === false).length || 0;

            const totalBookings = bookings?.length || 0;
            const pendingBookings = bookings?.filter(booking => booking.status === 'pending').length || 0;
            const approvedBookings = bookings?.filter(booking => booking.status === 'approved').length || 0;

            const totalRevenue = payments?.filter(p => p.status === 'approved').reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
            const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0;

            const recentBookings = bookings?.slice(-5).reverse() || [];
            const recentPayments = payments?.slice(-5).reverse() || [];

            setStats({
                totalKosts,
                totalRooms,
                availableRooms,
                occupiedRooms,
                totalBookings,
                pendingBookings,
                approvedBookings,
                totalRevenue,
                pendingPayments,
                recentBookings,
                recentPayments
            });

            setIsLoading(false);
        };

        fetchData();
    }, [router, supabase]);

    const lastMonthRevenue = 3000000; // Atau query dari database
    const revenueGrowth = lastMonthRevenue > 0 
        ? Math.round(((stats.totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0;

    const StatCard = ({
        title,
        value,
        icon: Icon,
        trend,
        description,
        color = 'blue'
    }: {
        title: string;
        value: string | number;
        icon: any;
        trend?: string;
        description?: string;
        color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
    }) => {
        const colorClasses = {
            blue: 'bg-blue-50 text-blue-600',
            green: 'bg-green-50 text-green-600',
            red: 'bg-red-50 text-red-600',
            yellow: 'bg-yellow-50 text-yellow-600',
            purple: 'bg-purple-50 text-purple-600'
        };

        return (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                        {description && (
                            <p className="text-xs text-gray-500 mt-1">{description}</p>
                        )}
                    </div>
                    <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                        <Icon size={24} />
                    </div>
                </div>
                {trend && (
                    <div className="flex items-center mt-4">
                        <TrendingUp size={16} className="text-green-500 mr-1" />
                        <span className="text-sm text-green-600">{trend}</span>
                    </div>
                )}
            </div>
        );
    };

    const ActivityItem = ({
        type,
        title,
        description,
        time,
        status
    }: {
        type: 'booking' | 'payment';
        title: string;
        description: string;
        time: string;
        status: 'success' | 'pending' | 'failed';
    }) => {
        const statusIcon = {
            success: <CheckCircle size={16} className="text-green-500" />,
            pending: <Clock size={16} className="text-yellow-500" />,
            failed: <XCircle size={16} className="text-red-500" />
        };

        const statusColor = {
            success: 'text-green-600 bg-green-50',
            pending: 'text-yellow-600 bg-yellow-50',
            failed: 'text-red-600 bg-red-50'
        };

        return (
            <div className="flex items-start space-x-3 py-3">
                <div className={`p-2 rounded-full ${type === 'booking' ? 'bg-blue-50' : 'bg-green-50'}`}>
                    {type === 'booking' ? <Home size={16} className="text-blue-600" /> : <DollarSign size={16} className="text-green-600" />}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{title}</p>
                    <p className="text-sm text-gray-500">{description}</p>
                    <p className="text-xs text-gray-400 mt-1">{time}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[status]}`}>
                    <div className="flex items-center space-x-1">
                        {statusIcon[status]}
                        <span>{status === 'success' ? 'Berhasil' : status === 'pending' ? 'Pending' : 'Gagal'}</span>
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Ringkasan Menu</h1>
                    <div className="flex items-center mt-4 space-x-2 text-sm text-gray-500">
                        <Calendar size={16} />
                        <span>{new Date().toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Properti"
                        value={stats.totalKosts}
                        icon={Home}
                        description="Kost yang dikelola"
                        color="blue"
                    />
                    <StatCard
                        title="Total Kamar"
                        value={stats.totalRooms}
                        icon={Users}
                        description={`${stats.availableRooms} tersedia, ${stats.occupiedRooms} terisi`}
                        color="green"
                    />
                    <StatCard
                        title="Pemesanan"
                        value={stats.totalBookings}
                        icon={Calendar}
                        description={`${stats.pendingBookings} menunggu`}
                        color="purple"
                    />
                    <StatCard
                        title="Pendapatan"
                        value={`${stats.totalRevenue.toLocaleString('id-ID')}`}
                        icon={DollarSign}
                        description={`${stats.pendingPayments} pembayaran tertunda`}
                        color="yellow"
                    />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
                            </div>
                            <div className="p-6">
                                {stats.recentBookings.length > 0 || stats.recentPayments.length > 0 ? (
                                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                                        {stats.recentBookings.map((booking, index: number) => (
                                            <ActivityItem
                                                key={`booking-${index}`}
                                                type="booking"
                                                title="Pemesanan Baru"
                                                description={`Status: ${booking.status}`}
                                                time={new Date(booking.created_at).toLocaleDateString('id-ID')}
                                                status={booking.status === 'approved' ? 'success' : (booking.status === 'pending' || booking.status === 'process') ? 'pending' : 'failed'}
                                            />
                                        ))}
                                        {stats.recentPayments.map((payment, index: number) => (
                                            <ActivityItem
                                                key={`payment-${index}`}
                                                type="payment"
                                                title="Pembayaran"
                                                description={`Rp ${payment.amount?.toLocaleString('id-ID') || '0'}`}
                                                time={new Date(payment.created_at).toLocaleDateString('id-ID')}
                                                status={payment.status === 'completed' ? 'success' : payment.status === 'approved' ? 'success' : payment.status === 'pending' ? 'pending' : 'failed'} 
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500">Belum ada aktivitas terbaru</p>
                                    </div>
                                )}
                            </div>
                            
                            <style jsx>{`
                                .custom-scrollbar::-webkit-scrollbar {
                                    width: 6px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-track {
                                    background: #f3f4f6;
                                    border-radius: 10px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb {
                                    background: #d1d5db;
                                    border-radius: 10px;
                                }
                                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                    background: #9ca3af;
                                }
                                .custom-scrollbar {
                                    scrollbar-width: thin;
                                    scrollbar-color: #d1d5db #f3f4f6;
                                }
                            `}</style>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Aksi Cepat</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <Link href="/dashboard-admin/manage-rooms/add" 
                                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors group">
                                    <Home size={24} className="text-gray-400 group-hover:text-blue-500 mb-2" />
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Tambah Kamar</span>
                                </Link>

                                <Link href="/dashboard-admin/manage-rooms" 
                                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors group">
                                    <Users size={24} className="text-gray-400 group-hover:text-green-500 mb-2" />
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-green-600">Kelola Kamar</span>
                                </Link>

                                <Link href="/dashboard-admin/booking-request" 
                                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors group">
                                    <Book size={24} className="text-gray-400 group-hover:text-purple-500 mb-2" />
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-purple-600">Manajemen Kost</span>
                                </Link>

                                <Link href="/dashboard-admin/payment-history" 
                                    className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors group">
                                    <DollarSign size={24} className="text-gray-400 group-hover:text-yellow-500 mb-2" />
                                    <span className="text-sm font-medium text-gray-600 group-hover:text-yellow-600">History Pembayaran</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100">Kamar Tersedia</p>
                                <p className="text-2xl font-bold mt-1">{stats.availableRooms}</p>
                                <p className="text-blue-100 text-sm mt-2">{stats.totalRooms > 0 ? Math.round((stats.availableRooms / stats.totalRooms) * 100) : 0}% dari total</p>
                            </div>
                            <Home size={32} className="text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100">Pemesanan Disetujui</p>
                                <p className="text-2xl font-bold mt-1">{stats.approvedBookings}</p>
                                <p className="text-green-100 text-sm mt-2">{stats.totalBookings > 0 ? Math.round((stats.approvedBookings / stats.totalBookings) * 100) : 0}% dari total</p>
                            </div>
                            <CheckCircle size={32} className="text-green-200" />
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100">Pendapatan Bulan Ini</p>
                                <p className="text-2xl font-bold mt-1">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
                                <p className="text-purple-100 text-sm mt-2">
                                    {revenueGrowth > 0 ? '+' : ''}{revenueGrowth}% dari bulan lalu
                                </p>
                            </div>
                            <TrendingUp size={32} className="text-purple-200" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}