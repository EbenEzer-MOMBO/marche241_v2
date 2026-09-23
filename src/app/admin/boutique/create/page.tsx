'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateBoutiquePage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    router.replace('/admin/onboarding/boutique');
  }, [router]);

  return null;
}
