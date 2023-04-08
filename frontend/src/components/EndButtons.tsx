import { Button, Stack } from "@mui/material"
import axios from "axios";
import { useSnackbar } from "notistack";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MAIN_API } from "src/config";
import { MetadataContext } from "src/contexts/MetadataContext";
import { PATH_PAGE } from "src/routes/paths";
import delay from "src/utils/delay";
import { processTokens } from "src/utils/jwt";
import LoadingBackdrop from "./LoadingBackdrop";

// ----------------------------------------------------------------------

type ButtonProps = {
    gameID: string;
};

export default function EndButtons({ gameID }: ButtonProps) {

    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const [awaitingResponse, setAwaitingResponse] = useState(false);
    const navigate = useNavigate();

    const endSegment = async (type: 'end_round' | 'end_game') => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}${type}/${gameID}/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                if (type === 'end_game') {
                    enqueueSnackbar(res, { autoHideDuration: 2000 });
                    delay(750).then(() => { navigate(PATH_PAGE.home) });
                } else {
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
            <Stack
                direction={'row'}
                spacing={2}
                width={'100%'}
                sx={{
                    position: 'fixed',
                    bottom: 10,
                    left: 0,
                    zIndex: 100,
                    justifyContent: 'center'
                }}
            >
                <Button
                    variant="contained"
                    onClick={() => { processTokens(endSegment, 'end_round') }}
                    sx={{ width: isMobile ? '35%' : '25%' }}
                >
                    End Round
                </Button>
                <Button
                    variant="contained"
                    onClick={() => { processTokens(endSegment, 'end_game') }}
                    sx={{ width: isMobile ? '35%' : '25%' }}
                >
                    End Game
                </Button>
            </Stack>
        </>
    )
}