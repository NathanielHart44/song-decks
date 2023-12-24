import { Accordion, AccordionDetails, Card, Grid, IconButton, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography, useTheme } from "@mui/material";
import { Proposal, Tag, User } from "src/@types/types";
import Iconify, { StatusIconify } from "../base/Iconify";
import { useContext, useEffect, useState } from "react";
import AccordionSummaryDiv from "./AccordionSummaryDiv";
import truncateText from "src/utils/truncateText";
import { capWords } from "src/utils/capWords";
import AddNewWB from "./AddNewWB";
import { MetadataContext } from "src/contexts/MetadataContext";
import { useApiCall } from "src/hooks/useApiCall";
import { processTokens } from "src/utils/jwt";
import WorkbenchMgmtDialog from "./WorkbenchMgmtDialog";
import { ModalState } from "src/pages/Workbench";

// ----------------------------------------------------------------------

type ViewProps = {
    grid_sizing: {
        xs: number;
        sm: number;
        md: number;
        lg: number;
        xl: number;
    };
    proposals: Proposal[];
    setAllProposals: (proposals: Proposal[]) => void;
    modalState: ModalState,
    setModalVisibility: (type: 'proposalCreationOpen', isOpen: boolean) => void,
    awaitingResponse: boolean,
    newProposal: Proposal | undefined,
    setNewProposal: (proposal: Proposal | undefined) => void,
    handleProposal: (is_new: boolean, proposal: Proposal) => Promise<void>,
    allTags: Tag[] | undefined
}

