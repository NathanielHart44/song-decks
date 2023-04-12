import {
    Backdrop,
    Button,
    Slide,
    SpeedDial,
    SpeedDialIcon,
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
import LoadingBackdrop from "../LoadingBackdrop";
import Iconify from "../Iconify";

// ----------------------------------------------------------------------

type ButtonProps = {
    gameID: string;
};

export default function EndButtons({ gameID }: ButtonProps) {

    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    const navigate = useNavigate();
    const [open, setOpen] = useState<boolean>(false);

    const endSegment = async (type: 'end_round' | 'end_game') => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}${type}/${gameID}/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                if (type === 'end_game') {
                    enqueueSnackbar(res);
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
        <div>
            { awaitingResponse && <LoadingBackdrop /> }
            <div>
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
            </div>
            <SpeedDial
                ariaLabel="End Functions"
                sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: (theme) => theme.zIndex.drawer + 1 }}
                icon={open ? <SpeedDialIcon /> : <Iconify icon={'ic:round-exit-to-app'} width={'50%'} height={'50%'} />}
                onClick={() => { setOpen(!open) }}
                open={open}
            />
        </div>
    )
}