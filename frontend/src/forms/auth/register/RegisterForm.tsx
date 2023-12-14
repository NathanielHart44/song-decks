import { useState } from 'react';
// form
import { useForm } from 'react-hook-form';
import { useSnackbar } from 'notistack';
// @mui
import { Stack, IconButton, InputAdornment, Alert, TextField, Divider } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/base/Iconify';
import delay from 'src/utils/delay';
import { useNavigate } from 'react-router-dom';
import { PATH_PAGE } from 'src/routes/paths';
import useAuth from 'src/hooks/useAuth';
import { GoogleSignIn } from 'src/components/auth/GoogleSignIn';

// ----------------------------------------------------------------------

type FormValuesProps = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  afterSubmit?: string;
};

export default function RegisterForm() {

  const { register } = useAuth();
  const navigate = useNavigate();
  const [registerError, setRegisterError] = useState({ error: '' });
  const { enqueueSnackbar } = useSnackbar();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const defaultValues = {
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: '',
  };

  const methods = useForm<FormValuesProps>({
    defaultValues,
  });

  const {
    // reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = async (data: FormValuesProps) => {
      setRegisterError({ error: '' });
      const formData = new FormData();
      formData.append('email', data.email.toString());
      formData.append('username', data.username.toString());
      formData.append('password', data.password.toString());
      formData.append('firstName', data.firstName.toString());
      formData.append('lastName', data.lastName.toString());

      if (data.password !== data.confirmPassword) {
        setRegisterError({ error: 'Passwords do not match' });
        return;
      }

      const emailRegex = new RegExp("^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,}$", "i");
      if (!emailRegex.test(data.email)) {
        setRegisterError({ error: 'Invalid email address' });
        return;
      }

      const result: { success: boolean, message: string } = await register(formData);
      if (result.success) {
        enqueueSnackbar(result.message);
        delay(500).then(() => navigate(PATH_PAGE.home));
      } else {
        setRegisterError({ error: result.message });
      }
    };

  return (
      <Stack spacing={3}>
        <GoogleSignIn />
        <Divider flexItem />
        {registerError?.error && <Alert severity="error">{registerError.error}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            name="firstName"
            label="First name"
            variant="outlined"
            size="small"
            fullWidth
            onChange={(event) => { methods.setValue('firstName', event.target.value) }}
          />
          <TextField
            name="lastName"
            label="Last name"
            variant="outlined"
            size="small"
            fullWidth
            onChange={(event) => { methods.setValue('lastName', event.target.value) }}
          />
        </Stack>

        <TextField
          name="username"
          label="Username"
          variant="outlined"
          size="small"
          fullWidth
          onChange={(event) => { methods.setValue('username', event.target.value) }}
        />
        <TextField
          name="email"
          label="Email address"
          variant="outlined"
          size="small"
          fullWidth
          onChange={(event) => { methods.setValue('email', event.target.value) }}
          inputProps={{ pattern: "^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,}$/i" }}
        />
        <TextField
          name="password"
          label="Password"
          variant="outlined"
          size="small"
          fullWidth
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={() => setShowPassword(!showPassword)}>
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          onChange={(event) => { methods.setValue('password', event.target.value) }}
        />
        <TextField
          name="confirmPassword"
          label="Confirm password"
          variant="outlined"
          size="small"
          fullWidth
          type={showConfirmPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Iconify icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          onChange={(event) => { methods.setValue('confirmPassword', event.target.value) }}
        />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isSubmitting}
          onClick={handleSubmit(onSubmit)}
        >
          Register
        </LoadingButton>
      </Stack>
  );
}