import WorkbenchMgmtDialog from "src/components/workbench/WorkbenchMgmtDialog";

// ----------------------------------------------------------------------

type Props = {
    modalState: any,
    setModalVisibility: any,
    awaitingResponse: boolean,
    newProposal: any,
    setNewProposal: any,
    handleProposal: any,
    newTask: any,
    setNewTask: any,
    handleTask: any,
    newTag: any,
    setNewTag: any,
    handleTag: any,
    allModerators: any,
    allTags: any,
    newSubtask: any,
    setNewSubtask: any,
    handleSubtask: any,
}

export default function WBMgmtDialogGroup(
    {
        modalState,
        setModalVisibility,
        awaitingResponse,
        newProposal,
        setNewProposal,
        handleProposal,
        newTask,
        setNewTask,
        handleTask,
        newTag,
        setNewTag,
        handleTag,
        allModerators,
        allTags,
        newSubtask,
        setNewSubtask,
        handleSubtask,
    }: Props
) {
    return (
        <>
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
                type={'subtask'}
                is_new={newSubtask?.id === -1}
                open={modalState.subtaskCreationOpen}
                setOpen={(isOpen) => setModalVisibility('subtaskCreationOpen', isOpen)}
                newItem={newSubtask}
                setNewItem={setNewSubtask}
                awaitingResponse={awaitingResponse}
                handleItem={handleSubtask}
                allModerators={allModerators}
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
        </>
    );
};