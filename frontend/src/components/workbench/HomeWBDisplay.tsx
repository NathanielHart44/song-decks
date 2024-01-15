import { Divider, Stack } from "@mui/material";
import ProposalCardView from "./ProposalCardView";
import TaskCardView from "./TaskCardView";
import { Proposal } from "src/@types/types";
import { useEffect, useState } from "react";
import { ModalState, initialModalState } from "src/pages/Workbench";
import { objectToFormData, useApiCall } from "src/hooks/useApiCall";
import useWorkbenchState from "src/hooks/useWorkbenchState";
import { processTokens } from "src/utils/jwt";

// ----------------------------------------------------------------------

export default function HomeWBDisplay() {


    const { apiCall } = useApiCall();

    const [modalState, setModalState] = useState<ModalState>(initialModalState);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(true);

    const grid_sizing = {
        xs: 12,
        sm: 6,
        md: 6,
        lg: 4,
        xl: 3
    };

    const {
        allTasks, setAllTasks, allProposals, setAllProposals,
        newProposal, setNewProposal, allTags, setAllTags
    } = useWorkbenchState();

    function setModalVisibility(modalName: keyof ModalState, isOpen: boolean) {
        setModalState(prevState => ({ ...prevState, [modalName]: isOpen }));
    };

    const handleProposal = async (is_new: boolean, proposal: Proposal) => {
        setAwaitingResponse(true);
        const formData = objectToFormData(proposal);
        const url_path = is_new ? 'create_proposal' : `update_proposal/${proposal.id}`;
    
        apiCall(url_path, 'POST', formData, (data) => {
            const updated_proposal = data;
    
            if (is_new) {
                setAllProposals(allProposals ? [...allProposals, updated_proposal] : [updated_proposal]);
            } else {
                let updated_proposals = allProposals?.map((existingProposal) => {
                    if (existingProposal.id === updated_proposal.id) {
                        return updated_proposal;
                    }
                    return existingProposal;
                });
                setAllProposals(updated_proposals);
            }
        });
        setAwaitingResponse(false);
    };

    const getAllContent = async (type: 'tags' | 'proposals' | 'tasks') => {
        apiCall(`get_all_${type}`, 'GET', null, (data) => {
            if (type === 'tags') setAllTags(data);
            if (type === 'proposals') setAllProposals(data);
            if (type === 'tasks') setAllTasks(data);
        });
    };

    useEffect(() => {
        processTokens(() => {
            getAllContent('tags');
            getAllContent('proposals');
            getAllContent('tasks');
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (allTags && allProposals && allTasks) {
            setAwaitingResponse(false);
        }
    }, [allTags, allProposals, allTasks]);

    return (
        <Stack spacing={10} width={'100%'} justifyContent={'center'} alignItems={'center'}>
            <ProposalCardView
                grid_sizing={grid_sizing}
                proposals={allProposals || []}
                setAllProposals={setAllProposals}
                modalState={modalState}
                setModalVisibility={setModalVisibility}
                awaitingResponse={awaitingResponse}
                newProposal={newProposal}
                setNewProposal={setNewProposal}
                handleProposal={handleProposal}
                allTags={allTags}
            />
            <Divider sx={{ width: '65%' }} />
            <TaskCardView
                grid_sizing={grid_sizing}
                tasks={allTasks || []}
                setAllTasks={setAllTasks}
            />
        </Stack>
    )
}
