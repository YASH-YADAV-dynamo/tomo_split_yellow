'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, User, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

interface JoinGroupPageProps {
  params: {
    slug: string;
  };
}

export default function JoinGroupPage({ params }: JoinGroupPageProps) {
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    // Convert slug back to group name
    const name = params.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    setGroupName(name);
    setLoading(false);
  }, [params.slug]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoining(true);

    try {
      const response = await fetch('/api/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupSlug: params.slug,
          name: formData.name,
          email: formData.email
        }),
      });

      if (response.ok) {
        // Redirect to main app
        router.push('/');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error joining group:', error);
      alert('Failed to join group. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-subtle">
            <span className="text-black font-bold text-2xl">T</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-white to-gray-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          {/* Back Button */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to App
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-black font-bold text-2xl">T</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Join "{groupName}"
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You've been invited to join this expense splitting group
            </p>
          </div>

          {/* Join Form */}
          <form onSubmit={handleJoin} className="space-y-4">
            <Input
              label="Your Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              icon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Button
              type="submit"
              className="w-full mt-6"
              disabled={joining}
            >
              {joining ? 'Joining...' : 'Join Group'}
            </Button>
          </form>

          {/* Info */}
          <div className="mt-6 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• You'll be added to the "{groupName}" group</li>
              <li>• You can start splitting expenses with other members</li>
              <li>• Track your balances and settlements</li>
            </ul>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
