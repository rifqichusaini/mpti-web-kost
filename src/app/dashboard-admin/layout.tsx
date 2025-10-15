/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard-admin/layout.tsx
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Home,
    Users,
    CreditCard,
    History,
    Menu,
    X,
    LogOut,
    ChevronRight,
    User,
    Building
} from 'lucide-react';

const navigation = [
    {
        name: 'Dashboard',
        href: '/dashboard-admin',
        icon: LayoutDashboard,
        description: 'Ringkasan statistik'
    },
    {
        name: 'Kelola Kamar',
        href: '/dashboard-admin/manage-rooms',
        icon: Home,
        description: 'Kelola properti kost'
    },
    {
        name: 'Penyewa',
        href: '/dashboard-admin/booking-request',
        icon: Users,
        description: 'Kelola pemesanan'
    },
    {
        name: 'Metode Pembayaran',
        href: '/dashboard-admin/payment-method',
        icon: CreditCard,
        description: 'Atur pembayaran'
    },
    {
        name: 'History Pembayaran',
        href: '/dashboard-admin/payment-history',
        icon: History,
        description: 'Riwayat transaksi'
    },
];

export default function DashboardAdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClientComponentClient();
    const [breadcrumbs, setBreadcrumbs] = useState<{ name: string; href: string }[]>([]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const getUser = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error || !user) {
                    router.push('/login/admin');
                    return;
                }
                setUser(user);
            } catch (error) {
                console.error('Error fetching user:', error);
                router.push('/login/admin');
            } finally {
                setIsLoading(false);
            }
        };

        const generateBreadcrumbs = async () => {
            const pathSegments = pathname.split('/').filter(segment => segment && segment !== 'dashboard-admin');
            const newBreadcrumbs = [{ name: 'Dashboard', href: '/dashboard-admin' }];

            for (let i = 0; i < pathSegments.length; i++) {
                const segment = pathSegments[i];
                const href = '/dashboard-admin/' + pathSegments.slice(0, i + 1).join('/');
                let name = '';

                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);

                if (isUUID) {
                    if (pathSegments[i - 1] === 'manage-rooms') {
                        const { data: kostData } = await supabase.from('kosts').select('name').eq('id', segment).single();
                        name = kostData?.name || segment;
                    }
                    else if (pathSegments[i - 1] === 'manage') {
                        const { data: roomData } = await supabase.from('rooms').select('room_number').eq('id', segment).single();
                        name = `Kamar ${roomData?.room_number}` || segment;
                    } else {
                        name = segment;
                    }
                } else {
                    const navItem = navigation.find(item => item.href === href);
                    name = navItem ? navItem.name : segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' ');
                }
                newBreadcrumbs.push({ name, href });
            }
            setBreadcrumbs(newBreadcrumbs);
        };

        getUser();
        generateBreadcrumbs();
    }, [pathname, router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login/admin');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 flex">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-80 bg-white/95 backdrop-blur-xl border-r border-gray-200/60 transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-xl lg:shadow-none
      `}>
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200/60 bg-gradient-to-r from-emerald-600 to-teal-600">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Building className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">KostManager</h1>
                                <p className="text-xs text-emerald-100">Admin Dashboard</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-md text-white hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                    group flex items-center space-x-4 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25'
                                            : 'text-gray-600 hover:bg-emerald-50/50 hover:text-emerald-700'
                                        }
                  `}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-emerald-600'}`} />
                                    <div className="flex-1">
                                        <span className="font-medium">{item.name}</span>
                                        <p className="text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            {item.description}
                                        </p>
                                    </div>
                                    {isActive && (
                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-200/60 bg-white/50">
                        <div className="flex items-center space-x-3 mb-4 p-3 rounded-lg bg-white/80 backdrop-blur-sm">
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center shadow-md">
                                <User className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate text-gray-900">{user?.email}</p>
                                <p className="text-xs text-gray-500">Administrator</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white/80 text-gray-700 hover:bg-white hover:shadow-md rounded-xl transition-all duration-200 font-medium border border-gray-200/60"
                        >
                            <LogOut className="w-4 h-4" />
                            <Link
                                href="/"
                            >Logout
                            </Link>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className={`
          sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 transition-all duration-200
          ${isScrolled ? 'shadow-sm' : 'shadow-none'}
        `}>
                    <div className="flex items-center justify-between p-4 lg:p-6">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <nav className="flex items-center space-x-2 text-sm">
                                {breadcrumbs.map((item, index) => (
                                    <div key={item.href} className="flex items-center space-x-2">
                                        {index > 0 && <ChevronRight className="w-4 h-4 text-gray-400" />}
                                        {index === breadcrumbs.length - 1 ? (
                                            <span className="font-semibold text-emerald-600">
                                                {item.name}
                                            </span>
                                        ) : (
                                            <Link
                                                href={item.href}
                                                className="text-gray-500 hover:text-emerald-600 transition-colors"
                                            >
                                                {item.name}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="hidden lg:flex items-center space-x-3 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-2 rounded-xl border border-emerald-200/60">
                                <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full flex items-center justify-center shadow-md">
                                    <User className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-emerald-900">{user?.email}</p>
                                    <p className="text-xs text-emerald-600">Online</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                {breadcrumbs[breadcrumbs.length - 1]?.name}
                            </h1>
                            <p className="text-lg text-gray-600">
                                Selamat datang kembali, <span className="font-semibold text-emerald-600">{user?.email}</span>
                            </p>
                        </div>

                        {/* Content */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}