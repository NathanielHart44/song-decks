import { FilterState } from "src/pages/Workbench";
import {
    Divider,
    Drawer,
    Fab,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme
} from "@mui/material";
import { Dispatch, SetStateAction } from "react";
import FilterAltIcon from '@mui/icons-material/FilterAlt';

// ----------------------------------------------------------------------

type WBFiltersDrawerProps = {
    isMobile: boolean;
    filtersOpen: boolean;
    setFiltersOpen: (open: boolean) => void;
    filterState: FilterState;
    setFilterState: Dispatch<SetStateAction<FilterState>>;
};

// ----------------------------------------------------------------------

export default function WBFiltersDrawer({ isMobile, filtersOpen, setFiltersOpen, filterState, setFilterState }: WBFiltersDrawerProps) {

    const theme = useTheme();
    const title_grey = theme.palette.grey[600];

    function handleSortDateChange(newDate: FilterState['sortDate']) {
        setFilterState(prevState => ({ ...prevState, sortDate: newDate }));
    };

    function handlePublicPrivateChange(newPublicPrivate: FilterState['publicPrivate']) {
        setFilterState(prevState => ({ ...prevState, publicPrivate: newPublicPrivate }));
    };
    function handleProposalStatusChange(newProposalStatus: FilterState['proposalStatus']) {
        setFilterState(prevState => ({ ...prevState, proposalStatus: newProposalStatus }));
    };
    function handleTaskStateChange(newTaskState: FilterState['taskState']) {
        setFilterState(prevState => ({ ...prevState, taskState: newTaskState }));
    };
    function handleTaskAssigneeChange(newTaskAssignee: FilterState['taskAssignee']) {
        setFilterState(prevState => ({ ...prevState, taskAssignee: newTaskAssignee }));
    };

    return (
        <>
            <Fab
                color={"primary"}
                sx={{
                    position: 'fixed',
                    bottom: theme.spacing(2),
                    right: theme.spacing(2),
                }}
                onClick={() => { setFiltersOpen(!filtersOpen) }}
            >
                <FilterAltIcon />
            </Fab>
            <Drawer
                anchor={'right'}
                open={filtersOpen}
                onClose={() => setFiltersOpen(false)}
                sx={{
                    '& .MuiDrawer-paper': { width: isMobile ? '60%' : '30%' },
                    position: 'relative'
                }}
            >
                <Stack spacing={2} justifyContent={'center'} alignItems={'center'} width={'92%'} sx={{ my: 2, px: 1, mx: 1 }}>
                    <Typography variant={'h4'}>Filters</Typography>
                    <Divider sx={{ width: '65%' }} />
                    <Stack sx={{ width: '100%' }}>
                        <Typography color={title_grey} variant={'subtitle2'}>Sort By</Typography>
                        <ToggleButtonGroup
                            color={"primary"}
                            value={filterState.sortDate}
                            exclusive
                            size={'small'}
                            fullWidth
                        >
                            <ToggleButton value={"desc"} onClick={() => { handleSortDateChange('desc') }}>
                                Newest
                            </ToggleButton>
                            <ToggleButton value={"asc"} onClick={() => { handleSortDateChange('asc') }}>
                                Oldest
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                    <Stack sx={{ width: '100%' }}>
                        <Typography color={title_grey} variant={'subtitle2'}>Privacy</Typography>
                        <ToggleButtonGroup
                            color={"primary"}
                            value={filterState.publicPrivate}
                            exclusive
                            size={'small'}
                            fullWidth
                        >
                            <ToggleButton value={"all"} onClick={() => { handlePublicPrivateChange('all') }}>
                                All
                            </ToggleButton>
                            <ToggleButton value={"public"} onClick={() => { handlePublicPrivateChange('public') }}>
                                Public
                            </ToggleButton>
                            <ToggleButton value={"private"} onClick={() => { handlePublicPrivateChange('private') }}>
                                Private
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>

                    <Typography variant={'h6'}>Proposals</Typography>
                    <Stack sx={{ width: '100%' }}>
                        <Typography color={title_grey} variant={'subtitle2'}>Status</Typography>
                        <ToggleButtonGroup
                            color={"primary"}
                            orientation={isMobile ? 'vertical' : 'horizontal'}
                            value={filterState.proposalStatus}
                            exclusive
                            size={'small'}
                            fullWidth
                        >
                            <ToggleButton value={"pending"} onClick={() => { handleProposalStatusChange('pending') }}>
                                Pending
                            </ToggleButton>
                            <ToggleButton value={"confirmed"} onClick={() => { handleProposalStatusChange('confirmed') }}>
                                Confirmed
                            </ToggleButton>
                            <ToggleButton value={"rejected"} onClick={() => { handleProposalStatusChange('rejected') }}>
                                Rejected
                            </ToggleButton>
                            <ToggleButton value={"all"} onClick={() => { handleProposalStatusChange('all') }}>
                                All
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>

                    <Typography variant={'h6'}>Tasks</Typography>
                    <Stack sx={{ width: '100%' }}>
                        <Typography color={title_grey} variant={'subtitle2'}>Assigned To</Typography>
                        <ToggleButtonGroup
                            color={"primary"}
                            value={filterState.taskAssignee}
                            exclusive
                            size={'small'}
                            fullWidth
                        >
                            <ToggleButton value={"all"} onClick={() => { handleTaskAssigneeChange('all') }}>
                                All
                            </ToggleButton>
                            <ToggleButton value={"assigned_to_me"} onClick={() => { handleTaskAssigneeChange('assigned_to_me') }}>
                                Assigned To Me
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                    <Stack sx={{ width: '100%' }}>
                        <Typography color={title_grey} variant={'subtitle2'}>Status</Typography>
                        <ToggleButtonGroup
                            color={"primary"}
                            orientation={'vertical'}
                            value={filterState.taskState}
                            exclusive
                            size={'small'}
                            fullWidth
                        >
                            <ToggleButton value={"all_not_finished"} onClick={() => { handleTaskStateChange('all_not_finished') }}>
                                All Not Finished
                            </ToggleButton>
                            <ToggleButton value={"all"} onClick={() => { handleTaskStateChange('all') }}>
                                All
                            </ToggleButton>
                            <ToggleButton value={"not_started"} onClick={() => { handleTaskStateChange('not_started') }}>
                                Not Started
                            </ToggleButton>
                            <ToggleButton value={"assigned"} onClick={() => { handleTaskStateChange('assigned') }}>
                                Assigned
                            </ToggleButton>
                            <ToggleButton value={"in_progress"} onClick={() => { handleTaskStateChange('in_progress') }}>
                                In Progress
                            </ToggleButton>
                            <ToggleButton value={"finished"} onClick={() => { handleTaskStateChange('finished') }}>
                                Finished
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Stack>
                </Stack>
            </Drawer>
        </>
    );
};