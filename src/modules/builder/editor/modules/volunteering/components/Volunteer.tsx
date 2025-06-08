/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ChangeEvent, Fragment, useCallback, useState } from 'react';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import { useVoluteeringStore } from '@/stores/volunteering';
import { IVolunteeringItem } from '@/stores/volunteering.interface';
import { SwitchWidget } from '@/helpers/common/atoms/Switch';
import { RichtextEditor } from '@/helpers/common/components/richtext';
import AIButton from '@/helpers/common/components/button/AIButton';
import { useApiKey } from '@/helpers/common/components/Ai/ApiKeyDialog'; // Import the centralized API key hook
import { DATE_PICKER_FORMAT } from '@/helpers/constants';

interface IVolunteerProps {
  volunteeringInfo: IVolunteeringItem;
  currentIndex: number;
}

const Volunteer: React.FC<IVolunteerProps> = ({
  volunteeringInfo,
  currentIndex,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Use the custom hook to access the user's API key and the AI instance
  const { apiKey, getGenAI } = useApiKey();

  const onChangeHandler = useCallback(
    (name: string, value: any) => {
      const current = { ...volunteeringInfo };
      const update = useVoluteeringStore.getState().updatedVolunteeringExp;
      switch (name) {
        case 'organisation':
          current.organization = value;
          break;
        case 'role':
          current.position = value;
          break;
        case 'startDate':
          if (value?.isValid()) current.startDate = value;
          break;
        case 'isVolunteeringNow':
          current.isVolunteeringNow = value;
          break;
        case 'endDate':
          if (value?.isValid()) current.endDate = value;
          break;
        case 'summary':
          current.summary = value;
          break;
      }
      update(currentIndex, current);
    },
    [currentIndex, volunteeringInfo]
  );

  const onSummaryChange = useCallback(
    (html: string) => onChangeHandler('summary', html),
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

    setIsLoading(true);
    try {
      // Get the generative AI instance from the hook
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an expert resume-writing assistant.
Return only raw HTML list items—no markdown code fences or extra text.
Generate concise, ATS-friendly bullet points for a resume's "Volunteering" section based on:
Organization: ${volunteeringInfo.organization || 'a volunteering organization'},
Role: ${volunteeringInfo.position || 'a volunteer role'},
Description: ${volunteeringInfo.summary || 'general volunteering responsibilities'}.

Requirements:
- Under 80 words total
- Return only an HTML <ul><li>…</li></ul> list
- Start each bullet with an action verb`;
      const result = await model.generateContent(prompt);
      const resp = await result.response;
      let text = (await resp.text()).trim();

      // strip out any markdown fences
      text = text.replace(/```html\s*/gi, '').replace(/```/g, '').trim();

      // if it didn’t come back as <ul>, wrap lines into <li>
      if (!text.startsWith('<ul>')) {
        const lines = text
          .split('\n')
          .map((l) => l.replace(/^[•*-]\s*/, '').trim())
          .filter(Boolean);
        text = `<ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul>`;
      }

      onChangeHandler('summary', text);
    } catch (err: any) {
      console.error('AI generate error:', err);
      // Provide user-friendly error messages in the editor
      if (err.message.includes('API_KEY_INVALID')) {
        onChangeHandler('summary', '<p>Error: The provided API Key is invalid. Please check and update it.</p>');
      } else {
        onChangeHandler('summary', `<p>Error generating text: ${err.message}</p>`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Fragment>
      <TextField
        label="Organisation"
        variant="filled"
        value={volunteeringInfo.organization}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChangeHandler('organisation', e.target.value)
        }
        autoComplete="off"
        fullWidth
        required
        autoFocus
        sx={{ marginBottom: '26px' }}
      />

      <TextField
        label="Role"
        variant="filled"
        value={volunteeringInfo.position}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChangeHandler('role', e.target.value)
        }
        autoComplete="off"
        fullWidth
        required
        sx={{ marginBottom: '26px' }}
      />

      <DatePicker
        label="Start date"
        value={dayjs(volunteeringInfo.startDate)}
        onChange={(d) => onChangeHandler('startDate', d)}
        format={DATE_PICKER_FORMAT}
        slotProps={{
          textField: {
            variant: 'filled',
            autoComplete: 'off',
            fullWidth: true,
            required: true,
          },
        }}
      />

      <SwitchWidget
        label="I currently volunteer here"
        value={!!volunteeringInfo.isVolunteeringNow}
        onChange={(v) => onChangeHandler('isVolunteeringNow', v)}
      />

      <DatePicker
        label="End date"
        value={
          volunteeringInfo.isVolunteeringNow
            ? null
            : dayjs(volunteeringInfo.endDate)
        }
        onChange={(d) => onChangeHandler('endDate', d)}
        format={DATE_PICKER_FORMAT}
        slotProps={{
          textField: {
            variant: 'filled',
            autoComplete: 'off',
            fullWidth: true,
            required: true,
            sx: { marginBottom: '26px' },
          },
        }}
        disabled={volunteeringInfo.isVolunteeringNow}
      />

      <RichtextEditor
        label="Few points on this volunteering experience"
        value={volunteeringInfo.summary}
        onChange={onSummaryChange}
        name="summary"
      />
      <div className="flex justify-center">
        <AIButton
          loading={isLoading}
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

export default Volunteer;