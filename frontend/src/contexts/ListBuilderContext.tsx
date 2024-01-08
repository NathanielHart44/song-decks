import { createContext, ReactNode, useReducer } from "react";
import { Attachment, Commander, Faction, NCU, Unit } from "src/@types/types";

// ----------------------------------------------------------------------

type Props = { children: ReactNode };

export const DEFAULT_LIST_POINTS = 40;

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
    selectedView: 'settings' as VIEW_OPTIONS,
    listTitle: '',
    usedPoints: 0,
    maxPoints: DEFAULT_LIST_POINTS,
    selectedUnits: [],
    selectedUnitTempID: null,
    selectedNCUs: []
};

// ----------------------------------------------------------------------

export const ListBuilderContext = createContext<{
    listState: ListState;
    listDispatch: React.Dispatch<ListAction>;
}>
({
    listState: initialState,
    listDispatch: () => null
});

export default function ListBuilderProvider({ children }: Props) {

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

    return (
        <ListBuilderContext.Provider
            value={{
                listState,
                listDispatch
            }}
        >
            {children}
        </ListBuilderContext.Provider>
    );
}

// ----------------------------------------------------------------------

export type VIEW_OPTIONS = 'my_list' | 'units' | 'attachments' | 'ncus' | 'settings';
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