import React, { useState } from 'react';
import { RichtextEditor } from '@/helpers/common/components/richtext';
import { useActivity } from '@/stores/activity';
import AIButton from '@/helpers/common/components/button/AIButton';
import { useApiKey } from '@/helpers/common/components/Ai/ApiKeyDialog'; // Import the centralized API key hook

const Involvements: React.FC = () => {
  const activities = useActivity((state) => state.activities);
  const { updateInvolvements } = useActivity.getState(); // Get the update function from the store
  const [isLoading, setIsLoading] = useState(false);

  // Use the custom hook to access the user's API key and the AI instance
  const { apiKey, getGenAI } = useApiKey();

  const handleGenerate = async () => {
    // Guard against function calls when the key is not available
    if (!apiKey) {
      updateInvolvements(
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
Return only raw HTML—no markdown code fences or extra text.
Generate concise, ATS-friendly bullet points for a resume's "Involvements" or "Extracurricular Activities" section based on:
"${activities.involvements || 'general extracurricular activities'}".

Requirements:
- Under 80 words total
- Return only an HTML <ul><li>…</li></ul> list
- Start each bullet with an action verb (e.g., Organized, Led, Managed, Coordinated).`;

      const result = await model.generateContent(prompt);
      const resp = await result.response;
      let text = (await resp.text()).trim();

      // Strip out any markdown fences just in case
      text = text.replace(/```html\s*/gi, '').replace(/```/g, '').trim();

      // If it didn’t start with <ul>, wrap plain lines into <li>
      if (!text.startsWith('<ul>')) {
        const lines = text
          .split('\n')
          .map((l) => l.replace(/^[•*-]\s*/, '').trim())
          .filter(Boolean);
        text = `<ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul>`;
      }

      // Commit back into the zustand store
      updateInvolvements(text);
    } catch (error: any) {
      console.error('Error generating involvements:', error);
      // Provide user-friendly error messages in the editor
      if (error.message.includes('API_KEY_INVALID')) {
        updateInvolvements('<p>Error: The provided API Key is invalid. Please check and update it.</p>');
      } else {
        updateInvolvements(`<p>Error generating text: ${error.message}</p>`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <RichtextEditor
        label="Involvements"
        value={activities.involvements}
        onChange={(html) => updateInvolvements(html)}
        name="involvements"
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

export default Involvements;