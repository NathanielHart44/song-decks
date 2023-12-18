import { Box, Button, CardMedia, Collapse, Grid, IconButton, Stack, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { useState } from "react";
import { Task } from "src/@types/types";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { StatusIconify } from "../base/Iconify";
import formatTimestamp from "src/utils/formatTimestamp";
import { WORKBENCH_SETTINGS } from "src/utils/workbench_settings";
import { AvatarDisplay } from "../nav/AccountMenu";

// ----------------------------------------------------------------------

type TaskLineType = {
    task: Task;
    handleTaskEdit: (task: Task) => void;
};

export default function TaskLine({ task, handleTaskEdit }: TaskLineType) {

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
                    {task.title}
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
                        { task.assigned_admins.length === 0 && <></>}
                        {task.assigned_admins.length >= 1 && (
                            <>
                                {task.assigned_admins.map((admin, index) => (
                                    <Tooltip title={admin.user.username} placement={"bottom"} arrow>
                                        <Box><AvatarDisplay is_main={false} currentUser={admin.user} /></Box>
                                    </Tooltip>
                                ))}
                            </>
                        )}
                    </Stack>
                </TableCell>
                <TableCell align={'center'}>
                    {task.tags.length}
                </TableCell>
                <TableCell align={'right'}>{formatTimestamp(task.created_at)}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
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
                            <Typography
                                paragraph
                                variant="body2"
                                color="text.secondary"
                            >
                                {task.description}
                            </Typography>
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