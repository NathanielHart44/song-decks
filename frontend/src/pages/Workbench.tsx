import Page from "src/components/base/Page";
import { processTokens } from "src/utils/jwt";
import { useContext, useEffect, useState } from "react";
import { Tag, Proposal, Task } from "src/@types/types";
import { Container, Stack, Theme, useMediaQuery, useTheme } from "@mui/material";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";

// components
import WorkbenchAccordionContainer from "src/components/workbench/WorkbenchAccordion";
import WorkbenchMgmtDialog from "src/components/workbench/WorkbenchMgmtDialog";
import ProposalLine from "src/components/workbench/ProposalLine";
import TaskLine from "src/components/workbench/TaskLine";
import { MetadataContext } from "src/contexts/MetadataContext";
import TagLine from "src/components/workbench/TagLine";

// hooks
import useWorkbenchState from 'src/hooks/useWorkbenchState';
import { useApiCall, objectToFormData } from "src/hooks/useApiCall";

// ----------------------------------------------------------------------

type ModalState = {
    taskCreationOpen: boolean;
    proposalCreationOpen: boolean;
    tagCreationOpen: boolean;
};

const initialModalState: ModalState = {
    taskCreationOpen: false,
    proposalCreationOpen: false,
    tagCreationOpen: false
};

// ----------------------------------------------------------------------

