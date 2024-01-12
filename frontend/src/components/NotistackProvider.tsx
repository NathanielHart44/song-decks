import { ReactNode, useRef } from 'react';
import { IconifyIcon } from '@iconify/react';
import { SnackbarProvider, SnackbarKey, MaterialDesignContent } from 'notistack';
// @mui
import { alpha, useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
// theme
import { ColorSchema } from '../theme/palette';
//
import Iconify from './base/Iconify';

// ----------------------------------------------------------------------

type Props = {
  children: ReactNode;
};

export default function NotistackProvider({ children }: Props) {
  const notistackRef = useRef<any>(null);
  const theme = useTheme();

  const onClose = (key: SnackbarKey) => () => {
    notistackRef.current.closeSnackbar(key);
  };

  const StyledDefaultSnackbar = styled(MaterialDesignContent)(() => ({
    '&.notistack-MuiContent-default': {
      backgroundColor: theme.palette.grey[700],
    }
  }));

  return (
    <SnackbarProvider
      ref={notistackRef}
      dense
      maxSnack={4}
      autoHideDuration={3000}
      variant="default" // Set default variant
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      iconVariant={{
        info: <SnackbarIcon icon={'eva:checkmark-circle-2-fill'} color="info" />,
        success: <SnackbarIcon icon={'eva:checkmark-circle-2-fill'} color="success" />,
        warning: <SnackbarIcon icon={'eva:alert-triangle-fill'} color="warning" />,
        error: <SnackbarIcon icon={'eva:alert-circle-fill'} color="error" />,
      }}
      // With close as default
      action={(key) => (
        <Iconify icon={'eva:close-fill'} onClick={onClose(key)} sx={{ p: 0.5 }} width={30} height={30}/>
      )}
      Components={{
        default: StyledDefaultSnackbar,
      }}
    >
      {children}
    </SnackbarProvider>
  );
}

// ----------------------------------------------------------------------

type SnackbarIconProps = {
  icon: IconifyIcon | string;
  color: ColorSchema;
};

function SnackbarIcon({ icon, color }: SnackbarIconProps) {
  return (
    <Box
      component="span"
      sx={{
        mr: 1.5,
        width: 20,
        height: 20,
        display: 'flex',
        borderRadius: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        color: `white`,
        bgcolor: (theme) => alpha(theme.palette[color].main, 0.16),
      }}
    >
      <Iconify icon={icon} width={24} height={24} />
    </Box>
  );
}
