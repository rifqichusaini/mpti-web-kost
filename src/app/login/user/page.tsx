// src/app/login/user/page.tsx
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from 'lucide-react';

export default function UserLoginPage() {
    const supabase = createClientComponentClient();

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback/user`,
            },
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233B82F6' fill-opacity='0.05'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c-5.523 0-10-4.477-10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c-5.523 0-10-4.477-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
            </div>

            <div className="absolute top-20 left-10 w-24 h-24 bg-blue-100 rounded-full opacity-40 blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-indigo-100 rounded-full opacity-30 blur-xl"></div>
            <div className="absolute top-1/3 right-20 w-16 h-16 bg-blue-200 rounded-full opacity-20 blur-lg"></div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 bg-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text ">
                        KostHub
                    </h1>
                    <p className="text-gray-600 font-medium">Temukan Kost Impian Anda</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Masuk Sebagai Penyewa</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Akses untuk mencari dan membooking kost terbaik
                        </p>
                    </div>

                    <button
                        onClick={handleLogin}
                        className="w-full bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 border-2 border-gray-100 hover:border-green-200 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm hover:shadow-lg group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-green-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        <span className="relative flex items-center">
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span className="group-hover:text-green-700 transition-colors duration-300 font-medium">
                                Lanjutkan dengan Google
                            </span>
                        </span>
                    </button>

                    

                    <div className="mt-8 pt-6 border-t border-gray-100/50">
                        <p className="text-center text-xs text-gray-500 leading-relaxed">
                            Dengan melanjutkan, Anda menyetujui{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline transition-colors">
                                Syarat & Ketentuan
                            </a>{' '}
                            dan{' '}
                            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline transition-colors">
                                Kebijakan Privasi
                            </a>{' '}
                            kami
                        </p>
                    </div>
                </div>

                
            </div>

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <p className="text-xs text-gray-400">KostHub v1.0 • User Portal</p>
            </div>
        </div>
    );
}