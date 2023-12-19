import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogContent,
    Grid,
    Stack,
    Switch,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme
} from "@mui/material";
import { Profile, Proposal, Task, Tag } from "src/@types/types";
import { StatusIconify } from "../base/Iconify";
import { processTokens } from "src/utils/jwt";
import { WORKBENCH_SETTINGS } from "src/utils/workbenchSettings";
import TagDisplay from "./TagDisplay";

// ----------------------------------------------------------------------

type TaskManagementDialogType = {
    type: 'task' | 'proposal' | 'tag';
    is_new: boolean;
    awaitingResponse: boolean;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    newItem: any | undefined;
    setNewItem: React.Dispatch<React.SetStateAction<any | undefined>>;
    handleItem: (arg0: any, arg1: any) => void;
    allModerators?: Profile[];
    allTags?: Tag[];
};

export default function WorkbenchMgmtDialog({ type, is_new, open, setOpen, newItem, setNewItem, awaitingResponse, handleItem, allModerators, allTags }: TaskManagementDialogType) {
    if (newItem === undefined) { return null };
    return (
        <Dialog
            open={open && newItem !== undefined && !awaitingResponse}
            fullWidth={true}
            onClose={() => { if (is_new === false) { setOpen(false) } }}
        >
            { type === 'proposal' &&
                <ProposalContent
                    newProposal={newItem as Proposal}
                    setNewProposal={setNewItem as React.Dispatch<React.SetStateAction<Proposal | undefined>>}
                    setOpen={setOpen}
                    is_new={is_new}
                    handleItem={handleItem}
                    allTags={allTags}
                />
            }
            { type === 'task' &&
                <TaskContent
                    newTask={newItem as Task}
                    setNewTask={setNewItem as React.Dispatch<React.SetStateAction<Task | undefined>>}
                    setOpen={setOpen}
                    is_new={is_new}
                    handleItem={handleItem}
                    allModerators={allModerators}
                    allTags={allTags}
                />
            }
            { type === 'tag' &&
                <TagContent
                    newTag={newItem as Tag}
                    setNewTag={setNewItem as React.Dispatch<React.SetStateAction<Tag | undefined>>}
                    setOpen={setOpen}
                    is_new={is_new}
                    handleItem={handleItem}
                />
            }

        </Dialog>
    )
}

// ----------------------------------------------------------------------

type TaskContentProps = {
    newTask: Task;
    setNewTask: React.Dispatch<React.SetStateAction<Task | undefined>>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    is_new: boolean;
    handleItem: (arg0: any, arg1: any) => void;
    allModerators?: Profile[];
    allTags?: Tag[];
};