export default function ProposalCardView({
    grid_sizing,
    proposals,
    setAllProposals,
    modalState,
    setModalVisibility,
    awaitingResponse,
    newProposal,
    setNewProposal,
    handleProposal,
    allTags
}: ViewProps) {

    const theme = useTheme();
    const title_grey = theme.palette.grey[600];

    const { isMobile, currentUser } = useContext(MetadataContext);
    const { apiCall } = useApiCall();
    const [awaitingProposalResponse, setAwaitingProposalResponse] = useState<boolean>(false);

    const [viewedProposals, setViewedProposals] = useState<Proposal[]>([]);
    const [filter, setFilter] = useState<'pending' | 'all' | 'personal'>('pending');
    const filter_options = ['pending', 'personal', 'all'];
    const [sort, setSort] = useState<'date' | 'popular'>('date');
    const sort_options = ['date', 'popular'];

    const handleSelection = (type: 'filter' | 'sort', value: string) => {
        if (type === 'filter' && filter_options.includes(value as any)) {
            setFilter(value as 'all' | 'personal');
        } else if (type === 'sort' && sort_options.includes(value as any)) {
            setSort(value as 'date' | 'popular');
        }
    };

    function beginProposal() {
        if (!currentUser) return;

        const new_proposal: Proposal = {
            id: -1,
            creator: currentUser.profile,
            text: '',
            tags: [],
            status: 'pending',
            favorited_by: [],
            created_at: ''
        };
        setNewProposal(new_proposal);
        setModalVisibility('proposalCreationOpen', true);
    };

    useEffect(() => {
        let proposals_copy: Proposal[] = JSON.parse(JSON.stringify(proposals));
        if (filter === 'personal') {
            const filtered_proposals = proposals_copy.filter((proposal) => {
                return proposal.creator.id === currentUser?.profile as any;
            });
            proposals_copy = filtered_proposals;
        }
        if (filter === 'all') {
            const filtered_proposals = proposals_copy.filter((proposal) => {
                return proposal.status !== 'rejected';
            });
            proposals_copy = filtered_proposals;
        }
        if (filter === 'pending') {
            const filtered_proposals = proposals_copy.filter((proposal) => {
                return proposal.status === 'pending';
            });
            proposals_copy = filtered_proposals;
        }
        if (sort === 'date') {
            proposals_copy = [...proposals_copy].sort((a, b) => {
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
        }
        if (sort === 'popular') {
            proposals_copy = [...proposals_copy].sort((a, b) => {
                return b.favorited_by.length - a.favorited_by.length;
            });
        }
        setViewedProposals(proposals_copy);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, sort, proposals]);

    const handleFavorite = async (id: number) => {
        if (awaitingProposalResponse) return;
        setAwaitingProposalResponse(true);
        apiCall(`handle_favorite_proposal/${id}`, 'POST', null, (data) => {
            const updated_proposal: Proposal = data;
            const updated_proposals = proposals.map((proposal) => {
                if (proposal.id === updated_proposal.id) return updated_proposal;
                return proposal;
            });
            setAllProposals(updated_proposals);
        });
        setAwaitingProposalResponse(false);
    };

    return (
        <Stack width={'100%'} spacing={2} justifyContent={'center'} alignItems={'center'}>
            <Stack width={'100%'} spacing={1} justifyContent={'center'} alignItems={'center'}>
                <Typography variant={'h4'}>Proposals</Typography>
                <Typography paragraph color={title_grey} sx={{ textAlign: 'center', mb: 0 }}>
                    Ideas on how to improve the platform. Submit and favorite proposals to help us prioritize.
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
            <Stack height={'100%'} justifyContent={"center"} alignItems={"center"} sx={{ pt: 4 }}>
                <AddNewWB
                    isMobile={isMobile}
                    handleClick={beginProposal}
                />
            </Stack>
            <Grid container>
                {viewedProposals.map((proposal) => (
                    <Grid item {...grid_sizing} key={proposal.id}>
                        <ProposalCard
                            currentUser={currentUser}
                            awaitingResponse={awaitingProposalResponse}
                            proposal={proposal}
                            handleFavorite={handleFavorite}
                        />
                    </Grid>
                ))}
            </Grid>
            <WorkbenchMgmtDialog
                type={'proposal'}
                is_new={true}
                open={modalState.proposalCreationOpen}
                setOpen={(isOpen) => setModalVisibility('proposalCreationOpen', isOpen)}
                awaitingResponse={awaitingResponse}
                newItem={newProposal}
                setNewItem={setNewProposal}
                handleItem={handleProposal}
                allTags={allTags}
            />
        </Stack>
    )
}

// ----------------------------------------------------------------------

type CardProps = {
    currentUser: User | undefined;
    awaitingResponse: boolean;
    proposal: Proposal;
    handleFavorite: (id: number) => void;
}

function ProposalCard({ currentUser, awaitingResponse, proposal, handleFavorite }: CardProps) {

    const max_text_length = 100;
    const [accordionOpen, setAccordionOpen] = useState<boolean>(false);
    const [selected, setSelected] = useState<boolean>(false);

    useEffect(() => {
        if (currentUser && proposal.favorited_by.includes(currentUser?.profile as any)) {
            setSelected(true);
        } else {
            setSelected(false);
        }
    }, [currentUser, proposal]);

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
                    title={ accordionOpen ? capWords(proposal.status) : truncateText(proposal.text, max_text_length) }
                    icon={
                        <StatusIconify
                            status={proposal.status}
                            size={24}
                        />
                    }
                />
                <AccordionDetails sx={{ pt: 3 }}>
                    {proposal.text}
                </AccordionDetails>
            </Accordion>
            <Stack direction={"row"} justifyContent={"flex-end"} alignItems={"center"}>
                <Typography variant={"caption"} color={"text.secondary"} sx={{ mr: 0 }}>
                    {proposal.favorited_by.length}
                </Typography>
                <Tooltip title={selected ? 'Unfavorite' : 'Favorite'} arrow>
                    <IconButton
                        size={"small"}
                        color={"secondary"}
                        onClick={() => { processTokens(() => { handleFavorite(proposal.id) }) }}
                        disabled={awaitingResponse}
                    >
                        <Iconify icon={selected ? 'mdi:star' : 'mdi:star-outline'} />
                    </IconButton>
                </Tooltip>
            </Stack>
        </Card>
    )
}

// ----------------------------------------------------------------------

type ToggleButtonGroupDivProps = {
    isMobile: boolean;
    options: string[];
    selectedValue: string;
    type: 'filter' | 'sort';
    handleSelection(type: 'filter' | 'sort', value: string): void;
};

export function ToggleButtonGroupDiv({ isMobile, options, selectedValue, type, handleSelection }: ToggleButtonGroupDivProps) {

    return (
        <ToggleButtonGroup
            color={'primary'}
            value={selectedValue}
            exclusive
            size={isMobile ? 'small' : 'medium'}
            onChange={(e, value) => { handleSelection(type, value as string) }}
            fullWidth
        >
            {options.map((option) => {
                return (
                    <ToggleButton key={type + '_option_' + option} value={option}>
                        <Typography variant={'body2'}>{capWords(option)}</Typography>
                    </ToggleButton>
                )
            })}
        </ToggleButtonGroup>
    )
};