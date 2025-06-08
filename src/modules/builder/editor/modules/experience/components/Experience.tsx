import React, { ChangeEvent, Fragment, useCallback, useState } from 'react';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { useExperiences } from '@/stores/experience';
import { IExperienceItem } from '@/stores/experience.interface';
import { SwitchWidget } from '@/helpers/common/atoms/Switch';
import { RichtextEditor } from '@/helpers/common/components/richtext';
import AIButton from '@/helpers/common/components/button/AIButton';
import { useApiKey } from '@/helpers/common/components/Ai/ApiKeyDialog'; // Import the centralized API key hook
import { DATE_PICKER_FORMAT } from '@/helpers/constants';

interface IExperienceProps {
  experienceInfo: IExperienceItem;
  currentIndex: number;
}

const Experience: React.FC<IExperienceProps> = ({ experienceInfo, currentIndex }) => {
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  
  // Use the custom hook to access the user's API key and the AI instance
  const { apiKey, getGenAI } = useApiKey();

  const onChangeHandler = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (name: string, value: any) => {
      const currentExpInfo = { ...experienceInfo };
      const updateExperience = useExperiences.getState().updateExperience;
      switch (name) {
        case 'companyName':
          currentExpInfo.name = value;
          break;
        case 'position':
          currentExpInfo.position = value;
          break;
        case 'startDate':
          if (value?.isValid()) {
            currentExpInfo.startDate = value;
          }
          break;
        case 'isWorkingHere':
          currentExpInfo.isWorkingHere = value;
          break;
        case 'endDate':
          if (value?.isValid()) {
            currentExpInfo.endDate = value;
          }
          break;
        case 'years':
          currentExpInfo.years = value;
          break;
        case 'summary':
          currentExpInfo.summary = value;
          break;
        default:
          break;
      }
      updateExperience(currentIndex, currentExpInfo);
    },
    [currentIndex, experienceInfo]
  );

  const onSummaryChange = useCallback(
    (htmlOutput: string) => {
      onChangeHandler('summary', htmlOutput);
    },
    [onChangeHandler]
  );

  const handleGenerateSummary = async () => {
    // Guard against function calls when the key is not available
    if (!apiKey) {
      onChangeHandler(
        'summary',
        '<p>Error: API Key is not set. Please add it via the "API Key" button in the navigation bar.</p>'
      );
      return;
    }

    setIsLoadingSummary(true);
    try {
      // Get the generative AI instance from the hook
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Generate a concise and professional summary of work experience for a resume based on: Company: ${experienceInfo.name || 'a company'}, Position: ${experienceInfo.position || 'a professional role'}, Description: ${experienceInfo.summary || 'general professional responsibilities'}. 

Requirements:
- Keep it under 80 words total
- Format as HTML bullet points using <ul> and <li> tags
- Each bullet point should start with an action verb
- Focus on achievements and responsibilities
- Make it ATS-friendly

Return only the HTML <ul><li>content</li></ul> structure without any additional text or formatting.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let generatedText = await response.text();

      // Clean up the response to ensure it's proper HTML
      generatedText = generatedText.trim().replace(/```html\s*/gi, '').replace(/```/g, '');

      // If the response doesn't start with <ul>, wrap it
      if (!generatedText.startsWith('<ul>')) {
        const lines = generatedText.split('\n').filter(line => line.trim());
        const listItems = lines.map(line => {
          const cleanLine = line.replace(/^[•*-]\s*/, '').trim();
          return cleanLine ? `<li>${cleanLine}</li>` : '';
        }).filter(item => item);
        generatedText = `<ul>${listItems.join('')}</ul>`;
      }
      
      onChangeHandler('summary', generatedText);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Error with Gemini API:', error);
      // Provide user-friendly error messages in the editor
      if (error.message.includes('API_KEY_INVALID')) {
        onChangeHandler('summary', '<p>Error: The provided API Key is invalid. Please check and update it.</p>');
      } else {
        onChangeHandler('summary', `<p>Error generating text: ${error.message}</p>`);
      }
    } finally {
      setIsLoadingSummary(false);
    }
  };

  return (
    <Fragment>
      <TextField
        label="Company name"
        variant="filled"
        value={experienceInfo.name}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          onChangeHandler('companyName', value);
        }}
        autoComplete="off"
        fullWidth
        required
        autoFocus={true}
        sx={{ marginBottom: '26px' }}
      />
      <TextField
        label="Position"
        variant="filled"
        value={experienceInfo.position}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          onChangeHandler('position', value);
        }}
        autoComplete="off"
        fullWidth
        required
        sx={{ marginBottom: '26px' }}
      />
      <DatePicker
        label="Start date"
        format={DATE_PICKER_FORMAT}
        value={dayjs(experienceInfo.startDate)}
        onChange={(newDate) => {
          onChangeHandler('startDate', newDate);
        }}
        slotProps={{
          textField: { variant: 'filled', autoComplete: 'off', fullWidth: true, required: true },
        }}
      />
      <SwitchWidget
        label={'I currently work here'}
        value={experienceInfo.isWorkingHere ?? false}
        onChange={(newValue: boolean) => {
          onChangeHandler('isWorkingHere', newValue);
        }}
      />
      <DatePicker
        label="End date"
        format={DATE_PICKER_FORMAT}
        value={experienceInfo.isWorkingHere ? null : dayjs(experienceInfo.endDate)}
        onChange={(newDate) => {
          onChangeHandler('endDate', newDate);
        }}
        slotProps={{
          textField: {
            variant: 'filled',
            autoComplete: 'off',
            fullWidth: true,
            required: true,
            sx: { marginBottom: '26px' },
          },
        }}
        disabled={experienceInfo.isWorkingHere}
      />
      <TextField
        label="Years"
        variant="filled"
        value={experienceInfo.years}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          onChangeHandler('years', value);
        }}
        autoComplete="off"
        fullWidth
        sx={{ marginBottom: '26px' }}
      />
      <RichtextEditor
        label="Few points on this work experience"
        value={experienceInfo.summary}
        onChange={onSummaryChange}
        name="summary"
      />
      <div className='text-center'>
        <AIButton
          loading={isLoadingSummary}
          onClick={handleGenerateSummary}
          disabled={!apiKey}
          title={!apiKey ? 'Please set your API key to use AI features' : 'Enhance with AI'}
        >
          Enhance with AI
        </AIButton>
      </div>
    </Fragment>
  );
};

export default Experience;