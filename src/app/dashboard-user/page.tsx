// src/app/dashboard-user/page.tsx
"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import type { Room } from "@/types/room";

import Header from "./components/Header";
import RoomList from "./components/RoomList";
import BookingModal from "./components/BookingModal";
import PaymentModal from "./components/PaymentModal";
import NotificationModal from "./components/NotificationModal";

interface Kost {
    id: string;
    name: string;
    address: string;
}

export default function DashboardUserPage() {
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [kosts, setKosts] = useState<Kost[]>([]);
    const [selectedKost, setSelectedKost] = useState<string | null>(null);
    const [showKostSelection, setShowKostSelection] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [notifications, setNotifications] = useState<number>(0);
    const [bookingId, setBookingId] = useState<string | null>(null);
    const [openNotifModal, setOpenNotifModal] = useState(false);
    const [openPaymentModal, setOpenPaymentModal] = useState(false);
    const [activeBookingId, setActiveBookingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            
            if (!user) {
                router.push("/login/user");
                return;
            }

            // Cek apakah user adalah penyewa aktif
            const { data: tenant } = await supabase
                .from("penyewa")
                .select("id")
                .eq("penyewa_id", user.id)
                .single();

            // Jika user adalah penyewa, redirect ke dashboard penyewa
            if (tenant) {
                router.push("/dashboard-penyewa");
                return;
            }

            // Panggil API untuk get kosts berdasarkan referral code
            try {
                const response = await fetch('/api/get-kosts');
                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 403) {
                        router.push("/referral-input");
                        return;
                    }
                    console.error("Error fetching kosts:", data.error);
                    setIsLoading(false);
                    return;
                }

                const kostsData = data.kosts;

                if (kostsData && kostsData.length > 0) {
                    setKosts(kostsData);

                    // Jika owner punya lebih dari 1 kost, tampilkan pilihan
                    if (kostsData.length > 1 && !selectedKost) {
                        setShowKostSelection(true);
                        setIsLoading(false);
                        return;
                    }

                    // Jika hanya 1 kost atau sudah pilih kost, ambil rooms
                    const kostId = selectedKost || kostsData[0].id;
                    
                    const { data: roomsData } = await supabase
                        .from("rooms")
                        .select("*")
                        .eq("kost_id", kostId)
                        .order("room_number", { ascending: true });

                    setRooms(roomsData || []);
                }
            } catch (error) {
                console.error("Error:", error);
                setIsLoading(false);
                return;
            }

            // Ambil notifikasi booking
            const { data: notifData } = await supabase
                .from("booking_requests")
                .select("id")
                .eq("user_id", user.id)
                .eq("status", "process");

            setNotifications(notifData?.length || 0);

            if (notifData && notifData.length > 0) {
                setBookingId(notifData[0].id);
            } else {
                setBookingId(null);
            }

            setIsLoading(false);
        };

        fetchData();

        const channel = supabase
            .channel("booking_requests-changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "booking_requests",
                },
                () => {
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [router, supabase, selectedKost]);

    const handleKostSelection = (kostId: string) => {
        setSelectedKost(kostId);
        setShowKostSelection(false);
        setIsLoading(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    // Tampilan pemilihan kost jika owner punya lebih dari 1 kost
    if (showKostSelection) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pilih Kost</h1>
                        <p className="text-gray-600">Pemilik memiliki beberapa properti kost</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {kosts.map((kost) => (
                            <button
                                key={kost.id}
                                onClick={() => handleKostSelection(kost.id)}
                                className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 hover:border-emerald-500 p-6 text-left transition-all duration-300 hover:shadow-xl group"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                                        <svg className="w-6 h-6 text-emerald-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{kost.name}</h3>
                                <p className="text-gray-600 text-sm">{kost.address}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 font-sans antialiased">
            {selectedRoom && (
                <BookingModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
            )}

            <div className="container mx-auto max-w-7xl">
                <Header
                    notifications={notifications}
                    onOpenNotif={() => setOpenNotifModal(true)}
                />
                
                {/* Tampilkan info kost yang dipilih */}
                {selectedKost && kosts.length > 1 && (
                    <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-emerald-700 font-medium">Kost Terpilih</p>
                                <p className="text-emerald-900 font-bold">
                                    {kosts.find(k => k.id === selectedKost)?.name}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setSelectedKost(null);
                                setShowKostSelection(true);
                            }}
                            className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm"
                        >
                            Ganti Kost
                        </button>
                    </div>
                )}

                <main className="mt-8">
                    <RoomList rooms={rooms} onSelect={setSelectedRoom} />
                </main>
            </div>
            
            {openNotifModal && bookingId && (
                <NotificationModal
                    open={openNotifModal}
                    onClose={() => setOpenNotifModal(false)}
                    bookingId={bookingId}
                    onPayNow={(id) => {
                        setActiveBookingId(id);
                        setOpenNotifModal(false);
                        setOpenPaymentModal(true);
                    }}
                />
            )}

            {openPaymentModal && activeBookingId && (
                <PaymentModal
                    open={openPaymentModal}
                    onClose={() => setOpenPaymentModal(false)}
                    bookingId={activeBookingId}
                />
            )}
        </div>
    );
}