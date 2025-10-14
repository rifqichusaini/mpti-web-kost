// src/app/auth/callback/user/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("OAuth Error:", error);
      return NextResponse.redirect(requestUrl.origin + "/login/user?error=oauth-failed");
    }

    // Cek apakah user sudah verifikasi referral code
    if (sessionData.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("referral_verified, role")
        .eq("id", sessionData.user.id)
        .single();

      // Jika user belum verifikasi referral dan role adalah penyewa
      if (profile && profile.role === "penyewa" && !profile.referral_verified) {
        return NextResponse.redirect(requestUrl.origin + "/referral-input");
      }
    }

    return NextResponse.redirect(requestUrl.origin + "/dashboard-user");
  }

  return NextResponse.redirect(requestUrl.origin + "/login/user");
}