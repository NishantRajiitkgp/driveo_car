import { Providers } from '@/lib/providers';
import { AdminNav } from '@/components/nav/AdminNav';

export const metadata = {
  title: 'Driveo Admin',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-[#050505] text-white flex">
        <AdminNav />
        <main className="flex-1 md:ml-64 p-6">{children}</main>
      </div>
    </Providers>
  );
}
