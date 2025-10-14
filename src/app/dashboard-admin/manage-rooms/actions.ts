// src/app/dashboard-admin/manage-rooms/actions.ts
"use server";

import { supabaseAdmin } from "@/lib/service-role";
import { revalidatePath } from "next/cache";

export async function deleteRoom(roomId: string) {
  
  try {
    // Hapus room dari database
    const { error } = await supabaseAdmin
      .from("rooms")
      .delete()
      .eq("id", roomId);

    if (error) {
      console.error("Error deleting room:", error);
      return {
        success: false,
        error: error.message,
      };
    }

    // Revalidate path agar data terupdate
    revalidatePath("/dashboard-admin/manage-rooms");

    return {
      success: true,
      message: "Kamar berhasil dihapus",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat menghapus kamar",
    };
  }
}