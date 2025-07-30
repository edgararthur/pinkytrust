'use client';

import { useAuth } from '@/lib/auth/context';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Account Information</h2>
          <p className="text-gray-600">Email: {user?.email}</p>
        </div>

        <Button
          variant="danger"
          onClick={() => signOut()}
          className="w-full sm:w-auto"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
} 