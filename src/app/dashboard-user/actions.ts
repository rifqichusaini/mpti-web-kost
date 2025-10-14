'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { addMonths } from 'date-fns';

interface ServerActionState {
  success: boolean;
  message: string;
}

export async function createBookingRequest(
  state: ServerActionState,
  formData: FormData
) {
  const supabase = createServerActionClient({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Anda tidak memiliki izin untuk melakukan aksi ini.' };
  }

  const roomId = formData.get('room_id') as string;
  const kostId = formData.get('kost_id') as string;
  const duration = Number(formData.get('duration'));

  if (!roomId || !kostId || isNaN(duration) || duration < 1) {
    return { success: false, message: 'Data yang dikirim tidak valid.' };
  }

  const dueDate = addMonths(new Date(), duration);

  const { error } = await supabase
    .from('booking_requests')
    .insert({
      user_id: user.id,
      room_id: roomId,
      kost_id: kostId,
      due_date: dueDate.toISOString(),
      status: 'pending',
    });

  if (error) {
    console.error('Gagal membuat permintaan sewa:', error);
    return { success: false, message: `Gagal membuat permintaan sewa: ${error.message}` };
  }

  return { success: true, message: 'Permintaan berhasil dikirim!' };
}