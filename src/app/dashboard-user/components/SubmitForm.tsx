"use client";

import { useFormStatus } from "react-dom";
import { useState, useEffect } from "react";

interface SubmitFormProps {
  formState?: { success: boolean; message: string };
  onSuccess?: () => void;
}

interface NotificationModalProps {
  isOpen: boolean;
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
  onRedirect?: () => void;
}

function NotificationModal({ isOpen, type, message, onClose, onRedirect }: NotificationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="relative inset-0 p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 w-full max-w-sm transform transition-all duration-300 scale-100">
        <div className={`rounded-t-xl p-6 ${type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
        </div>
        <div className="p-6 text-center">
          <h3 className={`text-lg font-bold mb-2 ${type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
            {type === 'success' ? 'Berhasil!' : 'Gagal'}
          </h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={() => {
              onClose();
              if (type === 'success' && onRedirect) {
                onRedirect();
              }
            }}
            className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition-colors ${
              type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {type === 'success' ? 'Kembali ke Dashboard' : 'Tutup'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SubmitForm({ formState, onSuccess }: SubmitFormProps) {
  const { pending } = useFormStatus();
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [lastMessage, setLastMessage] = useState('');
  const [hasShownNotification, setHasShownNotification] = useState(false);

  // Handle notification display when formState changes
  useEffect(() => {
    // Cek jika ada response dan belum pernah ditampilkan
    if (formState?.message && 
        formState.message !== lastMessage && 
        formState.message !== '' &&
        !hasShownNotification) {
      
      setNotificationType(formState.success ? 'success' : 'error');
      setNotificationMessage(formState.message);
      setShowNotification(true);
      setLastMessage(formState.message);
      setHasShownNotification(true);
      
    }
  }, [formState, lastMessage, hasShownNotification]);

  const handleCloseNotification = () => {
    setShowNotification(false);
    setHasShownNotification(false); // Reset untuk submit berikutnya
  };

  const handleRedirect = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <>
      <button
        type="submit"
        className="w-full bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
        disabled={pending}
      >
        {pending ? "Mengirim Permintaan..." : "Kirim Permintaan"}
      </button>

      <NotificationModal
        isOpen={showNotification}
        type={notificationType}
        message={notificationMessage}
        onClose={handleCloseNotification}
        onRedirect={handleRedirect}
      />
    </>
  );
}

export default SubmitForm;