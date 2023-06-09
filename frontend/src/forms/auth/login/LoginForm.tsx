import { useState } from 'react';
import { Stack, Alert, IconButton, InputAdornment, TextField } from '@mui/material';
import useAuth from '../../../hooks/useAuth';
import Iconify from '../../../components/Iconify';
import LoadingButton from '@mui/lab/LoadingButton';
import { useForm } from 'react-hook-form';

// ----------------------------------------------------------------------

type FormValuesProps = {
  username: string;
  password: string;
  remember: boolean;
  afterSubmit?: string;
};

export default function LoginForm() {
  const { login } = useAuth();
  const [loginError, setLoginError] = useState({ error: null });

  const [showPassword, setShowPassword] = useState(false);

  const defaultValues = {
    username: '',
    password: '',
    remember: true,
  };

  const methods = useForm<FormValuesProps>({
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
    setLoginError({ error: null });
    try {
      await login(data.username, data.password);
    } catch (error) {
      var message = null;
      if(JSON.parse(error).password) {
        message = JSON.parse(error).password;
      } else if(JSON.parse(error).username) {
        message = JSON.parse(error).username;
      } else {
        message = JSON.parse(error).detail;
      }
      setLoginError({ error: message });
    }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {loginError?.error && <Alert severity="error">{loginError.error}</Alert>}

        <TextField
          name="username"
          label="Username"
          variant="outlined"
          onChange={(event) => { methods.setValue('username', event.target.value) }}
        />

        <TextField
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          variant="outlined"
          autoComplete="current-password"
          onChange={(event) => { methods.setValue('password', event.target.value) }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
        >
          Login
        </LoadingButton>
      </Stack>

      {/* <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Checkbox name="remember" defaultChecked />
        <label>Remember me</label>

        <Link component={RouterLink} variant="subtitle2" to={PATH_AUTH.resetPassRequest}>
          Forgot password?
        </Link>
      </Stack> */}
    </form>
  );
}
