/* eslint-disable react-hooks/exhaustive-deps */
import { Avatar, Box, Button, Grid, Stack, SxProps, Theme, Typography, useTheme } from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Commander, Faction } from "src/@types/types";
import LoadingBackdrop from "src/components/LoadingBackdrop";
import Page from "src/components/Page";
import { MAIN_API } from "src/config";
import { MetadataContext } from "src/contexts/MetadataContext";
import { PATH_PAGE } from "src/routes/paths";
import delay from "src/utils/delay";
import { processTokens } from "src/utils/jwt";

// ----------------------------------------------------------------------

export default function SelectDeck() {

    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const theme = useTheme();
    const navigate = useNavigate();

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(true);

    const [factions, setFactions] = useState<Faction[]>();
    const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);

    const [allCommanders, setAllCommanders] = useState<Commander[]>();
    const [viewedCommanders, setViewedCommanders] = useState<Commander[] | null>(null);
    const [selectedCommander, setSelectedCommander] = useState<Commander | null>(null);

    const getFactions = async () => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}factions/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                setFactions(response.data.response);
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
        }).catch((error) => {
            console.error(error);
        })
    };

    const beginGame = async () => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        const factionId = selectedFaction?.id;
        const commanderId = selectedCommander?.id;
        await axios.get(`${MAIN_API.base_url}start_game/${factionId}/${commanderId}/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                localStorage.setItem('CurrentCards', JSON.stringify(response.data.response));
                delay(500).then(() => navigate(PATH_PAGE.game));
            } else {
                enqueueSnackbar(response.data.response);
                setAwaitingResponse(false);
            };
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

    return (
        <Page title="Select Deck">
            { awaitingResponse && <LoadingBackdrop /> }
            <Stack spacing={3} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                <Typography variant={'h3'}>Select Faction & Commander</Typography>
                <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'center'}>
                    { selectedFaction ?
                        <SelectableAvatar
                            item={selectedFaction}
                            altText={`SELECTED ${selectedFaction.name}`}
                            isMobile={isMobile}
                            handleClick={handleFactionClick}
                        /> :
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
                        <SelectableAvatar
                            item={selectedCommander}
                            altText={`SELECTED ${selectedCommander.name}`}
                            isMobile={isMobile}
                            handleClick={handleCommanderClick}
                        /> :
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

                {  factions && !selectedFaction && (
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={2}
                        sx={gridContainerStyles}
                    >
                        {[...factions, ...factions, ...factions, ...factions, ...factions, ...factions,...factions].map((faction) => (
                            <Grid item key={faction.id} sx={gridItemStyles}>
                                <SelectableAvatar
                                    key={faction.id}
                                    item={faction}
                                    altText={faction.name}
                                    isMobile={isMobile}
                                    handleClick={handleFactionClick}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}

                { selectedFaction && allCommanders && viewedCommanders && !selectedCommander && (
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={2}
                        sx={gridContainerStyles}
                    >
                        {[...viewedCommanders, ...viewedCommanders, ...viewedCommanders, ...viewedCommanders, ...viewedCommanders, ...viewedCommanders,...viewedCommanders].map((commander) => (
                            <Grid item key={commander.id} sx={gridItemStyles}>
                                <SelectableAvatar
                                    key={commander.id}
                                    item={commander}
                                    altText={commander.name}
                                    isMobile={isMobile}
                                    handleClick={handleCommanderClick}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}

                { selectedFaction && selectedCommander && (
                    <Button variant={'contained'} color={'primary'} onClick={beginGame}>
                        Confirm
                    </Button>
                )}
                
            </Stack>
        </Page>
    );
}

// ----------------------------------------------------------------------

type SelectableAvatarProps = {
    altText: string;
    handleClick: (arg0: any) => void;
    item: any;
    isMobile: boolean;
    defaultIcon?: string;
    sxOverrides?: SxProps<Theme>;
};

function SelectableAvatar({ altText, handleClick, item, isMobile, defaultIcon, sxOverrides }: SelectableAvatarProps) {

    const avatar_size = isMobile ? 100 : 80;

    const avatarStyles = {
        width: avatar_size,
        height: avatar_size,
        ...!isMobile ? {
            transition: 'transform 0.3s',
            cursor: 'pointer',
            '&:hover': { transform: 'scale(1.1)' },
        } : {},
        ...sxOverrides,
    };

    return (
        <Box>
            <Stack spacing={1} justifyContent={'center'} alignItems={'center'}>
                {item ? (
                    <Avatar
                        alt={altText}
                        src={item.img_url}
                        variant={'rounded'}
                        sx={avatarStyles}
                        onClick={() => { handleClick(item) }}
                    />
                ) : (
                    <Avatar
                        alt={altText}
                        variant={'rounded'}
                        sx={avatarStyles}
                        onClick={() => { handleClick(item) }}
                    >
                        <img src={defaultIcon} alt={altText} />
                    </Avatar>
                )}
                <Typography variant={'caption'}>
                    {(item && !altText.includes('SELECTED')) ? item.name : ''}
                </Typography>
            </Stack>
        </Box>
    );
};