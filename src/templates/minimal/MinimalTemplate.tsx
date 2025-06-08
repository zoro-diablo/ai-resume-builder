// src/templates/minimal/MinimalTemplate.tsx
import React, { useContext } from 'react';
import { StateContext } from '@/modules/builder/resume/ResumeLayout';
import { SectionValidator } from '@/helpers/common/components/ValidSectionRenderer';
import { MinimalHeader } from './components/Header';
import { MinimalSummary } from './components/Summary';
import { MinimalObjective } from './components/Objective';
import { MinimalWork } from './components/Work';
import { MinimalEducation } from './components/Education';
import { MinimalSkills } from './components/Skills';
import { MinimalVolunteer } from './components/Volunteer';
import { MinimalAwards } from './components/Awards';

export default function MinimalTemplate() {
  const resumeData = useContext(StateContext);

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen p-6">
      {/* Header Section */}
      <MinimalHeader
        name={resumeData.basics.name}
        label={resumeData.basics.label}
        email={resumeData.basics.email}
        phone={resumeData.basics.phone}
        city={resumeData.basics.location.city}
        url={resumeData.basics.url}
        image={resumeData.basics.image}
        profiles={resumeData.basics.profiles}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Left Side */}
        <div className="lg:col-span-2 space-y-0">
          <SectionValidator value={resumeData.basics.summary}>
            <MinimalSummary summary={resumeData.basics.summary} />
          </SectionValidator>

          <SectionValidator value={resumeData.work}>
            <MinimalWork experience={resumeData.work} />
          </SectionValidator>          

          <SectionValidator value={resumeData.awards}>
            <MinimalAwards awards={resumeData.awards} />
          </SectionValidator>
        </div>

        {/* Sidebar - Right Side */}
        <div className="space-y-0">
          <SectionValidator value={resumeData.basics.objective}>
            <MinimalObjective objective={resumeData.basics.objective} />
          </SectionValidator>

          <SectionValidator value={resumeData.skills.languages}>
            <MinimalSkills title="Languages" skills={resumeData.skills.languages} />
          </SectionValidator>

          <SectionValidator value={resumeData.skills.technologies}>
            <MinimalSkills title="Technologies" skills={resumeData.skills.technologies} />
          </SectionValidator>

          <SectionValidator value={resumeData.skills.frameworks}>
            <MinimalSkills 
              title="Frameworks & Libraries" 
              skills={resumeData.skills.frameworks.concat(resumeData.skills.libraries)} 
            />
          </SectionValidator>

          <SectionValidator value={resumeData.skills.tools}>
            <MinimalSkills title="Tools" skills={resumeData.skills.tools} />
          </SectionValidator>

          <SectionValidator value={resumeData.education}>
            <MinimalEducation education={resumeData.education} />
          </SectionValidator>
          <SectionValidator value={resumeData.volunteer}>
            <MinimalVolunteer volunteer={resumeData.volunteer} />
          </SectionValidator>
        </div>
      </div>
    </div>
  );
}