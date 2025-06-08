
import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import { MdClose, MdCheckCircle, MdLightbulb, MdWork } from 'react-icons/md';
import { useResumeStore } from '../../../../stores/useResumeStore';
import { useApiKey } from  '@/helpers/common/components/Ai/ApiKeyDialog';

interface AnalysisResult {
  score: number;
  scoreRationale: string;
  jobCompatibility: string[];
  improvementTips: string[];
}

interface ResumeAnalysisDialogProps {
  open: boolean;
  onClose: () => void;
}

const ResumeAnalysisDialog = ({ open, onClose }: ResumeAnalysisDialogProps) => {
  const resumeData = useResumeStore();
  const { apiKey, getGenAI } = useApiKey();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAnalysis = useCallback(async () => {
    if (!open) return;

    if (!apiKey) {
      setError('Please set your Gemini API key first using the "API Key" button in the navigation bar.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const genAI = getGenAI();
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `
        You are an expert career coach. Analyze the following resume data:
        ${JSON.stringify(resumeData)}
        
        Provide your analysis in a structured JSON object with these exact keys:
        - "score": number from 0-100
        - "scoreRationale": a brief 1-2 sentence explanation of the score
        - "jobCompatibility": array of 3-5 suitable job titles based on skills and experience
        - "improvementTips": array of 5-8 concise, actionable tips (each tip should be 1-2 sentences max)
        
        Guidelines:
        - Keep scoreRationale under 30 words
        - Each improvement tip should be specific and under 25 words
        - Focus on practical, actionable advice
        - Be critical but constructive
        
        Return ONLY the raw JSON object without any markdown formatting or explanatory text.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Clean the response text to remove any markdown formatting and extra whitespace
      let cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      
      // Try to extract JSON if there's extra text
      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedResponse = jsonMatch[0];
      }
      
      const parsedAnalysis: AnalysisResult = JSON.parse(cleanedResponse);
      
      // Validate the response structure
      if (!parsedAnalysis.score || !parsedAnalysis.scoreRationale || 
          !Array.isArray(parsedAnalysis.jobCompatibility) || 
          !Array.isArray(parsedAnalysis.improvementTips)) {
        throw new Error('Invalid response format from AI');
      }
      
      setAnalysis(parsedAnalysis);
    } catch (e: any) {
      console.error('Analysis error:', e);
      if (e.message.includes('API key is not available')) {
        setError('Please set your Gemini API key first using the "API Key" button.');
      } else if (e.message.includes('API_KEY_INVALID')) {
        setError('Invalid API key. Please check your Gemini API key.');
      } else if (e.name === 'SyntaxError') {
        setError('Failed to parse AI response. Please try again.');
      } else {
        setError(`Failed to analyze resume. Error: ${e.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [resumeData, open, apiKey, getGenAI]);

  // Trigger analysis when dialog opens and API key is available
  useEffect(() => {
    if (open && apiKey && !analysis && !isLoading && !error) {
      generateAnalysis();
    }
  }, [open, apiKey, analysis, isLoading, error, generateAnalysis]);

  useEffect(() => {
    if (!open) {
      setAnalysis(null);
      setError(null);
      setIsLoading(false);
    }
  }, [open]);

  const getScoreColor = (score: number): 'error' | 'warning' | 'primary' => {
    if (score < 40) return 'error';
    if (score < 70) return 'warning';
    return 'primary';
  };

  const handleRetry = () => {
    if (apiKey) {
      generateAnalysis();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: 4, height: '90vh' } }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          AI Resume Analysis
        </Typography>
        <IconButton aria-label="close" onClick={onClose}>
          <MdClose />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ backgroundColor: '#f7f9fc', p: { xs: 2, md: 4 } }}>
        {isLoading && (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
          >
            <CircularProgress />
            <Typography mt={2}>Analyzing your resume, please wait...</Typography>
          </Box>
        )}

        {error && (
          <Alert 
            severity="error" 
            action={
              apiKey && (
                <IconButton
                  aria-label="retry"
                  color="inherit"
                  size="small"
                  onClick={handleRetry}
                >
                  <Typography variant="button" sx={{ textDecoration: 'underline' }}>
                    Retry
                  </Typography>
                </IconButton>
              )
            }
          >
            {error}
          </Alert>
        )}

        {!apiKey && !isLoading && (
          <Alert severity="info">
            To use AI Resume Analysis, please set your Gemini API key using the "API Key" button in the navigation bar.
          </Alert>
        )}

        {analysis && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1fr 2fr' }, gap: 4 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                p: 3,
                backgroundColor: 'white',
                borderRadius: 3,
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Resume Score
              </Typography>
              <Box sx={{ position: 'relative', display: 'inline-flex', my: 2 }}>
                <CircularProgress variant="determinate" value={100} size={120} sx={{ color: 'grey.300' }} />
                <CircularProgress
                  variant="determinate"
                  value={analysis.score}
                  size={120}
                  color={getScoreColor(analysis.score)}
                  sx={{ position: 'absolute', left: 0 }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography
                    variant="h4"
                    component="div"
                    sx={{ fontWeight: 'bold' }}
                    color={getScoreColor(analysis.score)}
                  >
                    {`${Math.round(analysis.score)}%`}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.4 }}>
                {analysis.scoreRationale}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  p: 3,
                  backgroundColor: 'white',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, color: 'primary.main' }}
                >
                  <MdWork size={24} /> Job Compatibility
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {analysis.jobCompatibility.slice(0, 6).map((job, i) => (
                    <Chip 
                      key={i} 
                      label={job} 
                      color="primary" 
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
              </Box>

              <Box
                sx={{
                  p: 3,
                  backgroundColor: 'white',
                  borderRadius: 3,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                }}
              >
                <Typography
                  variant="h6"
                  component="div"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, color: 'warning.dark' }}
                >
                  <MdLightbulb size={24} /> Improvement Tips
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {analysis.improvementTips.map((tip, i) => (
                    <ListItem key={i} sx={{ alignItems: 'flex-start', p: 0, mb: 1.2 }}>
                      <ListItemIcon sx={{ minWidth: 32, mt: '2px', color: '#0ea5e9' }}>
                        <MdCheckCircle size={16} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={tip} 
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          lineHeight: 1.4,
                          color: 'text.primary'
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ResumeAnalysisDialog;