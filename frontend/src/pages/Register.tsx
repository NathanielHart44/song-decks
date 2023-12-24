import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Link, Container, Typography, Stack } from '@mui/material';
// hooks
// routes
import { PATH_AUTH } from 'src/routes/paths';
// components
import Page from 'src/components/base/Page';
// sections
import { RegisterForm } from 'src/forms/auth/register';

// ----------------------------------------------------------------------

export default function Register() {

  return (
    <Page title="Register">
      <Stack style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h4" align="center" sx={{ my: 3 }}>
          New Account Registration
        </Typography>
        <Container maxWidth="sm">
          <RegisterForm />

          <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
            Already have an account?{' '}
            <Link variant="subtitle2" to={PATH_AUTH.login} component={RouterLink}>
              Login
            </Link>
          </Typography>
        </Container>
      </Stack>
    </Page>
  );
}
