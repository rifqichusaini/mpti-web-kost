import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import PaymentMethodForm from "./components/PaymentMethodForm";
import { CreditCard, Banknote, Plus, FileText } from "lucide-react";

interface PaymentMethod {
    id: string;
    type: string;
    bank_name: string;
    account_number: string;
    qris_url: string;
}

export default async function PaymentMethodsPage() {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login/admin");
    }

    const { data: kosts } = await supabase
        .from("kosts")
        .select("id")
        .eq("owner_id", user.id);

    if (!kosts || kosts.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <Banknote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Tidak Ada Properti</h1>
                    <p className="text-gray-600">Anda tidak memiliki properti kost.</p>
                </div>
            </div>
        );
    }

    const kostId = kosts[0].id;
    console.log('Server-side kostId:', kostId);

    const { data: methods, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("kost_id", kostId);

    if (error) {
        console.error("Error fetching payment methods:", error.message);
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Metode Pembayaran</h1>
                            <p className="text-gray-600 mt-2">Kelola metode pembayaran untuk properti kost Anda</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Plus className="w-5 h-5 text-gray-400" />
                            <h2 className="text-xl font-semibold text-gray-900">Tambah Metode Pembayaran</h2>
                        </div>
                        <PaymentMethodForm kostId={kostId} />
                    </div>

                    {/* Daftar Metode Pembayaran */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            <h2 className="text-xl font-semibold text-gray-900">Daftar Metode Pembayaran</h2>
                        </div>
                        
                        {methods && methods.length > 0 ? (
                            <div className="space-y-4">
                                {methods.map((method: PaymentMethod) => (
                                    <div key={method.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                                                {method.type === 'rekening' ? (
                                                    <CreditCard className="w-4 h-4 text-gray-400" />
                                                ) : (
                                                    <Banknote className="w-4 h-4 text-gray-400" />
                                                )}
                                                <span>
                                                    {method.type === 'rekening' ? 'Rekening Bank' : 'QRIS'}
                                                </span>
                                            </h3>
                                        </div>
                                        
                                        {method.type === 'rekening' ? (
                                            <div className="space-y-1 text-sm text-gray-600">
                                                <div className="flex items-center space-x-2">
                                                    <FileText className="w-3 h-3" />
                                                    <span>Bank: <span className="font-medium text-gray-900">{method.bank_name}</span></span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <CreditCard className="w-3 h-3" />
                                                    <span>No. Rekening: <span className="font-medium text-gray-900">{method.account_number}</span></span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Banknote className="w-3 h-3" />
                                                <a 
                                                    href={method.qris_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                                                >
                                                    Lihat Gambar QRIS
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Belum ada metode pembayaran yang terdaftar.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}