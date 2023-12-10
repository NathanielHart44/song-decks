/* eslint-disable react-hooks/exhaustive-deps */
import {
    Box,
    Button,
    Divider,
    Grid,
    Stack,
    SxProps,
    Theme,
    Typography,
    keyframes,
    useTheme
} from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useReducer, useState } from "react";
import { Commander, Faction, CardTemplate } from "src/@types/types";
import LoadingBackdrop from "src/components/LoadingBackdrop";
import Page from "src/components/Page";
import { SelectableAvatar } from "src/components/SelectableAvatar";
import EditAddCard from "src/components/edit-contents/EditAddCard";
import EditAddCommander from "src/components/edit-contents/EditAddCommander";
import EditAddFaction from "src/components/edit-contents/EditAddFaction";
import { MAIN_API } from "src/config";
import { MetadataContext } from "src/contexts/MetadataContext";
import { processTokens } from "src/utils/jwt";
import { AddNew } from "../components/edit-contents/AddNew";
import { CardOptions } from "../components/edit-contents/CardOptions";
import UploadAvatarComp from "src/components/UploadAvatarComp";

// ----------------------------------------------------------------------

type State = {
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

type Action =
    | { type: 'SET_FACTIONS'; payload: Faction[] }
    | { type: 'SET_SELECTED_FACTION'; payload: Faction | null }
    | { type: 'SET_FACTION_CARDS'; payload: CardTemplate[] | null }
    | { type: 'SET_ALL_COMMANDERS'; payload: Commander[] }
    | { type: 'SET_VIEWED_COMMANDERS'; payload: Commander[] | null }
    | { type: 'SET_SELECTED_COMMANDER'; payload: Commander | null }
    | { type: 'SET_COMMANDER_CARDS'; payload: CardTemplate[] | null }
    | { type: 'TOGGLE_ADD_NEW_FACTION' }
    | { type: 'TOGGLE_ADD_NEW_COMMANDER' }
    | { type: 'TOGGLE_ADD_NEW_CARD' };

const initialState = {
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

export default function ManageContent() {

    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    
    function contentReducer(state: State, action: Action) {
        switch (action.type) {
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

    const getFactions = async () => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}factions/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                contentDispatch({ type: 'SET_FACTIONS', payload: response.data.response });
            } else { enqueueSnackbar(response.data.response) };
        }).catch((error) => {
            console.error(error);
        })
    };

    const getFactionCards = async () => {
        if (!contentState.selectedFaction) { return };
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        const url = `${MAIN_API.base_url}get_cards_of_faction/${contentState.selectedFaction.id}/`;
        await axios.get(url, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                contentDispatch({ type: 'SET_FACTION_CARDS', payload: response.data.response });
            } else { enqueueSnackbar(response.data.response) };
            setAwaitingResponse(false);
        }).catch((error) => {
            console.error(error);
        })
    };

    const getCommanders = async () => {
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}commanders/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                contentDispatch({ type: 'SET_ALL_COMMANDERS', payload: response.data.response });
            } else { enqueueSnackbar(response.data.response) };
            setAwaitingResponse(false);
        }).catch((error) => {
            console.error(error);
        })
    };

    const getCommanderCards = async () => {
        if (!contentState.selectedCommander) { return };
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        const url = `${MAIN_API.base_url}get_cards_of_commander/${contentState.selectedCommander.id}/`;
        await axios.get(url, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                contentDispatch({ type: 'SET_COMMANDER_CARDS', payload: response.data.response });
            } else { enqueueSnackbar(response.data.response) };
            setAwaitingResponse(false);
        }).catch((error) => {
            console.error(error);
        })
    };

    useEffect(() => { processTokens(getFactions) }, []);

    useEffect(() => { if (contentState.factions) { processTokens(getCommanders) } }, [contentState.factions]);

    useEffect(() => {
        if (contentState.selectedFaction && contentState.allCommanders) {
            const filteredCommanders = contentState.allCommanders?.filter((commander) => commander.faction.id === contentState.selectedFaction?.id);
            contentDispatch({ type: 'SET_VIEWED_COMMANDERS', payload: filteredCommanders });
            processTokens(getFactionCards);
        }
    }, [contentState.selectedFaction]);

    useEffect(() => {
        if (contentState.selectedFaction && contentState.allCommanders) {
            const filteredCommanders = contentState.allCommanders?.filter((commander) => commander.faction.id === contentState.selectedFaction?.id);
            if (!filteredCommanders?.find((commander) => commander.id === contentState.selectedCommander?.id)) {
                contentDispatch({ type: 'SET_SELECTED_COMMANDER', payload: null });
                contentDispatch({ type: 'SET_COMMANDER_CARDS', payload: null });
            }
            contentDispatch({ type: 'SET_VIEWED_COMMANDERS', payload: filteredCommanders });
        }
    }, [contentState.allCommanders, contentState.selectedCommander]);

    useEffect(() => {
        if (contentState.selectedFaction && contentState.selectedCommander) { processTokens(getCommanderCards) };
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
        <Page title="Manage">
            { awaitingResponse && <LoadingBackdrop /> }
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
                        gridContainerStyles={gridContainerStyles}
                        gridItemStyles={gridItemStyles}
                    />

                    <Stack width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        <Box width={'75%'} sx={{ py: 4 }}>
                            <Divider flexItem />
                        </Box>
                    </Stack>

                    <ContentBottom
                        contentState={contentState}
                        contentDispatch={contentDispatch}
                        isMobile={isMobile}
                    />
                </Stack>
            }
        </Page>
    );
};

