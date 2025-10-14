'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { addPaymentMethod } from '../actions';
import { Banknote, CreditCard, Upload, Save, Image } from 'lucide-react';

interface PaymentMethodFormProps {
    kostId: string;
}

const initialState = {
    success: false,
    message: '',
};

export default function PaymentMethodForm({ kostId }: PaymentMethodFormProps) {
    const [state, formAction] = useActionState(addPaymentMethod, initialState);
    const [methodType, setMethodType] = useState('rekening');
    const [fileName, setFileName] = useState<string>('');
    const { pending } = useFormStatus();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Tambah Metode Pembayaran</h1>
                <p className="text-gray-600 mt-2">Tambahkan metode pembayaran untuk properti kost Anda</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <form action={formAction} className="space-y-6">
                    <input type="hidden" name="kost_id" value={kostId} />

                    {/* Jenis Pembayaran */}
                    <div>
                        <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                            <Banknote className="w-5 h-5 text-gray-400" />
                            <span>Jenis Pembayaran</span>
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div 
                                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                                    methodType === 'rekening' 
                                        ? 'border-emerald-500 bg-emerald-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setMethodType('rekening')}
                            >
                                <div className="flex items-center space-x-3">
                                    <input
                                        id="rekening"
                                        name="type"
                                        type="radio"
                                        value="rekening"
                                        checked={methodType === 'rekening'}
                                        onChange={() => setMethodType('rekening')}
                                        className="h-5 w-5 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <CreditCard className="w-6 h-6 text-gray-600" />
                                    <div>
                                        <label htmlFor="rekening" className="block text-sm font-semibold text-gray-900">
                                            Rekening Bank
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">Transfer bank</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div 
                                className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${
                                    methodType === 'qris' 
                                        ? 'border-emerald-500 bg-emerald-50' 
                                        : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => setMethodType('qris')}
                            >
                                <div className="flex items-center space-x-3">
                                    <input
                                        id="qris"
                                        name="type"
                                        type="radio"
                                        value="qris"
                                        checked={methodType === 'qris'}
                                        onChange={() => setMethodType('qris')}
                                        className="h-5 w-5 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <Banknote className="w-6 h-6 text-gray-600" />
                                    <div>
                                        <label htmlFor="qris" className="block text-sm font-semibold text-gray-900">
                                            QRIS
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">Pembayaran QR</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {methodType === 'rekening' ? (
                            <>
                                <div>
                                    <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Bank
                                    </label>
                                    <input
                                        id="bank_name"
                                        name="bank_name"
                                        type="text"
                                        placeholder="Contoh: BCA, Mandiri, BNI"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="account_number" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nomor Rekening
                                    </label>
                                    <input
                                        id="account_number"
                                        name="account_number"
                                        type="text"
                                        placeholder="Masukkan nomor rekening"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>
                            </>
                        ) : (
                            <div>
                                <label htmlFor="qris_image" className="block text-sm font-medium text-gray-700 mb-2">
                                    Unggah Gambar QRIS
                                </label>
                                
                                <div className="relative">
                                    <input
                                        id="qris_image"
                                        name="qris_image"
                                        type="file"
                                        accept="image/png, image/jpeg, image/svg+xml"
                                        className="w-full text-gray-900 border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                        onChange={handleFileChange}
                                        required
                                    />
                                    
                                    {fileName && (
                                        <div className="mt-2 flex items-center space-x-2 text-sm text-emerald-600 bg-emerald-50 p-2 rounded-lg">
                                            <Image className="w-4 h-4" />
                                            <span className="font-medium">{fileName}</span>
                                        </div>
                                    )}
                                    
                                    <p className="mt-1 text-xs text-gray-500">
                                        Format: PNG, JPG, SVG (Maks. 5MB)
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {state?.message && (
                        <div className={`p-4 rounded-lg border ${
                            state.success 
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                            <p className="text-sm font-medium">{state.message}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        disabled={pending}
                    >
                        <Save className="w-4 h-4" />
                        <span>{pending ? 'Menyimpan...' : 'Simpan Metode Pembayaran'}</span>
                    </button>
                </form>
            </div>
        </div>
    );
}