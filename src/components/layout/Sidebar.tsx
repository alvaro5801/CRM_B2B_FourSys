import { SidebarNav } from './SidebarNav';
import { LogoutButton } from './LogoutButton';
import { getCurrentUser } from '@/lib/auth';

export async function Sidebar() {
  const user = await getCurrentUser();

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">CRM FourSys</h1>
      </div>

      {/* Navigation */}
      <SidebarNav />

      {/* User Profile & Logout */}
      <LogoutButton userName={user?.name} />
    </div>
  );
}

