// app/dashboard-admin/booking-request/page.tsx
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { processBooking, approveBooking, rejectBooking } from "./actions";
import { SubmitButton } from "@/app/dashboard-admin/booking-request/components/SubmitButton";
import { Calendar, User, Home, DollarSign, Clock, CheckCircle, XCircle, Users } from "lucide-react";

export const dynamic = 'force-dynamic';

interface Profile {
    id: string; 
    email: string;
}

interface Room {
    room_number: string;
    price: number;
    is_available: boolean;
}

interface Payment {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface BookingRequest {
    id: string;
    room_id: string;
    kost_id: string;
    status: 'pending' | 'process' | 'approved' | 'rejected';
    due_date: string;
    user_id: Profile | null;
    rooms: Room | null;
    payments: Payment[] | null;
}

export default async function BookingRequestsPage() {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect("/login/admin");
    }

    const { data: kosts } = await supabase
        .from("kosts")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1);

    if (!kosts || kosts.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Tidak Ada Properti</h1>
                    <p className="text-gray-600">Anda tidak memiliki properti kost.</p>
                </div>
            </div>
        );
    }
    const kostId = kosts[0].id;

    // Query untuk semua booking requests
    const { data: allBookingRequests } = await supabase
        .from("booking_requests")
        .select(`
            id, room_id, kost_id, status, due_date, created_at,
            user_id ( id, email ),
            rooms ( room_number, price, is_available )
        `)
        .eq("kost_id", kostId)
        .order('created_at', { ascending: true });

    // Query payments secara terpisah jika diperlukan
    let paymentsData: any[] = [];
    if (allBookingRequests && allBookingRequests.length > 0) {
        const bookingIds = allBookingRequests.map(req => req.id);
        
        const { data: payments } = await supabase
            .from("payments")
            .select("id, status, booking_request_id")
            .in("booking_request_id", bookingIds);

        paymentsData = payments || [];
    }

    // Map dan filter data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allBookingsMapped: BookingRequest[] = (allBookingRequests ?? []).map((req: any) => {
        const relatedPayments = paymentsData.filter((payment: any) => payment.booking_request_id === req.id);
        
        return {
            ...req,
            user_id: Array.isArray(req.user_id) ? req.user_id[0] ?? null : req.user_id ?? null,
            rooms: Array.isArray(req.rooms) ? req.rooms[0] ?? null : req.rooms ?? null,
            payments: relatedPayments.length > 0 ? relatedPayments : null,
        };
    });

    // Filter untuk permintaan sewa aktif
    const activeRequestsMapped = allBookingsMapped.filter((req: BookingRequest) => {
        if (!['pending', 'process'].includes(req.status)) {
            return false;
        }

        if (req.payments && Array.isArray(req.payments) && req.payments.length > 0) {
            const hasApprovedPayment = req.payments.some((payment: Payment) => payment.status === 'approved');
            return !hasApprovedPayment;
        }

        return true;
    });

    // Ganti query penghuni aktif
    const { data: activeResidents } = await supabase
        .from("penyewa")
        .select(`
            id,
            penyewa_id,
            room_id,
            kost_id,
            due_date,
            created_at,
            profiles:penyewa_id ( id, email ),
            rooms:room_id ( room_number, price, is_available )
        `)
        .eq("kost_id", kostId)
        .order('created_at', { ascending: false });

    // Map data penyewa ke format yang sama dengan BookingRequest
    const activeResidentsMapped: BookingRequest[] = (activeResidents ?? []).map((resident: any) => ({
        id: resident.id,
        room_id: resident.room_id,
        kost_id: resident.kost_id,
        status: 'approved' as const,
        due_date: resident.due_date,
        user_id: resident.profiles,
        rooms: resident.rooms,
        payments: null,
    }));

    const getStatusBadge = (status: BookingRequest['status']) => {
        const config = {
            pending: { 
                color: 'bg-amber-100 text-amber-800 border border-amber-200', 
                label: 'Menunggu Konfirmasi',
                icon: Clock
            },
            process: { 
                color: 'bg-blue-100 text-blue-800 border border-blue-200', 
                label: 'Menunggu Pembayaran',
                icon: Clock
            },
            approved: { 
                color: 'bg-emerald-100 text-emerald-800 border border-emerald-200', 
                label: 'Penghuni Aktif',
                icon: CheckCircle
            },
            rejected: { 
                color: 'bg-red-100 text-red-800 border border-red-200', 
                label: 'Ditolak',
                icon: XCircle
            },
        }[status];
        
        if (!config) return null;

        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3" />
                <span>{config.label}</span>
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const renderBookingCard = (request: BookingRequest, showActions: boolean = true) => (
        <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Left Section - Information */}
                    <div className="flex-1">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                    <User className="w-4 h-4 text-gray-400" />
                                    <span>{request.user_id?.email || "N/A"}</span>
                                </h3>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                    <Home className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span>Kamar: <span className="font-semibold text-gray-900">{request.rooms?.room_number || 'N/A'}</span></span>
                                </div>
                                <div className="mt-3 text-sm text-gray-500">
                                    {request.status === 'approved' ? `Mulai sewa: ${formatDate(request.due_date)}` : `Batas pembayaran: ${formatDate(request.due_date)}`}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="mb-2">
                                    {getStatusBadge(request.status)}
                                </div>
                                <div className="flex items-center justify-end space-x-2 text-sm text-gray-600">
                                    <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span>Harga: <span className="font-semibold text-gray-900">Rp {request.rooms?.price?.toLocaleString('id-ID') || 'N/A'}</span></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Section - Actions */}
                    {showActions && (
                        // <div className="flex flex-col space-y-2 lg:w-48 lg:self-center">
                        <div className={`flex flex-col space-y-2 lg:w-48 ${request.status === 'pending' ? 'lg:self-center' : 'lg:self-start'}`}>
                            {request.status === 'pending' && (
                                <>
                                    <form action={processBooking} className="w-full">
                                        <input type="hidden" name="requestId" value={request.id} />
                                        <SubmitButton 
                                            buttonText="Proses Pesanan" 
                                            variant="blue"
                                        />
                                    </form>
                                    <form action={rejectBooking} className="w-full">
                                        <input type="hidden" name="requestId" value={request.id} />
                                        <SubmitButton 
                                            buttonText="Tolak" 
                                            variant="danger"
                                        />
                                    </form>
                                </>
                            )}
                            {request.status === 'process' && (
                                <form action={approveBooking} className="w-full lg:self-start">
                                    <input type="hidden" name="requestId" value={request.id} />
                                    <input type="hidden" name="roomId" value={request.room_id} />
                                    <input type="hidden" name="userId" value={request.user_id?.id} />
                                    <input type="hidden" name="kostId" value={request.kost_id} />
                                    <input type="hidden" name="dueDate" value={request.due_date} />
                                    <SubmitButton 
                                        buttonText="Setujui Pembayaran" 
                                        variant="primary"
                                    />
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Manajemen Kamar Kost</h1>
                            <p className="text-gray-600 mt-2">Kelola permintaan sewa dan penghuni properti Anda</p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <main className="space-y-12">
                    {/* Section 1: Permintaan Sewa Aktif */}
                    <section>
                        <div className="flex items-center space-x-3 mb-6">
                            <Clock className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Permintaan Sewa Aktif</h2>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                {activeRequestsMapped.length}
                            </span>
                        </div>
                        
                        {activeRequestsMapped.length > 0 ? (
                            <div className="space-y-4">
                                {activeRequestsMapped.map((request) => renderBookingCard(request, true))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                                <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak Ada Permintaan Aktif</h3>
                                <p className="text-gray-600">
                                    Tidak ada permintaan sewa yang perlu ditindaklanjuti saat ini.
                                </p>
                            </div>
                        )}
                    </section>

                    {/* Section 2: Penghuni Aktif */}
                    <section>
                        <div className="flex items-center space-x-3 mb-6">
                            <Users className="w-6 h-6 text-green-600" />
                            <h2 className="text-2xl font-bold text-gray-900">Penghuni Aktif</h2>
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                {activeResidentsMapped.length}
                            </span>
                        </div>
                        
                        {activeResidentsMapped.length > 0 ? (
                            <div className="space-y-4">
                                {activeResidentsMapped.map((request) => renderBookingCard(request, false))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                                <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum Ada Penghuni</h3>
                                <p className="text-gray-600">
                                    Belum ada penghuni yang menempati kamar kost Anda.
                                </p>
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
}