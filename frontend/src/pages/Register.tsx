import { Link as RouterLink } from 'react-router-dom';
// @mui
import { Link, Container, Typography } from '@mui/material';
// hooks
// routes
import { PATH_AUTH } from 'src/routes/paths';
// components
import Page from 'src/components/Page';
// sections
import { RegisterForm } from 'src/forms/auth/register';

// ----------------------------------------------------------------------

export default function Register() {
  // const { signInWithGoogle } = useAuth();

  return (
    <Page title="Register">
      <Container maxWidth="sm">
        <RegisterForm />

        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }}>
          Already have an account?{' '}
          <Link variant="subtitle2" to={PATH_AUTH.login} component={RouterLink}>
            Login
          </Link>
        </Typography>
      </Container>
    </Page>
  );
}