function TaskContent({ newTask, setNewTask, setOpen, is_new, handleItem, allModerators, allTags }: TaskContentProps) {

    const theme = useTheme();
    const title_grey = theme.palette.grey[600];
    const outline_grey = theme.palette.grey[500_12];

    function cancelTask() {
        if (is_new) {
            setNewTask(undefined);
            setOpen(false);
        } else {
            setOpen(false);
        }
    }

    return (
        <DialogContent sx={{ p: 2 }}>
            <Stack spacing={2} width={'100%'}>
                <TextField
                    label={"Task Title"}
                    variant={"outlined"}
                    value={newTask?.title}
                    onChange={(event) => { newTask && setNewTask({ ...newTask, title: event.target.value }); } }
                    fullWidth
                />
                <TextField
                    label={"Task Description"}
                    variant={"outlined"}
                    value={newTask?.description}
                    onChange={(event) => { newTask && setNewTask({ ...newTask, description: event.target.value }); } }
                    fullWidth
                    multiline
                    minRows={5}
                />
                <TextField
                    label={"Task Notes"}
                    variant={"outlined"}
                    value={newTask?.notes}
                    onChange={(event) => { newTask && setNewTask({ ...newTask, notes: event.target.value }); } }
                    fullWidth
                    multiline
                    minRows={2}
                />
                <Stack>
                    <Typography color={title_grey} variant={'subtitle2'}>Status</Typography>
                    <ToggleButtonGroup
                        color={'primary'}
                        value={newTask?.state || 'not_started'}
                        exclusive
                        onChange={(event, value) => { newTask && setNewTask({ ...newTask, state: value }); } }
                        fullWidth
                    >
                        {['not_started', 'assigned', 'in_progress', 'finished'].map((status) => {
                            return (
                                <ToggleButton key={'state_select_' + status} value={status}>
                                    <StatusIconify
                                        status={status}
                                        size={24}
                                    />
                                </ToggleButton>
                            )
                        })}
                    </ToggleButtonGroup>
                </Stack>
                <Stack>
                    <Typography color={title_grey} variant={'subtitle2'}>Complexity</Typography>
                    <ToggleButtonGroup
                        color={'primary'}
                        value={newTask?.complexity || 'low'}
                        exclusive
                        onChange={(event, value) => { newTask && setNewTask({ ...newTask, complexity: value }); } }
                        fullWidth
                    >
                        {Object.keys(WORKBENCH_SETTINGS.complex_priority_map).map((complexity) => {
                            return (
                                <ToggleButton
                                    key={'complexity_select_' + complexity}
                                    value={WORKBENCH_SETTINGS.complex_priority_map[complexity as keyof typeof WORKBENCH_SETTINGS.complex_priority_map]}
                                >
                                    <StatusIconify
                                        status={complexity + '_complexity'}
                                        size={24}
                                    />
                                </ToggleButton>
                            )
                        })}
                    </ToggleButtonGroup>
                </Stack>
                <Stack>
                    <Typography color={title_grey} variant={'subtitle2'}>Priority</Typography>
                    <ToggleButtonGroup
                        color={'primary'}
                        value={newTask?.priority || 'low'}
                        exclusive
                        onChange={(event, value) => { newTask && setNewTask({ ...newTask, priority: value }); } }
                        fullWidth
                    >
                        {Object.keys(WORKBENCH_SETTINGS.complex_priority_map).map((priority) => {
                            return (
                                <ToggleButton
                                    key={'priorityy_select_' + priority}
                                    value={WORKBENCH_SETTINGS.complex_priority_map[priority as keyof typeof WORKBENCH_SETTINGS.complex_priority_map]}
                                >
                                    <StatusIconify
                                        status={priority + '_priority'}
                                        size={24}
                                    />
                                </ToggleButton>
                            )
                        })}
                    </ToggleButtonGroup>
                </Stack>
                {allTags &&
                    <Stack>
                        <Typography color={title_grey} variant={'subtitle2'}>Tags</Typography>
                        <Box
                            sx={{
                                width: '100%',
                                border: 1,
                                borderColor: outline_grey,
                                borderRadius: 1,
                                p: 1,
                            }}
                        >
                            <TagDisplay
                                allTags={allTags}
                                selectedTags={newTask.tags}
                                updateTags={
                                    (tags: Tag[]) => { newTask && setNewTask({ ...newTask, tags: tags }) }
                                }
                            />
                        </Box>
                    </Stack>
                }
                <Stack>
                    <Typography color={title_grey} variant={'subtitle2'}>Assigned Moderators</Typography>
                    <Box
                        sx={{
                            width: '100%',
                            border: 1,
                            borderColor: outline_grey,
                            borderRadius: 1,
                            p: 1,
                        }}
                    >
                        <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                            { allModerators && allModerators.map((moderator) => (
                                <Grid item key={'mod_select_' + moderator.id} xs={12} sm={6} md={4} lg={3} xl={3}>
                                    <Stack direction={'row'} justifyContent={'center'} alignItems={'center'}>
                                        <Checkbox
                                            checked={newTask?.assigned_admins.map((mod) => mod.id).includes(moderator.id)}
                                            onChange={(event) => {
                                                if (event.target.checked) {
                                                    newTask && setNewTask({
                                                        ...newTask,
                                                        assigned_admins: [...newTask?.assigned_admins, moderator],
                                                    });
                                                } else {
                                                    newTask && setNewTask({
                                                        ...newTask,
                                                        assigned_admins: newTask?.assigned_admins.filter((mod) => mod.id !== moderator.id),
                                                    });
                                                }
                                            }}
                                        />
                                        <Typography>{moderator.user.username}</Typography>
                                    </Stack>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                </Stack>
                <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                    <Typography>Public</Typography>
                    <Switch
                        checked={!newTask?.is_private}
                        onChange={(event) => { newTask && setNewTask({ ...newTask, is_private: !event.target.checked }); } } />
                </Stack>

                <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                    <Button
                        variant={"contained"}
                        onClick={() => {
                            processTokens(() => { handleItem(is_new, newTask) });
                            setOpen(false);
                        }}
                        fullWidth
                    >
                        {is_new ? 'Create Task' : 'Save'}
                    </Button>
                    </Grid>
                    <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                        <Button
                            color={"secondary"}
                            variant={"contained"}
                            onClick={cancelTask}
                            fullWidth
                        >
                            Cancel
                        </Button>
                    </Grid>
                </Grid>
            </Stack>
        </DialogContent>
    );
}

// ----------------------------------------------------------------------

type ProposalContentProps = {
    newProposal: Proposal;
    setNewProposal: React.Dispatch<React.SetStateAction<Proposal | undefined>>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    is_new: boolean;
    handleItem: (arg0: any, arg1: any) => void;
    allTags?: Tag[];
};

function ProposalContent({ newProposal, setNewProposal, setOpen, is_new, handleItem, allTags }: ProposalContentProps) {

    function cancelProposal() {
        if (is_new) {
            setNewProposal(undefined);
            setOpen(false);
        } else {
            setOpen(false);
        }
    }

    return (
        <DialogContent sx={{ p: 2 }}>
            <Stack spacing={2} width={'100%'}>
                <TextField
                    label={"Proposal"}
                    variant={"outlined"}
                    value={newProposal?.text}
                    onChange={(event) => { newProposal && setNewProposal({ ...newProposal, text: event.target.value }); } }
                    fullWidth
                    multiline
                    minRows={5}
                />

                <ToggleButtonGroup
                    color={'primary'}
                    value={newProposal?.status || 'pending'}
                    exclusive
                    onChange={(event, value) => { newProposal && setNewProposal({ ...newProposal, status: value }); } }
                    fullWidth
                >
                    {['pending', 'confirmed', 'rejected', 'closed'].map((status) => {
                        return (
                            <ToggleButton key={'status_select_' + status} value={status}>
                                <StatusIconify
                                    status={status}
                                    size={24}
                                />
                            </ToggleButton>
                        )
                    })}
                </ToggleButtonGroup>

                {allTags &&
                    <TagDisplay
                        allTags={allTags}
                        selectedTags={[]}
                        updateTags={() => {}}
                    />
                }

                <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                        <Button
                            variant={"contained"}
                            onClick={() => {
                                processTokens(() => { handleItem(is_new, newProposal) });
                                setOpen(false);
                            }}
                            fullWidth
                        >
                            {is_new ? 'Create Proposal' : 'Edit Proposal'}
                        </Button>
                    </Grid>
                    <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                        <Button
                            color={"secondary"}
                            variant={"contained"}
                            onClick={cancelProposal}
                            fullWidth
                        >
                            Cancel
                        </Button>
                    </Grid>
                </Grid>

            </Stack>
        </DialogContent>
    );
}

// ----------------------------------------------------------------------

type TagContentProps = {
    newTag: Tag;
    setNewTag: React.Dispatch<React.SetStateAction<Tag | undefined>>;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    is_new: boolean;
    handleItem: (arg0: any, arg1: any) => void;
};

function TagContent({ newTag, setNewTag, setOpen, is_new, handleItem }: TagContentProps) {

    function cancelTag() {
        if (is_new) {
            setNewTag(undefined);
            setOpen(false);
        } else {
            setOpen(false);
        }
    }

    return (
        <DialogContent sx={{ p: 2 }}>
            <Stack spacing={2} width={'100%'}>
                <TextField
                    label={"Tag Name"}
                    variant={"outlined"}
                    value={newTag?.name}
                    onChange={(event) => { newTag && setNewTag({ ...newTag, name: event.target.value }); } }
                    fullWidth
                />

                <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                        <Button
                            variant={"contained"}
                            onClick={() => {
                                processTokens(() => { handleItem(is_new, newTag) });
                                setOpen(false);
                            }}
                            fullWidth
                        >
                            {is_new ? 'Create Tag' : 'Edit Tag'}
                        </Button>
                    </Grid>
                    <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                        <Button
                            color={"secondary"}
                            variant={"contained"}
                            onClick={cancelTag}
                            fullWidth
                        >
                            Cancel
                        </Button>
                    </Grid>
                </Grid>

            </Stack>
        </DialogContent>
    );
}