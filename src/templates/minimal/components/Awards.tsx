// src/templates/minimal/components/Awards.tsx
import React from 'react';
import { HTMLRenderer } from '@/helpers/common/components/HTMLRenderer';
import { dateParser } from '@/helpers/utils';
import { IAwards } from '@/stores/index.interface';
import { MinimalHeading } from '../atoms/MinimalHeading';

export const MinimalAwards = ({ awards }: { awards: IAwards[] }) => (
  <div className="mb-1">
    <MinimalHeading title="Awards & Recognition" />
    <div className="space-x-4 flex">
      {awards.map((award, index) => (
        <div key={index} className="bg-blue-50 border-l-4 border-blue-100 p-3 rounded-r-lg">
          <div className="flex justify-between items-start mb-1">
            <div>
              <p className=" text-xs font-semibold text-gray-900">{award.title}</p>
              <p className="text-blue-700 text-xs">{award.awarder}</p>
              <span className="text-xs text-gray-500">{dateParser(award.date)}</span>
            </div>
          </div>
          <div className="text-gray-700 text-sm">
            <HTMLRenderer htmlString={award.summary} />
          </div>
        </div>
      ))}
    </div>
  </div>
);
