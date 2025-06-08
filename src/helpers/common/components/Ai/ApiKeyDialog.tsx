// src/components/layout/NavBar/components/ApiKeyDialog.tsx

import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button } from '@mui/material';
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY_STORAGE_KEY = 'gemini_api_key';

// Custom hook to manage the API key
export const useApiKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(() => {
    // Initialize with localStorage value if available
    if (typeof window !== 'undefined') {
      return localStorage.getItem(API_KEY_STORAGE_KEY);
    }
    return null;
  });

  useEffect(() => {
    // Listen for storage changes across tabs/components
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === API_KEY_STORAGE_KEY) {
        setApiKey(e.newValue);
      }
    };

    // Listen for custom events for same-tab updates
    const handleApiKeyUpdate = (e: CustomEvent) => {
      setApiKey(e.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('apiKeyUpdated', handleApiKeyUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('apiKeyUpdated', handleApiKeyUpdate as EventListener);
    };
  }, []);

  const saveApiKey = (key: string) => {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
    setApiKey(key);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('apiKeyUpdated', { detail: key }));
  };

  const clearApiKey = () => {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    setApiKey(null);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('apiKeyUpdated', { detail: null }));
  };

  // Only create GoogleGenerativeAI instance if apiKey exists
  const getGenAI = () => {
    if (!apiKey) {
      throw new Error('API key is not available');
    }
    return new GoogleGenerativeAI(apiKey);
  };

  return { apiKey, saveApiKey, clearApiKey, getGenAI };
};

interface ApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ApiKeyDialog = ({ open, onClose }: ApiKeyDialogProps) => {
  const { apiKey, saveApiKey, clearApiKey } = useApiKey();
  const [currentKey, setCurrentKey] = useState('');

  useEffect(() => {
    if (open) {
      // Set current key to existing API key or empty string
      setCurrentKey(apiKey || '');
    }
  }, [open, apiKey]);

  const handleSave = () => {
    if (currentKey.trim()) {
      saveApiKey(currentKey.trim());
      onClose();
    }
  };

  const handleClear = () => {
    clearApiKey();
    setCurrentKey('');
  };

  const handleClose = () => {
    // Reset currentKey to the saved apiKey when closing without saving
    setCurrentKey(apiKey || '');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {apiKey ? 'Update Gemini API Key' : 'Enter your Gemini API Key'}
      </DialogTitle>
      <DialogContent>
        <p className="text-sm text-gray-600 mb-4">
          Your API key is stored locally in your browser and is never sent to our servers. You can get
          your key from{' '}
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Google AI Studio
          </a>.
        </p>
        {apiKey && (
          <p className="text-sm text-green-600 mb-2">
            ✓ API key is currently set
          </p>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Gemini API Key"
          type="password"
          fullWidth
          variant="outlined"
          value={currentKey}
          onChange={(e) => setCurrentKey(e.target.value)}
          placeholder={apiKey ? "Enter new API key to replace current one" : "Enter your Gemini API key"}
        />
      </DialogContent>
      <DialogActions>
        {apiKey && (
          <Button onClick={handleClear} color="error">
            Clear Key
          </Button>
        )}
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={!currentKey.trim()}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};