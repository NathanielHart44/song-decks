import { Box, Button, useTheme } from '@mui/material';
import useAuth from '../../hooks/useAuth';

// ----------------------------------------------------------------------

export function GoogleSignIn() {

    const { google_login } = useAuth();
    const theme = useTheme();

    return (
        <Button
            disabled={false}
            onClick={google_login}
            variant={"contained"}
            sx={{
                backgroundColor: theme.palette.grey.default_canvas,
                '&:hover': {
                    backgroundColor: theme.palette.grey[900],
                }
            }}
            endIcon={
                <Box sx={{ maxHeight: '100%', maxWidth: '60px' }}>
                    <img src="/icons/ic_google.svg" alt="ASOIAF Logo" loading="lazy" />
                </Box>
            }
        >
            Continue with Google
        </Button>
    );
}