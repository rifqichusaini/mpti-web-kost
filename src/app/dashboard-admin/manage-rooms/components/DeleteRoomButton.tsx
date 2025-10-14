// src/app/dashboard-admin/manage-rooms/components/DeleteRoomButton.tsx
"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import { deleteRoom } from "../actions";
import Link from "next/link";

export default function DeleteRoomButton({ 
  roomId, 
  roomNumber 
}: { 
  roomId: string;
  roomNumber: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const kostId = searchParams.get("kost_id");
  
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowModal(true);
    setConfirmText("");
    setError("");
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    
    // Redirect kembali ke halaman manage-rooms
    if (kostId) {
      router.push(`/dashboard-admin/manage-rooms?kost_id=${kostId}`);
    } else {
      router.push("/dashboard-admin/manage-rooms");
    }
    router.refresh();
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmText !== "HAPUS") {
      setError("Teks konfirmasi tidak sesuai. Ketik 'HAPUS' dengan huruf kapital.");
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const result = await deleteRoom(roomId);

      if (result.success) {
        setShowModal(false);
        setShowSuccessModal(true);
      } else {
        setError(result.error || "Gagal menghapus kamar");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menghapus kamar");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setConfirmText("");
    setError("");
  };

  const modalContent = showModal ? (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Konfirmasi Penghapusan
            </h3>
            <p className="text-sm text-gray-600">Kamar {roomNumber}</p>
          </div>
        </div>

        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-800 font-medium mb-2">
            Tindakan ini akan:
          </p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Menghapus kamar secara permanen</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Menghapus semua penyewa dari kamar ini</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">•</span>
              <span>Tidak dapat dibatalkan</span>
            </li>
          </ul>
        </div>

        {/* Confirmation Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ketik <span className="font-bold text-red-600">"HAPUS"</span> untuk mengkonfirmasi:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirm(e as any);
              }
            }}
            className="text-black w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all"
            placeholder="HAPUS"
            autoFocus
            disabled={isDeleting}
          />
          {error && (
            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
              <span>❌</span>
              {error}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Menghapus...
              </>
            ) : (
              "Hapus Kamar"
            )}
          </button>
        </div>
      </div>
    </div>
  ) : null;
  
  const successModalContent = showSuccessModal ? (
    <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-green-100 rounded flex items-center justify-center">
            <span className="text-2xl">✅</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Berhasil Dihapus
            </h3>
            <p className="text-sm text-gray-600">Kamar {roomNumber}</p>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-green-800">
            Kamar dan semua data terkait telah berhasil dihapus secara permanen.
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleSuccessClose}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-medium shadow-lg"
        >
          OK
        </button>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isDeleting}
        className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-lg border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        🗑️ Hapus Kamar Permanen
      </button>

      {/* Render modal using Portal to avoid nested form issue */}
      {typeof document !== "undefined" && modalContent && createPortal(
        modalContent,
        document.body
      )}

      {/* Render modal using Portal to avoid nested form issue */}
      {typeof document !== "undefined" && successModalContent  && createPortal(
        modalContent,
        document.body
      )}
    </>
  );
}