// src/app/referral-input/page.tsx
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { KeyRound, AlertCircle, Loader2 } from 'lucide-react';

export default function ReferralInputPage() {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [referralCode, setReferralCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showError, setShowError] = useState(false);

    useEffect(() => {
        // Cek apakah user sudah login
        const checkAuth = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login/user');
                return;
            }

            // Cek apakah sudah verifikasi referral
            const { data: profile } = await supabase
                .from('profiles')
                .select('referral_verified')
                .eq('id', user.id)
                .single();

            if (profile?.referral_verified) {
                router.push('/dashboard-user');
            }
        };

        checkAuth();
    }, [router, supabase]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setShowError(false);

        if (!referralCode.trim()) {
            setError('Kode referral tidak boleh kosong');
            setShowError(true);
            return;
        }

        setIsLoading(true);

        try {
            // Panggil API untuk validasi referral code
            const response = await fetch('/api/validate-referral', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ referralCode: referralCode.trim().toUpperCase() }),
            });

            const data = await response.json();

            if (!response.ok) {
                // DEBUG: Log untuk development
                console.log('❌ Validation failed:', data);
                if (data.debug) {
                    console.log('🔍 Searched code:', data.debug.searchedCode);
                    console.log('📋 Available codes:', data.debug.availableCodes);
                    console.log('💡 Error detail:', data.debug.errorDetail);
                }
                
                setError(data.error || 'Kode referral tidak valid');
                setShowError(true);
                setIsLoading(false);
                return;
            }

            // Jika berhasil, redirect ke dashboard
            router.push('/dashboard-user');
            router.refresh();
        } catch (err) {
            console.error('Error validating referral:', err);
            setError('Terjadi kesalahan. Silakan coba lagi.');
            setShowError(true);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310B981' fill-opacity='0.05'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c-5.523 0-10-4.477-10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c-5.523 0-10-4.477-10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }} />
            </div>

            <div className="absolute top-20 left-10 w-24 h-24 bg-emerald-100 rounded-full opacity-40 blur-xl"></div>
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-blue-100 rounded-full opacity-30 blur-xl"></div>

            <div className="relative w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                        <KeyRound className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Kode Referral
                    </h1>
                    <p className="text-gray-600 font-medium">Masukkan kode dari pemilik kost</p>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="referralCode" className="block text-sm font-semibold text-gray-700 mb-2">
                                Kode Referral
                            </label>
                            <input
                                type="text"
                                id="referralCode"
                                value={referralCode}
                                onChange={(e) => {
                                    setReferralCode(e.target.value.toUpperCase());
                                    setError('');
                                    setShowError(false);
                                }}
                                placeholder="Contoh: KOST123"
                                className="w-full px-4 py-3 border-2 placeholder-gray-300 text-gray-500 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-center text-lg font-semibold tracking-wider uppercase"
                                disabled={isLoading}
                                maxLength={20}
                            />
                            <p className="mt-2 text-xs text-gray-500 text-center">
                                Dapatkan kode dari pemilik kost yang ingin Anda booking
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !referralCode.trim()}
                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Memvalidasi...
                                </>
                            ) : (
                                'Lanjutkan'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Error Modal */}
            {showError && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                            Kode Tidak Valid
                        </h3>
                        <p className="text-gray-600 text-center mb-6">
                            {error}
                        </p>
                        <button
                            onClick={() => setShowError(false)}
                            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                        >
                            Coba Lagi
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}