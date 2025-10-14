// src/app/api/get-kosts/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        
        // Service role client untuk bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );
        
        // Cek autentikasi user
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Ambil profile user untuk mendapatkan referral code yang digunakan
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('referral_verified, used_referral_code')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json(
                { error: 'Profile not found' },
                { status: 404 }
            );
        }

        if (!profile.referral_verified || !profile.used_referral_code) {
            return NextResponse.json(
                { error: 'Referral not verified' },
                { status: 403 }
            );
        }

        // Cari owner berdasarkan referral code
        const { data: owner, error: ownerError } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('referral_code', profile.used_referral_code)
            .eq('role', 'pemilik')
            .single();

        if (ownerError || !owner) {
            return NextResponse.json(
                { error: 'Owner not found' },
                { status: 404 }
            );
        }

        // Ambil semua kost milik owner
        const { data: kosts, error: kostsError } = await supabaseAdmin
            .from('kosts')
            .select('id, name, address, owner_id')
            .eq('owner_id', owner.id);

        if (kostsError) {
            console.error('Error fetching kosts:', kostsError);
            return NextResponse.json(
                { error: 'Failed to fetch kosts' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            owner: {
                id: owner.id,
                email: owner.email,
            },
            kosts: kosts || [],
        });

    } catch (error) {
        console.error('Get kosts error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}