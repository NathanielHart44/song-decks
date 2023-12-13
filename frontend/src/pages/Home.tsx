import { Box, Button, CircularProgress, Divider, Grid, Stack } from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Game, UserCardStats } from "src/@types/types";
import Page from "src/components/base/Page";
import { MAIN_API } from "src/config";
import { MetadataContext } from "src/contexts/MetadataContext";
import { PATH_PAGE } from "src/routes/paths";
import { processTokens } from "src/utils/jwt";
import { RecentGames } from "../components/RecentGames";
import { PlayerStats } from "../components/PlayerStats";
import ContactPop from "src/components/ContactPop";

// ----------------------------------------------------------------------

export default function Home() {

    const navigate = useNavigate();
    const { isMobile } = useContext(MetadataContext);
    const { enqueueSnackbar } = useSnackbar();
    const [awaitingGames, setAwaitingGames] = useState<boolean>(true);
    const [awaitingStats, setAwaitingStats] = useState<boolean>(true);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(true);
    const [recentGames, setRecentGames] = useState<Game[]>([]);
    const [playerStats, setPlayerStats] = useState<UserCardStats[]>([]);
    const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);

    const handleFeedback = () => { setFeedbackOpen(!feedbackOpen) };
    
    const getRecentGames = async () => {
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}get_recent_games/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                setRecentGames(res);
            } else { enqueueSnackbar(response.data.response) };
            setAwaitingGames(false);
        }).catch((error) => {
            console.error(error);
        })
    };

    const getPlayerStats = async () => {
        let token = localStorage.getItem('accessToken') ?? '';
        await axios.get(`${MAIN_API.base_url}get_player_stats/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                setPlayerStats(res);
            } else { enqueueSnackbar(response.data.response) };
            setAwaitingStats(false);
        }).catch((error) => {
            console.error(error);
        })
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { processTokens(getRecentGames); processTokens(getPlayerStats) }, []);

    useEffect(() => {
        if (!awaitingGames && !awaitingStats) { setAwaitingResponse(false) };
    }, [awaitingGames, awaitingStats]);

    return (
        <Page title="Home">
            <Stack spacing={6} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                        <Button
                            variant={'contained'}
                            onClick={() => { navigate(PATH_PAGE.select_deck) }}
                            size={'large'}
                            fullWidth
                        >
                            New Game
                        </Button>
                    </Grid>
                    <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                        <Button
                            variant={'contained'}
                            onClick={handleFeedback}
                            size={'large'}
                            fullWidth
                        >
                            Leave Feedback
                        </Button>
                    </Grid>
                    <ContactPop
                        popOpen={feedbackOpen}
                        setPopOpen={setFeedbackOpen}
                    />
                </Grid>
                <Box width={'75%'}>
                    <Divider flexItem />
                </Box>
                { awaitingResponse && <CircularProgress /> }
                { !awaitingResponse && playerStats &&
                    <>
                        <PlayerStats stats={playerStats} />
                        <Box width={'75%'}>
                            <Divider flexItem />
                        </Box>
                    </>
                }
                { !awaitingResponse && recentGames && <RecentGames isMobile={isMobile} games={recentGames} /> }
            </Stack>
        </Page>
    );
};