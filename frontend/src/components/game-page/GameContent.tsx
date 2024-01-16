import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSnackbar } from "notistack";
import axios from "axios";
import { MAIN_API } from "src/config";
import { processTokens } from "src/utils/jwt";
import LoadingBackdrop from "../base/LoadingBackdrop";
import { Box } from "@mui/material";
import { GameContext } from "src/contexts/GameContext";
import HSwipe3 from "./HSwipe3";
import { useWindowDimensions } from "src/utils/useWindowDimensions";
import { MetadataContext } from "src/contexts/MetadataContext";

// ----------------------------------------------------------------------

export default function GameContent() {

    const { gameID = '' } = useParams();
    const { isMobile } = useContext(MetadataContext);
    const { enqueueSnackbar } = useSnackbar();
    const { height, width } = useWindowDimensions();

    const display_ratio = 450 / 320;
    const [calcWidth, setCalcWidth] = useState<number>(0);
    const [calcHeight, setCalcHeight] = useState<number>(0);

    function calculateWidth(w_width: number) {
        const calc_width =
            w_width < 320 ? (w_width * 0.66) :
                w_width < 500 ? (w_width * 0.75) :
                    w_width < 800 ? (w_width * 0.33) : 320;
        return calc_width;
    };

    useEffect(() => {
        const new_width = calculateWidth(width);
        setCalcWidth(new_width);
        setCalcHeight(new_width * display_ratio);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height]);

    const { selectedSection, setAllCards, inDeck, inHand, inPlay, inDiscard } = useContext(GameContext);

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

    function getSectionCards(section: string | null) {
        if (section === "Deck" || section === null) { return inDeck }
        else if (section === "Hand") { return inHand }
        else if (section === "In Play") { return inPlay }
        else if (section === "Discard") { return inDiscard }
        else { return [] };
    };

    return (
        <>
            { awaitingResponse && <LoadingBackdrop /> }
            { (!awaitingResponse && (getSectionCards(selectedSection).length > 0)) &&
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        width: '100%',
                        overflow: 'hidden',
                        pt: 4,
                        // border: '2px solid blue'
                    }}
                >
                    <HSwipe3
                        isMobile={isMobile}
                        card_height={calcHeight}
                        card_width={calcWidth}
                        cards={getSectionCards(selectedSection)}
                    />
                </Box>
            }
        </>
    );
};