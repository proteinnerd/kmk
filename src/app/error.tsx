'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="bg-[#1a1d24] min-h-screen flex items-center justify-center">
      <div className="text-red-500">{error.message || 'Something went wrong'}</div>
    </div>
  );
} 