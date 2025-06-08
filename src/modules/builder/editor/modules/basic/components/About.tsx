/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { RichtextEditor } from '@/helpers/common/components/richtext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import  AIButton  from '@/helpers/common/components/button/AIButton';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not defined');
}
const genAI = new GoogleGenerativeAI(apiKey);

const About = ({
  basicTabs,
  onChangeHandler,
}: {
  basicTabs: { summary: string; objective: string };
  onChangeHandler: (value: string, key: 'summary' | 'objective') => void;
}) => {
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingObjective, setIsLoadingObjective] = useState(false);

  const handleGenerateSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Generate a professional "About me" summary for a resume based on: ${
        basicTabs.summary || 'a general professional background'
      }. Keep it concise and under 80 words.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = await response.text();
      onChangeHandler(generatedText, 'summary');
    } catch (error) {
      console.error('Error with Gemini API:', error);
      onChangeHandler('Error generating text', 'summary');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleGenerateObjective = async () => {
    setIsLoadingObjective(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Generate a concise and professional career objective for a resume based on: ${
        basicTabs.objective || 'a general career goal'
      }. Keep it under 40 words.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = await response.text();
      onChangeHandler(generatedText, 'objective');
    } catch (error) {
      console.error('Error with Gemini API:', error);
      onChangeHandler('Error generating text', 'objective');
    } finally {
      setIsLoadingObjective(false);
    }
  };

  return (
    <>
      <RichtextEditor
        label="About me"
        value={basicTabs.summary}
        onChange={(html) => onChangeHandler(html, 'summary')}
        name="summary"
      />
       <div className='flex justify-center'>

      <AIButton loading={isLoadingSummary} onClick={handleGenerateSummary}>
        Enhance with AI
      </AIButton>
       </div>

        <RichtextEditor
          label="Career objective"
          value={basicTabs.objective}
          onChange={(html) => onChangeHandler(html, 'objective')}
          name="objective"
        />
        <div className='flex justify-center'>
          <AIButton loading={isLoadingObjective} onClick={handleGenerateObjective}>
            Enhance with AI
          </AIButton>
        </div>
    </>
  );
};

export default About;
