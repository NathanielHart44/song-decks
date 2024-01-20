import {
    Box,
    Dialog,
    Divider,
    Grid,
    Stack,
    SxProps,
    Theme,
    useTheme
} from "@mui/material";
import { CardTemplate, Commander, Faction } from "src/@types/types";
import { SelectableAvatar } from "src/components/base/SelectableAvatar";
import { gridContainerStyles, gridItemStyles } from "../../pages/ListBuilder";
import { useEffect, useState } from "react";
import LoadingBackdrop from "../base/LoadingBackdrop";
import { TacticCardImg } from "../game-page/CardProbability";
import { useApiCall } from "src/hooks/useApiCall";
import { processTokens } from "src/utils/jwt";

// ----------------------------------------------------------------------
type FactionAndCommanderSelectProps = {
    isMobile: boolean;
    allFactions: Faction[];
    selectedFaction: Faction | null;
    selectedCommander: Commander | null;
    factionCommanders: Commander[] | null;
    handleFactionClick: (arg0: Faction | null) => void;
    handleCommanderClick: (arg0: Commander | null) => void;
};
export function FactionAndCommanderSelect(
    { isMobile, allFactions, selectedFaction, selectedCommander, factionCommanders, handleFactionClick, handleCommanderClick }: FactionAndCommanderSelectProps
) {

    const theme = useTheme();

    const [dialogOpen, setDialogOpen] = useState<boolean>(false);

    return (
        <>
            <Stack direction={'row'} spacing={2} justifyContent={'center'} alignItems={'flex-start'}>
                <Stack spacing={1} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    {selectedFaction ?
                        <SelectableAvatar
                            item={selectedFaction}
                            altText={selectedFaction.name}
                            isMobile={isMobile}
                            handleClick={handleFactionClick}
                        /> :
                        <SelectableAvatar
                            item={selectedFaction}
                            altText={'Faction'}
                            defaultIcon={'/icons/throne.png'}
                            isMobile={isMobile}
                            handleClick={handleFactionClick}
                            sxOverrides={{ backgroundColor: theme.palette.grey.default_canvas }}
                        />
                    }
                </Stack>
                <Stack spacing={1} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    {selectedCommander ?
                        <SelectableAvatar
                            item={selectedCommander}
                            altText={selectedCommander.name}
                            isMobile={isMobile}
                            handleClick={handleCommanderClick}
                        /> :
                        <SelectableAvatar
                            item={selectedCommander}
                            altText={'Commander'}
                            defaultIcon={'/icons/crown.svg'}
                            isMobile={isMobile}
                            handleClick={handleCommanderClick}
                            sxOverrides={{ backgroundColor: theme.palette.grey.default_canvas, '& img': { width: '65%', height: '65%' } }}
                        />
                    }
                </Stack>
                <Stack spacing={1} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <SelectableAvatar
                        item={null}
                        altText={'Tactics Cards'}
                        defaultIcon={'mdi:cards'}
                        isMobile={isMobile}
                        handleClick={() => { setDialogOpen(true) }}
                        disabled={!selectedFaction && !selectedCommander}
                        sxOverrides={{ backgroundColor: theme.palette.grey.default_canvas, '& img': { width: '65%', height: '65%' } }}
                    />
                </Stack>
            </Stack>
            <TacticsCardDisplay
                isMobile={isMobile}
                dialogOpen={dialogOpen}
                setDialogOpen={setDialogOpen}
                selectedFaction={selectedFaction}
                selectedCommander={selectedCommander}
            />

            <Divider sx={{ width: '65%' }} />

            {!selectedFaction &&
                <Box sx={{ width: '100%' }}>
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={2}
                        sx={gridContainerStyles}
                    >
                        {allFactions.map((faction) => (
                            <Grid item key={faction.id + 'faction'} sx={gridItemStyles}>
                                <SelectableAvatar
                                    item={faction}
                                    altText={faction.name}
                                    isMobile={isMobile}
                                    handleClick={handleFactionClick}
                                />
                            </Grid>
                        )
                        )}
                    </Grid>
                </Box>
            }
            {selectedFaction && !selectedCommander &&
                <Box sx={{ width: '100%' }}>
                    <Grid
                        container
                        rowSpacing={2}
                        columnSpacing={2}
                        sx={gridContainerStyles}
                    >
                        {factionCommanders?.map((commander) => (
                            <Grid item key={commander.id + 'commander'} sx={gridItemStyles}>
                                <SelectableAvatar
                                    item={commander}
                                    altText={commander.name}
                                    isMobile={isMobile}
                                    handleClick={handleCommanderClick}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            }
        </>
    );
}

// ----------------------------------------------------------------------

type TacticsCardDisplayProps = {
    isMobile: boolean;
    dialogOpen: boolean;
    setDialogOpen: (arg0: boolean) => void;
    selectedFaction: Faction | null;
    selectedCommander: Commander | null;
};

function TacticsCardDisplay({ isMobile, dialogOpen, setDialogOpen, selectedFaction, selectedCommander }: TacticsCardDisplayProps) {

    const theme = useTheme();
    const { apiCall } = useApiCall();

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    const [factionCards, setFactionCards] = useState<CardTemplate[]>([]);
    const [commanderCards, setCommanderCards] = useState<CardTemplate[]>([]);

    const getContent = async (type: 'faction_cards' | 'commander_cards') => {
        if (awaitingResponse) { return };
        setAwaitingResponse(true);

        let url;
        switch (type) {
            case 'faction_cards':
                url = `get_cards_of_faction/${selectedFaction?.id}`;
                break;
            case 'commander_cards':
                url = `get_cards_of_commander/${selectedCommander?.id}`;
                break;
        }
        apiCall(url, 'GET', null, (data) => {
            switch (type) {
                case 'faction_cards':
                    setFactionCards(data);
                    break;
                case 'commander_cards':
                    setCommanderCards(data);
                    break;
            }
        });
        setAwaitingResponse(false);
    };

    useEffect(() => {
        if (dialogOpen) {
            if (selectedFaction) { processTokens(() => { getContent('faction_cards') }) }
            if (selectedCommander) { processTokens(() => { getContent('commander_cards') }) }
        } else {
            if (!selectedFaction) { setFactionCards([]) }
            if (!selectedCommander) { setCommanderCards([]) }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dialogOpen, selectedFaction, selectedCommander]);

    const gridContainerStyles: SxProps<Theme> = {
        justifyContent: 'space-around',
        alignItems: 'center',
        display: 'grid',
        width: '100%',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))'
    };

    const gridItemStyles: SxProps<Theme> = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    };

    return (
        <>
            { awaitingResponse && <LoadingBackdrop /> }
            <Dialog
                open={dialogOpen}
                scroll={"body"}
                fullScreen
                maxWidth={false}
                sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    color: theme.palette.primary.main,
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '.MuiDialog-paperFullScreen': { backgroundColor: 'transparent' },
                    '.MuiDialog-container': { width: '100%' }
                }}
                onClick={() => setDialogOpen(false)}
            >
                <Grid
                    container
                    rowSpacing={2}
                    columnSpacing={2}
                    sx={gridContainerStyles}
                >
                    {commanderCards.map((card) => (
                        <Grid
                            item
                            key={card.id + 'commander_card'}
                            sx={gridItemStyles}
                        >
                            <TacticCardImg
                                isMobile={isMobile}
                                img_url={card.img_url}
                                card_name={card.card_name}
                            />
                        </Grid>
                    ))}
                    {factionCards.map((card) => (
                        <Grid
                            item
                            key={card.id + 'faction_card'}
                            sx={gridItemStyles}
                        >
                            <TacticCardImg
                                isMobile={isMobile}
                                img_url={card.img_url}
                                card_name={card.card_name}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Dialog>
        </>
    );
};
