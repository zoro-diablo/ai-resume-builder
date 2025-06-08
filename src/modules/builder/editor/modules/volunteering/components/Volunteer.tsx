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
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DATE_PICKER_FORMAT } from '@/helpers/constants';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not defined');
}
const genAI = new GoogleGenerativeAI(apiKey);

interface IVolunteerProps {
  volunteeringInfo: IVolunteeringItem;
  currentIndex: number;
}

const Volunteer: React.FC<IVolunteerProps> = ({
  volunteeringInfo,
  currentIndex,
}) => {
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an expert resume-writing assistant.
Return only raw HTML list items—no markdown code fences or extra text.
Generate concise, ATS-friendly bullet points for a resume's "Volunteering" section based on:
Organization: ${
        volunteeringInfo.organization || 'a volunteering organization'
      },
Role: ${volunteeringInfo.position || 'a volunteer role'},
Description: ${
        volunteeringInfo.summary || 'general volunteering responsibilities'
      }.

Requirements:
- Under 80 words total
- Return only an HTML <ul><li>…</li></ul> list
- Start each bullet with an action verb`;
      const result = await model.generateContent(prompt);
      const resp = await result.response;
      let text = (await resp.text()).trim();

      // strip out any markdown fences
      text = text
        .replace(/```html\s*/gi, '')
        .replace(/```/g, '')
        .trim();

      // if it didn’t come back as <ul>, wrap lines into <li>
      if (!text.startsWith('<ul>')) {
        const lines = text
          .split('\n')
          .map((l) => l.replace(/^[•*-]\s*/, '').trim())
          .filter(Boolean);
        text = `<ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul>`;
      }

      onChangeHandler('summary', text);
    } catch (err) {
      console.error('AI generate error:', err);
      // fallback error message
      onChangeHandler(
        'summary',
        '<ul><li>Error generating content. Please try again.</li></ul>'
      );
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

      <AIButton loading={isLoading} onClick={handleGenerateSummary}>
        Enhance with AI
      </AIButton>
    </Fragment>
  );
};

export default Volunteer;
