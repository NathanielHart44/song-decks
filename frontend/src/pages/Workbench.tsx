import Page from "src/components/base/Page";
import { processTokens } from "src/utils/jwt";
import { useContext, useEffect, useState } from "react";
import { Tag, Proposal, Task, Subtask } from "src/@types/types";
import { Container, Stack, Theme, useMediaQuery, useTheme } from "@mui/material";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";

// components
import WorkbenchAccordionContainer from "src/components/workbench/WorkbenchAccordion";
import ProposalLine from "src/components/workbench/ProposalLine";
import TaskLine from "src/components/workbench/TaskLine";
import { MetadataContext } from "src/contexts/MetadataContext";
import TagLine from "src/components/workbench/TagLine";

// hooks
import useWorkbenchState from 'src/hooks/useWorkbenchState';
import { useApiCall, objectToFormData } from "src/hooks/useApiCall";
import WBMgmtDialogGroup from "../components/workbench/WBMgmtDialogGroup";

// ----------------------------------------------------------------------

export type ModalState = {
    taskCreationOpen: boolean;
    subtaskCreationOpen: boolean;
    proposalCreationOpen: boolean;
    tagCreationOpen: boolean;
};

export const initialModalState: ModalState = {
    taskCreationOpen: false,
    subtaskCreationOpen: false,
    proposalCreationOpen: false,
    tagCreationOpen: false
};

// ----------------------------------------------------------------------

export default function Workbench() {

    const theme = useTheme();
    const line_text_color = theme.palette.grey[500];

    const { currentUser } = useContext(MetadataContext);
    const { apiCall } = useApiCall();
    const is_large_screen = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
    const [modalState, setModalState] = useState<ModalState>(initialModalState);

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(true);

    const {
        allTasks, setAllTasks, newTask, setNewTask,
        allProposals, setAllProposals, newProposal, setNewProposal,
        allTags, setAllTags, newTag, setNewTag,
        allModerators, setAllModerators,
        newSubtask, setNewSubtask
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

    function beginSubtask(task: Task, subtask: Subtask | null) {
        const default_subtask: Subtask = {
            id: -1,
            task: task,
            title: '',
            description: '',
            state: 'not_started',
            complexity: 1,
            priority: 1,
            is_private: false,
            notes: '',
            assigned_admins: [],
            created_at: ''
        };
        setNewSubtask(subtask ? subtask : default_subtask);
        setModalState(prevState => ({ ...prevState, subtaskCreationOpen: true }));
    };

    const handleSubtask = async (is_new: boolean, subtask: Subtask) => {
        setAwaitingResponse(true);
        const formData = objectToFormData(subtask);
        const url_path = is_new ? 'create_subtask' : `update_subtask/${subtask.id}`;
        apiCall(url_path, 'POST', formData, (data) => {
            if (is_new) {
                let updated_tasks = allTasks?.map((task) => {
                    if (task.id === data.id) {
                        return data;
                    }
                    return task;
                });
                setAllTasks(updated_tasks);
            } else {
                let updated_tasks = allTasks?.map((task) => {
                    if (task.id === data.id) {
                        return data;
                    }
                    return task;
                });
                setAllTasks(updated_tasks);
            }
        });
        setAwaitingResponse(false);
    }

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
                        favorited_by: [],
                        assigned_admins: [],
                        subtasks: [],
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
            favorited_by: [],
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
                <WBMgmtDialogGroup
                    modalState={modalState}
                    setModalVisibility={setModalVisibility}
                    awaitingResponse={awaitingResponse}
                    newProposal={newProposal}
                    setNewProposal={setNewProposal}
                    handleProposal={handleProposal}
                    newTask={newTask}
                    setNewTask={setNewTask}
                    handleTask={handleTask}
                    newTag={newTag}
                    setNewTag={setNewTag}
                    handleTag={handleTag}
                    allModerators={allModerators}
                    allTags={allTags}
                    newSubtask={newSubtask}
                    setNewSubtask={setNewSubtask}
                    handleSubtask={handleSubtask}
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
                                is_small_screen={!is_large_screen}
                                task={task}
                                handleTaskEdit={handleTaskEdit}
                                beginSubtask={beginSubtask}
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
