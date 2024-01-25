import { useContext, useState } from 'react';
// @mui
import { Stack, IconButton, InputAdornment, Alert, TextField, Button, Switch, Typography } from '@mui/material';
// components
import Iconify from '../../../components/base/Iconify';
import { useApiCall } from 'src/hooks/useApiCall';
import { processTokens } from 'src/utils/jwt';
import { MetadataContext } from 'src/contexts/MetadataContext';
import LoadingBackdrop from 'src/components/base/LoadingBackdrop';
import { useSnackbar } from 'notistack';

// ----------------------------------------------------------------------

export default function ChangeProfileForm() {

  const { currentUser, getCurrentUser } = useContext(MetadataContext);
  const { apiCall } = useApiCall();
  const { enqueueSnackbar } = useSnackbar();

  const [registerError, setRegisterError] = useState({ error: '' });
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  
  const [changePassword, setChangePassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const defaultValues = {
    email: currentUser?.user.email || '',
    username: currentUser?.user.username || '',
    firstName: currentUser?.user.first_name || '',
    lastName: currentUser?.user.last_name || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const [allInfo, setAllInfo] = useState(defaultValues);

  const onSubmit = async () => {
    if (awaitingResponse) return;
    function handleMain() {
      setRegisterError({ error: '' });
      const formData = new FormData();
      formData.append('email', allInfo.email.toString());
      formData.append('username', allInfo.username.toString());
      formData.append('first_name', allInfo.firstName.toString());
      formData.append('last_name', allInfo.lastName.toString());

      if (allInfo.newPassword && !allInfo.oldPassword) {
        setRegisterError({ error: 'Please enter your old password' });
        return;
      }

      if (allInfo.oldPassword && !allInfo.newPassword) {
        setRegisterError({ error: 'Please enter a new password' });
        return;
      }

      if (allInfo.newPassword !== allInfo.confirmPassword) {
        setRegisterError({ error: 'New passwords do not match' });
        return;
      }

      if (allInfo.oldPassword) formData.append('old_password', allInfo.oldPassword.toString());
      if (allInfo.newPassword) formData.append('new_password', allInfo.newPassword.toString());
      if (allInfo.confirmPassword) formData.append('confirm_password', allInfo.confirmPassword.toString());

      const emailRegex = new RegExp("^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,}$", "i");
      if (!emailRegex.test(allInfo.email)) {
        setRegisterError({ error: 'Invalid email address' });
        return;
      }

      setAwaitingResponse(true);
      apiCall(`update_user/${currentUser?.user.id}`, 'POST', formData, (data) => {
        enqueueSnackbar('Profile successfully updated');
        processTokens(getCurrentUser);
        setAllInfo({ ...allInfo, oldPassword: '', newPassword: '', confirmPassword: '' });
        }, (error) => {
        setRegisterError({ error: error.response.data.detail });
      });
      setAwaitingResponse(false);
    }
    processTokens(handleMain);
  };

  const toggleTester = async () => {
    setAwaitingResponse(true);
    const url = 'request_tester';
    apiCall(url, 'GET', null, (data) => {
        enqueueSnackbar(data.detail);
        window.location.reload();
    });
    setAwaitingResponse(false);
};

  return (
      <Stack spacing={3}>
        {registerError?.error && <Alert severity="error">{registerError.error}</Alert>}
        { awaitingResponse && <LoadingBackdrop /> }

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            name="firstName"
            label="First name"
            variant="outlined"
            size="small"
            fullWidth
            value={allInfo.firstName}
            onChange={(event) => { setAllInfo({ ...allInfo, firstName: event.target.value }) }}
          />
          <TextField
            name="lastName"
            label="Last name"
            variant="outlined"
            size="small"
            fullWidth
            value={allInfo.lastName}
            onChange={(event) => { setAllInfo({ ...allInfo, lastName: event.target.value }) }}
          />
        </Stack>

        <TextField
          name="username"
          label="Username"
          variant="outlined"
          size="small"
          fullWidth
          value={allInfo.username}
          onChange={(event) => { setAllInfo({ ...allInfo, username: event.target.value }) }}
        />
        <TextField
          name="email"
          label="Email address"
          variant="outlined"
          size="small"
          fullWidth
          inputProps={{ pattern: "^[A-Z0-9._%+-]+@[A-Z0-9.-]+.[A-Z]{2,}$/i" }}
          value={allInfo.email}
          onChange={(event) => { setAllInfo({ ...allInfo, email: event.target.value }) }}
        />
        <Stack direction={'row'} alignItems={'center'} justifyContent={'space-between'}>
          <Typography color={'text.secondary'}>Change Password</Typography>
          <Switch
            checked={changePassword}
            onChange={() => { setChangePassword(!changePassword) }}
            inputProps={{ 'aria-label': 'controlled' }}
          />
        </Stack>
        {changePassword &&
          <>
            <TextField
              name="oldPassword"
              label="Old Password"
              variant="outlined"
              size="small"
              autoComplete="off"
              fullWidth
              type={showOldPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setShowOldPassword(!showOldPassword)}>
                      <Iconify icon={showOldPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              value={allInfo.oldPassword}
              onChange={(event) => { setAllInfo({ ...allInfo, oldPassword: event.target.value }) }}
            />
            <TextField
              name="newPassword"
              label="New password"
              variant="outlined"
              size="small"
              autoComplete="off"
              fullWidth
              type={showNewPassword ? 'text' : 'password'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton edge="end" onClick={() => setShowNewPassword(!showNewPassword)}>
                      <Iconify icon={showNewPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              value={allInfo.newPassword}
              onChange={(event) => { setAllInfo({ ...allInfo, newPassword: event.target.value }) }}
            />
            <TextField
              name="confirmPassword"
              label="Confirm password"
              variant="outlined"
              size="small"
              autoComplete="off"
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
              value={allInfo.confirmPassword}
              onChange={(event) => { setAllInfo({ ...allInfo, confirmPassword: event.target.value }) }}
            />
          </>
        }

        <Button
          variant="contained"
          color="primary"
          onClick={onSubmit}
          disabled={awaitingResponse}
        >
          Save Changes
        </Button>
        {currentUser?.tester &&
          <Button
            variant="contained"
            color="secondary"
            onClick={() => { processTokens(toggleTester) }}
            disabled={awaitingResponse}
          >
            Leave Tester Program
          </Button>
        }
      </Stack>
  );
}