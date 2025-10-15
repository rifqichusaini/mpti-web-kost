// src/app/dashboard-admin/manage-rooms/add-property/AddPropertyForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, Loader2 } from 'lucide-react';

interface AddPropertyFormProps {
    userId: string;
}

export default function AddPropertyForm({ userId }: AddPropertyFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validation
        if (!formData.name.trim()) {
            setError('Nama properti harus diisi');
            return;
        }
        
        if (!formData.address.trim()) {
            setError('Alamat properti harus diisi');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/kosts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    owner_id: userId,
                    name: formData.name.trim(),
                    address: formData.address.trim(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Gagal menambahkan properti');
            }

            // Redirect to manage rooms page with the new kost
            router.push(`/dashboard-admin/manage-rooms?kost_id=${result.data.id}`);
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                </div>
            )}

            {/* Nama Properti */}
            <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                    Nama Properti <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building2 className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Contoh: Kost Melati Putih"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        disabled={isSubmitting}
                        required
                    />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                    Berikan nama yang mudah diingat untuk properti Anda
                </p>
            </div>

            {/* Alamat */}
            <div>
                <label htmlFor="address" className="block text-sm font-semibold text-gray-900 mb-2">
                    Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 pt-3 pointer-events-none">
                        <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Contoh: Jl. Mawar No. 123, RT 05/RW 02, Kelurahan Sukamaju, Kecamatan Cibeunying, Kota Bandung, Jawa Barat 40123"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-none"
                        disabled={isSubmitting}
                        required
                    />
                </div>
                <p className="mt-1.5 text-xs text-gray-500">
                    Tulis alamat selengkap mungkin termasuk RT/RW, kelurahan, kecamatan, kota, dan kode pos
                </p>
            </div>

            {/* Buttons */}
            <div className="flex space-x-3 pt-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Menyimpan...</span>
                        </>
                    ) : (
                        <>
                            <Building2 className="w-5 h-5" />
                            <span>Simpan Properti</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}