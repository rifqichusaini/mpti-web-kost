// src/app/dashboard-admin/components/RoomAvailabilityCheckbox.tsx
"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

export default function RoomAvailabilityCheckbox({
  defaultChecked,
  label,
}: {
  defaultChecked: boolean;
  label: string;
}) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const handleCheckboxClick = (e: React.MouseEvent<HTMLInputElement>) => {
    // Jika sekarang unchecked (terisi) dan mau diubah jadi checked (tersedia)
    if (!isChecked) {
      e.preventDefault(); // Hanya prevent kalau mau checked (butuh konfirmasi)
      setShowConfirmDialog(true);
    } else {
      // Jika mau uncheck, langsung allow tanpa preventDefault
      setIsChecked(false);
    }
  };

  const handleConfirm = () => {
    setIsChecked(true);
    setShowConfirmDialog(false);
  };

  const handleCancel = () => {
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className="flex items-center space-x-3">
        {/* Hidden input untuk form submission - ini yang akan di-submit */}
        <input
          type="hidden"
          name="is_available"
          value={isChecked ? "on" : "off"}
        />
        
        {/* Visual checkbox (tidak di-submit karena tidak ada name) */}
        <input
          type="checkbox"
          id="is_available"
          checked={isChecked}
          onClick={handleCheckboxClick}
          readOnly
          className="h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
        />
        
        <label
          htmlFor="is_available"
          className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer select-none"
        >
          {isChecked ? (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="font-medium">Kamar Tersedia</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="font-medium">Kamar Terisi</span>
            </>
          )}
        </label>
      </div>

      {/* Popup Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Konfirmasi Perubahan
                </h3>
              </div>
              <button
                onClick={handleCancel}
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-700 leading-relaxed">
                Menandai kamar sebagai <strong>tersedia</strong> akan menghapus <strong>semua penyewa dan booking requests</strong> dari kamar ini saat Anda klik tombol <strong>"Simpan Perubahan"</strong>. 
              </p>
              <p className="text-gray-600 text-sm mt-3 bg-orange-50 p-3 rounded-lg border border-orange-200">
                ⚠️ <strong>Perhatian:</strong> Data yang dihapus tidak dapat dikembalikan.
              </p>
            </div>

            <div className="flex space-x-3 p-6 pt-0">
              <button
                onClick={handleCancel}
                type="button"
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleConfirm}
                type="button"
                className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all font-medium shadow-lg"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}