import Page from "src/components/base/Page";
import axios from "axios";
import { MAIN_API } from "src/config";
import { processTokens } from "src/utils/jwt";
import { useContext, useEffect, useState } from "react";
import { Tag, Proposal, ProposalImage, Task, Profile } from "src/@types/types";
import { useSnackbar } from "notistack";
import { Container, Stack } from "@mui/material";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";

// components
import WorkbenchAccordionContainer from "src/components/workbench/WorkbenchAccordion";
import WorkbenchMgmtDialog from "src/components/workbench/WorkbenchMgmtDialog";
import ProposalLine from "src/components/workbench/ProposalLine";
import TaskLine from "src/components/workbench/TaskLine";
import { MetadataContext } from "src/contexts/MetadataContext";

// ----------------------------------------------------------------------

export default function Workbench() {

    const { enqueueSnackbar } = useSnackbar();
    const { currentUser } = useContext(MetadataContext);

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(true);
    const [allTags, setAllTags] = useState<Tag[]>();
    const [allProposals, setAllProposals] = useState<Proposal[]>();
    const [allTasks, setAllTasks] = useState<Task[]>();
    const [allModerators, setAllModerators] = useState<Profile[]>();
    const [proposalsOpen, setProposalsOpen] = useState<boolean>(true);
    const [tasksOpen, setTasksOpen] = useState<boolean>(true);

    const [taskCreationOpen, setTaskCreationOpen] = useState<boolean>(false);
    const [newTask, setNewTask] = useState<Task>();
    
    const [proposalCreationOpen, setProposalCreationOpen] = useState<boolean>(false);
    const [newProposal, setNewProposal] = useState<Proposal>();

    const getAllContent = async (type: 'tags' | 'proposals' | 'tasks') => {
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}get_all_${type}/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (type === 'tags') { setAllTags(response.data) }
            if (type === 'proposals') { setAllProposals(response.data) }
            if (type === 'tasks') { setAllTasks(response.data) }
        }).catch((error) => {
            console.error(error);
            enqueueSnackbar(error.data.detail);
        })
    };

    const getAllModerators = async () => {
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}get_all_moderators/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            setAllModerators(response.data);
        }).catch((error) => {
            console.error(error);
            enqueueSnackbar(error.data.detail);
        })
    };

    function handleSubmissionError(error: any) {
        const error_data = error.response.data;
        if (error_data.text) {
            let error_msg = '';
            for (const key in error_data.text) {
                error_msg += `Error ${parseInt(key) + 1}: ${error_data.text[key]}\n`;
            }
            enqueueSnackbar(error_msg);
        } else {
            enqueueSnackbar(error_data.detail);
        }
    }

    function handleTaskEdit(task: Task) {
        setNewTask(task);
        setTaskCreationOpen(true);
    };

    const handleTask = async (is_new: boolean, task: Task) => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        const formData = new FormData();
        formData.append('title', task.title);
        formData.append('description', task.description);
        formData.append('state', task.state);
        formData.append('complexity', task.complexity.toString());
        formData.append('is_private', task.is_private.toString());
        formData.append('notes', task.notes);
        task.assigned_admins.forEach((admin) => {
            formData.append('assigned_admin_ids', admin.id.toString());
        });
        // formData.append('tags', task.tags);
        // formData.append('dependencies', task.dependencies);
        
        const url = is_new ? `${MAIN_API.base_url}create_task/` : `${MAIN_API.base_url}update_task/${task.id}/`;
        await axios.post(url, formData, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            const updated_task = response.data;
            if (is_new) {
                setAllTasks(allTasks ? [...allTasks, updated_task] : [updated_task]);
            } else {
                let updated_tasks = allTasks?.map((task) => {
                    if (task.id === updated_task.id) {
                        return updated_task;
                    }
                    return task;
                });
                setAllTasks(updated_tasks);
            }
            setAwaitingResponse(false);
        }).catch((error) => {
            handleSubmissionError(error);
            setAwaitingResponse(false);
        })
    }

    const handleProposal = async (is_new: boolean, proposal: Proposal) => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        const formData = new FormData();
        formData.append('text', proposal.text);
        // formData.append('images', proposal.images);
        // formData.append('tags', proposal.tags);
        formData.append('status', proposal.status);

        const url = is_new ? `${MAIN_API.base_url}create_proposal/` : `${MAIN_API.base_url}update_proposal/${proposal.id}/`;
        await axios.post(url, formData, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            const updated_proposal = response.data;

            if (is_new) {
                setAllProposals(allProposals ? [...allProposals, updated_proposal] : [updated_proposal]);
            } else {
                let updated_proposals = allProposals?.map((proposal) => {
                    if (proposal.id === updated_proposal.id) {
                        return updated_proposal;
                    }
                    return proposal;
                });
                setAllProposals(updated_proposals);
                if (updated_proposal.status === 'confirmed') {
                    const new_task: Task = {
                        id: -1,
                        title: 'New Task',
                        description: updated_proposal.text,
                        state: 'not_started',
                        complexity: 1,
                        is_private: false,
                        notes: '',
                        tags: [],
                        assigned_admins: [],
                        dependencies: [],
                        created_at: ''
                    };
                    setNewTask(new_task);
                    setTaskCreationOpen(true);
                }
            }
            setAwaitingResponse(false);
        }).catch((error) => {
            handleSubmissionError(error);
            setAwaitingResponse(false);
        })
    };

    function beginProposal() {
        if (!currentUser) return;

        const new_proposal: Proposal = {
            id: -1,
            creator: currentUser.profile,
            text: '',
            tags: [],
            status: 'pending',
            created_at: ''
        };
        setNewProposal(new_proposal);
        setProposalCreationOpen(true);
    }

    useEffect(() => {
        processTokens(() => {
            getAllContent('tags');
            getAllContent('proposals');
            getAllContent('tasks');
            getAllModerators();
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (allTags && allProposals && allTasks && allModerators) {
            setAwaitingResponse(false);
        }
    }, [allTags, allProposals, allTasks, allModerators]);

    return (
        <Page title="Workbench">
            <Container maxWidth={false}>
                <WorkbenchMgmtDialog
                    type={'task'}
                    is_new={(!newTask || newTask.id === -1) ? true : false}
                    open={taskCreationOpen}
                    setOpen={setTaskCreationOpen}
                    newItem={newTask}
                    setNewItem={setNewTask}
                    awaitingResponse={awaitingResponse}
                    handleItem={handleTask}
                    allModerators={allModerators}
                />
                <WorkbenchMgmtDialog
                    type={'proposal'}
                    is_new={true}
                    open={proposalCreationOpen}
                    setOpen={setProposalCreationOpen}
                    awaitingResponse={awaitingResponse}
                    newItem={newProposal}
                    setNewItem={setNewProposal}
                    handleItem={handleProposal}
                />
                { awaitingResponse && <LoadingBackdrop /> }
                <Stack spacing={2} width={'100%'}>
                    <WorkbenchAccordionContainer
                        title={'Proposals'}
                        open={proposalsOpen}
                        setOpen={setProposalsOpen}
                        addNew={beginProposal}
                        table_body={
                            allProposals && allProposals.map((proposal: Proposal) => (
                                <ProposalLine
                                    key={'proposal' + proposal.id}
                                    proposal={proposal}
                                    handleProposal={handleProposal}
                                />
                            ))
                        }
                    />
                    <WorkbenchAccordionContainer
                        title={'Tasks'}
                        open={tasksOpen}
                        setOpen={setTasksOpen}
                        table_body={
                            allTasks && allTasks.map((task: Task) => (
                                <TaskLine
                                    key={'task' + task.id}
                                    task={task}
                                    handleTaskEdit={handleTaskEdit}
                                />
                            ))
                        }
                    />
                </Stack>
            </Container>
        </Page>
    );
};