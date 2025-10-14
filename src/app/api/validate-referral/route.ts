// src/app/api/validate-referral/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

        // Ambil referral code dari request body
        const { referralCode } = await request.json();

        if (!referralCode || typeof referralCode !== 'string') {
            return NextResponse.json(
                { error: 'Kode referral tidak valid' },
                { status: 400 }
            );
        }

        // DEBUG: Cek semua profiles dengan referral_code (gunakan admin client)
        const { data: allProfiles, error: debugError } = await supabaseAdmin
            .from('profiles')
            .select('id, email, role, referral_code')
            .not('referral_code', 'is', null);

        // Cari owner dengan referral code ini (gunakan admin client)
        const { data: owner, error: ownerError } = await supabaseAdmin
            .from('profiles')
            .select('id, email, role, referral_code')
            .eq('referral_code', referralCode.trim().toUpperCase())
            .eq('role', 'pemilik')
            .single();


        if (ownerError || !owner) {
            // DEBUG: Return detailed error untuk development
            return NextResponse.json(
                { 
                    error: 'Kode referral tidak ditemukan atau tidak valid',
                    debug: {
                        searchedCode: referralCode.trim().toUpperCase(),
                        availableCodes: allProfiles?.map(p => ({
                            code: p.referral_code,
                            role: p.role,
                            email: p.email
                        })),
                        errorDetail: ownerError?.message
                    }
                },
                { status: 404 }
            );
        }

        // Update profile user dengan referral code yang digunakan
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                used_referral_code: referralCode.trim().toUpperCase(),
                referral_verified: true,
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error updating profile:', updateError);
            return NextResponse.json(
                { error: 'Gagal menyimpan kode referral' },
                { status: 500 }
            );
        }

        // Ambil data kost yang dimiliki owner
        const { data: kosts, error: kostsError } = await supabaseAdmin
            .from('kosts')
            .select('id, name, address')
            .eq('owner_id', owner.id);

        if (kostsError) {
            console.error('Error fetching kosts:', kostsError);
        }

        return NextResponse.json({
            success: true,
            message: 'Kode referral berhasil diverifikasi',
            owner: {
                id: owner.id,
                email: owner.email,
            },
            kostsCount: kosts?.length || 0,
        });

    } catch (error) {
        console.error('Validation error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan server' },
            { status: 500 }
        );
    }
}