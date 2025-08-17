/* eslint-disable react-hooks/exhaustive-deps */
import {
    Stack,
    SxProps,
    Theme
} from "@mui/material";
import { useEffect, useReducer } from "react";
import { Commander, Faction, CardTemplate } from "src/@types/types";
import { processTokens } from "src/utils/jwt";
import { ContentTop } from "./ContentTop";

// hooks
import { useApiCall } from "src/hooks/useApiCall";
import useFactions from "src/hooks/useFactions";
import useCommanders from "src/hooks/useCommanders";
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

    | { type: 'SET_MODE'; payload: 'faction_select' | 'type_select' | 'commander_select' | 'commander' };

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

            default:
                throw new Error('Unhandled action type!');
        }
    };    

    const [contentState, contentDispatch] = useReducer(contentReducer, initialState);

    useEffect(() => {
        if (contentState.mode === 'commander_select') {
            fetchAllCommanders();
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
    }, [contentState.selectedFaction]);

    useEffect(() => {
        if (allFactions) { contentDispatch({ type: 'SET_FACTIONS', payload: allFactions }); }
        if (allCommanders) { contentDispatch({ type: 'SET_ALL_COMMANDERS', payload: allCommanders }); }
        if (allFactions && allCommanders) { setAwaitingResponse(false) };
    }, [allFactions, allCommanders]);

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

    // Attachments/NCUs/Units removed from management UI

    useEffect(() => {
        if (!contentState.selectedFaction) {
            contentDispatch({ type: 'SET_MODE', payload: 'faction_select' });
        } else if (contentState.selectedFaction && !contentState.selectedCommander) {
            contentDispatch({ type: 'SET_MODE', payload: 'type_select' });
        } else if (contentState.selectedFaction && contentState.selectedCommander) {
            contentDispatch({ type: 'SET_MODE', payload: 'commander' });
        }
    }, [
        contentState.selectedFaction,
        contentState.selectedCommander
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

    return (
        <>
            { !awaitingResponse &&
                <Stack
                    spacing={3}
                    justifyContent={'center'}
                    alignItems={'center'}
                    width={'100%'}
                >
                    <ContentTop
                        contentState={contentState}
                        contentDispatch={contentDispatch}
                        isMobile={isMobile}
                        handleFactionClick={handleFactionClick}
                        handleCommanderClick={handleCommanderClick}
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
