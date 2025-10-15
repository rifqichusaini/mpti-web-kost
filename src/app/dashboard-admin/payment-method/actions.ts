/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard-admin/payment-method/actions.ts
"use server";

import { createServerActionClient } from "@supabase/auth-helpers-nextjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { v4 as uuidv4 } from "uuid";

interface ServerActionState {
  success: boolean;
  message: string;
}

export async function addPaymentMethod(
  state: ServerActionState,
  formData: FormData
) {
  const supabase =  createServerActionClient({ cookies });
  const type = formData.get("type") as string;
  const kostId = formData.get("kost_id") as string;
  console.log("Kost ID received from form:", kostId);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Anda tidak memiliki izin." };
  }

  try {
    const { data: kostData, error: kostError } = await supabase
      .from("kosts")
      .select("id")
      .eq("id", kostId)
      .eq("owner_id", user.id)
      .limit(1);

    if (kostError || !kostData || kostData.length === 0) {
      throw new Error("Anda tidak memiliki izin untuk mengelola kost ini.");
    }

    if (type === "rekening") {
      const bankName = formData.get("bank_name") as string;
      const accountNumber = formData.get("account_number") as string;

      const { error } = await supabase.from("payment_methods").insert({
        kost_id: kostId,
        type,
        bank_name: bankName,
        account_number: accountNumber,
      });

      if (error) {
        throw new Error(`Gagal menambahkan rekening: ${error.message}`);
      }
    } else if (type === "qris") {
      const file = formData.get("qris_image") as File;

      if (!file || file.size === 0) {
        throw new Error("Gambar QRIS harus diunggah.");
      }

      const fileExtension = file.name.split(".").pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `qris/${kostId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("payment_methods")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Gagal mengunggah QRIS: ${uploadError.message}`);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("payment_methods").getPublicUrl(filePath);

      const { error } = await supabase.from("payment_methods").insert({
        kost_id: kostId,
        type,
        qris_url: publicUrl,
      });

      if (error) {
        throw new Error(`Gagal menyimpan URL QRIS: ${error.message}`);
      }
    }

    revalidatePath("/dashboard-admin/payment-methods");
    return {
      success: true,
      message: "Metode pembayaran berhasil ditambahkan!",
    };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}
