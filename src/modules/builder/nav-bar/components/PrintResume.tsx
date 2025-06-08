import { useEffect } from 'react';

import { StyledButton } from '../atoms';
import { Button, MenuItem } from '@mui/material';
import { MdDownload } from 'react-icons/md';

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
   <Button
      onClick={() => globalThis.print()}
      variant="outlined"
      startIcon={<MdDownload />}
      sx={{ color: 'black', background: 'white' }}
    >
      Download
    </Button>
  );
};
