/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Stack } from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Commander, Faction } from "src/@types/types";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";
import Page from "src/components/base/Page";
import { MAIN_API } from "src/config";
import { MetadataContext } from "src/contexts/MetadataContext";
import { PATH_PAGE } from "src/routes/paths";
import delay from "src/utils/delay";
import { processTokens } from "src/utils/jwt";
import { useApiCall } from "src/hooks/useApiCall";
import { FactionAndCommanderSelect } from "src/components/list-build/FactionAndCommanderSelect";

// ----------------------------------------------------------------------

export default function SelectDeck() {

    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const { apiCall } = useApiCall();
    const navigate = useNavigate();

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(true);

    const [factions, setFactions] = useState<Faction[]>();
    const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);

    const [allCommanders, setAllCommanders] = useState<Commander[]>();
    const [viewedCommanders, setViewedCommanders] = useState<Commander[] | null>(null);
    const [selectedCommander, setSelectedCommander] = useState<Commander | null>(null);

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
                    navigate(PATH_PAGE.game + `/${res[0].game.id}`);
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
        });
    }, []);

    useEffect(() => {
        if (factions && allCommanders) { setAwaitingResponse(false) };
    }, [factions, allCommanders]);
    
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

                { selectedFaction && selectedCommander && (
                    <Button
                        variant={'contained'}
                        color={'primary'}
                        size={'large'}
                        onClick={() => { processTokens(beginGame) }}
                        disabled={awaitingResponse}
                    >
                        Confirm
                    </Button>
                )}
                
            </Stack>
        </Page>
    );
};