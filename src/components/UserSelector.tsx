import React from 'react';
import { motion } from 'framer-motion';
import { User, Users } from 'lucide-react';
import { UserProfile } from '../lib/supabase';

interface UserSelectorProps {
  profiles: UserProfile[];
  onSelectUser: (userName: string) => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({ profiles, onSelectUser }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Select Profile</h1>
          </div>
          <p className="text-gray-600">
            Choose your profile to access your personal trading challenge data
          </p>
        </div>

        <div className="space-y-4">
          {profiles.map((profile, index) => (
            <motion.button
              key={profile.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectUser(profile.name)}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all duration-200 hover:shadow-md group"
            >
              <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center transition-colors">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-900">
                  {profile.displayName}
                </h3>
                <p className="text-sm text-gray-500">
                  Access your trading challenge
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p className="font-medium mb-2">Challenge Rules:</p>
            <div className="space-y-1 text-xs">
              <p>• Starting Balance: $6,000</p>
              <p>• Phase 1: 8% target ($480)</p>
              <p>• Phase 2: 5% target ($300)</p>
              <p>• Max Loss: 10% ($600)</p>
              <p>• Daily Loss: 5% ($300)</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};