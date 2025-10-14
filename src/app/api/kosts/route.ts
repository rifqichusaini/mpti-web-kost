// src/app/api/kosts/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { owner_id, name, address } = body;

        // Validation
        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'Nama properti harus diisi' },
                { status: 400 }
            );
        }

        if (!address || !address.trim()) {
            return NextResponse.json(
                { error: 'Alamat properti harus diisi' },
                { status: 400 }
            );
        }

        // Verify owner_id matches authenticated user
        if (owner_id !== user.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Insert into database
        const { data, error } = await supabase
            .from('kosts')
            .insert([
                {
                    owner_id: user.id,
                    name: name.trim(),
                    address: address.trim(),
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Gagal menyimpan properti ke database' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Properti berhasil ditambahkan',
                data
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan pada server' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        
        // Check authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get all kosts for the authenticated user
        const { data, error } = await supabase
            .from('kosts')
            .select('*')
            .eq('owner_id', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Database error:', error);
            return NextResponse.json(
                { error: 'Gagal mengambil data properti' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Server error:', error);
        return NextResponse.json(
            { error: 'Terjadi kesalahan pada server' },
            { status: 500 }
        );
    }
}