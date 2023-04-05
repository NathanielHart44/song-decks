/* eslint-disable react-hooks/exhaustive-deps */
import { Button, IconButton, Stack, Typography, useTheme } from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { Commander, Faction } from "src/@types/types";
import Page from "src/components/Page";
import { MAIN_API } from "src/config";
import { MetadataContext } from "src/contexts/MetadataContext";
import { processTokens } from "src/utils/jwt";

// ----------------------------------------------------------------------

export default function SelectDeck() {

    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const theme = useTheme();

    const [factions, setFactions] = useState<Faction[]>();
    const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);

    const [allCommanders, setAllCommanders] = useState<Commander[]>();
    const [viewedCommanders, setViewedCommanders] = useState<Commander[] | null>(null);
    const [selectedCommander, setSelectedCommander] = useState<Commander | null>(null);

    const [isValidSubmit, setIsValidSubmit] = useState<boolean>(false);

    const getFactions = async () => {
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}factions/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                setFactions(response.data.response);
            } else { enqueueSnackbar(response.data.message) };
        }).catch((error) => {
            console.error(error);
        })
    };

    const getCommanders = async () => {
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}commanders/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                setAllCommanders(response.data.response);
            } else { enqueueSnackbar(response.data.message) };
        }).catch((error) => {
            console.error(error);
        })
    };

    useEffect(() => {
        processTokens(getFactions);
        processTokens(getCommanders);
    }, []);

    useEffect(() => {
        if (selectedFaction && allCommanders) {
            const filteredCommanders = allCommanders?.filter((commander) => commander.faction.id === selectedFaction.id);
            setViewedCommanders(filteredCommanders);
        }
    }, [selectedFaction]);

    useEffect(() => {
        // set isValidSubmit to true if selectedFaction and selectedCommander are not null
    }, [selectedFaction, selectedCommander]);

    return (
        <Page title="Select Deck">
            <Stack spacing={3} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                <Typography variant={'h2'}>Select Faction & Commander</Typography>
                { factions && factions.map((faction) => (
                    <IconButton
                        key={faction.id}
                        size={"small"}
                        onClick={() => {
                            if (selectedFaction?.id === faction.id) {
                                setSelectedFaction(null);
                                setSelectedCommander(null);
                            } else {
                                setSelectedFaction(faction);
                            }
                        }}
                        disableFocusRipple
                        disableRipple
                        sx={{
                            borderRadius: '50%',
                            border: selectedFaction?.id === faction.id ? `4px solid ${theme.palette.primary.light}` : '4px solid transparent',
                            // background: selectedFaction?.id === faction.id
                            //     ? 'radial-gradient(circle at center, rgba(255, 255, 255, 1) 50%, transparent 70%)'
                            //     : 'transparent',
                            backgroundPosition: 'center',
                            backgroundSize: '100% 100%',
                            backgroundRepeat: 'no-repeat',
                            backgroundClip: 'content-box',
                            '& img': {
                                transition: 'transform 0.3s',
                                transform: selectedFaction?.id === faction.id ? 'scale(1.1)' : 'scale(1)',
                            },
                        }}
                    >
                        <img src={faction.img_url} alt={faction.name} />
                    </IconButton>
                    ))
                }

                { selectedFaction && allCommanders && viewedCommanders && (
                    viewedCommanders.map((commander) => (
                        <IconButton
                            key={commander.id}
                            size={"small"}
                            onClick={() => {
                                if (selectedCommander?.id === commander.id) {
                                    setSelectedCommander(null);
                                } else {
                                    setSelectedCommander(commander);
                                }
                            }}
                            disableFocusRipple
                            disableRipple
                            sx={{
                                borderRadius: '50%',
                                border: selectedCommander?.id === commander.id ? `4px solid ${theme.palette.primary.light}` : '4px solid transparent',
                                // background: selectedCommander?.id === commander.id
                                //     ? 'radial-gradient(circle at center, rgba(255, 255, 255, 1) 50%, transparent 70%)'
                                //     : 'transparent',
                                backgroundPosition: 'center',
                                backgroundSize: '100% 100%',
                                backgroundRepeat: 'no-repeat',
                                backgroundClip: 'content-box',
                                '& img': {
                                    transition: 'transform 0.3s',
                                    transform: selectedCommander?.id === commander.id ? 'scale(1.1)' : 'scale(1)',
                                },
                            }}
                        >
                            <img src={commander.img_url} alt={commander.name} />
                        </IconButton>
                    )
                    ))
                } 
                
            </Stack>
        </Page>
    );
}