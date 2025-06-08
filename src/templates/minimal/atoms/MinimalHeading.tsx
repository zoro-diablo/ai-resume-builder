// src/templates/minimal/atoms/MinimalHeading.tsx
export const MinimalHeading = ({ title }: { title: string }) => (
  <h2 className="text-sm font-semibold text-gray-800 mb-3 p-1 border-b-2 border-blue-500 uppercase tracking-wide">
    {title}
  </h2>
);