/* eslint-disable react-hooks/exhaustive-deps */
import {
    Stack,
    SxProps,
    Theme,
    keyframes
} from "@mui/material";
import { useEffect, useReducer } from "react";
import { Commander, Faction, CardTemplate, Attachment, NCU } from "src/@types/types";
import { processTokens } from "src/utils/jwt";
import { ContentTop } from "./ContentTop";

// hooks
import { useApiCall } from "src/hooks/useApiCall";
import useFactions from "src/hooks/useFactions";
import useCommanders from "src/hooks/useCommanders";
import useAttachments from "src/hooks/useAttachments";
import useNCUs from "src/hooks/useNCUs";
import useUnits from "src/hooks/useUnits";
import ContentBottom from "./ContentBottom";

// ----------------------------------------------------------------------

export type State = {
    mode: string;
    factions: Faction[];
    selectedFaction: Faction | null;
    factionCards: CardTemplate[] | null;
    allCommanders: Commander[];
    viewedCommanders: Commander[] | null;
    selectedCommander: Commander | null;
    commanderCards: CardTemplate[] | null;
    addNewFaction: boolean;
    addNewCommander: boolean;
    addNewCard: boolean;
    
    allAttachments: Attachment[];
    factionAttachments: Attachment[] | null;
    selectedAttachment: Attachment | null;
    addNewAttachment: boolean;

    allNCUs: NCU[];
    factionNCUs: NCU[] | null;
    selectedNCU: NCU | null;
    addNewNCU: boolean;

    allUnits: any[];
    factionUnits: any[] | null;
    selectedUnit: any | null;
    addNewUnit: boolean;
};

export type Action =
    | { type: 'SET_FACTIONS'; payload: Faction[] }
    | { type: 'SET_SELECTED_FACTION'; payload: Faction | null }
    | { type: 'SET_FACTION_CARDS'; payload: CardTemplate[] | null }
    | { type: 'SET_ALL_COMMANDERS'; payload: Commander[] }
    | { type: 'SET_VIEWED_COMMANDERS'; payload: Commander[] | null }
    | { type: 'SET_SELECTED_COMMANDER'; payload: Commander | null }
    | { type: 'SET_COMMANDER_CARDS'; payload: CardTemplate[] | null }
    | { type: 'TOGGLE_ADD_NEW_FACTION' }
    | { type: 'TOGGLE_ADD_NEW_COMMANDER' }
    | { type: 'TOGGLE_ADD_NEW_CARD' }

    | { type: 'SET_MODE'; payload: 'faction_select' | 'type_select' | 'commander_select' | 'commander' | 'attachments' | 'ncus' | 'units' }
    
    | { type: 'SET_ALL_ATTACHMENTS'; payload: Attachment[] }
    | { type: 'SET_FACTION_ATTACHMENTS'; payload: Attachment[] | null }
    | { type: 'SET_SELECTED_ATTACHMENT'; payload: Attachment | null }
    | { type: 'TOGGLE_ADD_NEW_ATTACHMENT' }
    
    | { type: 'SET_ALL_NCUs'; payload: NCU[] }
    | { type: 'SET_FACTION_NCUs'; payload: NCU[] | null }
    | { type: 'SET_SELECTED_NCU'; payload: NCU | null }
    | { type: 'TOGGLE_ADD_NEW_NCU' }
    
    | { type: 'SET_ALL_UNITS'; payload: any[] }
    | { type: 'SET_FACTION_UNITS'; payload: any[] | null }
    | { type: 'SET_SELECTED_UNIT'; payload: any | null }
    | { type: 'TOGGLE_ADD_NEW_UNIT' };

const initialState = {
    mode: 'faction',
    factions: [],
    selectedFaction: null,
    factionCards: null,
    allCommanders: [],
    viewedCommanders: null,
    selectedCommander: null,
    commanderCards: null,
    addNewFaction: false,
    addNewCommander: false,
    addNewCard: false,
    
    allAttachments: [],
    factionAttachments: null,
    selectedAttachment: null,
    addNewAttachment: false,

    allNCUs: [],
    factionNCUs: null,
    selectedNCU: null,
    addNewNCU: false,

    allUnits: [],
    factionUnits: null,
    selectedUnit: null,
    addNewUnit: false,
};

