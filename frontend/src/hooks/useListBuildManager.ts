import { Attachment, Commander, Faction, List, NCU, Unit } from "src/@types/types";
import { ListClickProps } from "src/pages/ListBuilder";
import { genUniqueID } from "src/utils/genUniqueID";
import { useApiCall } from "src/hooks/useApiCall";
import { useContext } from "react";
import { ALL_CONTENT_OPTIONS, ListBuilderContext, ListState, resetListState } from "src/contexts/ListBuilderContext";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { PATH_PAGE } from "src/routes/paths";

// ----------------------------------------------------------------------

const useListBuildManager = () => {
    const { apiCall } = useApiCall();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const { listDispatch, listState } = useContext(ListBuilderContext);

    const handleFactionClick = (faction: Faction | null) => {
        if (faction && faction.id === listState.selectedFaction?.id) {
            resetListState(listDispatch);
        } else {
            listDispatch({ type: 'SET_SELECTED_FACTION', payload: faction });
        }
    };

    const handleCommanderClick = (commander: Commander | null) => {
        if (commander && commander.id === listState.selectedCommander?.id) {
            // if the commander.commander_type === 'attachment', remove it from the avaiableAttachments.
            if (commander.commander_type === 'attachment') {
                const commanderAttachmentIndex = listState.availableAttachments?.findIndex((attachment) => attachment.name === commander.name);
                if (commanderAttachmentIndex !== undefined && commanderAttachmentIndex !== -1 && listState.availableAttachments) {
                    const newAvailableAttachments = [...listState.availableAttachments];
                    newAvailableAttachments.splice(commanderAttachmentIndex, 1);
                    listDispatch({ type: 'SET_AVAILABLE_ATTACHMENTS', payload: newAvailableAttachments });
                }
                // then see if there is a selectedUnit that has an attachment with the same name as the commander.
                // if so, remove that attachment from the selectedUnit.
                const commanderAttachment = listState.selectedUnits.find((unit) => unit.attachments.find((attachment) => attachment.name === commander.name));
                if (commanderAttachment) {
                    const commanderAttachmentIndex = commanderAttachment.attachments.findIndex((attachment) => attachment.name === commander.name);
                    if (commanderAttachmentIndex !== undefined && commanderAttachmentIndex !== -1) {
                        const newCommanderAttachment = JSON.parse(JSON.stringify(commanderAttachment));
                        newCommanderAttachment.attachments.splice(commanderAttachmentIndex, 1);
                        let unitToRemoveIndex = listState.selectedUnits.findIndex((unit) => unit.temp_id === commanderAttachment.temp_id);
                        if (unitToRemoveIndex !== -1) {
                            const newSelectedUnits = [...listState.selectedUnits];
                            newSelectedUnits.splice(unitToRemoveIndex, 1);
                            newSelectedUnits.push(newCommanderAttachment);
                            listDispatch({ type: 'SET_SELECTED_UNITS', payload: newSelectedUnits });
                        }
                    }
                }
            } else if (commander.commander_type === 'unit') {
                const newSelectedUnits = listState.selectedUnits.filter((unit) => unit.name !== commander.name);
                listDispatch({ type: 'SET_SELECTED_UNITS', payload: newSelectedUnits });
            }
            // if the commander.commander_type === 'unit', remove it from the selectedUnits.
            listDispatch({ type: 'SET_SELECTED_COMMANDER', payload: null });
        } else {
            listDispatch({ type: 'SET_SELECTED_COMMANDER', payload: commander });
        }
    };

    const handleListClick = (props: ListClickProps) => {
        const { type, item, in_list } = props;
        if (in_list) {
            if (type === 'unit') {
                let unitToRemoveIndex = listState.selectedUnits.findIndex((unit) => unit.temp_id === item.temp_id);
                const unitToRemove = listState.selectedUnits[unitToRemoveIndex];
                    
                if (unitToRemoveIndex !== -1) {
                    const newSelectedUnits = [...listState.selectedUnits];
                    const newUnitToRemoveIndex = newSelectedUnits.findIndex((unit) => unit.temp_id === unitToRemove.temp_id);
                    newSelectedUnits[newUnitToRemoveIndex].attachments = [];
                    newSelectedUnits.splice(newUnitToRemoveIndex, 1);
                    listDispatch({ type: 'SET_SELECTED_UNIT_TEMP_ID', payload: null });
                    listDispatch({ type: 'SET_SELECTED_UNITS', payload: newSelectedUnits });
                }
                enqueueSnackbar('Unit removed from List');
            } else if (type === 'ncu') {
                listDispatch({ type: 'SET_SELECTED_NCUs', payload: listState.selectedNCUs.filter((ncu) => ncu.id !== item.id) });
                enqueueSnackbar('NCU removed from List');
            } else {
                // handle Attachment removal
                const attachment_temp_id = (item as Attachment).temp_id;
                if (!attachment_temp_id) { return };
                const attachmentsUnit = listState.selectedUnits.find((unit) => unit.attachments.find((attachment) => attachment.temp_id === attachment_temp_id));
                if (!attachmentsUnit) { return };
                const attachmentToRemoveIndex = attachmentsUnit.attachments.findIndex((attachment) => attachment.temp_id === attachment_temp_id);
                if (attachmentToRemoveIndex !== -1) {
                    const newAttachmentsUnit = JSON.parse(JSON.stringify(attachmentsUnit));
                    newAttachmentsUnit.attachments.splice(attachmentToRemoveIndex, 1);
                    let unitToRemoveIndex = listState.selectedUnits.findIndex((unit) => unit.temp_id === attachmentsUnit.temp_id);
                    if (unitToRemoveIndex !== -1) {
                        const newSelectedUnits = [...listState.selectedUnits];
                        const newUnitToRemoveIndex = newSelectedUnits.findIndex((unit) => unit.temp_id === attachmentsUnit.temp_id);
                        newSelectedUnits.splice(newUnitToRemoveIndex, 1);
                        newSelectedUnits.push(newAttachmentsUnit);
                        listDispatch({ type: 'SET_SELECTED_UNITS', payload: newSelectedUnits });
                    }
                }
                enqueueSnackbar('Attachment removed from Unit');
            }
        } else {
            if (type === 'unit') {
                let newUnit = JSON.parse(JSON.stringify(item)) as Unit;
                newUnit.temp_id = genUniqueID();
                newUnit.attachments = [];
                
                listDispatch({ type: 'SET_SELECTED_UNITS', payload: [...listState.selectedUnits, newUnit] });
                enqueueSnackbar('Unit added to List');
            } else if (type === 'ncu') {
                if (!listState.selectedNCUs.find((ncu) => ncu.id === item.id)) {
                    listDispatch({ type: 'SET_SELECTED_NCUs', payload: [...listState.selectedNCUs, item as NCU] });
                }
                enqueueSnackbar('NCU added to List');
            } else {
                // handle Attachment add
                if (!listState.selectedUnitTempID) { return };
                const selectedUnit = JSON.parse(JSON.stringify(listState.selectedUnits.find((unit) => unit.temp_id === listState.selectedUnitTempID)));
                if (!selectedUnit) { return };
                let newAttachment = JSON.parse(JSON.stringify(item)) as Attachment;
                newAttachment.temp_id = genUniqueID();
                let newSelectedUnit = {
                    ...selectedUnit,
                    attachments: [...selectedUnit.attachments, newAttachment]
                };

                let unitToRemoveIndex = listState.selectedUnits.findIndex((unit) => unit.temp_id === selectedUnit.temp_id);
                if (unitToRemoveIndex !== -1) {
                    const newSelectedUnits = [...listState.selectedUnits];
                    newSelectedUnits.splice(unitToRemoveIndex, 1);
                    newSelectedUnits.push(newSelectedUnit);
                    listDispatch({ type: 'SET_SELECTED_UNITS', payload: newSelectedUnits });
                    listDispatch({ type: 'SET_SELECTED_UNIT_TEMP_ID', payload: null });
                    listDispatch({ type: 'SET_SELECTED_VIEW', payload: 'my_list' });
                }
                enqueueSnackbar('Attachment added to Unit');
            }
        }
    };

    const getContent = async (type: ALL_CONTENT_OPTIONS) => {
        listDispatch({ type: 'SET_AWAITING_RESPONSE', payload: true });
        let url;
        if (type === 'factions') {
            url = `${type}`;
        } else {
            url = `${type}/${listState.selectedFaction?.id}`;
        }
        apiCall(url, 'GET', null, (data) => {
            if (type === 'factions') {
                listDispatch({ type: 'SET_ALL_FACTIONS', payload: data });
            } else if (type === 'commanders') {
                listDispatch({ type: 'SET_FACTION_COMMANDERS', payload: data });
            } else if (type === 'units') {
                listDispatch({ type: 'SET_FACTION_UNITS', payload: data });
            } else if (type === 'attachments') {
                listDispatch({ type: 'SET_FACTION_ATTACHMENTS', payload: data });
                listDispatch({ type: 'SET_AVAILABLE_ATTACHMENTS', payload: data });
            } else if (type === 'ncus') {
                listDispatch({ type: 'SET_FACTION_NCUs', payload: data });
            };
        });
        if (type === 'factions') { listDispatch({ type: 'SET_AWAITING_RESPONSE', payload: false }) };
    };

    const handleDeleteList = async (list_id?: number) => {
        if (listState.awaitingResponse) return;
        listDispatch({ type: 'SET_AWAITING_RESPONSE', payload: true });

        const url = list_id ? `delete_list/${list_id}` : `delete_list/${listState.originalList?.id}`;
        apiCall(url, 'DELETE', null, () => {
            enqueueSnackbar('List Deleted!');
            navigate(PATH_PAGE.list_manager);
        });
        listDispatch({ type: 'SET_AWAITING_RESPONSE', payload: false });
    }

    const handleSaveList = async (type: 'create' | 'edit') => {
        if (listState.awaitingResponse) return;
        listDispatch({ type: 'SET_AWAITING_RESPONSE', payload: true });

        let url = 'add_edit_list';
        if (type === 'edit' && listState.originalList) {
            url = `${url}/${listState.originalList?.id}`;
        };

        const list_units = listState.selectedUnits.map((unit) => {
            return {
                id: unit.id,
                attachments: unit.attachments.map((attachment) => attachment.id)
            };
        });
        const formData = new FormData();
        formData.append('name', listState.listTitle);
        formData.append('points_allowed', listState.maxPoints.toString());
        formData.append('faction_id', listState.selectedFaction?.id.toString() || '');
        formData.append('commander_id', listState.selectedCommander?.id.toString() || '');
        formData.append('units', JSON.stringify(list_units));
        formData.append('ncu_ids', JSON.stringify(listState.selectedNCUs.map((ncu) => ncu.id)));
        formData.append('is_draft', 'false');
        formData.append('is_public', 'true');
        formData.append('is_valid', 'true');

        apiCall(url, 'POST', formData, () => {
            enqueueSnackbar('List Saved!');
            navigate(PATH_PAGE.list_manager);
        });
        listDispatch({ type: 'SET_AWAITING_RESPONSE', payload: false });
    }

    function validSubmission(type: 'create' | 'edit') {
        let failure_reasons = [];
        if (!listState.selectedFaction) {
            failure_reasons.push('No Faction selected.');
        };
        if (!listState.listTitle) {
            failure_reasons.push('No List name.');
        };
        if (listState.usedPoints > listState.maxPoints) {
            failure_reasons.push('List is over the max points allowed.');
        };
        if (listState.selectedUnits.length < 1) {
            failure_reasons.push('No Units selected.');
        };
        // if the commander is not present as a unit or an attachment on a unit, add it to the failure_reasons.
        if (listState.selectedCommander) {
            if (listState.selectedCommander.commander_type === 'attachment') {
                const commanderAttachment = listState.selectedUnits.find((unit) => unit.attachments.find((attachment) => attachment.name === listState.selectedCommander?.name));
                if (!commanderAttachment) {
                    failure_reasons.push('Commander Attachment not assigned to a Unit.');
                }
            } else if (listState.selectedCommander.commander_type === 'unit') {
                if (!listState.selectedUnits.find((unit) => unit.name === listState.selectedCommander?.name)) {
                    failure_reasons.push('Commander Unit not added to the List.');
                }
            }
        } else {
            failure_reasons.push('No Commander selected.');
        }
        if (type === 'edit' && listState.originalList) {
            const listOutline = buildListOutline('list', listState.originalList);
            const stateOutline = buildListOutline('state', listState);
            if (JSON.stringify(listOutline) === JSON.stringify(stateOutline)) {
                failure_reasons.push('No changes made to the List.');
            }
        }
        return {
            valid: failure_reasons.length === 0,
            failure_reasons
        };
    }

    return { listState, listDispatch, getContent, handleFactionClick, handleCommanderClick, handleListClick, handleSaveList, handleDeleteList, validSubmission };
};

export default useListBuildManager;

// ----------------------------------------------------------------------

function buildListOutline(type: 'list' | 'state', obj: List | ListState) {
    if (type === 'list') {
        const list = obj as List;
        const listOutline = {
            list_name: list.name,
            max_points: list.points_allowed,
            faction: list.faction.id,
            commander: list.commander.id,
            units: list.units.map((unit: Unit) => {
                return {
                    id: unit.id,
                    attachments: unit.attachments.map((attachment) => attachment.id)
                };
            }),
            ncus: list.ncus.map((ncu: NCU) => ncu.id)
        };
        return listOutline;
    } else {
        const listState = obj as ListState;
        const listOutline = {
            list_name: listState.listTitle,
            max_points: listState.maxPoints,
            faction: listState.selectedFaction?.id,
            commander: listState.selectedCommander?.id,
            units: listState.selectedUnits.map((unit: Unit) => {
                return {
                    id: unit.id,
                    attachments: unit.attachments.map((attachment) => attachment.id)
                };
            }),
            ncus: listState.selectedNCUs.map((ncu: NCU) => ncu.id)
        };
        return listOutline;
    };
};