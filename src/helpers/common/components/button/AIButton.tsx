import React from 'react';

export interface AIButtonProps {
  /** Whether the button is in a loading/disabled state */
  loading?: boolean;
  /** Click handler */
  onClick?: () => void | Promise<void>;
  /** Button label (defaults to "Generate") */
  children?: React.ReactNode;
}

const AIButton: React.FC<AIButtonProps> = ({
  loading = false,
  onClick,
  children = 'Generate',
}) => (
  <>
    <button
      type="button"
      className="btn"
      onClick={onClick}
      disabled={loading}
    >
      <svg
        className="sparkle"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M10 21.236L6.755 14.745.264 11.5 6.755 8.255 10 1.764l3.245 6.491L19.736 11.5l-6.491 3.245L10 21.236zm8-0.236l1.5 3 1.5-3 3-1.5-3-1.5-1.5-3-1.5 3-3 1.5 3 1.5zm1.333-11.5L20.5 7l1.167-2.333L24 3.5 21.667 2.333 20.5 0l-1.167 2.333-2.333 1.167 2.333 1.167z"
        />
      </svg>
      <span className="text">
        {loading ? 'Generating…' : children}
      </span>
    </button>

    <style jsx>{`
      .btn {
        /* Sizing & Layout */
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 12px;
        height: 44px;
        padding: 0 24px;
        
        /* --- ✨ NEW Default Appearance (Cyan Theme) --- */
        background: transparent;
        border: 1px solid #0e7490; /* Muted, dark cyan border */
        color: #1f2937; /* Dark gray text (near-black) */
        border-radius: 9999px; /* Pill shape */
        
        /* General */
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: all 0.3s ease;
      }

      .btn:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      .sparkle {
        fill: #06b6d4; /* Vibrant cyan sparkle icon */
        transition: all 0.4s ease;
      }
      
      .text {
        transition: all 0.3s ease;
      }

      /* --- ✨ UPDATED Hover State (Cyan Theme) --- */
      .btn:hover:not(:disabled) {
        transform: translateY(-2px) scale(1.02);
        background: linear-gradient(45deg, #22d3ee, #0891b2); /* Cyan gradient */
        border-color: transparent;
        color: #ffffff; /* White text on hover */
        box-shadow:
          0px 0px 0px 4px rgba(6, 182, 212, 0.15), /* Outer ring glow */
          0px 0px 60px 0px #06b6d4; /* Main glow */
      }

      .btn:hover:not(:disabled) .sparkle {
        fill: #ffffff;
        transform: scale(1.2);
      }
    `}</style>
  </>
);

export default AIButton;