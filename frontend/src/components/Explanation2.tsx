import { Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Divider, Stack, Typography, useTheme } from '@mui/material';
import { useContext, useState } from 'react';
import { MetadataContext } from 'src/contexts/MetadataContext';
import { Popup } from './Explanation';
import { useNavigate } from 'react-router-dom';
import { PATH_AUTH } from 'src/routes/paths';

// ----------------------------------------------------------------------

export default function Explanation2 () {

    const theme = useTheme();

    const info = [
        {
          title: 'Manage Your Tactics Deck From Your Browser',
          text: 'No more forgetting your cards at home!',
          image: ['/images/example_1.png'],
        },
        {
          title: 'Built First For Mobile',
          text: 'Designed to be used on your phone or tablet while playing.',
          image: ['/images/example_4.png'],
        },
        {
          title: 'Provides In-Game Insights',
          text: 'The odds of drawing a certain card, how many cards are left, and more!',
          image: ['/images/example_3.png'],
        },
        {
          title: 'Interact With The Most Up-To-Date Cards',
          text: 'Every card for every Faction and Commander is available, and we\'re constantly updating them as new cards are released.',
          image: ['/images/example_2.png'],
        },
        {
          title: 'Designed To Be Flexible',
          text: 'Features such as leaving notes on your cards enable you to use ASOIAF Decks however you need!',
          image: ['/images/example_5.png'],
        },
        {
          title: 'And Much More to Come!',
          text: 'We\'re still working to add new features and make this a useful tool for the community. We want your feedback on what to build next!',
          image: [],
        },
        {
          title: 'Sign Up',
          text: 'Create an account and get started!',
          image: [],
        }
      ];

    return (
        <Stack spacing={6} alignItems={'center'} justifyContent={'center'} sx={{ width: '100%', height: '100%' }}>
            <Stack spacing={1} alignItems={'center'} justifyContent={'center'} sx={{ width: '100%' }}>
                <Typography variant={'h3'} paragraph sx={{ textAlign: 'center', mb: 0 }}>
                    Digital Tactics Deck
                </Typography>
                <Stack alignItems={'center'} justifyContent={'center'} sx={{ width: '50%' }}>
                    <Divider flexItem />
                </Stack>
                <Typography paragraph color={theme.palette.text.secondary} sx={{ textAlign: 'center', mb: 0 }}>
                    An unofficial tool built for A Song of Ice & Fire: Tabletop Miniatures Game.
                </Typography>
            </Stack>

            <Stack
                spacing={6}
                alignItems={'center'}
                sx={{ width: '100%', height: '100%' }}
            >
                {info.map((info_part, index) => (
                    <ExCard key={index} info_part={info_part} />
                ))}
            </Stack>
        </Stack>
    )
}

// ----------------------------------------------------------------------

type ExCardProps = {
    info_part: {
        title: string,
        text: string,
        image: string[],
    }
}

function ExCard({ info_part }: ExCardProps) {

    const { isMobile } = useContext(MetadataContext);
    const theme = useTheme();
    const navigate = useNavigate();
    const has_img = info_part.image.length > 0;

    const [popUpOpen, setPopUpOpen] = useState(false);

    const handleClick = () => { setPopUpOpen(!popUpOpen) };

    return (
        <Card sx={{ maxHeight: 530, width: isMobile ? '80%' : '50%' }}>
            <CardActionArea onClick={handleClick} sx={{ maxHeight: 480 }} disabled={!has_img}>
                { has_img &&
                    <CardMedia
                        component="img"
                        image={info_part.image[0]}
                        alt={info_part.title}
                        sx={{
                            height: 300,
                            objectFit: 'cover',
                        }}
                    />
                }
                <CardContent sx={{ maxHeight: info_part.title === 'Sign Up' ? 110 : 200 }}>
                    { info_part.title !== 'BUTTON' &&
                        <Typography variant={'h6'}>
                            {info_part.title}
                        </Typography>
                    }
                    <Typography paragraph variant="body2" color={theme.palette.text.secondary}>
                        {info_part.text}
                    </Typography>
                </CardContent>
            </CardActionArea>
            { info_part.title === 'Sign Up' &&
                <CardActions sx={{ maxHeight: 50 }}>
                    <Button variant={'contained'} fullWidth onClick={() => { navigate(PATH_AUTH.register) }}>
                        Get Started
                    </Button>
                </CardActions>
            }

            <Popup
                image={info_part.image[0]}
                open={popUpOpen}
                handleClose={handleClick}
            />
        </Card>
    )
}