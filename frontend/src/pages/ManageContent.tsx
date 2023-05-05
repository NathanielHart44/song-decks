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
import { useContext, useEffect, useState } from "react";
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

// ----------------------------------------------------------------------

export default function ManageContent() {

    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const theme = useTheme();
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const [factions, setFactions] = useState<Faction[]>();
    const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
    const [factionCards, setFactionCards] = useState<CardTemplate[] | null>(null);

    const [allCommanders, setAllCommanders] = useState<Commander[]>();
    const [viewedCommanders, setViewedCommanders] = useState<Commander[] | null>(null);
    const [selectedCommander, setSelectedCommander] = useState<Commander | null>(null);
    const [commanderCards, setCommanderCards] = useState<CardTemplate[] | null>(null);

    const [addNewFaction, setAddNewFaction] = useState<boolean>(false);
    const [addNewCommander, setAddNewCommander] = useState<boolean>(false);
    const [addNewCard, setAddNewCard] = useState<boolean>(false);

    const getFactions = async () => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}factions/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                setFactions(response.data.response);
            } else { enqueueSnackbar(response.data.response) };
        }).catch((error) => {
            console.error(error);
        })
    };

    const getFactionCards = async () => {
        if (!selectedFaction) { return };
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}get_cards_of_faction/${selectedFaction.id}/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                setFactionCards(response.data.response);
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
                setAllCommanders(response.data.response);
            } else { enqueueSnackbar(response.data.response) };
            setAwaitingResponse(false);
        }).catch((error) => {
            console.error(error);
        })
    };

    const getCommanderCards = async () => {
        if (!selectedCommander) { return };
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}get_cards_of_commander/${selectedCommander.id}/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                setCommanderCards(response.data.response);
            } else { enqueueSnackbar(response.data.response) };
            setAwaitingResponse(false);
        }).catch((error) => {
            console.error(error);
        })
    };

    useEffect(() => { processTokens(getFactions) }, []);

    useEffect(() => { if (factions) { processTokens(getCommanders) } }, [factions]);

    useEffect(() => {
        if (selectedFaction && allCommanders) {
            const filteredCommanders = allCommanders?.filter((commander) => commander.faction.id === selectedFaction.id);
            setViewedCommanders(filteredCommanders);
            processTokens(getFactionCards);
        }
    }, [selectedFaction]);

    useEffect(() => {
        if (selectedFaction && allCommanders) {
            const filteredCommanders = allCommanders?.filter((commander) => commander.faction.id === selectedFaction.id);
            if (!filteredCommanders?.find((commander) => commander.id === selectedCommander?.id)) {
                setSelectedCommander(null);
                setCommanderCards(null);
            }
            setViewedCommanders(filteredCommanders);
        }
    }, [allCommanders, selectedCommander]);

    useEffect(() => {
        if (selectedFaction && selectedCommander) { processTokens(getCommanderCards) };
    }, [selectedCommander]);

    function handleFactionClick(faction: Faction) {
        if (selectedFaction && (selectedFaction?.id === faction.id)) {
            setSelectedFaction(null);
            setFactionCards(null);
            setSelectedCommander(null);
            setCommanderCards(null);
        } else {
            setSelectedFaction(faction);
        }    
    }

    function handleCommanderClick(commander: Commander) {
        if (selectedCommander && (selectedCommander?.id === commander.id)) {
            setSelectedCommander(null);
            setCommanderCards(null);
        } else {
            setSelectedCommander(commander);
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
        alignItems: 'center',
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
                    key={
                        selectedFaction ?
                            selectedCommander ?
                                `${selectedCommander.name}-${selectedCommander.id}-${selectedFaction.id}` :
                                `${selectedFaction.name}-${selectedFaction.id}` :
                            'default'
                    }
                    sx={{ animation: `${getFadeIn()} 2s` }}
                >
                    <Stack spacing={3} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        <Typography variant={'h3'}>Manage Content</Typography>
                        <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'center'}>
                            { selectedFaction ?
                                <Stack>
                                    <SelectableAvatar
                                        item={selectedFaction}
                                        altText={`SELECTED ${selectedFaction.name}`}
                                        isMobile={isMobile}
                                        handleClick={handleFactionClick}
                                    />
                                    <Button size={'small'} onClick={() => { setAddNewFaction(true) }}>Edit</Button>
                                </Stack> :
                                <SelectableAvatar
                                    item={selectedFaction}
                                    altText={'DEFAULT FACTION'}
                                    defaultIcon={'/icons/throne.png'}
                                    isMobile={isMobile}
                                    handleClick={handleFactionClick}
                                    sxOverrides={{ backgroundColor: theme.palette.grey.default_canvas }}
                                />
                            }
                            { selectedCommander ?
                                <Stack>
                                    <SelectableAvatar
                                        item={selectedCommander}
                                        altText={`SELECTED ${selectedCommander.name}`}
                                        isMobile={isMobile}
                                        handleClick={handleCommanderClick}
                                    />
                                    <Button size={'small'} onClick={() => { setAddNewCommander(true) }}>Edit</Button>
                                </Stack> :
                                <SelectableAvatar
                                    item={selectedCommander}
                                    altText={'DEFAULT COMMANDER'}
                                    defaultIcon={'/icons/crown.svg'}
                                    isMobile={isMobile}
                                    handleClick={handleCommanderClick}
                                    sxOverrides={{ backgroundColor: theme.palette.grey.default_canvas, '& img': { width: '65%', height: '65%' } }}
                                />
                            }
                        </Stack>

                        { factions && !selectedFaction && (
                            <Grid
                                container
                                rowSpacing={2}
                                columnSpacing={2}
                                sx={gridContainerStyles}
                            >
                                { factions.map((faction) => (
                                    <Grid item key={faction.id + 'faction'} sx={gridItemStyles}>
                                        <SelectableAvatar
                                            item={faction}
                                            altText={faction.name}
                                            isMobile={isMobile}
                                            handleClick={handleFactionClick}
                                        />
                                    </Grid>
                                ))}
                                <Grid item sx={gridItemStyles}>
                                    <AddNew
                                        type={'faction'}
                                        isMobile={isMobile}
                                        handleClick={() => { setAddNewFaction(true) }}
                                    />
                                </Grid>
                            </Grid>
                        )}
                        { factions &&
                            <EditAddFaction
                                faction={selectedFaction ? selectedFaction : null}
                                factions={factions}
                                editOpen={addNewFaction}
                                setEditOpen={setAddNewFaction}
                                setFactions={setFactions}
                            />
                        }

                        { selectedFaction && allCommanders && viewedCommanders && !selectedCommander && (
                            <Grid
                                container
                                rowSpacing={2}
                                columnSpacing={2}
                                sx={gridContainerStyles}
                            >
                                { viewedCommanders.map((commander) => (
                                    <Grid item key={commander.id + 'commander'} sx={gridItemStyles}>
                                        <SelectableAvatar
                                            item={commander}
                                            altText={commander.name}
                                            isMobile={isMobile}
                                            handleClick={handleCommanderClick}
                                        />
                                    </Grid>
                                ))}
                                <Grid item sx={gridItemStyles}>
                                    <AddNew
                                        type={'commander'}
                                        isMobile={isMobile}
                                        handleClick={() => { setAddNewCommander(true) }}
                                    />
                                </Grid>
                            </Grid>
                        )}
                        { factions && selectedFaction && allCommanders &&
                            <EditAddCommander
                                commander={
                                    selectedCommander ? selectedCommander :
                                    {
                                        id: -1,
                                        name: '',
                                        img_url: '',
                                        faction: selectedFaction,
                                    }
                                }
                                editOpen={addNewCommander}
                                setEditOpen={setAddNewCommander}
                                commanders={allCommanders}
                                setCommanders={setAllCommanders}
                                factions={factions}
                            />
                        }
                    </Stack>

                    <Stack width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        <Box width={'75%'} sx={{ py: 4 }}>
                            <Divider flexItem />
                        </Box>
                    </Stack>

                    <Stack width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        { !commanderCards && factionCards && factions && (
                            <CardOptions
                                isMobile={isMobile}
                                cards={factionCards}
                                factions={factions}
                                commanders={allCommanders ?? []}
                                handleClick={() => { setAddNewCard(true) }}
                                setCards={setFactionCards}
                            />
                        )}
                        { commanderCards && factions && (
                            <CardOptions
                                isMobile={isMobile}
                                cards={commanderCards}
                                factions={factions}
                                commanders={allCommanders ?? []}
                                handleClick={() => { setAddNewCard(true) }}
                                setCards={setCommanderCards}
                            />
                        )}
                        { factions && allCommanders &&
                            <EditAddCard
                                card={{
                                    id: -1,
                                    card_name: '',
                                    img_url: '',
                                    faction: selectedFaction ? selectedFaction : null,
                                    commander: selectedCommander ? selectedCommander : null,
                                }}
                                cards={commanderCards ? commanderCards : factionCards ? factionCards : []}
                                factions={factions}
                                commanders={allCommanders}
                                editOpen={addNewCard}
                                setEditOpen={setAddNewCard}
                                setCards={commanderCards ? setCommanderCards : setFactionCards}
                            />
                        }
                    </Stack>
                </Stack>
            }
        </Page>
    );
};