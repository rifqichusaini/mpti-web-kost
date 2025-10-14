// src/app/api/rooms/route.ts
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import type { Room } from "@/types/room";

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  const { data: rooms, error } = await supabase.from("rooms").select("*");

  if (error) {
    return NextResponse.json(
      { message: "Gagal mengambil data kamar", error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(rooms, { status: 200 });
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const body: Room = await req.json();

    const { data, error } = await supabase
      .from("rooms")
      .insert([body])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { message: "Gagal menambahkan kamar", error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan", error },
      { status: 500 }
    );
  }
}
