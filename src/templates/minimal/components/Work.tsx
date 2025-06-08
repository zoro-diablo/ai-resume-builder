// src/templates/minimal/components/Work.tsx
import React from 'react';
import { HTMLRenderer } from '@/helpers/common/components/HTMLRenderer';
import { dateParser } from '@/helpers/utils';
import { IWorkIntrf } from '@/stores/index.interface';
import { MinimalHeading } from '../atoms/MinimalHeading';

export const MinimalWork = ({ experience }: { experience: IWorkIntrf[] }) => (
  <div className="mb-2">
    <MinimalHeading title="Professional Experience" />
    <div className="space-y-2">
      {experience.map((item, index) => (
        <div key={index} className="bg-white border-l-4 border-blue-500 pl-4 py-2">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{item.position}</h3>
              <p className="text-xs text-blue-600 font-medium">{item.name}</p>
            </div>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1  rounded">
              {dateParser(item.startDate)} - {item.isWorkingHere ? 'Present' : dateParser(item.endDate)}
            </span>
          </div>
          <div className="text-gray-700 text-sm leading-relaxed">
            <HTMLRenderer htmlString={item.summary} />
          </div>
        </div>
      ))}
    </div>
  </div>
);