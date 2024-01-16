import {
    Backdrop,
    Button,
    Slide,
    Stack,
    useTheme
} from "@mui/material"
import axios from "axios";
import { useSnackbar } from "notistack";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MAIN_API } from "src/config";
import { MetadataContext } from "src/contexts/MetadataContext";
import { PATH_PAGE } from "src/routes/paths";
import delay from "src/utils/delay";
import { processTokens } from "src/utils/jwt";
import LoadingBackdrop from "../base/LoadingBackdrop";
import { GameContext } from "src/contexts/GameContext";

// ----------------------------------------------------------------------

type EndBackDropProps = {
    gameID: string;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function EndBackdrop({ gameID, open, setOpen }: EndBackDropProps) {

    const { isMobile } = useContext(MetadataContext);
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    const { gameRound, setGameRound } = useContext(GameContext);

    const endSegment = async (type: 'end_round' | 'end_game') => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}${type}/${gameID}/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                if (type === 'end_game') {
                    enqueueSnackbar(res);
                    localStorage.removeItem('deckDisplay');
                    delay(750).then(() => { navigate(PATH_PAGE.home) });
                } else {
                    setGameRound(gameRound + 1);
                    enqueueSnackbar('Round ended!');
                    setAwaitingResponse(false);
                }
            } else {
                enqueueSnackbar(response.data.response);
                setAwaitingResponse(false);
            };
        }).catch((error) => {
            console.error(error);
        })
    };

    return (
        <>
            { awaitingResponse && <LoadingBackdrop /> }
            <Backdrop
                open={open}
                sx={{ color: theme.palette.primary.main, zIndex: (theme) => theme.zIndex.drawer + 1 }}
                onClick={() => { setOpen(false) }}
            >
                <Slide direction="up" in={open} mountOnEnter unmountOnExit>
                    <Stack
                        direction={'row'}
                        spacing={2}
                        width={'100%'}
                        sx={{
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => { processTokens(endSegment, 'end_round') }}
                            sx={{ width: isMobile ? '35%' : '25%' }}
                        >
                            End Round
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => { processTokens(endSegment, 'end_game') }}
                            sx={{ width: isMobile ? '35%' : '25%' }}
                        >
                            End Game
                        </Button>
                    </Stack>
                </Slide>
            </Backdrop>
        </>
    )
}