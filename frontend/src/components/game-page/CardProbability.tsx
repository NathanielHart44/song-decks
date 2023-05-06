import {
    Dialog,
    Box,
    Divider,
    Grid,
    Slide,
    Stack,
    SxProps,
    Theme,
    Typography,
    useTheme,
    DialogContent
} from "@mui/material"
import axios from "axios";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { MAIN_API } from "src/config";
import { MetadataContext } from "src/contexts/MetadataContext";
import { processTokens } from "src/utils/jwt";
import LoadingBackdrop from "../LoadingBackdrop";
import { PlayerCard } from "src/@types/types";

// ----------------------------------------------------------------------

type ButtonProps = {
    gameID: string;
    deck_count: number;
    open: boolean;
    setOpen: (arg0: boolean) => void;
};

export default function CardProbability({ gameID, deck_count, open, setOpen }: ButtonProps) {

    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    const [deckCardOptions, setDeckCardOptions] = useState<PlayerCard[]>([]);
    const [deckDisplayCards, setDeckDisplayCards] = useState<PlayerCard[]>([]);

    const getGameCards = async () => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}get_game_cards/${gameID}/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                let deck_cards = res.filter((card: PlayerCard) => card.status === 'in-deck');
                localStorage.setItem('deckCount', JSON.stringify(deck_cards.length));
                localStorage.setItem('deckOptions', JSON.stringify(deck_cards));
                setDeckCardOptions(deck_cards);
                deck_cards = deck_cards.filter(
                    (card: PlayerCard, index: number, self: PlayerCard[]) => self.findIndex((c: PlayerCard) => c.card_template.id === card.card_template.id) === index
                );
                localStorage.setItem('deckDisplay', JSON.stringify(deck_cards));
                setDeckDisplayCards(deck_cards);
            } else {
                enqueueSnackbar(response.data.response);
            };
            setAwaitingResponse(false);
        }).catch((error) => {
            console.error(error);
        })
    };

    useEffect(() => {
        if (open) {
            const deckCount = localStorage.getItem('deckCount') ?? '';
            const deckOptions = localStorage.getItem('deckOptions') ?? '';
            const deckDisplay = localStorage.getItem('deckDisplay') ?? '';
            if (deckCount !== deck_count.toString()) {
                processTokens(getGameCards);
            } else {
                setDeckCardOptions(JSON.parse(deckOptions));
                setDeckDisplayCards(JSON.parse(deckDisplay));
            };
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, deck_count]);

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

    const backdropStyles: SxProps<Theme> = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'auto',
    };

    function getPercentage(card: PlayerCard) {
        let cardCount = deckCardOptions.filter((c: PlayerCard) => c.card_template.id === card.card_template.id).length;
        let percentage = (cardCount / deckCardOptions.length) * 100;
        return percentage.toFixed(2);
    }

    function rankCards(cards: PlayerCard[]) {
        const rankedCards = cards.sort((a: PlayerCard, b: PlayerCard) => {
            let aPercentage = parseFloat(getPercentage(a));
            let bPercentage = parseFloat(getPercentage(b));
            return bPercentage - aPercentage;
        });
        return rankedCards;
    }

    return (
        <div>
            { awaitingResponse && <LoadingBackdrop /> }
            <div>
                <Dialog
                    open={open}
                    fullWidth={isMobile}
                    sx={{
                        color: theme.palette.primary.main,
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                    PaperProps={{
                        sx: {
                            backgroundColor: 'transparent',
                        }
                    }}
                    onClick={() => { setOpen(false) }}
                >
                    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
                        <DialogContent>
                            <Grid
                                container
                                rowSpacing={2}
                                columnSpacing={2}
                                sx={gridContainerStyles}
                            >
                                { rankCards(deckDisplayCards).map((card) => (
                                    <Grid item key={card.id + 'card'} sx={gridItemStyles}>
                                        <Stack spacing={2} justifyContent={'center'} alignItems={'center'}>
                                            <Box
                                                sx={{
                                                    height: '100%',
                                                    width: '200px',
                                                    ...!isMobile ? {
                                                        transition: 'transform 0.3s',
                                                        cursor: 'pointer',
                                                        '&:hover': { transform: 'scale(1.075)' },
                                                    } : {},
                                                }}
                                            >
                                                <img
                                                    src={card.card_template.img_url}
                                                    alt={card.card_template.card_name}
                                                    style={{ borderRadius: '6px', width: '100%', height: '100%', objectFit: 'contain' }} />
                                            </Box>
                                            <Typography color={theme.palette.text.primary}>{getPercentage(card)}%</Typography>
                                            <Divider flexItem />
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>
                        </DialogContent>
                    </Slide>
                </Dialog>
            </div>
        </div>
    )
}