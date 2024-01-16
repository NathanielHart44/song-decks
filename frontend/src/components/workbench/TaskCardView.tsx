import { Accordion, AccordionDetails, Card, Grid, IconButton, Stack, Tooltip, Typography, useTheme } from "@mui/material";
import { Profile, Task } from "src/@types/types";
import Iconify, { StatusIconify } from "../base/Iconify";
import { useContext, useEffect, useState } from "react";
import AccordionSummaryDiv from "./AccordionSummaryDiv";
import truncateText from "src/utils/truncateText";
import { capWords } from "src/utils/capWords";
import { MetadataContext } from "src/contexts/MetadataContext";
import { useApiCall } from "src/hooks/useApiCall";
import { processTokens } from "src/utils/jwt";
import { ToggleButtonGroupDiv } from "./ProposalCardView";
import TagDisplay from "./TagDisplay";

// ----------------------------------------------------------------------

type TaskCardViewProps = {
    grid_sizing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
    };
    tasks: Task[];
    setAllTasks: (tasks: Task[]) => void;
};

export default function TaskCardView({ grid_sizing, tasks, setAllTasks }: TaskCardViewProps) {

    const theme = useTheme();
    const title_grey = theme.palette.grey[600];

    const { currentUser, isMobile } = useContext(MetadataContext);

    const { apiCall } = useApiCall();
    const [awaitingTaskResponse, setAwaitingTaskResponse] = useState<boolean>(false);

    const [viewedTasks, setViewedTasks] = useState<Task[]>([]);
    const [filter, setFilter] = useState<'finished' | 'backlog' | 'in_progress'>('in_progress');
    const filter_options = ['in_progress', 'backlog', 'finished'];
    const [sort, setSort] = useState<'popular' | 'date'>('popular');
    const sort_options = ['popular', 'date'];

    const handleSelection = (type: 'filter' | 'sort', value: string) => {
        if (type === 'filter' && filter_options.includes(value as any)) {
            setFilter(value as 'finished' | 'backlog' | 'in_progress');
        } else if (type === 'sort' && sort_options.includes(value as any)) {
            setSort(value as 'date' | 'popular');
        }
    };

    useEffect(() => {
        let tasks_copy: Task[] = JSON.parse(JSON.stringify(tasks));
        if (filter === 'finished') {
            const filtered_tasks = tasks_copy.filter((task) => {
                return task.state === 'finished';
            });
            tasks_copy = filtered_tasks;
        }
        if (filter === 'backlog') {
            const filtered_tasks = tasks_copy.filter((task) => {
                return task.state === 'assigned' || task.state === 'not_started';
            });
            tasks_copy = filtered_tasks;
        }
        if (filter === 'in_progress') {
            const filtered_tasks = tasks_copy.filter((task) => {
                return task.state === 'in_progress';
            });
            tasks_copy = filtered_tasks;
        }

        if (sort === 'date') {
            tasks_copy = [...tasks_copy].sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
        }
        if (sort === 'popular') {
            tasks_copy = [...tasks_copy].sort((a, b) => {
                return b.favorited_by.length - a.favorited_by.length;
            });
        }
        setViewedTasks(tasks_copy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, sort, tasks]);

    const handleFavorite = async (id: number) => {
        if (awaitingTaskResponse) return;
        setAwaitingTaskResponse(true);
        apiCall(`handle_favorite_task/${id}`, 'POST', null, (data) => {
            const updated_task: Task = data;
            const updated_tasks = tasks.map((task) => {
                if (task.id === updated_task.id) return updated_task;
                return task;
            });
            setAllTasks(updated_tasks);
        });
        setAwaitingTaskResponse(false);
    };

    return (
        <Stack width={'100%'} spacing={2} justifyContent={'center'} alignItems={'center'}>
            <Stack width={'100%'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                <Typography variant={'h4'}>Projects</Typography>
                <Typography paragraph color={title_grey} sx={{ textAlign: 'center', mb: 0 }}>
                    Projects that our team is working on. Favorite tasks to help us prioritize.
                </Typography>
            </Stack>
            <Grid container spacing={2} width={'95%'} justifyContent={'center'} alignItems={'center'}>
                <Grid item xs={12} sm={12} md={6}>
                    <Stack width={'100%'} justifyContent={'center'}>
                        <Typography color={title_grey}>Filter</Typography>
                        <ToggleButtonGroupDiv
                            isMobile={isMobile}
                            options={filter_options}
                            selectedValue={filter}
                            type={'filter'}
                            handleSelection={handleSelection}
                        />
                    </Stack>
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                    <Stack width={'100%'} justifyContent={'center'}>
                        <Typography color={title_grey}>Sort</Typography>
                        <ToggleButtonGroupDiv
                            isMobile={isMobile}
                            options={sort_options}
                            selectedValue={sort}
                            type={'sort'}
                            handleSelection={handleSelection}
                        />
                    </Stack>
                </Grid>
            </Grid>
            <Grid container>
                {viewedTasks.map((task) => (
                    <Grid item {...grid_sizing} key={task.id}>
                        <TaskCard
                            currentUser={currentUser}
                            awaitingResponse={awaitingTaskResponse}
                            task={task}
                            handleFavorite={handleFavorite}
                        />
                    </Grid>
                ))}
            </Grid>
        </Stack>
    );
};

// ----------------------------------------------------------------------

type CardProps = {
    currentUser: Profile | undefined;
    awaitingResponse: boolean;
    task: Task;
    handleFavorite: (id: number) => void;
}

function TaskCard({ currentUser, awaitingResponse, task, handleFavorite }: CardProps) {

    const max_text_length = 100;
    const [accordionOpen, setAccordionOpen] = useState<boolean>(false);
    const [selected, setSelected] = useState<boolean>(false);

    useEffect(() => {
        if (currentUser && task.favorited_by.includes(currentUser.id)) {
            setSelected(true);
        } else {
            setSelected(false);
        }
    }, [currentUser, task]);

    return (
        <Card sx={{ p: 2, m: 2 }}>
            <Accordion
                disableGutters={true}
                expanded={accordionOpen}
                sx={{ ...(accordionOpen && { bgcolor: 'transparent' }) }}
                TransitionProps={{ unmountOnExit: true }}
            >
                <AccordionSummaryDiv
                    accordionOpen={accordionOpen}
                    setAccordionOpen={setAccordionOpen}
                    title={ accordionOpen ? capWords(task.state) : truncateText(task.title, max_text_length) }
                    icon={
                        <StatusIconify
                            status={task.state}
                            size={24}
                        />
                    }
                />
                <AccordionDetails sx={{ pt: 3 }}>
                    {task.description}
                </AccordionDetails>
            </Accordion>
            <TagDisplay
                allTags={task.tags}
                selectedTags={task.tags}
                updateTags={() => {}}
            />
            <Stack direction={"row"} justifyContent={"flex-end"} alignItems={"center"}>
                <Typography variant={"caption"} color={"text.secondary"} sx={{ mr: 0 }}>
                    {task.favorited_by.length}
                </Typography>
                <Tooltip title={selected ? 'Unfavorite' : 'Favorite'} arrow>
                    <IconButton
                        size={"small"}
                        color={"secondary"}
                        onClick={() => { processTokens(() => { handleFavorite(task.id) }) }}
                        disabled={awaitingResponse}
                    >
                        <Iconify icon={selected ? 'mdi:star' : 'mdi:star-outline'} />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Card>
    )
}