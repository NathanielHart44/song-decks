// @mui
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    alpha,
    Container,
    Stack,
    Typography,
    useTheme
} from '@mui/material';
import { useState } from 'react';
import Page from 'src/components/Page';
// sections
import AdminTask from '../components/AdminTask';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { MAIN_API } from 'src/config';

// ----------------------------------------------------------------------

export default function AdminPage() {

    return (
    <Page title="Admin">
        <Container maxWidth={false}>
        <Stack spacing={2} alignItems={'center'} sx={{ width: '100%' }}>
            <AccordianDiv title="Core" tasks={coreAdminTasks}/>
        </Stack>
        </Container>
    </Page>
    );
}

// ----------------------------------------------------------------------

type AccordianType = {
    title: string;
    tasks: Array<{ title: string, url: string, placeholder: string }>;
};

function AccordianDiv({ title, tasks }: AccordianType) {

    const theme = useTheme();

    const [open, setOpen] = useState<boolean>(true);

    const accordian_transition: string = '0.5s background-color;';
    const text_transition: string = '0.5s color;';
    const open_background_color = alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity);

    return (
    <Stack sx={{ width: '100%' }}>
        <Accordion disableGutters={true} expanded={open} sx={{ ...(open && { bgcolor: 'transparent' }) }} TransitionProps={{ unmountOnExit: true }}>
        <AccordionSummary
            onClick={() => { setOpen(!open) }}
            expandIcon={<ExpandMoreIcon />}
            sx={{
            borderRadius: '8px',
            transition: accordian_transition,
            color: theme.palette.text.secondary,
            ...(open && { bgcolor: open_background_color }),
            }}
        >
            <Typography sx={{ transition: text_transition, ...(open && { color: theme.palette.primary.main }) }}>{title}</Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ pt: 3 }}>
            <Stack spacing={3}>
            { tasks.map((task) => (
                <AdminTask key={task.title} title={task.title} url={task.url} placeholder={task.placeholder} open={open}/>
            ))}
            </Stack>
        </AccordionDetails>
        </Accordion>
    </Stack>
    )
}

// ----------------------------------------------------------------------

const main_url = `${MAIN_API.base_url}`;
const coreAdminTasks = [
    { title: 'See All Users', url: `${main_url}get_all_users/`, placeholder: '' },
    { title: 'Toggle Moderator Status', url: `${main_url}toggle_moderator/`, placeholder: 'Username' },
    { title: 'Games Played Info', url: `${main_url}games_played_info/`, placeholder: '' },
    { title: 'Reset Password', url: `${main_url}reset_password/`, placeholder: 'Username' },
];