/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Container, Divider, Grid, Stack, Typography } from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Commander, Faction } from "src/@types/types";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";
import Page from "src/components/base/Page";
import { MAIN_API } from "src/config";
import { MetadataContext } from "src/contexts/MetadataContext";
import { PATH_PAGE } from "src/routes/paths";
import { processTokens } from "src/utils/jwt";
import { useApiCall } from "src/hooks/useApiCall";
import { FactionAndCommanderSelect } from "src/components/list-build/FactionAndCommanderSelect";
// import { Searchbar } from "src/components/Searchbar";

// ----------------------------------------------------------------------

export default function SelectDeck() {

    const { enqueueSnackbar } = useSnackbar();
    const { isMobile, currentUser } = useContext(MetadataContext);
    const { apiCall } = useApiCall();
    // Classic-only flow (lists removed)
    const navigate = useNavigate();

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(true);

    const [factions, setFactions] = useState<Faction[]>();
    const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);

    const [allCommanders, setAllCommanders] = useState<Commander[]>();
    const [viewedCommanders, setViewedCommanders] = useState<Commander[] | null>(null);
    const [selectedCommander, setSelectedCommander] = useState<Commander | null>(null);

    const [searchTerm, setSearchTerm] = useState<string>('');

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
        const config = token ? { headers: { Authorization: `JWT ${token}` } } : undefined as any;
        await axios.get(`${MAIN_API.base_url}start_game/${factionId}/${commanderId}/`, config).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                setAwaitingResponse(false);
                navigate(`${PATH_PAGE.game}/${res[0].game.id}`);
            } else {
                enqueueSnackbar(response.data.response);
                setAwaitingResponse(false);
            };
        }).catch((error) => {
            console.error(error);
        })
    };

    useEffect(() => {
        // No auth required to fetch factions/commanders
        getContent('factions');
        getContent('commanders');
    }, []);

    useEffect(() => {
        if (factions && allCommanders) {
            setAwaitingResponse(false);
        };
    }, [factions, allCommanders]);
    
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
