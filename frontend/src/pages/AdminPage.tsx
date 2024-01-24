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
import { useEffect, useState } from 'react';
import Page from 'src/components/base/Page';
import { ChartDataCohortGroup } from 'src/@types/types';
import { MAIN_API } from 'src/config';
// sections
import AdminTask from '../components/admin/AdminTask';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { AccordianGraphContents } from '../components/admin/AccordianGraphContents';

// ----------------------------------------------------------------------

export const default_chart_data_groups: ChartDataCohortGroup[] = [
    {
        data: [],
        dataLabel: 'cumulative',
    },
    {
        data: [],
        dataLabel: 'day_by_day',
    }
];

// ----------------------------------------------------------------------

export default function AdminPage() {

    return (
    <Page title="Admin">
        <Container maxWidth={false}>
            <Stack spacing={2} alignItems={'center'} sx={{ width: '100%' }}>
                <AccordianDiv title={"Core Actions"} tasks={coreAdminTasks} is_graph={false} />
                <AccordianDiv title={"Main Info"} tasks={adminInfo} is_graph={false} />
                {graphs.map((graph) => (
                    <AccordianDiv
                        key={graph.title}
                        title={graph.title}
                        tasks={[graph]}
                        is_graph={true}
                    />
                ))}
            </Stack>
        </Container>
    </Page>
    );
}

// ----------------------------------------------------------------------

type AccordianType = {
    title: string;
    tasks: Array<{ title: string, url: string, placeholder: string }>;
    is_graph: boolean;
};

function AccordianDiv({ title, tasks, is_graph }: AccordianType) {

    const theme = useTheme();

    const [open, setOpen] = useState<boolean>(false);
    const [chartDataGroups, setChartDataGroups] = useState<ChartDataCohortGroup[]>(default_chart_data_groups);

    const accordian_transition: string = '0.5s background-color;';
    const text_transition: string = '0.5s color;';
    const open_background_color = alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity);

    useEffect(() => {
        if (!setChartDataGroups) return;
        setChartDataGroups(default_chart_data_groups);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

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
                { is_graph ?
                    <AccordianGraphContents
                        base_url={tasks[0].url}
                        chartDataGroups={chartDataGroups}
                        setChartDataGroups={setChartDataGroups}
                    /> :
                    <AccordionDetails sx={{ pt: 3 }}>
                        <Stack spacing={3}>
                            { tasks.map((task) => (
                                <AdminTask key={task.title} title={task.title} url={task.url} placeholder={task.placeholder} open={open}/>
                            ))}
                        </Stack>
                    </AccordionDetails>
                }
            </Accordion>
        </Stack>
    )
}

// ----------------------------------------------------------------------

const main_url = `${MAIN_API.base_url}`;
const coreAdminTasks = [
    { title: 'Toggle Tester Status', url: `${main_url}toggle_tester/`, placeholder: 'Username' },
    { title: 'Toggle Moderator Status', url: `${main_url}toggle_moderator/`, placeholder: 'Username' },
    { title: 'Toggle Admin Status', url: `${main_url}toggle_admin/`, placeholder: 'Username' },
    { title: 'Reset Password', url: `${main_url}reset_password/`, placeholder: 'Username' },
];

const adminInfo = [
    { title: 'See All Users', url: `${main_url}get_all_users/`, placeholder: '' },
    { title: 'See All Testers', url: `${main_url}get_all_testers/`, placeholder: '' },
    { title: 'See All Moderators', url: `${main_url}get_all_moderators/`, placeholder: '' },
    { title: 'See All Admins', url: `${main_url}get_all_admins/`, placeholder: '' },
    { title: 'Games Played Info', url: `${main_url}games_played_info/`, placeholder: '' },
    { title: 'See Top Users', url: `${main_url}get_top_users/`, placeholder: 'Count' },
];

const graphs = [
    { title: 'User Graphs', url: 'get_player_daily_stats', placeholder: '' },
    { title: 'List Graphs', url: 'get_list_daily_stats', placeholder: '' },
];