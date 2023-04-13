import CardImg from "src/components/CardImg";
import { CSSProperties, RefObject, useContext, useEffect, useState } from "react";
import HSwipe from "src/components/game-page/HSwipe";
import EndButtons from "src/components/game-page/EndButtons";
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import axios from "axios";
import { MAIN_API } from "src/config";
import { PlayerCard } from "src/@types/types";
import { processTokens } from "src/utils/jwt";
import LoadingBackdrop from "../LoadingBackdrop";
import { Stack, Typography } from "@mui/material";
import { ActionButtons } from "./ActionButtons";
import { MetadataContext } from "src/contexts/MetadataContext";

// ----------------------------------------------------------------------

type GameContentProps = {
    isMobile: boolean;
    sectionRefs: {
        sectionRef1: RefObject<HTMLDivElement>;
        sectionRef2: RefObject<HTMLDivElement>;
        sectionRef3: RefObject<HTMLDivElement>;
        sectionRef4: RefObject<HTMLDivElement>;
    };
};

export default function GameContent({ isMobile, sectionRefs }: GameContentProps) {

    const { gameID = '' } = useParams();
    const { sectionRef1, sectionRef2, sectionRef3, sectionRef4 } = sectionRefs;
    const { enqueueSnackbar } = useSnackbar();

    const { setAllCards, inDeck, inHand, setHandCard, inPlay, setPlayCard, inDiscard, setDiscardCard, selectedCard } = useContext(MetadataContext);

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const sections = [
        { name: "Deck", cards: inDeck.length > 0 ? [inDeck[0]] : [], ref: sectionRef1 },
        { name: "Hand", cards: inHand, ref: sectionRef2 },
        { name: "In Play", cards: inPlay, ref: sectionRef3 },
        { name: "Discard", cards: inDiscard, ref: sectionRef4 },
    ];

    const div_style: CSSProperties = {
        height: isMobile ? '110vh' : '110vh',
        width: '100%',
        display: 'flex',
        scrollSnapStop: 'always',
        scrollSnapAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const getCards = async () => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}get_game_cards/${gameID}/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                setAllCards(res);
            } else { enqueueSnackbar(response.data.response) };
            setAwaitingResponse(false);
        }).catch((error) => {
            console.error(error);
        })
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { processTokens(getCards) }, []);

    const drawCard = async () => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        const formData = new FormData();
        formData.append('game_id', gameID);

        await axios.post(`${MAIN_API.base_url}handle_card_action/draw/`, formData, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                setAllCards(response.data.response);
                const new_card = response.data.new_card;
                enqueueSnackbar("Drew: " + new_card.card_template.card_name);
            } else { enqueueSnackbar(response.data.response) };
            setAwaitingResponse(false);
        }).catch((error) => {
            console.error(error);
        })
    };

    function processDrawCard() {
        if (inDeck.length > 0) { processTokens(drawCard) }
        else { enqueueSnackbar("No cards left in deck") };
    };

    function handleSelectCard(card: PlayerCard, section: string, hide_msg?: boolean) {
        if (section === "Deck") { return }
        else if (section === "Hand") { setHandCard(card) }
        else if (section === "In Play") { setPlayCard(card) }
        else if (section === "Discard") { setDiscardCard(card) };
        if (hide_msg) { return }
        // else { enqueueSnackbar("Selected: " + card.card_template.card_name) };
    };

    return (
        <>
            { awaitingResponse && <LoadingBackdrop /> }
            { !awaitingResponse &&
                (
                    sections.map((section, index) => {
                        return (
                            <div key={section.name + 'S' + index} style={div_style} ref={section.ref} id={section.name}>
                                <Stack spacing={2} justifyContent={'center'} alignItems={'center'} sx={{ width: '100%' }}>
                                    <HSwipe
                                        key={section.name + 'H' + index}
                                        isMobile={isMobile}
                                        cardSwipeFunctions={section.cards.map((card: PlayerCard) => {
                                            const onClickFunc =
                                                (section.name === "Deck") ? processDrawCard : () => handleSelectCard(card, section.name);
                                            return onClickFunc;
                                        })}
                                        cards={section.cards.map((card: PlayerCard) => {

                                            const onClickFunc =
                                            (section.name === "Deck") ? processDrawCard : () => handleSelectCard(card, section.name);

                                            if (!card || !card.card_template) { return <></> };
                                            return (
                                                <CardImg
                                                    img_url={card.card_template.img_url}
                                                    card_name={
                                                    section.name === "Deck"
                                                        ? "CARD BACK"
                                                        : card.card_template.card_name
                                                    }
                                                    hide={section.name === "Deck"}
                                                    has_text={card.play_notes?.length > 0 ? true : false}
                                                    onClickFunc={onClickFunc}
                                                />
                                            );
                                        })}
                                    />
                                    { selectedCard && section.name !== "Deck" &&
                                        <ActionButtons
                                            category={
                                                section.name === "In Play" ? "play" :
                                                section.name.toLowerCase() as "hand" | "discard"
                                            }
                                            selected={section.cards.length === 0 ? false : true}
                                            currentCard={selectedCard}
                                            gameID={gameID}
                                            setAllCards={setAllCards}
                                            setAwaitingResponse={setAwaitingResponse}
                                        />
                                    }
                                </Stack>
                            </div>
                        )
                    })
                )
            }

            <EndButtons gameID={gameID} />
        </>
    );
};

// ----------------------------------------------------------------------

type GroupingHeaderProps = {
    title: string;
    count: number;
};

export function GroupingHeader({ title, count }: GroupingHeaderProps) {
    return (
        <Typography variant={'body1'}>{title} ({count})</Typography>
    );
};