// ----------------------------------------------------------------------

type Props = {
    isMobile: boolean;
    awaitingResponse: boolean;
    setAwaitingResponse: (arg0: boolean) => void;
};

export default function ManageCardContent({ isMobile, awaitingResponse, setAwaitingResponse }: Props) {

    const { apiCall } = useApiCall();
    const { allFactions } = useFactions();
    const { allCommanders, fetchAllCommanders } = useCommanders();
    const { allAttachments, fetchAllAttachments } = useAttachments();
    const { allNCUs, fetchAllNCUs } = useNCUs();
    const { allUnits, fetchAllUnits } = useUnits();

    function contentReducer(state: State, action: Action) {
        switch (action.type) {
            case 'SET_MODE':
                return { ...state, mode: action.payload };
            case 'SET_FACTIONS':
                return { ...state, factions: action.payload };
            case 'SET_SELECTED_FACTION':
                return { ...state, selectedFaction: action.payload };
            case 'SET_FACTION_CARDS':
                return { ...state, factionCards: action.payload };
            case 'SET_ALL_COMMANDERS':
                return { ...state, allCommanders: action.payload };
            case 'SET_VIEWED_COMMANDERS':
                return { ...state, viewedCommanders: action.payload };
            case 'SET_SELECTED_COMMANDER':
                return { ...state, selectedCommander: action.payload };
            case 'SET_COMMANDER_CARDS':
                return { ...state, commanderCards: action.payload };
            case 'TOGGLE_ADD_NEW_FACTION':
                return { ...state, addNewFaction: !state.addNewFaction };
            case 'TOGGLE_ADD_NEW_COMMANDER':
                return { ...state, addNewCommander: !state.addNewCommander };
            case 'TOGGLE_ADD_NEW_CARD':
                return { ...state, addNewCard: !state.addNewCard };

            case 'SET_ALL_ATTACHMENTS':
                return { ...state, allAttachments: action.payload };
            case 'SET_FACTION_ATTACHMENTS':
                return { ...state, factionAttachments: action.payload };
            case 'SET_SELECTED_ATTACHMENT':
                return { ...state, selectedAttachment: action.payload };
            case 'TOGGLE_ADD_NEW_ATTACHMENT':
                return { ...state, addNewAttachment: !state.addNewAttachment };

            case 'SET_ALL_NCUs':
                return { ...state, allNCUs: action.payload };
            case 'SET_FACTION_NCUs':
                return { ...state, factionNCUs: action.payload };
            case 'SET_SELECTED_NCU':
                return { ...state, selectedNCU: action.payload };
            case 'TOGGLE_ADD_NEW_NCU':
                return { ...state, addNewNCU: !state.addNewNCU };

            case 'SET_ALL_UNITS':
                return { ...state, allUnits: action.payload };
            case 'SET_FACTION_UNITS':
                return { ...state, factionUnits: action.payload };
            case 'SET_SELECTED_UNIT':
                return { ...state, selectedUnit: action.payload };
            case 'TOGGLE_ADD_NEW_UNIT':
                return { ...state, addNewUnit: !state.addNewUnit };
            default:
                throw new Error('Unhandled action type!');
        }
    };    

    const [contentState, contentDispatch] = useReducer(contentReducer, initialState);

    useEffect(() => {
        if (contentState.mode === 'commander_select') {
            fetchAllCommanders();
        } else if (contentState.mode === 'attachments') {
            fetchAllAttachments();
        } else if (contentState.mode === 'ncus') {
            fetchAllNCUs();
        } else if (contentState.mode === 'units') {
            fetchAllUnits();
        }
    }, [contentState.mode]);

    const getContent = async (type: 'faction_cards' | 'commander_cards') => {
        if (awaitingResponse) { return };
        setAwaitingResponse(true);

        let url;
        switch (type) {
            case 'faction_cards':
                url = `get_cards_of_faction/${contentState.selectedFaction?.id}`;
                break;
            case 'commander_cards':
                url = `get_cards_of_commander/${contentState.selectedCommander?.id}`;
                break;
        }
        apiCall(url, 'GET', null, (data) => {
            switch (type) {
                case 'faction_cards':
                    contentDispatch({ type: 'SET_FACTION_CARDS', payload: data });
                    break;
                case 'commander_cards':
                    contentDispatch({ type: 'SET_COMMANDER_CARDS', payload: data });
                    break;
            }
        });
        setAwaitingResponse(false);
    };

    useEffect(() => {
        if (!contentState.selectedFaction) return;
        if (contentState.allCommanders) {
            const filteredCommanders = contentState.allCommanders?.filter((commander) => commander.faction.id === contentState.selectedFaction?.id);
            contentDispatch({ type: 'SET_VIEWED_COMMANDERS', payload: filteredCommanders });
            processTokens(() => { getContent('faction_cards') });
        }
        if (contentState.allAttachments) {
            const filteredAttachments = contentState.allAttachments?.filter((attachment) => attachment.faction.id === contentState.selectedFaction?.id);
            contentDispatch({ type: 'SET_FACTION_ATTACHMENTS', payload: filteredAttachments });
        }
        if (contentState.allNCUs) {
            const filteredNCUs = contentState.allNCUs?.filter((ncu) => ncu.faction.id === contentState.selectedFaction?.id);
            contentDispatch({ type: 'SET_FACTION_NCUs', payload: filteredNCUs });
        }
        if (contentState.allUnits) {
            const filteredUnits = contentState.allUnits?.filter((unit) => unit.faction.id === contentState.selectedFaction?.id);
            contentDispatch({ type: 'SET_FACTION_UNITS', payload: filteredUnits });
        }
    }, [contentState.selectedFaction]);

    useEffect(() => {
        if (allFactions) { contentDispatch({ type: 'SET_FACTIONS', payload: allFactions }); }
        if (allCommanders) { contentDispatch({ type: 'SET_ALL_COMMANDERS', payload: allCommanders }); }
        if (allAttachments) { contentDispatch({ type: 'SET_ALL_ATTACHMENTS', payload: allAttachments }); }
        if (allNCUs) { contentDispatch({ type: 'SET_ALL_NCUs', payload: allNCUs }); }
        if (allUnits) { contentDispatch({ type: 'SET_ALL_UNITS', payload: allUnits }); }
        if (allFactions && allCommanders && allAttachments && allNCUs && allUnits) { setAwaitingResponse(false) };
    }, [allFactions, allCommanders, allAttachments, allNCUs, allUnits]);

    useEffect(() => {
        if (!contentState.selectedFaction) return;
        if (contentState.allCommanders) {
            const filteredCommanders = contentState.allCommanders?.filter((commander) => commander.faction.id === contentState.selectedFaction?.id);
            if (!filteredCommanders?.find((commander) => commander.id === contentState.selectedCommander?.id)) {
                contentDispatch({ type: 'SET_SELECTED_COMMANDER', payload: null });
                contentDispatch({ type: 'SET_COMMANDER_CARDS', payload: null });
            }
            contentDispatch({ type: 'SET_VIEWED_COMMANDERS', payload: filteredCommanders });
        }
    }, [contentState.allCommanders, contentState.selectedCommander]);

    useEffect(() => {
        if (contentState.selectedFaction && contentState.selectedCommander) { processTokens(() => { getContent('commander_cards') }) };
    }, [contentState.selectedCommander]);

    function handleFactionClick(faction: Faction) {
        if (contentState.selectedFaction && (contentState.selectedFaction?.id === faction.id)) {
            contentDispatch({ type: 'SET_SELECTED_FACTION', payload: null });
            contentDispatch({ type: 'SET_FACTION_CARDS', payload: null });
            contentDispatch({ type: 'SET_SELECTED_COMMANDER', payload: null });
            contentDispatch({ type: 'SET_COMMANDER_CARDS', payload: null });
            contentDispatch({ type: 'SET_FACTION_ATTACHMENTS', payload: null });
            contentDispatch({ type: 'SET_SELECTED_ATTACHMENT', payload: null });
            contentDispatch({ type: 'SET_FACTION_NCUs', payload: null });
            contentDispatch({ type: 'SET_SELECTED_NCU', payload: null });
            contentDispatch({ type: 'SET_FACTION_UNITS', payload: null });
            contentDispatch({ type: 'SET_SELECTED_UNIT', payload: null });
        } else {
            contentDispatch({ type: 'SET_SELECTED_FACTION', payload: faction });
        }    
    }

    function handleCommanderClick(commander: Commander) {
        if (contentState.selectedCommander && (contentState.selectedCommander?.id === commander.id)) {
            contentDispatch({ type: 'SET_SELECTED_COMMANDER', payload: null });
            contentDispatch({ type: 'SET_COMMANDER_CARDS', payload: null });
        } else {
            contentDispatch({ type: 'SET_SELECTED_COMMANDER', payload: commander });
        }
    }

    function handleAttachmentClick(attachment: Attachment) {
        if (contentState.selectedAttachment && (contentState.selectedAttachment?.id === attachment.id)) {
            contentDispatch({ type: 'SET_SELECTED_ATTACHMENT', payload: null });
        } else {
            contentDispatch({ type: 'SET_SELECTED_ATTACHMENT', payload: attachment });
        }
    }

    function handleNcuClick(ncu: NCU) {
        if (contentState.selectedNCU && (contentState.selectedNCU?.id === ncu.id)) {
            contentDispatch({ type: 'SET_SELECTED_NCU', payload: null });
        } else {
            contentDispatch({ type: 'SET_SELECTED_NCU', payload: ncu });
        }
    }

    function handleUnitClick(unit: any) {
        if (contentState.selectedUnit && (contentState.selectedUnit?.id === unit.id)) {
            contentDispatch({ type: 'SET_SELECTED_UNIT', payload: null });
        } else {
            contentDispatch({ type: 'SET_SELECTED_UNIT', payload: unit });
        }
    }

    useEffect(() => {
        if (!contentState.selectedFaction) {
            contentDispatch({ type: 'SET_MODE', payload: 'faction_select' });
        } else if (contentState.selectedFaction && !contentState.selectedCommander && !contentState.selectedAttachment && !contentState.selectedNCU && !contentState.selectedUnit) {
            contentDispatch({ type: 'SET_MODE', payload: 'type_select' });
        } else if (contentState.selectedFaction && contentState.selectedCommander) {
            contentDispatch({ type: 'SET_MODE', payload: 'commander' });
        } else if (contentState.selectedFaction && contentState.selectedAttachment) {
            contentDispatch({ type: 'SET_MODE', payload: 'attachments' });
        } else if (contentState.selectedFaction && contentState.selectedNCU) {
            contentDispatch({ type: 'SET_MODE', payload: 'ncus' });
        } else if (contentState.selectedFaction && contentState.selectedUnit) {
            contentDispatch({ type: 'SET_MODE', payload: 'units' });
        }
    }, [
        contentState.selectedFaction,
        contentState.selectedCommander,
        contentState.selectedAttachment,
        contentState.selectedNCU,
        contentState.selectedUnit
    ]);

    const gridContainerStyles: SxProps<Theme> = {
        justifyContent: 'space-around',
        alignItems: 'center',
        display: 'grid',
        width: '100%',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))'
    };

    const gridItemStyles: SxProps<Theme> = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        height: '100%',
    };

    function getFadeIn () {
        return keyframes({
            '0%': {
                opacity: 0,
            },
            '100%': {
                opacity: 1,
            },
        });
    };

    return (
        <>
            { !awaitingResponse &&
                <Stack
                    spacing={3}
                    justifyContent={'center'}
                    alignItems={'center'}
                    width={'100%'}
                    sx={{ animation: `${getFadeIn()} 2s` }}
                >
                    <ContentTop
                        contentState={contentState}
                        contentDispatch={contentDispatch}
                        isMobile={isMobile}
                        handleFactionClick={handleFactionClick}
                        handleCommanderClick={handleCommanderClick}
                        handleAttachmentClick={handleAttachmentClick}
                        handleNcuClick={handleNcuClick}
                        handleUnitClick={handleUnitClick}
                        gridContainerStyles={gridContainerStyles}
                        gridItemStyles={gridItemStyles}
                    />

                    <ContentBottom
                        contentState={contentState}
                        contentDispatch={contentDispatch}
                        isMobile={isMobile}
                    />
                </Stack>
            }
        </>
    );
};