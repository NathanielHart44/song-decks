import { useReducer } from "react";
import { Attachment, Commander, Faction, NCU, Unit } from "src/@types/types";
import { ListClickProps } from "src/pages/ListBuilder";
import { genUniqueID } from "src/utils/genUniqueID";
import { useApiCall } from "src/hooks/useApiCall";

// ----------------------------------------------------------------------

const useListBuildManager = () => {
    const { apiCall } = useApiCall();

    function listBuilderReducer(state: ListState, action: ListAction) {
        switch (action.type) {
            case 'SET_AWAITING_RESPONSE':
                return { ...state, awaitingResponse: action.payload };
            case 'SET_ALL_FACTIONS':
                return { ...state, allFactions: action.payload };
            case 'SET_SELECTED_FACTION':
                return { ...state, selectedFaction: action.payload };
            case 'SET_SELECTED_COMMANDER':
                return { ...state, selectedCommander: action.payload };
            case 'SET_FACTION_COMMANDERS':
                return { ...state, factionCommanders: action.payload };
            case 'SET_FACTION_UNITS':
                return { ...state, factionUnits: action.payload };
            case 'SET_FACTION_ATTACHMENTS':
                return { ...state, factionAttachments: action.payload };
            case 'SET_AVAILABLE_ATTACHMENTS':
                return { ...state, availableAttachments: action.payload };
            case 'SET_FACTION_NCUs':
                return { ...state, factionNCUs: action.payload };
            case 'SET_SELECTED_VIEW':
                return { ...state, selectedView: action.payload as VIEW_OPTIONS };
            case 'SET_LIST_TITLE':
                return { ...state, listTitle: action.payload };
            case 'SET_USED_POINTS':
                return { ...state, usedPoints: action.payload };
            case 'SET_MAX_POINTS':
                return { ...state, maxPoints: action.payload };
            case 'SET_SELECTED_UNITS':
                return { ...state, selectedUnits: action.payload };
            case 'SET_SELECTED_UNIT_TEMP_ID':
                return { ...state, selectedUnitTempID: action.payload };
            case 'SET_SELECTED_NCUs':
                return { ...state, selectedNCUs: action.payload };
            default:
                throw new Error('Unhandled action type!');
        }
    };

    const [listState, listDispatch] = useReducer(listBuilderReducer, initialState);

    const handleFactionClick = (faction: Faction | null) => {
        if (faction && faction.id === listState.selectedFaction?.id) {
            listDispatch({ type: 'SET_SELECTED_FACTION', payload: null });
            listDispatch({ type: 'SET_SELECTED_COMMANDER', payload: null });
            listDispatch({ type: 'SET_SELECTED_VIEW', payload: 'my_list' });
            listDispatch({ type: 'SET_LIST_TITLE', payload: '' });
            listDispatch({ type: 'SET_USED_POINTS', payload: 0 });
            listDispatch({ type: 'SET_MAX_POINTS', payload: DEFAULT_LIST_POINTS });
            listDispatch({ type: 'SET_SELECTED_NCUs', payload: [] });
            listDispatch({ type: 'SET_SELECTED_UNITS', payload: [] });
            listDispatch({ type: 'SET_SELECTED_UNIT_TEMP_ID', payload: null });
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
        const { type, item, in_list, index } = props;
        if (in_list) {
            if (type === 'unit') {
                let unitToRemoveIndex = listState.selectedUnits.findIndex((unit) => unit.id === item.id);
                if (index !== undefined) { unitToRemoveIndex = index };
                    
                if (unitToRemoveIndex !== -1) {
                    const newSelectedUnits = [...listState.selectedUnits];
                    newSelectedUnits[unitToRemoveIndex].attachments = [];
                    newSelectedUnits.splice(unitToRemoveIndex, 1);
                    listDispatch({ type: 'SET_SELECTED_UNITS', payload: newSelectedUnits });
                }                
            } else if (type === 'ncu') {
                listDispatch({ type: 'SET_SELECTED_NCUs', payload: listState.selectedNCUs.filter((ncu) => ncu.id !== item.id) });
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
                        newSelectedUnits.splice(unitToRemoveIndex, 1);
                        newSelectedUnits.push(newAttachmentsUnit);
                        listDispatch({ type: 'SET_SELECTED_UNITS', payload: newSelectedUnits });
                    }
                }
            }
        } else {
            if (type === 'unit') {
                let newUnit = JSON.parse(JSON.stringify(item)) as Unit;
                newUnit.temp_id = genUniqueID();
                newUnit.attachments = [];
                
                listDispatch({ type: 'SET_SELECTED_UNITS', payload: [...listState.selectedUnits, newUnit] });
            } else if (type === 'ncu') {
                if (!listState.selectedNCUs.find((ncu) => ncu.id === item.id)) {
                    listDispatch({ type: 'SET_SELECTED_NCUs', payload: [...listState.selectedNCUs, item as NCU] });
                }
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

    return { listState, listDispatch, getContent, handleFactionClick, handleCommanderClick, handleListClick };
};

export default useListBuildManager;

export const DEFAULT_LIST_POINTS = 40;
export type VIEW_OPTIONS = 'my_list' | 'units' | 'attachments' | 'ncus';
export type ALL_CONTENT_OPTIONS = 'factions' | 'commanders' | VIEW_OPTIONS;

export type ListState = {
    awaitingResponse: boolean;
    allFactions: Faction[];
    selectedFaction: Faction | null;
    selectedCommander: Commander | null;
    factionCommanders: Commander[] | null;
    factionUnits: Unit[] | null;
    factionAttachments: Attachment[] | null;
    availableAttachments: Attachment[] | null;
    factionNCUs: NCU[] | null;
    selectedView: VIEW_OPTIONS;
    listTitle: string;
    usedPoints: number;
    maxPoints: number;
    selectedUnits: Unit[];
    selectedUnitTempID: string | null;
    selectedNCUs: NCU[];
};

export type ListAction =
    { type: 'SET_AWAITING_RESPONSE'; payload: boolean }
    | { type: 'SET_ALL_FACTIONS'; payload: Faction[] }
    | { type: 'SET_SELECTED_FACTION'; payload: Faction | null }
    | { type: 'SET_SELECTED_COMMANDER'; payload: Commander | null }
    | { type: 'SET_FACTION_COMMANDERS'; payload: Commander[] | null }
    | { type: 'SET_FACTION_UNITS'; payload: Unit[] | null }
    | { type: 'SET_FACTION_ATTACHMENTS'; payload: Attachment[] | null }
    | { type: 'SET_AVAILABLE_ATTACHMENTS'; payload: Attachment[] | null }
    | { type: 'SET_FACTION_NCUs'; payload: NCU[] | null }
    | { type: 'SET_SELECTED_VIEW'; payload: VIEW_OPTIONS }
    | { type: 'SET_LIST_TITLE'; payload: string }
    | { type: 'SET_USED_POINTS'; payload: number }
    | { type: 'SET_MAX_POINTS'; payload: number }
    | { type: 'SET_SELECTED_UNITS'; payload: Unit[] }
    | { type: 'SET_SELECTED_UNIT_TEMP_ID'; payload: string | null }
    | { type: 'SET_SELECTED_NCUs'; payload: NCU[] };

const initialState = {
    awaitingResponse: true,
    allFactions: [],
    selectedFaction: null,
    selectedCommander: null,
    factionCommanders: null,
    factionUnits: null,
    factionAttachments: null,
    availableAttachments: null,
    factionNCUs: null,
    selectedView: 'my_list' as VIEW_OPTIONS,
    listTitle: '',
    usedPoints: 0,
    maxPoints: DEFAULT_LIST_POINTS,
    selectedUnits: [],
    selectedUnitTempID: null,
    selectedNCUs: []
};