import { useEffect } from 'react';

import { StyledButton } from '../atoms';
import { MenuItem } from '@mui/material';

export const PrintResume: React.FC<{ isMenuButton?: boolean }> = ({ isMenuButton }) => {
  useEffect(() => {
    globalThis?.addEventListener('beforeprint', () => {
      globalThis.document.title = `Resume_Builder_${Date.now()}`;
    });

    globalThis?.addEventListener('afterprint', () => {
      globalThis.document.title = 'Single Page Resume Builder';
    });
  }, []);

  if (isMenuButton) {
    return <MenuItem onClick={globalThis?.print}  sx={{ color: 'black'}}>Download as PDF</MenuItem>;
  }

  return (
    <StyledButton onClick={globalThis?.print} variant="contained" sx={{ color: 'black', background: 'white' }}>
      Download as PDF
    </StyledButton>
  );
};
