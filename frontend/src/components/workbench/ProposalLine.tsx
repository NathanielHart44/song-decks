import {
    Box,
    Button,
    CardMedia,
    Collapse,
    Grid,
    IconButton,
    Stack,
    TableCell,
    TableRow,
    Typography
} from "@mui/material";
import { useState } from "react";
import { Proposal } from "src/@types/types";
import { processTokens } from "src/utils/jwt";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { StatusIconify } from "../base/Iconify";
import formatTimestamp from "src/utils/formatTimestamp";
import { WORKBENCH_SETTINGS } from "src/utils/workbenchSettings";

// ----------------------------------------------------------------------

type ProposalLineType = {
    line_text_color: string;
    proposal: Proposal;
    handleProposal: (is_new: boolean, proposal: Proposal) => void;
};

export default function ProposalLine({ line_text_color, proposal, handleProposal }: ProposalLineType) {

    const [open, setOpen] = useState<boolean>(false);
    const has_image = false;

    function confirmProposal() {
        processTokens(() => {
            handleProposal(false, { ...proposal, status: 'confirmed' });
        })
    };

    function rejectProposal() {
        processTokens(() => {
            handleProposal(false, { ...proposal, status: 'rejected' });
        })
    };

    function toggleProposal() {
        processTokens(() => {
            handleProposal(false, { ...proposal, is_private: !proposal.is_private });
        })
    }

    if (proposal.status === 'closed') {
        return null;
    };

    return (
        <>
            <TableRow
                key={'proposal' + proposal.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell component="th" scope="row" align={'left'}>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell align={'center'}>
                    <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                        <StatusIconify
                            status={proposal.status}
                            size={24}
                        />
                    </Stack>
                </TableCell>
                <TableCell align={'center'}>
                    <Typography variant={'body2'} color={line_text_color}>
                        {proposal.creator && proposal.creator.user ? proposal.creator.user.username : 'No Creator'}
                    </Typography>
                </TableCell>
                <TableCell align={'center'}>
                    <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                        <StatusIconify
                            status={proposal.creator.moderator ? 'moderator' : 'user'}
                            size={24}
                        />
                    </Stack>
                </TableCell>
                <TableCell align={'center'}>
                    <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                        <StatusIconify
                            status={proposal.is_private ? 'private' : 'public'}
                            size={24}
                        />
                    </Stack>
                </TableCell>
                <TableCell align={'right'}>
                    <Typography variant={'body2'} color={line_text_color}>
                        {formatTimestamp(proposal.created_at)}
                    </Typography>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
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
                                color={line_text_color}
                            >
                                {proposal.text}
                            </Typography>

                            <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                                <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                                    <Button
                                        variant={"contained"}
                                        onClick={confirmProposal}
                                        fullWidth
                                    >
                                        Confirm
                                    </Button>
                                </Grid>
                                <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                                    <Button
                                        color={"secondary"}
                                        variant={"contained"}
                                        onClick={rejectProposal}
                                        fullWidth
                                    >
                                        Reject
                                    </Button>
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'} sx={{ pt: 2 }}>
                                <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                                    <Button
                                        variant={"contained"}
                                        onClick={toggleProposal}
                                        fullWidth
                                    >
                                        Toggle Private
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};