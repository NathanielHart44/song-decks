/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Divider, Stack, Switch, Typography } from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Commander, Faction, FakeList, List } from "src/@types/types";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";
import Page from "src/components/base/Page";
import { MAIN_API } from "src/config";
import { MetadataContext } from "src/contexts/MetadataContext";
import { PATH_PAGE } from "src/routes/paths";
import delay from "src/utils/delay";
import { processTokens } from "src/utils/jwt";
import { useApiCall } from "src/hooks/useApiCall";
import { FactionAndCommanderSelect } from "src/components/list-build/FactionAndCommanderSelect";
import { CurrentListsDisplay } from "../components/list-manage/CurrentListsDisplay";
import { parseLists } from "./ListManager";
import { encodeList } from "src/utils/convertList";

// ----------------------------------------------------------------------

export default function SelectDeck() {

    const { enqueueSnackbar } = useSnackbar();
    const { isMobile, currentUser } = useContext(MetadataContext);
    const { apiCall } = useApiCall();
    const navigate = useNavigate();

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(true);

    const [factions, setFactions] = useState<Faction[]>();
    const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);

    const [allCommanders, setAllCommanders] = useState<Commander[]>();
    const [viewedCommanders, setViewedCommanders] = useState<Commander[] | null>(null);
    const [selectedCommander, setSelectedCommander] = useState<Commander | null>(null);

    const [currentLists, setCurrentLists] = useState<List[]>();
    const [playWithLists, setPlayWithLists] = useState<boolean>(false);
    const [selectedList, setSelectedList] = useState<List | null>(null);
    const [availableLists, setAvailableLists] = useState<List[] | null>(null);

    const getUserLists = async () => {
        const url = `lists/${currentUser?.id}`;
        apiCall(url, 'GET', null, (data: FakeList[]) => {
            const lists = parseLists(data);
            setCurrentLists(lists);
        });
    };

    const getContent = async (type: 'factions' | 'commanders') => {
        apiCall(type, 'GET', null, (data) => {
            switch (type) {
                case 'factions':
                    setFactions(data);
                    break;
                case 'commanders':
                    setAllCommanders(data);
                    break;
            }
        });
    };

    const beginGame = async () => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        const factionId = selectedFaction?.id;
        const commanderId = selectedCommander?.id;
        await axios.get(`${MAIN_API.base_url}start_game/${factionId}/${commanderId}/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                delay(750).then(() => {
                    setAwaitingResponse(false);
                    let redirect_url = `${PATH_PAGE.game}/${res[0].game.id}`;
                    if (selectedList) {
                        const encoded_list = encodeList(selectedList);
                        redirect_url += `/${encoded_list}`;
                    }
                    navigate(redirect_url);
                });
            } else {
                enqueueSnackbar(response.data.response);
                setAwaitingResponse(false);
            };
        }).catch((error) => {
            console.error(error);
        })
    };

    useEffect(() => {
        processTokens(() => {
            getContent('factions');
            getContent('commanders');
            getUserLists();
        });
    }, []);

    useEffect(() => {
        if (currentLists && selectedFaction && selectedCommander) {
            let availableLists = currentLists.filter((list) => list.faction.id === selectedFaction?.id && list.commander.id === selectedCommander?.id);
            setAvailableLists(availableLists);
        } else {
            setAvailableLists(null);
        }
    }, [currentLists, selectedFaction, selectedCommander]);

    useEffect(() => {
        if (factions && allCommanders && currentLists) { setAwaitingResponse(false) };
    }, [factions, allCommanders && currentLists]);
    
    useEffect(() => {
        if (selectedFaction && allCommanders) {
            const neutralCommanders = allCommanders?.filter((commander) => commander.faction.neutral);
            let filteredCommanders = allCommanders?.filter((commander) => commander.faction.id === selectedFaction.id);
            if (neutralCommanders && selectedFaction && selectedFaction.name !== 'Free Folk' && selectedFaction.name !== 'Neutral') {
                filteredCommanders = filteredCommanders?.concat(neutralCommanders);
            }
            setViewedCommanders(filteredCommanders);
        }
    }, [selectedFaction]);

    function handleFactionClick(faction: Faction) {
        if (selectedFaction && (selectedFaction?.id === faction.id)) {
            setSelectedFaction(null);
            setSelectedCommander(null);
        } else {
            setSelectedFaction(faction);
        }    
    }

    function handleCommanderClick(commander: Commander) {
        if (selectedCommander && (selectedCommander?.id === commander.id)) {
            setSelectedCommander(null);
        } else {
            setSelectedCommander(commander);
        }
    }

    return (
        <Page title="Select Deck">
            { awaitingResponse && <LoadingBackdrop /> }
            <Stack spacing={3} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                <Typography variant={'h3'}>Select Deck</Typography>
                {factions &&
                    <FactionAndCommanderSelect
                        isMobile={isMobile}
                        allFactions={factions}
                        selectedFaction={selectedFaction}
                        selectedCommander={selectedCommander}
                        factionCommanders={viewedCommanders}
                        handleFactionClick={handleFactionClick as any}
                        handleCommanderClick={handleCommanderClick as any}
                    />
                }

                {selectedFaction && selectedCommander &&
                    <>
                        <Button
                            variant={'contained'}
                            color={'primary'}
                            size={'large'}
                            onClick={() => { processTokens(beginGame) }}
                            disabled={awaitingResponse}
                        >
                            Confirm
                        </Button>
                        {currentUser?.moderator &&
                            <Stack direction={'row'} alignItems={'center'}>
                                <Typography>Play With List</Typography>
                                <Switch
                                    checked={playWithLists}
                                    onChange={() => { setPlayWithLists(!playWithLists) }}
                                />
                            </Stack>
                        }
                        {playWithLists &&
                            <>
                                <Divider sx={{ width: '65%' }} />
                                <Typography variant={'h4'}>
                                    {selectedList ? 'Selected List' : 'Available Lists'}
                                </Typography>
                                <CurrentListsDisplay
                                    type={'select'}
                                    currentLists={selectedList ? [selectedList] : (availableLists ? availableLists : [])}
                                    selectedList={selectedList}
                                    selectList={setSelectedList}
                                />
                            </>
                        }
                    </>
                }                
            </Stack>
        </Page>
    );
};