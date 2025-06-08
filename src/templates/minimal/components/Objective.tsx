// src/templates/minimal/components/Objective.tsx
import React from 'react';
import { HTMLRenderer } from '@/helpers/common/components/HTMLRenderer';
import { MinimalHeading } from '../atoms/MinimalHeading';

export const MinimalObjective = ({ objective }: { objective: string }) => (
  <div className="mb-8">
    <MinimalHeading title="Objective" />
    <div className="text-gray-700 text-sm leading-relaxed">
      <HTMLRenderer htmlString={objective} />
    </div>
  </div>
);