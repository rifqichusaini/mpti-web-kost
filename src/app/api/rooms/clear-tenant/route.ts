// src/app/api/rooms/clear-tenant/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Cek autentikasi
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { roomId } = await request.json();

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID diperlukan' },
        { status: 400 }
      );
    }

    // 1. Hapus data penyewa berdasarkan room_id
    const { error: deletePenyewaError } = await supabase
      .from('penyewa')
      .delete()
      .eq('room_id', roomId);

    if (deletePenyewaError) {
      console.error('Error deleting penyewa:', deletePenyewaError);
      return NextResponse.json(
        { error: `Gagal menghapus penyewa: ${deletePenyewaError.message}` },
        { status: 500 }
      );
    }

    // 2. Update room menjadi available
    const { error: updateRoomError } = await supabase
      .from('rooms')
      .update({ is_available: true })
      .eq('id', roomId);

    if (updateRoomError) {
      console.error('Error updating room:', updateRoomError);
      return NextResponse.json(
        { error: `Gagal update room: ${updateRoomError.message}` },
        { status: 500 }
      );
    }

    // 3. Hapus booking requests yang mungkin masih ada untuk room ini
    await supabase
      .from('booking_requests')
      .delete()
      .eq('room_id', roomId);

    // 4. Update status payments jika ada
    await supabase
      .from('payments')
      .update({ status: 'cancelled' })
      .eq('room_id', roomId)
      .eq('status', 'approved');

    return NextResponse.json(
      { 
        success: true, 
        message: 'Penyewa berhasil dihapus dan kamar tersedia kembali' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error in clear-tenant API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}