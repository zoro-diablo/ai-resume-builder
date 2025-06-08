import React, { useState } from 'react';
import { RichtextEditor } from '@/helpers/common/components/richtext';
import { useActivity } from '@/stores/activity';
import AIButton from '@/helpers/common/components/button/AIButton';
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not defined');
}
const genAI = new GoogleGenerativeAI(apiKey);

const Involvements: React.FC = () => {
  const activities = useActivity((state) => state.activities);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an expert resume-writing assistant.
Return only raw HTML—no markdown code fences or extra text.
Generate concise, ATS-friendly bullet points for a resume's "Involvements" section based on:
"${activities.involvements || 'general extracurricular activities'}".

Requirements:
- Under 80 words total
- Return only an HTML <ul><li>…</li></ul> list
- Start each bullet with an action verb`;
      
      const result = await model.generateContent(prompt);
      const resp = await result.response;
      let text = (await resp.text()).trim();

      // strip out any markdown fences just in case
      text = text.replace(/```html\s*/gi, '').replace(/```/g, '').trim();

      // if it didn’t start with <ul>, wrap plain lines into <li>
      if (!text.startsWith('<ul>')) {
        const lines = text
          .split('\n')
          .map((l) => l.replace(/^[•*-]\s*/, '').trim())
          .filter(Boolean);
        text = `<ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul>`;
      }

      // commit back into your zustand store
      useActivity.getState().updateInvolvements(text);
    } catch (error) {
      console.error('Error generating involvements:', error);
      // optional: you could push an error bullet too
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <RichtextEditor
        label="Involvements"
        value={activities.involvements}
        onChange={(html) =>
          useActivity.getState().updateInvolvements(html)
        }
        name="involvements"
      />
      <AIButton loading={isLoading} onClick={handleGenerate}>
        Enhance with AI
      </AIButton>
    </>
  );
};

export default Involvements;
