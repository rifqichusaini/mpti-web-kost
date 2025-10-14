// src/app/dashboard-user/components/actions.ts
"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Room } from "@/types/room"; // pakai type yang sudah ada

interface CreatePaymentParams {
  bookingId: string;
  method: "rekening" | "qris";
  file: File;
}

// Tipe data booking_request
interface BookingRequest {
  id: string;
  user_id: string;
  room_id: string;
  kost_id: string;
  status: string;
  created_at: string;
  due_date: string;
}

export async function createPayment({
  bookingId,
  method,
  file,
}: CreatePaymentParams) {
  const supabase = createServerActionClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User tidak ditemukan");

  const { data: booking, error: bookingError } = await supabase
    .from("booking_requests")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    console.error(bookingError);
    throw new Error("Booking request tidak ditemukan");
  }

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("price")
    .eq("id", booking.room_id)
    .single();

  if (roomError || !room) {
    console.error(roomError);
    throw new Error("Data room tidak ditemukan");
  }

  const fileName = `${Date.now()}-${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("payment_file")
    .upload(fileName, file);

  if (uploadError) {
    console.error(uploadError);
    throw new Error("Gagal upload file");
  }

  const { error: insertError } = await supabase.from("payments").insert([
    {
      penyewa_id: booking.user_id,
      kost_id: booking.kost_id,
      room_id: booking.room_id,
      amount: room.price, 
      due_date: booking.due_date,
      proof_url: uploadData?.path,
      status: "pending",
    },
  ]);

  if (insertError) {
    console.error(insertError);
    throw new Error("Gagal menyimpan pembayaran");
  }

  return { success: true };
}
