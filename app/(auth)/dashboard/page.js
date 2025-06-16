'use client';
import { useSession } from 'next-auth/react';
import HRDashboard from '@/app/components/dashboard/HRDashboard';
import ApplieDashboard from '@/app/components/dashboard/ApplieDashboard';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }
  if (status === 'unauthenticated') {
    router.push('/');
    return null;
  }
  
  const role = session?.user?.role;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {role === 'hr' && <HRDashboard user={session.user} />}
      {role === 'applie' && <ApplieDashboard user={session.user} />}
    </div>
  );
}