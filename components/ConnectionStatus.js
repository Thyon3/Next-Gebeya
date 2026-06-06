import React from 'react';
import { useSocket } from '@/utils/SocketContext';

export default function ConnectionStatus() {
  const { isConnected } = useSocket();

  if (!isConnected) {
    return (
      <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <span className="w-2 h-2 bg-white rounded-full"></span>
        <span className="text-sm font-medium">Reconnecting...</span>
      </div>
    );
  }

  return null;
}
