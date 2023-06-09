import {
    Box,
    Divider,
    Grid,
    Stack,
    SxProps,
    Theme,
    Typography,
    useTheme,
    DialogContent,
    Button,
    Modal,
    Fade,
    SpeedDial,
    SpeedDialIcon
} from "@mui/material"
import axios from "axios";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { MAIN_API } from "src/config";
import { MetadataContext } from "src/contexts/MetadataContext";
import { processTokens } from "src/utils/jwt";
import LoadingBackdrop from "../LoadingBackdrop";
import { PlayerCard } from "src/@types/types";
import { GameContext } from "src/contexts/GameContext";
import Iconify from "../Iconify";

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
    const { setAllCards } = useContext(GameContext);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    const [deckCardOptions, setDeckCardOptions] = useState<PlayerCard[]>([]);
    const [deckDisplayCards, setDeckDisplayCards] = useState<PlayerCard[]>([]);
    const z_index = (open ? 999 : 0);

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
            enqueueSnackbar(error);
            console.error(error);
        })
    };

    const addCardToHand = async (card: PlayerCard) => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';

        const formData = new FormData();
        formData.append('game_id', gameID);
        formData.append('card_id', (card.id).toString());
        formData.append('card_template_id', (card.card_template.id).toString());

        await axios.post(`${MAIN_API.base_url}handle_card_action/place_in_hand/`, formData, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                setAllCards(res);
                getGameCards();
                enqueueSnackbar(`Added ${card.card_template.card_name} to hand.`);
            } else {
                enqueueSnackbar(response.data.response);
            };
        }).catch((error) => {
            console.error(error);
            enqueueSnackbar(error);
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
            <SpeedDial
                ariaLabel="Probability"
                sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: (theme) => theme.zIndex.drawer + z_index }}
                icon={open ? <SpeedDialIcon /> : <Iconify icon={'eva:percent-outline'} width={'45%'} height={'45%'} />}
                onClick={() => { setOpen(!open) }}
                open={open}
            />
            <div>
                <Modal
                    open={open}
                    onClick={() => { setOpen(false) }}
                    closeAfterTransition
                    sx={{ overflow: 'scroll' }}
                >
                    <Fade in={open}>
                        <DialogContent>
                            <Grid
                                container
                                rowSpacing={2}
                                columnSpacing={2}
                                sx={gridContainerStyles}
                            >
                                { rankCards(deckDisplayCards).map((card) => (
                                    <Grid
                                        item
                                        key={card.id + 'card'}
                                        sx={gridItemStyles}
                                    >
                                        <Stack spacing={2} justifyContent={'center'} alignItems={'center'}>
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
                                                        loading="lazy"
                                                        style={{ borderRadius: '6px', width: '100%', height: '100%', objectFit: 'contain' }} />
                                                </Box>
                                                <Stack spacing={1} justifyContent={'center'} alignItems={'center'}>
                                                    <Typography color={theme.palette.text.primary}>{getPercentage(card)}%</Typography>
                                                    <Button
                                                        variant={'contained'}
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            processTokens(addCardToHand, card);
                                                        }}
                                                    >
                                                        Add to Hand
                                                    </Button>
                                                </Stack>
                                            </Stack>
                                            <Divider flexItem />
                                        </Stack>
                                    </Grid>
                                ))}
                            </Grid>
                        </DialogContent>
                    </Fade>
                </Modal>
            </div>
        </div>
    )
}