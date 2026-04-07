import React from 'react';

interface LoaderProps { fullScreen?: boolean; size?: 'sm' | 'md' | 'lg'; }

const Loader: React.FC<LoaderProps> = ({ fullScreen = false, size = 'md' }) => {
  const sizeMap = { sm: 'h-6 w-6', md: 'h-10 w-10', lg: 'h-16 w-16' };
  const spinner = (
    <div className={`animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 ${sizeMap[size]}`} />
  );
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="flex flex-col items-center space-y-4">
          {spinner}
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  return <div className="flex justify-center items-center py-8">{spinner}</div>;
};

export default Loader;
