import { Helmet } from 'react-helmet-async';
import { forwardRef, ReactNode } from 'react';
// @mui
import { Box, BoxProps, keyframes } from '@mui/material';

// ----------------------------------------------------------------------

interface Props extends BoxProps {
  children: ReactNode;
  meta?: ReactNode;
  title: string;
}
const Page = forwardRef<HTMLDivElement, Props>(({ children, title = '', meta, ...other }, ref) => (
  <>
    <Helmet>
      <title>{`ASOIAF Decks | ${title}`}</title>
      {meta}
    </Helmet>

    <Box ref={ref} height={'100%'} sx={{ animation: `${getFadeIn()} 1.5s` }} {...other}>
      {children}
    </Box>
  </>
));

export default Page;

function getFadeIn () {
  return keyframes({
      '0%': {
          opacity: 0,
      },
      '100%': {
          opacity: 1,
      },
  });
};