import { Divider, Grid, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Page from "src/components/base/Page";
import { PATH_PAGE } from "src/routes/paths";
import { useContext, useEffect, useState } from "react";
import { MetadataContext } from "src/contexts/MetadataContext";
import { AppInstallContext } from "src/contexts/AppInstallContext";
import { useApiCall } from "src/hooks/useApiCall";
import { processTokens } from "src/utils/jwt";
import { useSnackbar } from "notistack";
import NavButton from "src/components/base/NavButton";
import { MAIN_API } from "src/config";
import ContactPop from "src/components/ContactPop";

// ----------------------------------------------------------------------

export default function Home() {

    const navigate = useNavigate();
    const { currentUser, isIOS, isPWA } = useContext(MetadataContext);
    const { installPrompt } = useContext(AppInstallContext);
    const { apiCall } = useApiCall();
    const { enqueueSnackbar } = useSnackbar();

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    const [appInstalled, setAppInstalled] = useState<boolean>(false);
    const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);

    const is_tester = currentUser?.tester;

    const handleFeedback = () => { setFeedbackOpen(!feedbackOpen) };

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
                <Typography variant={'h3'}>Welcome to ASOIAF Decks!</Typography>
                <Divider sx={{ width: '65%' }} />

                <Grid container gap={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                        <NavButton
                            title={'New Game'}
                            text={'Play a game in either "Classic" or "With List" mode.'}
                            image={`${MAIN_API.asset_url_base}additional-assets/example_6.png`}
                            onClick={() => { navigate(PATH_PAGE.game_start_router) }}
                            isDisabled={awaitingResponse}
                        />
                    </Grid>
                    <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                        <NavButton
                            title={'Manage Lists'}
                            text={'Create, edit, and share your Lists.'}
                            image={`${MAIN_API.asset_url_base}additional-assets/example_11.png`}
                            onClick={() => { navigate(PATH_PAGE.list_manager) }}
                            isDisabled={awaitingResponse}
                        />
                    </Grid>
                    <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                        <NavButton
                            title={'Site Proposals'}
                            text={'Ideas on how to improve the platform? Submit and favorite proposals to help us prioritize.'}
                            image={`${MAIN_API.asset_url_base}additional-assets/example_8.png`}
                            onClick={() => { navigate(PATH_PAGE.proposals) }}
                            isDisabled={awaitingResponse}
                        />
                    </Grid>
                </Grid>
                
                <Divider sx={{ width: '65%' }} />

                <Grid container gap={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                        <NavButton
                            title={is_tester ? 'Tester Page' : 'Become a Tester'}
                            text={
                                is_tester ?
                                "Visit the 'Testers' page in the nav bar to see what's new! Make sure to report any bugs you find, and let us know what you think!" :
                                "Want to test out the newest features? Become a tester to help us test new features before they go live!"
                            }
                            onClick={is_tester ?
                                () => { navigate(PATH_PAGE.tester) } :
                                () => { processTokens(toggleTester) }
                            }
                            isDisabled={awaitingResponse}
                        />
                    </Grid>
                    {is_tester && (!isPWA && !appInstalled) &&
                        <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                            <NavButton
                                title={'Install App'}
                                text={
                                    isIOS ?
                                    'Want to install the app? Just tap the share button, then "Add to Home Screen".' :
                                    installPrompt ? 'Install the app to your device for a better experience.' : 'Unable to install app. Please try again now.'
                                }
                                image={`${MAIN_API.asset_url_base}additional-assets/example_14.png`}
                                onClick={isIOS ? () => { } : handleInstallClick}
                                isDisabled={awaitingResponse || (isIOS && !isPWA) || !installPrompt}
                            />
                        </Grid>
                    }
                    {is_tester && (isPWA || appInstalled || !installPrompt) &&
                        <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                            <NavButton
                                title={'App Installed'}
                                text={'The app has been installed.'}
                                image={`${MAIN_API.asset_url_base}additional-assets/example_14.png`}
                                onClick={() => { }}
                                isDisabled={awaitingResponse || appInstalled || isPWA}
                            />
                        </Grid>
                    }
                    <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                        <NavButton
                            title={'Feedback'}
                            text={'Have any feedback or bug reports? Let us know!'}
                            onClick={handleFeedback}
                            isDisabled={awaitingResponse}
                        />
                    </Grid>
                </Grid>
                <ContactPop
                    popOpen={feedbackOpen}
                    setPopOpen={setFeedbackOpen}
                />
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