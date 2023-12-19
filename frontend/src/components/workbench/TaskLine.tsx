import { Box, Button, CardMedia, Collapse, Grid, IconButton, Stack, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { Task } from "src/@types/types";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { StatusIconify } from "../base/Iconify";
import formatTimestamp from "src/utils/formatTimestamp";
import { WORKBENCH_SETTINGS } from "src/utils/workbenchSettings";
import { AvatarDisplay } from "../nav/AccountMenu";
import TagDisplay from "./TagDisplay";
import truncateText from "src/utils/truncateText";

// ----------------------------------------------------------------------

type TaskLineType = {
    line_text_color: string;
    is_small_screen: boolean;
    task: Task;
    handleTaskEdit: (task: Task) => void;
};

export default function TaskLine({ line_text_color, is_small_screen, task, handleTaskEdit }: TaskLineType) {

    const [open, setOpen] = useState<boolean>(false);
    const has_image = false;

    return (
        <>
            <TableRow
                key={'task' + task.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell component="th" scope="row" align={'left'}>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => { setOpen(!open) }}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell align={'center'}>
                    <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                        <StatusIconify
                            status={task.state}
                            size={24}
                        />
                    </Stack>
                </TableCell>
                <TableCell align={'center'}>
                    <Typography variant={'body2'} color={line_text_color}>
                        {truncateText(task.title, is_small_screen ? 24 : 50)}
                    </Typography>
                </TableCell>
                <TableCell align={'center'}>
                    <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                        <StatusIconify
                            status={task.is_private ? 'private' : 'public'}
                            size={24}
                        />
                    </Stack>
                </TableCell>
                <TableCell align={'center'}>
                    <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                        <StatusIconify
                            status={
                                Object.keys(WORKBENCH_SETTINGS.complex_priority_map).find(
                                    key => WORKBENCH_SETTINGS.complex_priority_map[
                                        key as keyof typeof WORKBENCH_SETTINGS.complex_priority_map
                                    ] === task.complexity
                                ) + '_complexity'
                            }
                            size={24}
                        />
                    </Stack>
                </TableCell>
                <TableCell align={'center'}>
                    <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                        <StatusIconify
                            status={
                                Object.keys(WORKBENCH_SETTINGS.complex_priority_map).find(
                                    key => WORKBENCH_SETTINGS.complex_priority_map[
                                        key as keyof typeof WORKBENCH_SETTINGS.complex_priority_map
                                    ] === task.priority
                                ) + '_priority'
                            }
                            size={24}
                        />
                    </Stack>
                </TableCell>
                <TableCell align={'center'}>
                    <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                        {task.assigned_admins.length > 0 && (
                            <>
                                {task.assigned_admins.map((admin, index) => (
                                    <Tooltip key={'task_tooltip_' + index} title={admin.user.username} placement={"bottom"} arrow>
                                        <Box><AvatarDisplay is_main={false} currentUser={admin.user} /></Box>
                                    </Tooltip>
                                ))}
                            </>
                        )}
                    </Stack>
                </TableCell>
                <TableCell align={'right'}>
                    <Typography variant={'body2'} color={line_text_color}>
                        {formatTimestamp(task.created_at)}
                    </Typography>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={WORKBENCH_SETTINGS.column_info.tasks.length}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, width: '100%' }}>
                            { has_image &&
                                <CardMedia
                                    component="img"
                                    height={175}
                                    image={'https://i.natgeofe.com/n/ac577e56-2e49-4723-a422-82b1fca79c3f/green-iguana.jpg?w=1272&h=848'}
                                    alt="green iguana"
                                />
                            }
                            <Stack spacing={1} justifyContent={'center'} alignItems={'center'}>
                                <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                                    <Grid item xs={12} sm={12} md={3}>
                                        <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'flex-start'}>
                                            <TagDisplay
                                                allTags={task.tags}
                                                selectedTags={task.tags}
                                                updateTags={() => {}}
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={6}>
                                        <Typography
                                            paragraph
                                            variant="body2"
                                            color={line_text_color}
                                            sx={{ textAlign: 'center', mb: 0 }}
                                        >
                                            {task.description}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={3}>
                                        <Stack justifyContent={'center'} alignItems={'flex-start'}>
                                            <Typography
                                                variant="body2"
                                                color={line_text_color}
                                            >
                                                {task.notes.length > 0 && 'Notes:'}
                                            </Typography>
                                            <Typography
                                                paragraph
                                                variant="body2"
                                                color={line_text_color}
                                                sx={{ mb: 0 }}
                                            >
                                                {task.notes}
                                            </Typography>
                                        </Stack>
                                    </Grid>
                                </Grid>
                                <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                                    <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                                        <Button
                                            variant={"contained"}
                                            onClick={() => { handleTaskEdit(task) }}
                                            fullWidth
                                        >
                                            Edit Task
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Stack>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}