import { useState } from 'react';
import { Task, Subtask, Proposal, Tag, Profile } from 'src/@types/types';

// ----------------------------------------------------------------------

type WorkbenchState = {
    allTasks: Task[] | undefined;
    setAllTasks: React.Dispatch<React.SetStateAction<Task[] | undefined>>;
    newTask: Task | undefined;
    setNewTask: React.Dispatch<React.SetStateAction<Task | undefined>>;

    newSubtask: Subtask | undefined;
    setNewSubtask: React.Dispatch<React.SetStateAction<Subtask | undefined>>;

    allProposals: Proposal[] | undefined;
    setAllProposals: React.Dispatch<React.SetStateAction<Proposal[] | undefined>>;
    newProposal: Proposal | undefined;
    setNewProposal: React.Dispatch<React.SetStateAction<Proposal | undefined>>;

    allTags: Tag[] | undefined;
    setAllTags: React.Dispatch<React.SetStateAction<Tag[] | undefined>>;
    newTag: Tag | undefined;
    setNewTag: React.Dispatch<React.SetStateAction<Tag | undefined>>;

    allModerators: Profile[] | undefined;
    setAllModerators: React.Dispatch<React.SetStateAction<Profile[] | undefined>>;
};

// ----------------------------------------------------------------------

const useWorkbenchState = (): WorkbenchState => {
    const [allTasks, setAllTasks] = useState<Task[]>();
    const [newTask, setNewTask] = useState<Task>();

    const [newSubtask, setNewSubtask] = useState<Subtask>();

    const [allProposals, setAllProposals] = useState<Proposal[]>();
    const [newProposal, setNewProposal] = useState<Proposal>();

    const [allTags, setAllTags] = useState<Tag[]>();
    const [newTag, setNewTag] = useState<Tag>();

    const [allModerators, setAllModerators] = useState<Profile[]>();

    return {
        allTasks, setAllTasks, newTask, setNewTask,
        allProposals, setAllProposals, newProposal, setNewProposal,
        allTags, setAllTags, newTag, setNewTag,
        allModerators, setAllModerators,
        newSubtask, setNewSubtask
    };
};

export default useWorkbenchState;