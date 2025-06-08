// src/templates/minimal/components/Header.tsx
import React from 'react';
import { ProfileImage } from '@/helpers/common/components/ProfileImage';
import { IProfiles } from 'src/stores/basic.interface';
import { socialIcons } from 'src/helpers/icons';
import { BsGlobe, BsPhone, BsEnvelope, BsGeoAlt } from 'react-icons/bs';
import { ContactItem } from '../atoms/ContactItem';

export const MinimalHeader = ({
  name,
  label,
  email,
  phone,
  city,
  url,
  image,
  profiles,
}: {
  name: string;
  label: string;
  email: string;
  phone: string;
  city: string;
  url: string;
  image: string;
  profiles?: IProfiles[];
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 mb-4 rounded-lg">
      <div className="flex items-center gap-6">
        {image && (
          <ProfileImage 
            src={image} 
            width="100px" 
            height="100px" 
            imageWrapperClassname="flex-shrink-0 rounded-full overflow-hidden shadow-lg"
          />
        )}
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 ">{name}</h1>
          <p className="text-lg text-blue-600 font-medium">{label}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <ContactItem icon={BsPhone} text={phone} href={`tel:${phone}`} />
            <ContactItem icon={BsEnvelope} text={email} href={`mailto:${email}`} />
            <ContactItem icon={BsGeoAlt} text={city} />
            {url && <ContactItem icon={BsGlobe} text={url} href={url} />}
          </div>
          
          {profiles && profiles.length > 0 && (
            <div className="flex gap-3">
              {profiles.map((profile) => {
                const Icon = socialIcons.get(profile.network);
                return (
                  Icon && profile.url && (
                    <a
                      key={profile.network}
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  )
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};