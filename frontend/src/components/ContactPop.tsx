import axios from 'axios';
import { MAIN_API } from 'src/config';
import { useTheme } from '@mui/material/styles';
// @mui
import {
    Button,
    Dialog,
    DialogContent,
    TextField,
    Stack,
    Typography,
    Card,
    CircularProgress,
    Checkbox,
} from '@mui/material';
import { useState } from 'react';
import { processTokens } from 'src/utils/jwt';
import { useSnackbar } from 'notistack';
import delay from 'src/utils/delay';

// ----------------------------------------------------------------------

type Props = {
    popOpen: boolean;
    setPopOpen: (popOpen: boolean) => void;
};

export default function ContactPop({ popOpen, setPopOpen }: Props) {

    const { enqueueSnackbar } = useSnackbar();

    const [feedback, setFeedback] = useState<string>('');
    const [shouldReply, setShouldReply] = useState<boolean>(false);
    const [sendDisabled, setSendDisabled] = useState<boolean>(false);

    const handleFeedbackChange = (event: any) => { setFeedback(event.target.value) };

    const theme = useTheme();

    const sendEmail = async () => {
        setSendDisabled(true);
        const postForm = async () => {
            let token = localStorage.getItem('accessToken') ?? '';
            const formData = new FormData();
            formData.append('feedback', feedback ? feedback.toString() : '');
            formData.append('reply', shouldReply ? shouldReply.toString() : '');
    
            var url;
            url = `${MAIN_API.base_url}submit_feedback/`;
            await axios({
                method: 'post',
                url: url,
                data: formData,
            headers: { Authorization: `JWT ${token}` }
            }).then(async (res) => {
                setPopOpen(false);
                setFeedback('');
                delay(500).then(() => { setSendDisabled(false) });
                if (res.data && res.data.success) {
                    enqueueSnackbar(res.data.response);
                    await new Promise((resolve) => setTimeout(resolve, 750));
                } else {
                    enqueueSnackbar(res.data.error, { variant: "error" });
                }
            })
          };
    
        processTokens(postForm);
      }

    return (
        <Dialog open={popOpen} fullWidth={true} onClose={() => { setPopOpen(false) }}>
            <DialogContent>
                <Stack spacing={3}>
                    <Card sx={{ p: 2, bgcolor: theme.palette.grey[900], width: '100%' }}>
                        <Stack spacing={3}>
                            <TextField
                                variant="outlined"
                                fullWidth
                                multiline={true}
                                minRows={5}
                                value={feedback}
                                label={"Feedback & Bugs"}
                                onChange={handleFeedbackChange}
                                disabled={sendDisabled}
                            />
                            <Stack direction={'row'} justifyContent={'space-between'}>
                                <Typography>Would you like a response?</Typography>
                                <Checkbox
                                    checked={shouldReply}
                                    onChange={(event) => { setShouldReply(event.target.checked) }}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />
                            </Stack>
                            { sendDisabled ?
                                <Stack alignItems={'center'}>
                                    <CircularProgress />
                                </Stack> :
                                <Button onClick={sendEmail} variant='contained' disabled={sendDisabled || (feedback.length < 1)}>
                                    Send
                                </Button>
                            }
                        </Stack>
                    </Card>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}