import React from 'react';
import { HTMLRenderer } from '@/helpers/common/components/HTMLRenderer';
import { dateParser } from '@/helpers/utils';
import { IVolunteer } from '@/stores/index.interface';
import { MinimalHeading } from '../atoms/MinimalHeading';

export const MinimalVolunteer = ({ volunteer }: { volunteer: IVolunteer[] }) => (
  <div className="mb-8">
    <MinimalHeading title="Volunteer Experience" />
    <div className="space-y-4">
      {volunteer.map((item, index) => (
        <div key={index} className="border-l-2 border-blue-200 pl-4 py-2">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{item.position}</p>
              <p className="text-blue-600 text-sm">{item.organization}</p>
            </div>
            <span className="text-xs text-gray-500">
              {dateParser(item.startDate)} - {item.isVolunteeringNow ? 'Present' : dateParser(item.endDate)}
            </span>
          </div>
          <div className="text-gray-700 text-sm">
            <HTMLRenderer htmlString={item.summary} />
          </div>
        </div>
      ))}
    </div>
  </div>
);