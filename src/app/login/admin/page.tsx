'use client';

import { useEffect, useState, Suspense } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';

// Komponen Loading Fallback
function LoginLoading() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        </div>
    );
}

// Komponen utama yang menggunakan useSearchParams
function PemilikLoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClientComponentClient();
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const error = searchParams.get('error');
        const details = searchParams.get('details');
        
        if (error) {
            const errorMessages = {
                'invalid-role': 'Akun Anda tidak memiliki akses sebagai pemilik kost.',
                'oauth-failed': 'Login dengan Google gagal. Silakan coba lagi.',
                'already-registered': 'Akun Anda sudah terdaftar sebagai penyewa. Tidak dapat login sebagai pemilik.',
                'profile-creation-failed': 'Gagal membuat profil baru.'
            };
            
            let message = errorMessages[error as keyof typeof errorMessages] || 'Terjadi kesalahan saat login.';
            
            // Tampilkan detail error jika ada
            if (details && error === 'profile-creation-failed') {
                try {
                    const errorDetail = JSON.parse(decodeURIComponent(details));
                    message += `\n\nDetail: ${errorDetail.message} (Code: ${errorDetail.code})`;
                    console.error("Profile creation error details:", errorDetail);
                } catch (e) {
                    console.error("Failed to parse error details:", e);
                }
            }
            
            setErrorMessage(message);
        }
    }, [router, supabase, searchParams]);

    const handleLogin = async () => {
        setErrorMessage('');
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback/admin`,
            },
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2316A34A' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
            </div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21v-4a2 2 0 012-2h4a2 2 0 012 2v4" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">KostHub Admin</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Sebagai Pemilik Kost</h2>
                        <p className="text-gray-600">Silakan masuk untuk mengelola properti Anda</p>
                    </div>

                    {errorMessage && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <p className="text-red-700 text-sm whitespace-pre-line">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogin}
                        className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 border-2 border-gray-200 hover:border-emerald-300 rounded-xl transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md group"
                    >
                        <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="group-hover:text-emerald-600 transition-colors duration-200">
                            Login with Google
                        </span>
                    </button>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-center text-sm text-gray-500">
                            Dengan masuk, Anda menyetujui{' '}
                            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                                Syarat & Ketentuan
                            </a>{' '}
                            dan{' '}
                            <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                                Kebijakan Privasi
                            </a>
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <p className="text-xs text-gray-400">KostHub v1.0 • Admin Portal</p>
            </div>

            <div className="absolute top-10 left-10 w-20 h-20 bg-emerald-100 rounded-full opacity-60"></div>
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-emerald-200 rounded-full opacity-40"></div>
            <div className="absolute top-1/2 left-4 w-12 h-12 bg-emerald-300 rounded-full opacity-30"></div>
        </div>
    );
}

// Export komponen utama dengan Suspense wrapper
export default function PemilikLoginPage() {
    return (
        <Suspense fallback={<LoginLoading />}>
            <PemilikLoginContent />
        </Suspense>
    );
}