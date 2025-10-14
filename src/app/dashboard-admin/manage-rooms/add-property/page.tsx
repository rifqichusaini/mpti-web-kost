// src/app/dashboard-admin/manage-rooms/add-property/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AddPropertyForm from './AddPropertyForm';
import Link from 'next/link';
import { ArrowLeft, Building2 } from 'lucide-react';

export default async function AddPropertyPage() {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login/admin');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/dashboard-admin/manage-rooms"
                        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                    </Link>

                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-emerald-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Tambah Properti Baru</h1>
                            <p className="text-gray-600 mt-1">Daftarkan properti kost Anda</p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                    <AddPropertyForm userId={user.id} />
                </div>

                {/* Info Card */}
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-blue-900 mb-1">Tips</h3>
                            <p className="text-sm text-blue-800">
                                Pastikan nama dan alamat properti Anda jelas dan lengkap. Informasi ini akan membantu calon penyewa menemukan kost Anda dengan mudah.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}