// ----------------------------------------------------------------------

type ContentTopProps = {
    contentState: State;
    contentDispatch: React.Dispatch<Action>;
    isMobile: boolean;
    handleFactionClick: (faction: Faction) => void;
    handleCommanderClick: (commander: Commander) => void;
    gridContainerStyles: SxProps<Theme>;
    gridItemStyles: SxProps<Theme>;
};

function ContentTop({ contentState, contentDispatch, isMobile, handleFactionClick, handleCommanderClick, gridContainerStyles, gridItemStyles }: ContentTopProps) {

    const theme = useTheme();

    return (
        <Stack spacing={3} width={'100%'} justifyContent={'center'} alignItems={'center'}>
            <Typography variant={'h3'}>Manage Content</Typography>
            <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'flex-start'}>
                {contentState.selectedFaction ?
                    <Stack>
                        <SelectableAvatar
                            item={contentState.selectedFaction}
                            altText={`SELECTED ${contentState.selectedFaction.name}`}
                            isMobile={isMobile}
                            handleClick={handleFactionClick} />
                        <Button
                            size={'small'}
                            onClick={() => {
                                contentDispatch({ type: 'TOGGLE_ADD_NEW_FACTION' });
                            } }
                        >
                            Edit
                        </Button>
                    </Stack> :
                    <SelectableAvatar
                        item={contentState.selectedFaction}
                        altText={'DEFAULT FACTION'}
                        defaultIcon={'/icons/throne.png'}
                        isMobile={isMobile}
                        handleClick={handleFactionClick}
                        sxOverrides={{ backgroundColor: theme.palette.grey.default_canvas }}
                    />
                    }
                {contentState.selectedCommander ?
                    <Stack>
                        <SelectableAvatar
                            item={contentState.selectedCommander}
                            altText={`SELECTED ${contentState.selectedCommander.name}`}
                            isMobile={isMobile}
                            handleClick={handleCommanderClick} />
                        <Button
                            size={'small'}
                            onClick={() => {
                                contentDispatch({ type: 'TOGGLE_ADD_NEW_COMMANDER' });
                            } }
                        >
                            Edit
                        </Button>
                    </Stack> :
                    <SelectableAvatar
                        item={contentState.selectedCommander}
                        altText={'DEFAULT COMMANDER'}
                        defaultIcon={'/icons/crown.svg'}
                        isMobile={isMobile}
                        handleClick={handleCommanderClick}
                        sxOverrides={{ backgroundColor: theme.palette.grey.default_canvas, '& img': { width: '65%', height: '65%' } }}
                    />
                }
            </Stack>

            { contentState.factions && !contentState.selectedFaction &&
                <Box sx={{ width: '100%' }}>
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={2}
                        sx={gridContainerStyles}
                    >
                        {contentState.factions.map((faction) => (
                            <Grid item key={faction.id + 'faction'} sx={gridItemStyles}>
                                <SelectableAvatar
                                    item={faction}
                                    altText={faction.name}
                                    isMobile={isMobile}
                                    handleClick={handleFactionClick} />
                            </Grid>
                        ))}
                        <Grid item sx={gridItemStyles}>
                            <AddNew
                                type={'faction'}
                                isMobile={isMobile}
                                handleClick={() => {
                                    contentDispatch({ type: 'TOGGLE_ADD_NEW_FACTION' });
                                } }
                            />
                        </Grid>
                    </Grid>
                </Box>
            }
            { contentState.factions &&
                <EditAddFaction
                    faction={contentState.selectedFaction ? contentState.selectedFaction : null}
                    factions={contentState.factions}
                    editOpen={contentState.addNewFaction}
                    setEditOpen={() => { contentDispatch({ type: 'TOGGLE_ADD_NEW_FACTION' }); } }
                    setFactions={(factions: Faction[]) => { contentDispatch({ type: 'SET_FACTIONS', payload: factions }); } }
                />
            }

            { contentState.selectedFaction && contentState.allCommanders && contentState.viewedCommanders && !contentState.selectedCommander &&
                <Box sx={{ width: '100%' }}>
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={2}
                        sx={gridContainerStyles}
                    >
                        {contentState.viewedCommanders.map((commander) => (
                            <Grid item key={commander.id + 'commander'} sx={gridItemStyles}>
                                <SelectableAvatar
                                    item={commander}
                                    altText={commander.name}
                                    isMobile={isMobile}
                                    handleClick={handleCommanderClick} />
                            </Grid>
                        ))}
                        <Grid item sx={gridItemStyles}>
                            <AddNew
                                type={'commander'}
                                isMobile={isMobile}
                                handleClick={() => {
                                    contentDispatch({ type: 'TOGGLE_ADD_NEW_COMMANDER' });
                                } } />
                        </Grid>
                    </Grid>
                </Box>
            }
            { contentState.factions && contentState.selectedFaction && contentState.allCommanders &&
                <EditAddCommander
                    commander={contentState.selectedCommander ? contentState.selectedCommander :
                        {
                            id: -1,
                            name: '',
                            img_url: '',
                            faction: contentState.selectedFaction,
                        }}
                    editOpen={contentState.addNewCommander}
                    setEditOpen={() => { contentDispatch({ type: 'TOGGLE_ADD_NEW_COMMANDER' }); } }
                    commanders={contentState.allCommanders}
                    setCommanders={(commanders: Commander[]) => { contentDispatch({ type: 'SET_ALL_COMMANDERS', payload: commanders }); } }
                    factions={contentState.factions}
                />
            }
        </Stack>
    );
}

