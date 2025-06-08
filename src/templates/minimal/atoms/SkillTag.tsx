// src/templates/minimal/atoms/SkillTag.tsx
export const SkillTag = ({ skill }: { skill: string }) => (
  <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs mr-1 mb-1 hover:bg-blue-50 transition-colors">
    {skill}
  </span>
);