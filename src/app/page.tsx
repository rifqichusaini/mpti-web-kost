// src/app/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { User, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (role: "user" | "admin") => {
    if (role === "user") {
      router.push("/login/user");
    } else {
      router.push("/login/admin");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang</h1>
          <p className="text-gray-600">Silakan pilih jenis login untuk melanjutkan</p>
        </div>

        <div className="space-y-4">
          <div 
            onClick={() => handleLogin("user")}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-300 hover:border-emerald-300 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                <User className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 text-lg">Login sebagai User</h3>
                <p className="text-gray-500 text-sm mt-1">Akses untuk penyewa kost</p>
              </div>
              <div className="text-emerald-600 group-hover:text-emerald-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Admin login - uncomment when needed
          <div 
            onClick={() => handleLogin("admin")}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-all duration-300 hover:border-blue-300 group"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-semibold text-gray-900 text-lg">Login sebagai Admin</h3>
                <p className="text-gray-500 text-sm mt-1">Akses untuk pengelola kost</p>
              </div>
              <div className="text-blue-600 group-hover:text-blue-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
          */}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Pilih sesuai dengan peran Anda untuk mengakses sistem
          </p>
        </div>
      </div>
    </div>
  );
}