// ----------------------------------------------------------------------

type ContentBottomProps = {
    contentState: State;
    contentDispatch: React.Dispatch<Action>;
    isMobile: boolean;
};

function ContentBottom({ contentState, contentDispatch, isMobile }: ContentBottomProps) {

    return (
        <Stack width={'100%'} justifyContent={'center'} alignItems={'center'}>
            { (!contentState.selectedFaction && !contentState.selectedCommander) &&
                <UploadAvatarComp />
            }
            { !contentState.commanderCards && contentState.factionCards && contentState.factions && (
                <CardOptions
                    isMobile={isMobile}
                    cards={contentState.factionCards}
                    defaultCards={null}
                    factions={contentState.factions}
                    commanders={contentState.allCommanders ?? []}
                    handleClick={() => {
                        contentDispatch({ type: 'TOGGLE_ADD_NEW_CARD' });
                    } }
                    setCards={(cards: CardTemplate[]) => { contentDispatch({ type: 'SET_FACTION_CARDS', payload: cards }); } }
                />
            )}
            { contentState.commanderCards && contentState.factions && (
                <CardOptions
                    isMobile={isMobile}
                    cards={contentState.commanderCards}
                    defaultCards={contentState.factionCards ? contentState.factionCards : null}
                    factions={contentState.factions}
                    commanders={contentState.allCommanders ?? []}
                    handleClick={() => {
                        contentDispatch({ type: 'TOGGLE_ADD_NEW_CARD' });
                    } }
                    setCards={(cards: CardTemplate[]) => { contentDispatch({ type: 'SET_COMMANDER_CARDS', payload: cards }); } }
                />
            )}
            { contentState.factions && contentState.allCommanders &&
                <EditAddCard
                    card={{
                        id: -1,
                        card_name: '',
                        img_url: '',
                        faction: contentState.selectedFaction ? contentState.selectedFaction : null,
                        commander: contentState.selectedCommander ? contentState.selectedCommander : null,
                        replaces: null,
                    }}
                    cards={contentState.commanderCards ? contentState.commanderCards : contentState.factionCards ? contentState.factionCards : []}
                    defaultCards={contentState.commanderCards ? contentState.commanderCards : contentState.factionCards ? contentState.factionCards : []}
                    factions={contentState.factions}
                    commanders={contentState.allCommanders}
                    editOpen={contentState.addNewCard}
                    setEditOpen={() => { contentDispatch({ type: 'TOGGLE_ADD_NEW_CARD' }); } }
                    setCards={contentState.commanderCards ?
                        (cards: CardTemplate[]) => { contentDispatch({ type: 'SET_COMMANDER_CARDS', payload: cards }); } :
                        (cards: CardTemplate[]) => { contentDispatch({ type: 'SET_FACTION_CARDS', payload: cards }); } }
                />
            }
        </Stack>
    );
};