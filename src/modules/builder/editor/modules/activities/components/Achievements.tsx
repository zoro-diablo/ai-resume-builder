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

const Achievements: React.FC = () => {
  const activities = useActivity((state) => state.activities);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an expert resume-writing assistant.
Return only raw HTML—do not include any markdown code fences or extra text.
Generate concise, impact-focused bullet points for a resume's "Achievements" section based on:
"${activities.achievements || 'general achievements'}".

Requirements:
- Under 80 words total
- Return only an HTML <ul><li>…</li></ul> list
- Start each bullet with an action verb`;
      
      const result = await model.generateContent(prompt);
      const resp = await result.response;
      let text = (await resp.text()).trim();

      // strip any accidental markdown fences
      text = text.replace(/```html\s*/gi, '').replace(/```/g, '').trim();

      // fallback: if no <ul> at start, wrap lines into <li>
      if (!text.startsWith('<ul>')) {
        const lines = text
          .split('\n')
          .map((l) => l.replace(/^[•*-]\s*/, '').trim())
          .filter(Boolean);
        text = `<ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul>`;
      }

      useActivity.getState().updateAchievements(text);
    } catch (error) {
      console.error('Error generating achievements:', error);
      // optionally handle error state here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <RichtextEditor
        label="Achievements"
        value={activities.achievements}
        onChange={(html) =>
          useActivity.getState().updateAchievements(html)
        }
        name="achievements"
      />
      <AIButton loading={isLoading} onClick={handleGenerate}>
        Enhance with AI
      </AIButton>
    </>
  );
};

export default Achievements;
