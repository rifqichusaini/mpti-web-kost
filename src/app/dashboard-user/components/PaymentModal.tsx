/* eslint-disable @next/next/no-img-element */
// src/app/dashboard-user/components/PaymentModal.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createPayment } from "../payments/actions";

interface PaymentModalProps {
    open: boolean;
    onClose: () => void;
    bookingId: string;
}

export default function PaymentModal({
    open,
    onClose,
    bookingId,
}: PaymentModalProps) {
    const supabase = createClientComponentClient();
    const [step, setStep] = useState(1);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [methodsData, setMethodsData] = useState<any[]>([]);
    const [method, setMethod] = useState<"rekening" | "qris" | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!open) return;

        const fetchMethods = async () => {
            const { data, error } = await supabase
                .from("payment_methods")
                .select("*");
            if (error) {
                console.error("Error fetching payment methods:", error);
            } else {
                setMethodsData(data);
            }
        };

        fetchMethods();
    }, [open, supabase]);

    const selectedMethod = methodsData.find((m) => m.type === method);

    const handleSubmit = async () => {
        if (!file || !method || !selectedMethod) return;

        setLoading(true);

        try {
            await createPayment({
                bookingId,
                method,
                file,
            });
            

            setStep(4);
            setShowSuccess(true);
        } catch (error) {
            console.error(error);
            setStep(4);
            setShowError(true);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h2 className="text-lg font-bold">Pembayaran</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800"
                    >
                        ✕
                    </button>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-between mb-6">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={s === 4 ? "" : "flex items-center w-full"}>
                            <div
                                className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                                    ${(step >= s || showSuccess) 
                                        ? "bg-emerald-600 text-white"
                                        : showError && s === 4
                                        ? "bg-red-600 text-white"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                            >
                                {s}
                            </div>
                            {s < 4 && (
                                <div
                                    className={`flex-1 h-1 ${
                                        (step > s || showSuccess) 
                                            ? "bg-emerald-600" 
                                            : showError && step >= s
                                            ? "bg-red-600"
                                            : "bg-gray-200"
                                    }`}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step 1 */}
                {step === 1 && (
                    <div className="space-y-4">
                        <p>Pilih metode pembayaran:</p>
                        <div className="flex flex-col gap-2">
                            {methodsData.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => {
                                        setMethod(m.type);
                                        setStep(2);
                                    }}
                                    className="border rounded p-2 hover:bg-gray-100"
                                >
                                    {m.type === "rekening"
                                        ? `Transfer ${m.bank_name}`
                                        : "QRIS"}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Rekening */}
                {step === 2 && method === "rekening" && selectedMethod && (
                    <div className="space-y-4">
                        <p className="font-medium">Transfer ke Rekening:</p>
                        <div className="p-3 border rounded-md">
                            <p>{selectedMethod.bank_name}</p>
                            <p>
                                No Rek:{" "}
                                <span className="font-bold">
                                    {selectedMethod.account_number}
                                </span>
                            </p>
                        </div>
                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="border px-4 py-2 rounded hover:bg-gray-100"
                            >
                                Sebelumnya
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
                            >
                                Lanjut
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 2: QRIS */}
                {step === 2 && method === "qris" && selectedMethod && (
                    <div className="space-y-4">
                        <p className="font-medium">Scan QRIS berikut:</p>
                        <img
                            src={selectedMethod.qris_url}
                            alt="QRIS"
                            className="w-40 mx-auto"
                        />
                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="border px-4 py-2 rounded hover:bg-gray-100"
                            >
                                Sebelumnya
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
                            >
                                Lanjut
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                    <div className="space-y-4">
                        <p>Upload bukti pembayaran:</p>
                        <input
                            type="file"
                            accept="image/jpeg, image/jpg"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full border rounded p-2"
                        />
                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(2)}
                                className="border px-4 py-2 rounded hover:bg-gray-100"
                            >
                                Sebelumnya
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading || !file}
                                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 disabled:bg-gray-400"
                            >
                                {loading ? "Mengirim..." : "Submit"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Success */}
                {showSuccess && (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Bukti Bayar Berhasil Diunggah!</h3>
                        <p className="text-gray-600">Silahkan tunggu konfirmasi dari admin.</p>
                        <div className="flex justify-between">
                            <button
                                onClick={() => setStep(1)}
                                className="border px-4 py-2 rounded hover:bg-gray-100"
                            >
                                Sebelumnya
                            </button>
                            <button
                                onClick={() => {
                                    setStep(1);
                                    setMethod(null);
                                    setFile(null);
                                    setShowSuccess(false);
                                    onClose();
                                }}
                                className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 4: Error */}
                {showError && (
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-red-900">Bukti Bayar Gagal Diunggah!</h3>
                        <p className="text-red-600">Silahkan cek kembali ekstensi file anda</p>
                        <div className="flex justify-between">
                            <button
                                onClick={() => {
                                    setStep(3);
                                    setShowError(false);
                                }}
                                className="border border-red-500 text-red-600 px-4 py-2 rounded hover:bg-red-50"
                            >
                                Coba Lagi
                            </button>
                            <button
                                onClick={() => {
                                    setStep(1);
                                    setMethod(null);
                                    setFile(null);
                                    setShowError(false);
                                    onClose();
                                }}
                                className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
