import { Box, Button, Divider, Grid, Stack, Typography, useTheme } from "@mui/material";
// import axios from "axios";
// import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
// import { Game, UserCardStats } from "src/@types/types";
import Page from "src/components/base/Page";
// import { MAIN_API } from "src/config";
// import { MetadataContext } from "src/contexts/MetadataContext";
import { PATH_PAGE } from "src/routes/paths";
// import { processTokens } from "src/utils/jwt";
// import { RecentGames } from "../components/RecentGames";
// import { PlayerStats } from "../components/PlayerStats";
import HomeWBDisplay from "src/components/workbench/HomeWBDisplay";
import { useContext } from "react";
import { MetadataContext } from "src/contexts/MetadataContext";

// ----------------------------------------------------------------------

export default function Home() {

    const navigate = useNavigate();
    const { currentUser } = useContext(MetadataContext);
    // const { isMobile } = useContext(MetadataContext);
    // const { enqueueSnackbar } = useSnackbar();
    // const [awaitingGames, setAwaitingGames] = useState<boolean>(true);
    // const [awaitingStats, setAwaitingStats] = useState<boolean>(true);
    // const [awaitingResponse, setAwaitingResponse] = useState<boolean>(true);
    // const [recentGames, setRecentGames] = useState<Game[]>([]);
    // const [playerStats, setPlayerStats] = useState<UserCardStats[]>([]);
    
    // const getRecentGames = async () => {
    //     let token = localStorage.getItem('accessToken') ?? '';
    //     await axios.get(`${MAIN_API.base_url}get_recent_games/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
    //         if (response?.data && response.data.success) {
    //             const res = response.data.response;
    //             setRecentGames(res);
    //         } else { enqueueSnackbar(response.data.response) };
    //         setAwaitingGames(false);
    //     }).catch((error) => {
    //         console.error(error);
    //     })
    // };

    // const getPlayerStats = async () => {
    //     let token = localStorage.getItem('accessToken') ?? '';
    //     await axios.get(`${MAIN_API.base_url}get_player_stats/`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
    //         if (response?.data && response.data.success) {
    //             const res = response.data.response;
    //             setPlayerStats(res);
    //         } else { enqueueSnackbar(response.data.response) };
    //         setAwaitingStats(false);
    //     }).catch((error) => {
    //         console.error(error);
    //     })
    // };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    // useEffect(() => { processTokens(getRecentGames); processTokens(getPlayerStats) }, []);

    // useEffect(() => {
    //     if (!awaitingGames && !awaitingStats) { setAwaitingResponse(false) };
    // }, [awaitingGames, awaitingStats]);

    return (
        <Page title="Home">
            <Stack spacing={6} width={'100%'} justifyContent={'center'} alignItems={'center'}>

                <HomeNotices />
                <Divider sx={{ width: '65%' }} />

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
                    {currentUser?.moderator &&
                        <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                            <Button
                                variant={'contained'}
                                onClick={() => { navigate(PATH_PAGE.list_manager) }}
                                size={'large'}
                                fullWidth
                            >
                                Manage Lists
                            </Button>
                        </Grid>
                    }
                </Grid>
                <Divider sx={{ width: '65%' }} />

                {/* { awaitingResponse && <CircularProgress /> } */}
                {/* { !awaitingResponse && playerStats &&
                    <>
                        <PlayerStats stats={playerStats} />
                        <Box width={'75%'}>
                            <Divider flexItem />
                        </Box>
                    </>
                } */}
                {/* { !awaitingResponse && recentGames && <RecentGames isMobile={isMobile} games={recentGames} /> } */}

                <HomeWBDisplay />
            </Stack>
        </Page>
    );
};

// ----------------------------------------------------------------------

function HomeNotices() {
    
    const theme = useTheme();
    const title_grey = theme.palette.grey[600];

    const notices = [
        "- Looking for help managing the card images and testing new features! If you're interested, please reach out!",
        "- The feedback/bug button has been moved to the nav bar.",
    ];

    return (
        <Stack width={'100%'} spacing={1} justifyContent={'center'} alignItems={'center'}>
            {/* <Typography variant={'h4'}>Welcome to ASOIAF Decks!</Typography> */}
            {/* <Typography paragraph color={title_grey} sx={{ textAlign: 'center', mb: 0 }}>
                This is a fan-made Tactics Deck Manager for the A Song of Ice and Fire: Tabletop Miniatures Game.
            </Typography> */}

            <Box width={'100%'} sx={{ py: 2 }} />
            <Typography variant={'h4'}>Notices:</Typography>
            <Stack width={'75%'} spacing={4} justifyContent={'center'} alignItems={'center'}>
                {notices.map((notice, index) => (
                    <ListItemCont key={'notice_' + index} content={notice} text_color={title_grey} />
                ))}
            </Stack>
        </Stack>
    )
};

// ----------------------------------------------------------------------

type ListItemContProps = {
    content: string;
    text_color: string;
};

function ListItemCont({ content, text_color }: ListItemContProps) {

    return (
        <Typography paragraph color={text_color} sx={{ textAlign: 'center', mb: 0 }}>
            {content}
        </Typography>
    )
};