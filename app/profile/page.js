'use client';

import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Profile() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-teal-400 flex items-center justify-center text-2xl text-white font-bold">
                {session.user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{session.user.name}</h2>
                <p className="text-gray-500">{session.user.email}</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => router.push('/account')}
              >
                <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>
                <p className="text-gray-500 text-sm mt-1">Update your name and email</p>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-4 bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => router.push('/details')}
              >
                <h3 className="text-lg font-semibold text-gray-900">Personal Details</h3>
                <p className="text-gray-500 text-sm mt-1">Manage your fitness information</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
