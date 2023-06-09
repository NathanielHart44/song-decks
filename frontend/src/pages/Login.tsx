import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Link, Container, Typography } from '@mui/material';
// routes
import { PATH_AUTH } from 'src/routes/paths';
// components
import Page from "src/components/Page";
// sections
import { LoginForm } from 'src/forms/auth/login';

// ----------------------------------------------------------------------

export default function Login() {
  // const { signInWithGoogle } = useAuth();

  return (
    <Page title="Login">
      <Container maxWidth="sm">

        <LoginForm />

        <Typography variant="body2" align="center" sx={{ mt: 3 }}>
          Don’t have an account?{' '}
          <Link variant="subtitle2" component={RouterLink} to={PATH_AUTH.register}>
            Get started
          </Link>
        </Typography>
      </Container>
    </Page>
  );
}