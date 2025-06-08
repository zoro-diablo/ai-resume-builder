// src/templates/minimal/components/Summary.tsx
import React from 'react';
import { HTMLRenderer } from '@/helpers/common/components/HTMLRenderer';
import { MinimalHeading } from '../atoms/MinimalHeading';

export const MinimalSummary = ({ summary }: { summary: string }) => (
  <div className="mb-4">
    <MinimalHeading title="Professional Summary" />
    <div className="text-gray-700 leading-relaxed">
      <HTMLRenderer htmlString={summary} />
    </div>
  </div>
);