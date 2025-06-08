import React from 'react';
import { SkillTag } from '../atoms/SkillTag';

export const MinimalSkills = ({ title, skills }: { title: string; skills: any[] }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-800 mb-2">{title}</h3>
    <div className="flex flex-wrap">
      {skills.map((skill, index) => (
        <SkillTag key={index} skill={skill.name} />
      ))}
    </div>
  </div>
);