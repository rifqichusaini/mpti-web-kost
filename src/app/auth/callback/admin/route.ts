// src/app/auth/callback/admin/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Untuk operasi admin (bypass RLS), gunakan service role client
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth Error:", error);
      return NextResponse.redirect(requestUrl.origin + "/login/admin?error=oauth-failed");
    }

    const user = sessionData.user;
    
    if (user) {
      // Cek apakah profile sudah ada (gunakan supabaseAdmin untuk bypass RLS)
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        // Profile sudah ada, cek role-nya
        if (existingProfile.role !== 'pemilik') {
          // User sudah terdaftar sebagai penyewa, tidak bisa jadi pemilik
          await supabase.auth.signOut();
          return NextResponse.redirect(requestUrl.origin + "/login/admin?error=already-registered");
        }
        // Jika sudah pemilik, lanjutkan ke dashboard
      } else {
        // User baru, create profile dengan role pemilik (gunakan supabaseAdmin)
        console.log("Creating new profile for user:", {
          id: user.id,
          email: user.email,
          role: 'pemilik'
        });

        const { data: insertData, error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            role: 'pemilik'
          })
          .select();

        if (insertError) {
          console.error("Error creating profile:", {
            error: insertError,
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
          });
          await supabase.auth.signOut();
          
          // Encode error details untuk ditampilkan
          const errorDetails = encodeURIComponent(JSON.stringify({
            message: insertError.message,
            code: insertError.code,
            details: insertError.details
          }));
          
          return NextResponse.redirect(
            requestUrl.origin + "/login/admin?error=profile-creation-failed&details=" + errorDetails
          );
        }

        console.log("Profile created successfully:", insertData);
      }
    }

    return NextResponse.redirect(requestUrl.origin + "/dashboard-admin");
  }

  return NextResponse.redirect(requestUrl.origin + "/login/admin");
}