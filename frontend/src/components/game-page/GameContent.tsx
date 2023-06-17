import CardImg from "src/components/CardImg";
import { useContext, useEffect, useState } from "react";
import HSwipe from "src/components/game-page/HSwipe";
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import axios from "axios";
import { MAIN_API } from "src/config";
import { PlayerCard } from "src/@types/types";
import { processTokens } from "src/utils/jwt";
import LoadingBackdrop from "../LoadingBackdrop";
import { Typography } from "@mui/material";
import { GameContext } from "src/contexts/GameContext";
import { MetadataContext } from "src/contexts/MetadataContext";

// ----------------------------------------------------------------------

export default function GameContent() {

    const { gameID = '' } = useParams();
    const { isMobile } = useContext(MetadataContext);
    const { enqueueSnackbar } = useSnackbar();

    const { selectedSection, setAllCards, inDeck, inHand, setHandCard, inPlay, setPlayCard, inDiscard, setDiscardCard } = useContext(GameContext);

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

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

    function handleSelectCard(card: PlayerCard, section: string, hide_msg?: boolean) {
        if (section === "Deck") { return }
        else if (section === "Hand") { setHandCard(card) }
        else if (section === "In Play") { setPlayCard(card) }
        else if (section === "Discard") { setDiscardCard(card) };
        if (hide_msg) { return }
        else { enqueueSnackbar("Selected: " + card.card_template.card_name) };
    };

    function getSectionCards(section: string | null) {
        if (section === "Deck" || section === null) { return inDeck }
        else if (section === "Hand") { return inHand }
        else if (section === "In Play") { return inPlay }
        else if (section === "Discard") { return inDiscard }
        else { return [] };
    }

    return (
        <>
            { awaitingResponse && <LoadingBackdrop /> }
            { !awaitingResponse &&
                <HSwipe
                    isMobile={isMobile}
                    cards={getSectionCards(selectedSection).map((card: PlayerCard) => {

                        const onClickFunc  = () => handleSelectCard(card, selectedSection ? selectedSection : "Deck");

                        if (!card || !card.card_template) { return <></> };
                        return (
                            <CardImg
                                img_url={card.card_template.img_url}
                                card_name={
                                selectedSection === "Deck"
                                    ? "CARD BACK"
                                    : card.card_template.card_name
                                }
                                hide={selectedSection === "Deck" || selectedSection === null}
                                has_text={card.play_notes?.length > 0 ? true : false}
                                onClickFunc={onClickFunc}
                            />
                        );
                    })}
                />
            }
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