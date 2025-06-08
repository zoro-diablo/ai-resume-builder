// src/templates/minimal/atoms/ContactItem.tsx
import React from 'react';

export const ContactItem = ({ 
  icon: Icon, 
  text, 
  href 
}: { 
  icon: React.ComponentType<any>; 
  text: string; 
  href?: string; 
}) => {
  const content = (
    <div className="flex items-center gap-2 text-xs text-gray-600">
      <Icon className="w-4 h-4 text-blue-500" />
      <span>{text}</span>
    </div>
  );
  
  return href ? (
    <a href={href} className="hover:text-blue-600 transition-colors">
      {content}
    </a>
  ) : content;
};