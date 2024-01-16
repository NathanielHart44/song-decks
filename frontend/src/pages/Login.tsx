import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Link, Container, Stack, Typography } from '@mui/material';
// routes
import { PATH_AUTH } from 'src/routes/paths';
// components
import Page from "src/components/base/Page";
// sections
import { LoginForm } from 'src/forms/auth/login';

// ----------------------------------------------------------------------

export default function Login() {
  return (
    <Page title="Login">
      <Stack style={{ height: '100%', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h4" align="center" sx={{ my: 3 }}>
          Login
        </Typography>

        <Container maxWidth="sm">

          <LoginForm />

          <Typography variant="body2" align="center" sx={{ mt: 3 }}>
            Don’t have an account?{' '}
            <Link variant="subtitle2" component={RouterLink} to={PATH_AUTH.register}>
              Get started
            </Link>
          </Typography>
        </Container>
      </Stack>
    </Page>
  );
}