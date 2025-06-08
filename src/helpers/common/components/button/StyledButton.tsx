import React from 'react';

export interface StyledButtonProps {
  loading: boolean;
  onClick: () => void | Promise<void>;
  children: React.ReactNode;
  style?: React.CSSProperties;

  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const StyledButton: React.FC<StyledButtonProps> = ({
  loading,
  onClick,
  children,
  style = {},
  onMouseEnter,
  onMouseLeave,
}) => {
  const baseStyle: React.CSSProperties = {
    marginTop: '10px',
    padding: '2px 8px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f8f9fa',
    display: 'flex',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1,
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading) {
      e.currentTarget.style.backgroundColor = '#e9ecef';
      e.currentTarget.style.borderColor = '#adb5bd';
    }
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!loading) {
      e.currentTarget.style.backgroundColor = '#f8f9fa';
      e.currentTarget.style.borderColor = '#ddd';
    }
    onMouseLeave?.(e);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      style={baseStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
};
