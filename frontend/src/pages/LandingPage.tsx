import { Button, Container, Divider, Stack, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { PATH_AUTH } from 'src/routes/paths';
import Page from 'src/components/base/Page';
import { MAIN_API } from 'src/config';
import AppFeatured from 'src/components/carousel/AppFeatured';

// ----------------------------------------------------------------------

export type LandingPageInfo = {
    title: string,
    text: string,
    image: string[],
};

// ----------------------------------------------------------------------

export default function LandingPage() {

    const theme = useTheme();
    const navigate = useNavigate();

    const info: LandingPageInfo[] = [
        {
          title: 'Manage Your Tactics Deck From The Browser',
          text: 'No more forgetting your cards at home!',
          image: [`${MAIN_API.asset_url_base}additional-assets/example_1.png`],
        },
        {
          title: 'Built First For Mobile',
          text: 'Designed to be used on your phone or tablet while playing.',
          image: [`${MAIN_API.asset_url_base}additional-assets/example_4.png`],
        },
        {
          title: 'Provides In-Game Insights',
          text: 'The odds of drawing a certain card, how many cards are left, and more!',
          image: [`${MAIN_API.asset_url_base}additional-assets/example_3.png`],
        },
        {
          title: 'Interact With The Most Up-To-Date Cards',
          text: 'Every card for every Faction and Commander is available, and we\'re constantly updating them as new cards are released.',
          image: [`${MAIN_API.asset_url_base}additional-assets/example_2.png`],
        },
        {
          title: 'Designed To Be Flexible',
          text: 'Features such as leaving notes on your cards enable you to use ASOIAF Decks however you need!',
          image: [`${MAIN_API.asset_url_base}additional-assets/example_5.png`],
        },
        {
          title: 'And Much More to Come!',
          text: 'We\'re still working to add new features and make this a useful tool for the community. We want your feedback on what to build next!',
          image: [],
        }
    ];

    return (
        <Page title="Home">
            <Container maxWidth={'sm'}>
                <Stack spacing={6} alignItems={'center'} justifyContent={'center'} sx={{ width: '100%', height: '100%' }}>
                    <Stack spacing={1} alignItems={'center'} justifyContent={'center'} sx={{ width: '100%' }}>
                        <Typography variant={'h3'} paragraph sx={{ textAlign: 'center', mb: 0 }}>
                            Digital Tactics Deck
                        </Typography>
                        <Stack alignItems={'center'} justifyContent={'center'} sx={{ width: '50%' }}>
                            <Divider flexItem />
                        </Stack>
                        <Typography paragraph color={theme.palette.text.secondary} sx={{ textAlign: 'center', mb: 0 }}>
                            The tactics deck management tool for the ASOIAF miniatures game.
                        </Typography>
                    </Stack>

                    <AppFeatured items={info} />

                    <Stack spacing={2} alignItems={'center'} justifyContent={'center'} sx={{ width: '100%' }}>
                        <Typography paragraph color={theme.palette.text.secondary} sx={{ textAlign: 'center', mb: 0 }}>
                            Create an account and get started!
                        </Typography>
                        <Button variant={'contained'} fullWidth onClick={() => { navigate(PATH_AUTH.register) }}>
                            Get Started
                        </Button>
                    </Stack>
                </Stack>
            </Container>
        </Page>
    );
};