'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';


export async function processBooking(formData: FormData) {
  const supabase = createServerActionClient({ cookies });
  const requestId = formData.get('requestId') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Anda tidak memiliki izin.');
  }

  await supabase
    .from('booking_requests')
    .update({ status: 'process' })
    .eq('id', requestId);

  revalidatePath('/dashboard-admin/booking-request');
}

export async function approveBooking(formData: FormData) {
  const supabase = createServerActionClient({ cookies });
  const requestId = formData.get('requestId') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Anda tidak memiliki izin.');
  }

  // 1. Ambil data booking request yang akan di-approve
  const { data: bookingRequest, error: fetchError } = await supabase
    .from('booking_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (fetchError || !bookingRequest) {
    throw new Error('Booking request tidak ditemukan');
  }

  // 2. Cek apakah room masih available
  const { data: room } = await supabase
    .from('rooms')
    .select('is_available')
    .eq('id', bookingRequest.room_id)
    .single();

  if (room && !room.is_available) {
    throw new Error('Kamar sudah terisi oleh penghuni lain');
  }

  // 3. Update payment HANYA untuk user dan room dari booking request INI
  //    DAN yang masih pending
  const { error: paymentUpdateError } = await supabase
    .from("payments")
    .update({ status: 'approved' })
    .eq("room_id", bookingRequest.room_id)
    .eq("penyewa_id", bookingRequest.user_id)
    .eq("status", "pending"); // PENTING: hanya yang pending

  if (paymentUpdateError) {
    console.error('Payment update error:', paymentUpdateError);
    // Tidak throw error karena mungkin memang tidak ada record di payments
  }
  
  // 4. Update status booking request yang dipilih
  const { error: updateError } = await supabase
    .from('booking_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);

  if (updateError) {
    throw new Error(`Gagal update booking: ${updateError.message}`);
  }

  // 5. PENTING: Hapus penyewa lama jika ada (untuk keamanan)
  await supabase
    .from('penyewa')
    .delete()
    .eq('room_id', bookingRequest.room_id);

  // 6. Insert penyewa baru
  const dueDate = formData.get('dueDate') as string;
  const { error: insertError } = await supabase
    .from('penyewa')
    .insert({
      penyewa_id: bookingRequest.user_id,
      kost_id: bookingRequest.kost_id,
      room_id: bookingRequest.room_id,
      due_date: dueDate,
    });

  if (insertError) {
    throw new Error(`Gagal menambah penyewa: ${insertError.message}`);
  }
    
  // 7. Update room menjadi tidak available
  const { error: roomError } = await supabase
    .from('rooms')
    .update({ is_available: false })
    .eq('id', bookingRequest.room_id);

  if (roomError) {
    throw new Error(`Gagal update room: ${roomError.message}`);
  }

  // 8. Hapus booking request yang sudah di-approve
  await supabase
    .from('booking_requests')
    .delete()
    .eq('id', requestId);

  // 9. Hapus/tolak booking request lain untuk room yang sama
  await supabase
    .from('booking_requests')
    .delete()
    .eq('room_id', bookingRequest.room_id);

  revalidatePath('/dashboard-admin/booking-request');
  revalidatePath('/dashboard-admin/rooms'); 
}

export async function rejectBooking(formData: FormData) {
  const supabase = createServerActionClient({ cookies });
  const requestId = formData.get('requestId') as string;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Anda tidak memiliki izin.');
  }

  // Ambil data booking untuk update payment
  const { data: bookingRequest } = await supabase
    .from('booking_requests')
    .select('*')
    .eq('id', requestId)
    .single();

  if (bookingRequest) {
    // Update payment jadi rejected
    await supabase
      .from('payments')
      .update({ status: 'rejected' })
      .eq('room_id', bookingRequest.room_id)
      .eq('penyewa_id', bookingRequest.user_id)
      .eq('status', 'pending');
  }

  // Update status booking jadi rejected
  await supabase
    .from('booking_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);
  
  // Hapus booking request
  await supabase
    .from('booking_requests')
    .delete()
    .eq('id', requestId);

  revalidatePath('/dashboard-admin/booking-request');
}