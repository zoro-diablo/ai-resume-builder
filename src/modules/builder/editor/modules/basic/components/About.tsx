/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { RichtextEditor } from '@/helpers/common/components/richtext';
import AIButton from '@/helpers/common/components/button/AIButton';
import { useApiKey } from '@/helpers/common/components/Ai/ApiKeyDialog'; 

const About = ({
  basicTabs,
  onChangeHandler,
}: {
  basicTabs: { summary: string; objective: string };
  onChangeHandler: (value: string, key: 'summary' | 'objective') => void;
}) => {
  // Use the custom hook to access the user's API key and the AI instance
  const { apiKey, getGenAI } = useApiKey();

  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isLoadingObjective, setIsLoadingObjective] = useState(false);

  const handleGenerateSummary = async () => {
    // Guard against function calls when the key is not available
    if (!apiKey) {
      onChangeHandler(
        'Error: API Key is not set. Please add it via the "API Key" button in the navigation bar.',
        'summary'
      );
      return;
    }

    setIsLoadingSummary(true);
    try {
      // Get the generative AI instance from the hook
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Generate a professional "About me" summary for a resume based on: ${
        basicTabs.summary || 'a general professional background'
      }. Keep it concise and under 80 words.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = await response.text();
      onChangeHandler(generatedText, 'summary');
    } catch (error: any) {
      console.error('Error with Gemini API:', error);
      // Provide user-friendly error messages in the editor
      if (error.message.includes('API_KEY_INVALID')) {
        onChangeHandler('Error: The provided API Key is invalid. Please check and update it.', 'summary');
      } else {
        onChangeHandler(`Error generating text: ${error.message}`, 'summary');
      }
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const handleGenerateObjective = async () => {
    if (!apiKey) {
      onChangeHandler(
        'Error: API Key is not set. Please add it via the "API Key" button in the navigation bar.',
        'objective'
      );
      return;
    }

    setIsLoadingObjective(true);
    try {
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Generate a concise and professional career objective for a resume based on: ${
        basicTabs.objective || 'a general career goal'
      }. Keep it under 40 words.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const generatedText = await response.text();
      onChangeHandler(generatedText, 'objective');
    } catch (error: any) {
      console.error('Error with Gemini API:', error);
      if (error.message.includes('API_KEY_INVALID')) {
        onChangeHandler('Error: The provided API Key is invalid. Please check and update it.', 'objective');
      } else {
        onChangeHandler(`Error generating text: ${error.message}`, 'objective');
      }
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
      <div className="flex justify-center">
        <AIButton
          loading={isLoadingSummary}
          onClick={handleGenerateSummary}
          disabled={!apiKey}
          title={!apiKey ? 'Please set your API key to use AI features' : 'Enhance with AI'}
        >
          Enhance with AI
        </AIButton>
      </div>

      <RichtextEditor
        label="Career objective"
        value={basicTabs.objective}
        onChange={(html) => onChangeHandler(html, 'objective')}
        name="objective"
      />
      <div className="flex justify-center">
        <AIButton
          loading={isLoadingObjective}
          onClick={handleGenerateObjective}
          disabled={!apiKey}
          title={!apiKey ? 'Please set your API key to use AI features' : 'Enhance with AI'}
        >
          Enhance with AI
        </AIButton>
      </div>
    </>
  );
};

export default About;