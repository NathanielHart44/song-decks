/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Container, Divider, Grid, Stack, Typography } from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Commander, Faction, FakeList, List } from "src/@types/types";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";
import Page from "src/components/base/Page";
import { MAIN_API } from "src/config";
import { MetadataContext } from "src/contexts/MetadataContext";
import { PATH_PAGE } from "src/routes/paths";
import { processTokens } from "src/utils/jwt";
import { useApiCall } from "src/hooks/useApiCall";
import { FactionAndCommanderSelect } from "src/components/list-build/FactionAndCommanderSelect";
import { CurrentListsDisplay } from "../components/list-manage/CurrentListsDisplay";
import { parseLists } from "./ListManager";
import { encodeList } from "src/utils/convertList";
import { Searchbar } from "src/components/Searchbar";

// ----------------------------------------------------------------------

export default function SelectDeck() {

    const { enqueueSnackbar } = useSnackbar();
    const { isMobile, currentUser } = useContext(MetadataContext);
    const { apiCall } = useApiCall();
    const { type } = useParams();
    const is_classic = type === 'classic';
    const navigate = useNavigate();

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(true);

    const [factions, setFactions] = useState<Faction[]>();
    const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);

    const [allCommanders, setAllCommanders] = useState<Commander[]>();
    const [viewedCommanders, setViewedCommanders] = useState<Commander[] | null>(null);
    const [selectedCommander, setSelectedCommander] = useState<Commander | null>(null);

    const [allLists, setAllLists] = useState<List[]>();
    const [selectedList, setSelectedList] = useState<List | null>(null);
    const [viewedLists, setViewedLists] = useState<List[]>([]); // used for filters
    const [searchTerm, setSearchTerm] = useState<string>('');

    const getUserLists = async () => {
        const url = `lists/${currentUser?.id}`;
        apiCall(url, 'GET', null, (data: FakeList[]) => {
            const lists = parseLists(data);
            const valid_lists = lists.filter((list) => !list.is_draft);
            setAllLists(valid_lists);
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
                setAwaitingResponse(false);
                let redirect_url = `${PATH_PAGE.game}/${res[0].game.id}`;
                if (selectedList) {
                    const encoded_list = encodeList(selectedList);
                    redirect_url += `/${encoded_list}`;
                }
                navigate(redirect_url);
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
        if (searchTerm) {
            const filteredLists = allLists?.filter((list) => {
                return list.faction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    list.commander.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    list.name.toLowerCase().includes(searchTerm.toLowerCase());
            }) ?? [];
            setViewedLists(filteredLists);
        } else {
            setViewedLists(allLists ?? []);
        };
    }, [searchTerm]);

    useEffect(() => {
        if (selectedList) {
            setSelectedFaction(selectedList.faction);
            setSelectedCommander(selectedList.commander);
        } else {
            setSelectedFaction(null);
            setSelectedCommander(null);
        }
    }, [selectedList]);

    useEffect(() => {
        if (factions && allCommanders && allLists) {
            setAwaitingResponse(false);
            setViewedLists(allLists);
        };
    }, [factions, allCommanders && allLists]);
    
    useEffect(() => {
        if (selectedFaction && allCommanders) {
            const neutralCommanders = allCommanders?.filter((commander) => commander.faction.neutral);
            let filteredCommanders = allCommanders?.filter((commander) => commander.faction.id === selectedFaction.id);
            if (neutralCommanders && selectedFaction && selectedFaction.can_use_neutral && !selectedFaction.neutral) {
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
            <Container maxWidth={false}>
                <Stack spacing={3} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    {is_classic &&
                        <>
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
                            {(!selectedFaction || !selectedCommander) &&
                                <Divider sx={{ width: '65%' }} />
                            }
                            <ConfirmButton
                                handleClick={beginGame}
                                isDisabled={!selectedFaction || !selectedCommander}
                            />
                        </>
                    }
                    {!is_classic &&
                        <>
                            <Typography variant={'h3'}>Select List</Typography>
                            {(!selectedFaction || !selectedCommander || !selectedList) &&
                                <Searchbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} width={'80%'} />
                            }
                            <ConfirmButton
                                handleClick={beginGame}
                                isDisabled={!selectedFaction || !selectedCommander || !selectedList}
                            />
                            <CurrentListsDisplay
                                type={'select'}
                                currentLists={selectedList ? [selectedList] : (viewedLists ? viewedLists : [])}
                                selectedList={selectedList}
                                selectList={setSelectedList}
                            />
                        </>
                    }
                </Stack>
            </Container>
        </Page>
    );
};

// ----------------------------------------------------------------------

type ConfirmButtonProps = {
    handleClick: () => void;
    isDisabled: boolean;
};

function ConfirmButton({ handleClick, isDisabled }: ConfirmButtonProps) {
    return (
        <Grid container gap={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
            <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                <Button
                    variant={'contained'}
                    color={'primary'}
                    size={'large'}
                    onClick={handleClick}
                    fullWidth
                    disabled={isDisabled}
                >
                    Confirm
                </Button>
            </Grid>
        </Grid>
    );
};