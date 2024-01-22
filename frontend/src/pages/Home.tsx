import { Box, Button, Card, Divider, Grid, Stack, Typography, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Page from "src/components/base/Page";
import { PATH_PAGE } from "src/routes/paths";
import HomeWBDisplay from "src/components/workbench/HomeWBDisplay";
import { useContext } from "react";
import { MetadataContext } from "src/contexts/MetadataContext";
import Iconify from "src/components/base/Iconify";

// ----------------------------------------------------------------------

export default function Home() {

    const navigate = useNavigate();
    const { currentUser } = useContext(MetadataContext);

    return (
        <Page title="Home">
            <Stack spacing={6} width={'100%'} justifyContent={'center'} alignItems={'center'}>

                <HomeNotices />
                <Divider sx={{ width: '65%' }} />

                <Grid container gap={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                        <Button
                            variant={'contained'}
                            onClick={() => {
                                if (currentUser?.moderator) {
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
        "Looking for help managing the card images and testing new features! If you're interested, please reach out!",
        "The feedback/bug button has been moved to the nav bar.",
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
        <Stack direction={'row'} spacing={1} justifyContent={'center'} alignItems={'center'}>
            <Box sx={{ width: 20, height: 20 }}>
                <Iconify icon={'eva:info-outline'} color={text_color} width={20} height={20} />
            </Box>
            <Card sx={{ p: 2, width: '100%' }}>
                <Typography paragraph sx={{ textAlign: 'center', mb: 0 }}>
                    {content}
                </Typography>
            </Card>
        </Stack>
    )
};