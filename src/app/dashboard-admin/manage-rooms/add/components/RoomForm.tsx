// src/components/RoomForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  Home, 
  DollarSign, 
  Wifi, 
  Car, 
  Tv, 
  AirVent, 
  Utensils, 
  Shirt,
  Plus,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

interface RoomFormProps {
    kostId: string;
    kostName?: string;
}

const predefinedFacilities = [
  { id: 'wifi', name: 'WiFi', icon: Wifi },
  { id: 'parkir', name: 'Tempat Parkir', icon: Car },
  { id: 'tv', name: 'TV', icon: Tv },
  { id: 'ac', name: 'AC', icon: AirVent },
  { id: 'kamar-mandi-dalam', name: 'Kamar Mandi Dalam', icon: Shirt },
  { id: 'dapur', name: 'Dapur Bersama', icon: Utensils },
  { id: 'laundry', name: 'Laundry', icon: Shirt }
];

export default function RoomForm({ kostId, kostName }: RoomFormProps) {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [formData, setFormData] = useState({
        roomNumber: '',
        price: '',
        facilities: [] as string[],
        customFacility: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleFacilityToggle = (facility: string) => {
        setFormData(prev => ({
            ...prev,
            facilities: prev.facilities.includes(facility)
                ? prev.facilities.filter(f => f !== facility)
                : [...prev.facilities, facility]
        }));
    };

    const addCustomFacility = () => {
        if (formData.customFacility.trim() && !formData.facilities.includes(formData.customFacility.trim())) {
            setFormData(prev => ({
                ...prev,
                facilities: [...prev.facilities, prev.customFacility.trim()],
                customFacility: ''
            }));
        }
    };

    const removeFacility = (facilityToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            facilities: prev.facilities.filter(f => f !== facilityToRemove)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const newRoom = {
            kost_id: kostId,
            room_number: formData.roomNumber,
            facilities: formData.facilities.join(', '),
            price: parseInt(formData.price),
            is_available: true,
        };

        try {
            const { data, error } = await supabase
                .from('rooms')
                .insert([newRoom])
                .select();

            if (error) throw error;

            setMessage({ type: 'success', text: 'Kamar berhasil ditambahkan!' });
            
            // Redirect after 2 seconds
            setTimeout(() => {
                router.push('/dashboard-admin/manage-rooms');
                router.refresh();
            }, 2000);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Error adding room:', error);
            setMessage({ 
                type: 'error', 
                text: error.message || 'Gagal menambahkan kamar. Silakan coba lagi.' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali</span>
                </button>
                
                <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <Home className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tambah Kamar Baru</h1>
                        {kostName && (
                            <p className="text-gray-600">Properti: {kostName}</p>
                        )}
                    </div>
                </div>
                <p className="text-gray-500">Isi informasi detail kamar yang akan ditambahkan</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 text-black">
                {/* Room Number */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <span className="flex items-center space-x-2">
                            <Home className="w-4 h-4" />
                            <span>Nomor Kamar</span>
                        </span>
                    </label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        placeholder="Contoh: A101, 201, etc. text-black"
                        value={formData.roomNumber}
                        onChange={(e) => setFormData(prev => ({ ...prev, roomNumber: e.target.value }))}
                        required
                    />
                </div>

                {/* Price */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                        <span className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4" />
                            <span>Harga Sewa Bulanan</span>
                        </span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">Rp</span>
                        <input
                            type="number"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            placeholder="0"
                            value={formData.price}
                            onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            min="0"
                            required
                        />
                    </div>
                    {formData.price && (
                        <p className="text-sm text-gray-600 mt-2">
                            {parseInt(formData.price).toLocaleString('id-ID')} per bulan
                        </p>
                    )}
                </div>

                {/* Facilities */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Fasilitas Kamar
                    </label>
                    
                    {/* Predefined Facilities */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {predefinedFacilities.map((facility) => {
                            const Icon = facility.icon;
                            const isSelected = formData.facilities.includes(facility.name);
                            
                            return (
                                <button
                                    key={facility.id}
                                    type="button"
                                    onClick={() => handleFacilityToggle(facility.name)}
                                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                                        isSelected
                                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:border-emerald-300'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="text-sm font-medium">{facility.name}</span>
                                    {isSelected && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom Facility */}
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Tambah fasilitas custom..."
                            value={formData.customFacility}
                            onChange={(e) => setFormData(prev => ({ ...prev, customFacility: e.target.value }))}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomFacility())}
                        />
                        <button
                            type="button"
                            onClick={addCustomFacility}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Selected Facilities */}
                    {formData.facilities.length > 0 && (
                        <div className="mt-4">
                            <p className="text-sm text-gray-600 mb-2">Fasilitas terpilih:</p>
                            <div className="flex flex-wrap gap-2">
                                {formData.facilities.map((facility, index) => (
                                    <span
                                        key={index}
                                        className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm"
                                    >
                                        <span>{facility}</span>
                                        <button
                                            type="button"
                                            onClick={() => removeFacility(facility)}
                                            className="ml-1 hover:text-emerald-900"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Message */}
                {message && (
                    <div className={`p-4 rounded-lg ${
                        message.type === 'success' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center space-x-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                <span>Menambahkan...</span>
                            </span>
                        ) : (
                            <span className="flex items-center justify-center space-x-2">
                                <Plus className="w-4 h-4" />
                                <span>Tambahkan Kamar</span>
                            </span>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}