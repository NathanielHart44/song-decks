import { Box, Button, CardMedia, Collapse, Grid, IconButton, Stack, TableCell, TableRow, Theme, Tooltip, Typography, useMediaQuery } from "@mui/material";
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
    is_small_screen: boolean;
    task: Task;
    handleTaskEdit: (task: Task) => void;
};

export default function TaskLine({ is_small_screen, task, handleTaskEdit }: TaskLineType) {

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
                    <Typography variant={'body2'}>
                        {truncateText(task.title, is_small_screen ? 24 : 50)}
                    </Typography>
                </TableCell>
                <TableCell align={'center'}>
                    {task.is_private ? 'Private' : 'Public'}
                </TableCell>
                <TableCell align={'center'}>
                    <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                        <StatusIconify
                            status={
                                Object.keys(WORKBENCH_SETTINGS.complexity_map).find(
                                    key => WORKBENCH_SETTINGS.complexity_map[
                                        key as keyof typeof WORKBENCH_SETTINGS.complexity_map
                                    ] === task.complexity
                                ) + '_complexity'
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
                <TableCell align={'right'}>{formatTimestamp(task.created_at)}</TableCell>
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
                            <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                                <Grid item xs={12} sm={12} md={9}>
                                    <Typography
                                        paragraph
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 0 }}
                                    >
                                        {task.description}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={12} md={3}>
                                    <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                                        <TagDisplay
                                            allTags={task.tags}
                                            selectedTags={task.tags}
                                            updateTags={() => {}}
                                        />
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
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}