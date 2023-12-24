import { Container, Stack, Typography } from '@mui/material';
import Page from 'src/components/base/Page';
import ChangeProfileForm from 'src/forms/auth/register/ChangeProfileForm';

// ----------------------------------------------------------------------

export default function ProfilePage() {
    return (
        <Page title="Profile Settings">
            <Stack style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h4" align="center" sx={{ my: 3 }}>
                    Profile Settings
                </Typography>
                <Container maxWidth="sm">
                    <ChangeProfileForm />
                </Container>
            </Stack>
        </Page>
    )
}