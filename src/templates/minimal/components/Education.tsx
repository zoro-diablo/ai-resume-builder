// src/templates/minimal/components/Education.tsx
import React from 'react';
import { dateParser } from '@/helpers/utils';
import { IEducation } from '@/stores/index.interface';
import { MinimalHeading } from '../atoms/MinimalHeading';

export const MinimalEducation = ({ education }: { education: IEducation[] }) => (
  <div className="mb-4">
    <MinimalHeading title="Education" />
    <div className="space-y-2">
      {education.map((item, index) => (
        <div key={index} className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-sm text-gray-900">{item.studyType} in {item.area}</p>
              <p className="text-blue-600 text-sm">{item.institution}</p>
            </div>
            <span className="text-xs text-gray-500">
              {dateParser(item.startDate)} - {item.isStudyingHere ? 'Present' : dateParser(item.endDate)}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);