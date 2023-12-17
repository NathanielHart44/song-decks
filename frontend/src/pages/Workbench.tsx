import Page from "src/components/base/Page";
import axios from "axios";
import { MAIN_API } from "src/config";
import { processTokens } from "src/utils/jwt";
import { useEffect, useState } from "react";
import { Tag, Proposal, ProposalImage, Task } from "src/@types/types";
import { useSnackbar } from "notistack";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, CardActions, CardContent, CardMedia, Collapse, Container, Grid, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, alpha, useTheme } from "@mui/material";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { StatusIconify } from "src/components/base/Iconify";

// ----------------------------------------------------------------------

export default function Workbench() {

    const { enqueueSnackbar } = useSnackbar();

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(true);
    const [allTags, setAllTags] = useState<Tag[]>();
    const [allProposals, setAllProposals] = useState<Proposal[]>();
    const [allTasks, setAllTasks] = useState<Task[]>();
    const [open, setOpen] = useState<boolean>(true);

    const grid_sizing = {
        xs: 12,
        sm: 12,
        md: 12,
        lg: 6,
        xl: 4,
    };

    const getAllContent = async (type: 'tags' | 'proposals' | 'tasks') => {
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}get_all_${type}/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response.status !== 200) {
                console.log(response);
                enqueueSnackbar(response.data.detail);
                return;
            }
            if (type === 'tags') { setAllTags(response.data) }
            if (type === 'proposals') { setAllProposals(response.data) }
            if (type === 'tasks') { setAllTasks(response.data) }
        }).catch((error) => {
            console.error(error);
        })
    };

    const updateProposal = async (proposal: Proposal) => {
        let token = localStorage.getItem('accessToken') ?? '';
        const formData = new FormData();
        formData.append('text', proposal.text);
        // formData.append('images', proposal.images);
        // formData.append('tags', proposal.tags);
        formData.append('status', proposal.status);
        await axios.post(`${MAIN_API.base_url}update_proposal/${proposal.id}/`, formData, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response.status !== 200) {
                console.log(response);
                enqueueSnackbar(response.data.detail);
                return;
            }
            console.log(response);
            // take the updated proposal and replace it in the array
            let updated_proposal = response.data;
            let updated_proposals = allProposals?.map((proposal) => {
                if (proposal.id === updated_proposal.id) {
                    return updated_proposal;
                }
                return proposal;
            });
            setAllProposals(updated_proposals);
        }).catch((error) => {
            console.error(error);
        })
    };

    useEffect(() => {
        processTokens(() => {
            getAllContent('tags');
            getAllContent('proposals');
            getAllContent('tasks');
        })
    }, []);

    useEffect(() => {
        if (allTags && allProposals && allTasks) {
            setAwaitingResponse(false);
        }
    }, [allTags, allProposals, allTasks]);

    return (
        <Page title="Workbench">
            <Container maxWidth={false}>
                { awaitingResponse && <LoadingBackdrop /> }
                <Stack spacing={2} width={'100%'}>
                    <AccordionContainer
                        open={open}
                        setOpen={setOpen}
                        allProposals={allProposals}
                        updateProposal={updateProposal}
                    />
                </Stack>
            </Container>
        </Page>
    )
}

// ----------------------------------------------------------------------

type AccordionContainerType = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    allProposals: Proposal[] | undefined;
    updateProposal: (proposal: Proposal) => Promise<void>;
};

function AccordionContainer({ open, setOpen, allProposals, updateProposal }: AccordionContainerType) {

    const theme = useTheme();

    return (
        <Accordion
            disableGutters={true}
            expanded={open}
            sx={{ ...(open && { bgcolor: 'transparent' }) }}
            TransitionProps={{ unmountOnExit: true }}
        >
            <AccordianSummaryDiv open={open} setOpen={setOpen} title={"Proposals"} />
            <AccordionDetails sx={{ pt: 3 }}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell />
                                <TableCell align="right">Status</TableCell>
                                <TableCell align="right">Creator</TableCell>
                                <TableCell align="right">Created</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody
                            sx={{
                                '& > :nth-of-type(2n+1)': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                            }}
                        >
                            {allProposals && allProposals.map((proposal: Proposal) => (
                                <ProposalLine
                                    key={'proposal' + proposal.id}
                                    proposal={proposal}
                                    updateProposal={updateProposal}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </AccordionDetails>
        </Accordion>
    );
}

// ----------------------------------------------------------------------

type AccordianSummaryDivType = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    title: string;
};

function AccordianSummaryDiv({ open, setOpen, title }: AccordianSummaryDivType) {

    const theme = useTheme();

    const accordian_transition: string = '0.5s background-color;';
    const text_transition: string = '0.5s color;';
    const open_background_color = alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity);

    return (
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
            <Typography
                sx={{
                    transition: text_transition,
                    ...(open && { color: theme.palette.primary.main })
                }}
            >
                {title}
            </Typography>
        </AccordionSummary>
    )
}

// ----------------------------------------------------------------------

type ProposalLineType = {
    proposal: Proposal;
    updateProposal: (proposal: Proposal) => void;
};

function ProposalLine({ proposal, updateProposal }: ProposalLineType) {

    const [open, setOpen] = useState<boolean>(false);
    const has_image = false;

    function createTask() {
        console.log('create task');
        processTokens(() => {
            updateProposal({ ...proposal, status: 'confirmed' });
        })
        // create Task
    };

    function rejectTask() {
        console.log('reject task');
        processTokens(() => {
            updateProposal({ ...proposal, status: 'rejected' });
        })
    };

    if (proposal.status === 'closed') {
        return null;
    };

    return (
        <>
            <TableRow
                key={'proposal' + proposal.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell component="th" scope="row">
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell align="right">
                    <StatusIconify
                        status={proposal.status}
                        size={24}
                    />
                </TableCell>
                <TableCell align="right">
                    {proposal.creator && proposal.creator.user ? proposal.creator.user.username : 'No Creator'}
                </TableCell>
                <TableCell align="right">{proposal.created_at}</TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
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
                                {proposal.text}
                            </Typography>
                            <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'center'}>
                                <Button
                                    variant={"contained"}
                                    onClick={createTask}
                                >
                                    Create Task
                                </Button>
                                <Button
                                    color={"secondary"}
                                    variant={"contained"}
                                    onClick={rejectTask}
                                >
                                    Reject
                                </Button>
                            </Stack>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    )
}

// ----------------------------------------------------------------------

type StatusTagType = {
    status: 'pending' | 'rejected' | 'closed' | 'confirmed';
};

function StatusTag({ status }: StatusTagType) {

    const theme = useTheme();

    return (
        <Typography
            sx={{
                color: theme.palette.text.secondary,
                bgcolor: theme.palette.action.selected,
                borderRadius: '8px',
                padding: '0.25rem 0.5rem',
            }}
        >
            {status}
        </Typography>
    )
}