export default function Workbench() {

    const theme = useTheme();
    const line_text_color = theme.palette.grey[500];

    const { currentUser } = useContext(MetadataContext);
    const { apiCall } = useApiCall();
    const is_small_screen = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
    const [modalState, setModalState] = useState<ModalState>(initialModalState);

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(true);

    const {
        allTasks, setAllTasks, newTask, setNewTask,
        allProposals, setAllProposals, newProposal, setNewProposal,
        allTags, setAllTags, newTag, setNewTag,
        allModerators, setAllModerators
    } = useWorkbenchState();

    function setModalVisibility(modalName: keyof ModalState, isOpen: boolean) {
        setModalState(prevState => ({ ...prevState, [modalName]: isOpen }));
    };

    const getAllContent = async (type: 'tags' | 'proposals' | 'tasks') => {
        apiCall(`get_all_${type}`, 'GET', null, (data) => {
            if (type === 'tags') setAllTags(data);
            if (type === 'proposals') setAllProposals(data);
            if (type === 'tasks') setAllTasks(data);
        });
    };

    const getAllModerators = async () => {
        apiCall('get_all_moderators', 'GET', null, (data) => {
            setAllModerators(data);
        });
    };

    function handleTaskEdit(task: Task) {
        setNewTask(task);
        setModalState(prevState => ({ ...prevState, taskCreationOpen: true }));
    };

    const handleTask = async (is_new: boolean, task: Task) => {
        setAwaitingResponse(true);
        const formData = objectToFormData(task);
        const url_path = is_new ? 'create_task' : `update_task/${task.id}`;
        apiCall(url_path, 'POST', formData, (data) => {
            if (is_new) {
                setAllTasks(allTasks ? [...allTasks, data] : [data]);
            } else {
                let updated_tasks = allTasks?.map((task) => {
                    if (task.id === data.id) {
                        return data;
                    }
                    return task;
                });
                setAllTasks(updated_tasks);
            }
            getAllContent('tags').then(() => {
                setAwaitingResponse(false);
            });
        });
        setAwaitingResponse(false);
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
                
                // Logic to create a new task if the proposal is confirmed
                if (updated_proposal.status === 'confirmed') {
                    const new_task: Task = {
                        id: -1,
                        title: 'New Task',
                        description: updated_proposal.text,
                        state: 'not_started',
                        complexity: 1,
                        priority: 1,
                        is_private: false,
                        notes: '',
                        tags: [],
                        assigned_admins: [],
                        dependencies: [],
                        created_at: ''
                    };
                    setNewTask(new_task);
                    setModalState(prevState => ({ ...prevState, taskCreationOpen: true }));
                }
            }
        });
        setAwaitingResponse(false);
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
        setModalState(prevState => ({ ...prevState, proposalCreationOpen: true }));
    }

    function beginTag() {
        const new_tag: Tag = {
            id: -1,
            name: '',
            use_count: 0,
            // color: '',
            created_at: ''
        };
        setNewTag(new_tag);
        setModalState(prevState => ({ ...prevState, tagCreationOpen: true }));
    }

    function handleTagEdit(tag: Tag) {
        setNewTag(tag);
        setModalState(prevState => ({ ...prevState, tagCreationOpen: true }));
    };

    const handleTag = async (is_new: boolean, tag: Tag) => {
        setAwaitingResponse(true);

        const formData = objectToFormData(tag);
        const url_path = is_new ? 'create_tag' : `update_tag/${tag.id}`;
        apiCall(url_path, 'POST', formData, (data) => {
            if (is_new) {
                setAllTags(allTags ? [...allTags, data] : [data]);
            } else {
                let updated_tags = allTags?.map((existingTag) => {
                    if (existingTag.id === data.id) {
                        return data;
                    }
                    return existingTag;
                });
                setAllTags(updated_tags);
            }
        });
        setAwaitingResponse(false);
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
            { awaitingResponse && <LoadingBackdrop /> }
            <Container maxWidth={false}>
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
                <WorkbenchMgmtDialog
                    type={'task'}
                    is_new={newTask?.id === -1}
                    open={modalState.taskCreationOpen}
                    setOpen={(isOpen) => setModalVisibility('taskCreationOpen', isOpen)}
                    newItem={newTask}
                    setNewItem={setNewTask}
                    awaitingResponse={awaitingResponse}
                    handleItem={handleTask}
                    allModerators={allModerators}
                    allTags={allTags}
                />
                <WorkbenchMgmtDialog
                    type={'tag'}
                    is_new={newTag?.id === -1}
                    open={modalState.tagCreationOpen}
                    setOpen={(isOpen) => setModalVisibility('tagCreationOpen', isOpen)}
                    newItem={newTag}
                    setNewItem={setNewTag}
                    awaitingResponse={awaitingResponse}
                    handleItem={handleTag}
                    allModerators={allModerators}
                />
                <Stack spacing={2} width={'100%'}>
                    {renderAccordionContainer({
                        title: 'Proposals',
                        addNew: beginProposal,
                        children: allProposals && allProposals.map((proposal: Proposal) => (
                            <ProposalLine
                                key={'proposal_' + proposal.id}
                                line_text_color={line_text_color}
                                proposal={proposal}
                                handleProposal={handleProposal}
                            />
                        ))
                    })}
                    {renderAccordionContainer({
                        title: 'Tasks',
                        children: allTasks && allTasks.map((task: Task) => (
                            <TaskLine
                                key={'task_' + task.id}
                                line_text_color={line_text_color}
                                is_small_screen={is_small_screen}
                                task={task}
                                handleTaskEdit={handleTaskEdit}
                            />
                        ))
                    })}
                    {renderAccordionContainer({
                        title: 'Tags',
                        addNew: beginTag,
                        children: allTags && allTags.map((tag: Tag) => (
                            <TagLine
                                key={'tag_' + tag.id}
                                line_text_color={line_text_color}
                                tag={tag}
                                handleTagEdit={handleTagEdit}
                            />
                        ))
                    })}
                </Stack>
            </Container>
        </Page>
    );
};

// ----------------------------------------------------------------------

type AccordionContainerProps = {
    title: string;
    addNew?: () => void;
    children: React.ReactNode;
};

const renderAccordionContainer = ({ title, addNew, children }: AccordionContainerProps) => (
    <WorkbenchAccordionContainer
        title={title}
        addNew={addNew}
        table_body={children}
    />
);
