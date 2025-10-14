// src/app/api/check-expired-bookings/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Cari booking yang expired (lewat 10 menit dan belum bayar)
    const { data: expiredBookings, error: fetchError } = await supabaseAdmin
      .from('booking_requests')
      .select('id, room_id')
      .eq('status', 'pending')
      .lt('booking_expires_at', new Date().toISOString())
      .is('paid_at', null);

    if (fetchError) {
      console.error('Error fetching expired bookings:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    if (!expiredBookings || expiredBookings.length === 0) {
      return NextResponse.json({ 
        message: 'No expired bookings found',
        count: 0 
      });
    }

    // Update status booking jadi expired
    const bookingIds = expiredBookings.map(b => b.id);
    const { error: updateBookingError } = await supabaseAdmin
      .from('booking_requests')
      .update({ status: 'expired' })
      .in('id', bookingIds);

    if (updateBookingError) {
      console.error('Error updating bookings:', updateBookingError);
      return NextResponse.json({ error: 'Failed to update bookings' }, { status: 500 });
    }

    // Set room kembali available
    const roomIds = expiredBookings.map(b => b.room_id);
    const { error: updateRoomError } = await supabaseAdmin
      .from('rooms')
      .update({ is_available: true })
      .in('id', roomIds);

    if (updateRoomError) {
      console.error('Error updating rooms:', updateRoomError);
      return NextResponse.json({ error: 'Failed to update rooms' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${expiredBookings.length} expired booking(s) processed`,
      count: expiredBookings.length,
      bookings: expiredBookings
    });

  } catch (error) {
    console.error('Check expired error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Untuk keamanan, bisa tambahkan authorization header
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    // Validasi dengan secret key (opsional, untuk keamanan cron job)
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sama seperti GET
    return GET();
  } catch (error) {
    console.error('Check expired error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}