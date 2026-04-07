import React from 'react';

interface Props { src?: string; name: string; size?: 'sm' | 'md' | 'lg'; }

const Avatar: React.FC<Props> = ({ src, name, size = 'md' }) => {
  const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  if (src) {
    return <img src={src} alt={name} className={`${sizeMap[size]} rounded-full object-cover`} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />;
  }
  return (
    <div className={`${sizeMap[size]} rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
};

export default Avatar;
