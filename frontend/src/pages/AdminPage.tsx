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
import Page from 'src/components/base/Page';
import { ChartDataCohort } from 'src/@types/types';
import { MAIN_API } from 'src/config';
// sections
import AdminTask from '../components/admin/AdminTask';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AccordianGraphContents } from '../components/admin/AccordianGraphContents';

// ----------------------------------------------------------------------

export default function AdminPage() {

    const [chartDataGroups, setChartDataGroups] = useState<ChartDataCohort[][]>([]);

    return (
    <Page title="Admin">
        <Container maxWidth={false}>
            <Stack spacing={2} alignItems={'center'} sx={{ width: '100%' }}>
                <AccordianDiv title={"Core"} tasks={coreAdminTasks}/>
                <AccordianDiv
                    title={"Graphs"}
                    chartDataGroups={chartDataGroups}
                    setChartDataGroups={setChartDataGroups}
                />
            </Stack>
        </Container>
    </Page>
    );
}

// ----------------------------------------------------------------------

type AccordianType = {
    title: string;
    tasks?: Array<{ title: string, url: string, placeholder: string }>;
    chartDataGroups?: ChartDataCohort[][];
    setChartDataGroups?: React.Dispatch<React.SetStateAction<ChartDataCohort[][]>>;
};

function AccordianDiv({ title, tasks, chartDataGroups, setChartDataGroups }: AccordianType) {

    const theme = useTheme();

    const [open, setOpen] = useState<boolean>(false);

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
                { (tasks && tasks.length > 0) &&
                    <AccordionDetails sx={{ pt: 3 }}>
                        <Stack spacing={3}>
                            { tasks.map((task) => (
                                <AdminTask key={task.title} title={task.title} url={task.url} placeholder={task.placeholder} open={open}/>
                            ))}
                        </Stack>
                    </AccordionDetails>
                }
                { (!tasks && chartDataGroups && setChartDataGroups) &&
                    <AccordianGraphContents
                        chartDataGroups={chartDataGroups}
                        setChartDataGroups={setChartDataGroups}
                    />
                }
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