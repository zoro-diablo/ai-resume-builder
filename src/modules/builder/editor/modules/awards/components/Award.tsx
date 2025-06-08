/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ChangeEvent, Fragment, useCallback, useState } from 'react';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

import { useAwards } from '@/stores/awards';
import { IAwardItem } from '@/stores/awards.interface';
import { RichtextEditor } from '@/helpers/common/components/richtext';
import AIButton from '@/helpers/common/components/button/AIButton';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DATE_PICKER_FORMAT } from '@/helpers/constants';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not defined');
}
const genAI = new GoogleGenerativeAI(apiKey);

interface IAwardComp {
  awardInfo: IAwardItem;
  currentIndex: number;
}

const AwardComp: React.FC<IAwardComp> = ({ awardInfo, currentIndex }) => {
  const [isLoading, setIsLoading] = useState(false);

  const onChangeHandler = useCallback(
    (name: string, value: any) => {
      const current = { ...awardInfo };
      const updateAward = useAwards.getState().updateAward;

      switch (name) {
        case 'title':
          current.title = value;
          break;
        case 'awarder':
          current.awarder = value;
          break;
        case 'date':
          if (value?.isValid()) current.date = value;
          break;
        case 'summary':
          current.summary = value;
          break;
      }

      updateAward(currentIndex, current);
    },
    [awardInfo, currentIndex]
  );

  const onSummaryChange = useCallback(
    (html: string) => {
      onChangeHandler('summary', html);
    },
    [onChangeHandler]
  );

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an expert resume-writing assistant.
Return only raw HTML—no markdown code fences or extra text.
Generate concise, ATS-friendly bullet points for a resume's "Awards" section based on:
Award: ${awardInfo.title || 'an award'},
Awarded by: ${awardInfo.awarder || 'an organization'},
Date: ${
        awardInfo.date
          ? dayjs(awardInfo.date).format('MMM YYYY')
          : 'a date'
      },
Description: ${awardInfo.summary || 'award details'}.

Requirements:
- Under 60 words total
- Return only an HTML <ul><li>…</li></ul> list
- Start each bullet with an action verb`;

      const result = await model.generateContent(prompt);
      const resp = await result.response;
      let text = (await resp.text()).trim();

      // strip any markdown fences
      text = text.replace(/```html\s*/gi, '').replace(/```/g, '').trim();

      // if it doesn’t start with <ul>, wrap lines into <li>
      if (!text.startsWith('<ul>')) {
        const lines = text
          .split('\n')
          .map((l) => l.replace(/^[•*-]\s*/, '').trim())
          .filter(Boolean);
        text = `<ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul>`;
      }

      onChangeHandler('summary', text);
    } catch (error) {
      console.error('Error generating award bullets:', error);
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
        label="Award name"
        variant="filled"
        value={awardInfo.title}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChangeHandler('title', e.target.value)
        }
        autoComplete="off"
        fullWidth
        required
        autoFocus
        sx={{ marginBottom: '26px' }}
      />

      <TextField
        label="Awarded by"
        variant="filled"
        value={awardInfo.awarder}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          onChangeHandler('awarder', e.target.value)
        }
        autoComplete="off"
        fullWidth
        required
        sx={{ marginBottom: '26px' }}
      />

      <DatePicker
        label="Date"
        value={dayjs(awardInfo.date)}
        onChange={(newDate) => onChangeHandler('date', newDate)}
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
      />

      <RichtextEditor
        label="About the award"
        value={awardInfo.summary}
        onChange={onSummaryChange}
        name="summary"
      />

      <div className='flex justify-center'>
        <AIButton loading={isLoading} onClick={handleGenerateSummary}>
          Enhance with AI
        </AIButton>
      </div>
    </Fragment>
  );
};

export default AwardComp;
