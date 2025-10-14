import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardUserLayout({ children }: { children: React.ReactNode }) {
    const supabase = createServerComponentClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return redirect('/login/user');
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
            <header className="bg-white border-b border-gray-200 shadow-sm p-4">
                <div className="container mx-auto max-w-7xl flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-emerald-600">Penyewa Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <Link href="/" className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 transition-colors duration-200 hover:bg-gray-300">
                            Logout
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}