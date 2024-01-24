import { Button, Card, Divider, Grid, Stack, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Page from "src/components/base/Page";
import { PATH_PAGE } from "src/routes/paths";
import HomeWBDisplay from "src/components/workbench/HomeWBDisplay";
import { useContext, useEffect, useState } from "react";
import { MetadataContext } from "src/contexts/MetadataContext";
import Iconify from "src/components/base/Iconify";
import { AppInstallContext } from "src/contexts/AppInstallContext";
import { useApiCall } from "src/hooks/useApiCall";
import { processTokens } from "src/utils/jwt";
import { useSnackbar } from "notistack";

// ----------------------------------------------------------------------

export default function Home() {

    const navigate = useNavigate();
    const { currentUser, isIOS, isPWA } = useContext(MetadataContext);
    const { installPrompt } = useContext(AppInstallContext);
    const theme = useTheme();
    const title_grey = theme.palette.grey[600];
    const { apiCall } = useApiCall();
    const { enqueueSnackbar } = useSnackbar();

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    const [appInstalled, setAppInstalled] = useState<boolean>(false);

    const is_tester = currentUser?.tester;

    const handleInstallClick = () => {
        if (installPrompt) {
            installPrompt.prompt(); // Show the install prompt
            installPrompt.userChoice.then((choiceResult: any) => {
                if (choiceResult.outcome === 'accepted') {
                localStorage.setItem('appInstalled', 'true');
                setAppInstalled(true);
                } else {
                // console.log('User dismissed the install prompt');
                }
            });
        } else {
            console.log('No install prompt found');
        }
    };

    useEffect(() => {
        if (localStorage.getItem('appInstalled') === 'true') {
            setAppInstalled(true);
        }
    }, []);

    const toggleTester = async () => {
        setAwaitingResponse(true);
        const url = 'request_tester';
        apiCall(url, 'GET', null, (data) => {
            enqueueSnackbar(data.detail);
            window.location.reload();
        });
        setAwaitingResponse(false);
    };

    return (
        <Page title="Home">
            <Stack spacing={6} width={'100%'} justifyContent={'center'} alignItems={'center'}>

                {/* <HomeNotices /> */}
                <Typography variant={'h4'}>Welcome to ASOIAF Decks!</Typography>
                <Divider sx={{ width: '65%' }} />

                <Grid container gap={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                        <Button
                            variant={'contained'}
                            onClick={() => {
                                if (is_tester) {
                                    navigate(PATH_PAGE.game_start_router);
                                } else {
                                    navigate(PATH_PAGE.select_deck + '/classic');
                                }
                            }}
                            size={'large'}
                            fullWidth
                        >
                            New Game
                        </Button>
                    </Grid>
                    {is_tester &&
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

                <Grid container gap={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                        <Card sx={{ p: 2, width: '100%' }}>
                            <Stack spacing={2} justifyContent={'center'} alignItems={'center'}>
                                {!is_tester ?
                                    <Typography paragraph sx={{ textAlign: 'center', mb: 0 }}>
                                        Want to test out the newest features?
                                    </Typography> :
                                    <Stack spacing={0.5} justifyContent={'center'} alignItems={'center'}>
                                        <Typography paragraph sx={{ textAlign: 'center', mb: 0 }}>
                                            Visit the 'Testers' page in the nav bar to see what's new!
                                        </Typography>
                                        <Typography variant={'subtitle2'} color={title_grey} paragraph sx={{ textAlign: 'center', mb: 0 }}>
                                            Make sure to report any bugs you find, and let us know what you think!
                                        </Typography>
                                        <Button
                                            variant={'contained'}
                                            onClick={() => { navigate(PATH_PAGE.tester) }}
                                            disabled={awaitingResponse}
                                            fullWidth
                                        >
                                            Tester Page
                                        </Button>
                                    </Stack>
                                }
                                {!is_tester &&
                                    <Button
                                        variant={'contained'}
                                        onClick={() => { processTokens(toggleTester) }}
                                        disabled={awaitingResponse}
                                        fullWidth
                                    >
                                        Become a Tester
                                    </Button>
                                }
                            </Stack>
                        </Card>
                    </Grid>

                    {is_tester && (!isIOS && !isPWA && installPrompt && !appInstalled) &&
                        <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                            <Button
                                variant={'contained'}
                                onClick={handleInstallClick}
                                size={'large'}
                                fullWidth
                            >
                                Install App
                            </Button>
                        </Grid>
                    }
                    {is_tester && (!isPWA && !appInstalled && isIOS) &&
                        <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                            <Card sx={{ p: 2, width: '100%' }}>
                                <Stack spacing={2} justifyContent={'center'} alignItems={'center'}>
                                    <Typography paragraph sx={{ textAlign: 'center', mb: 0 }}>
                                        Want to install the app?
                                    </Typography>
                                    <Stack spacing={0.5} justifyContent={'center'} alignItems={'center'}>
                                        <Stack direction={'row'} spacing={0.5} justifyContent={'center'} alignItems={'center'}>
                                            <Typography variant={'subtitle2'} color={title_grey} sx={{ textAlign: 'center', mb: 0 }}>
                                                Just tap
                                            </Typography>
                                            <Iconify icon={'ion:share-outline'} color={theme.palette.primary.main} width={24} height={24} />
                                        </Stack>
                                        <Typography variant={'subtitle2'} color={title_grey} sx={{ textAlign: 'center', mb: 0 }}>
                                            Then 'Add to Home Screen'
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </Card>
                        </Grid>
                    }
                </Grid>
                <Divider sx={{ width: '65%' }} />

                <HomeWBDisplay />
            </Stack>
        </Page>
    );
};

// ----------------------------------------------------------------------

// function HomeNotices() {
    
//     const theme = useTheme();
//     const title_grey = theme.palette.grey[600];

//     const notices = [
//         "Looking for help managing the card images and testing new features! If you're interested, please reach out!",
//         "The feedback/bug button has been moved to the nav bar.",
//     ];

//     return (
//         <Stack width={'100%'} spacing={1} justifyContent={'center'} alignItems={'center'}>
//             {/* <Typography variant={'h4'}>Welcome to ASOIAF Decks!</Typography> */}
//             {/* <Typography paragraph color={title_grey} sx={{ textAlign: 'center', mb: 0 }}>
//                 This is a fan-made Tactics Deck Manager for the A Song of Ice and Fire: Tabletop Miniatures Game.
//             </Typography> */}

//             <Box width={'100%'} sx={{ py: 2 }} />
//             <Typography variant={'h4'}>Notices:</Typography>
//             <Stack width={'75%'} spacing={4} justifyContent={'center'} alignItems={'center'}>
//                 {notices.map((notice, index) => (
//                     <ListItemCont key={'notice_' + index} content={notice} text_color={title_grey} />
//                 ))}
//             </Stack>
//         </Stack>
//     )
// };

// ----------------------------------------------------------------------

// type ListItemContProps = {
//     content: string;
//     text_color: string;
// };

// function ListItemCont({ content, text_color }: ListItemContProps) {

//     return (
//         <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
//             <Box sx={{ width: 20, height: 20 }}>
//                 <Iconify icon={'eva:info-outline'} color={text_color} width={20} height={20} />
//             </Box>
//             <Card sx={{ p: 2, width: '100%' }}>
//                 <Typography paragraph sx={{ textAlign: 'center', mb: 0 }}>
//                     {content}
//                 </Typography>
//             </Card>
//         </Stack>
//     )
// };