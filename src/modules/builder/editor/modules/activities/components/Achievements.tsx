import React, { useState } from 'react';
import { RichtextEditor } from '@/helpers/common/components/richtext';
import { useActivity } from '@/stores/activity';
import AIButton from '@/helpers/common/components/button/AIButton';
import { useApiKey } from '@/helpers/common/components/Ai/ApiKeyDialog'; 

const Achievements: React.FC = () => {
  const activities = useActivity((state) => state.activities);
  const { updateAchievements } = useActivity.getState(); 
  const [isLoading, setIsLoading] = useState(false);

  const { apiKey, getGenAI } = useApiKey();

  const handleGenerate = async () => {
    if (!apiKey) {
      updateAchievements(
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
Return only raw HTML—do not include any markdown code fences or extra text.
Generate concise, impact-focused bullet points for a resume's "Achievements" section based on:
"${activities.achievements || 'general professional achievements'}".

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

      updateAchievements(text);
    } catch (error: any) {
      console.error('Error generating achievements:', error);
      // Provide user-friendly error messages in the editor
      if (error.message.includes('API_KEY_INVALID')) {
        updateAchievements('<p>Error: The provided API Key is invalid. Please check and update it.</p>');
      } else {
        updateAchievements(`<p>Error generating text: ${error.message}</p>`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <RichtextEditor
        label="Achievements"
        value={activities.achievements}
        onChange={(html) => updateAchievements(html)}
        name="achievements"
      />
      <div className="flex justify-center">
        <AIButton
          loading={isLoading}
          onClick={handleGenerate}
          disabled={!apiKey}
          title={!apiKey ? 'Please set your API key to use AI features' : 'Enhance with AI'}
        >
          Enhance with AI
        </AIButton>
      </div>
    </>
  );
};

export default Achievements;