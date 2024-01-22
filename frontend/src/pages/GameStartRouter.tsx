import { Button, Container, Stack, Typography } from "@mui/material";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import Page from "src/components/base/Page";
import { MetadataContext } from "src/contexts/MetadataContext";
import { PATH_PAGE } from "src/routes/paths";

// ----------------------------------------------------------------------

export default function GameStartRouter() {

    const navigate = useNavigate();
    const { currentUser } = useContext(MetadataContext);

    return (
        <Page title="New Game">
            <Container maxWidth={false}>
                <Stack justifyContent={'center'} alignItems={'center'} spacing={4} width={'100%'} >
                    <Typography variant={'h3'}>New Game</Typography>
                    <Stack justifyContent={'center'} alignItems={'center'} spacing={2} width={'100%'}>
                        <Button
                            variant={'contained'}
                            onClick={() => { navigate(PATH_PAGE.select_deck + '/classic') }}
                            size={"large"}
                            sx={{ width: '50%' }}
                        >
                            Classic Game
                        </Button>
                        <Typography
                            variant={'body1'}
                            color={'textSecondary'}
                            paragraph
                            textAlign={'center'}
                        >
                            Select a your Faction and Commander, and you're ready to go!
                        </Typography>
                    </Stack>
                    {currentUser?.moderator &&
                        <Stack justifyContent={'center'} alignItems={'center'} spacing={2} width={'100%'}>
                            <Button
                                variant={'contained'}
                                onClick={() => { navigate(PATH_PAGE.select_deck + '/with_list') }}
                                size={"large"}
                                sx={{ width: '50%' }}
                            >
                                Game With List
                            </Button>
                            <Stack justifyContent={'center'} alignItems={'center'} spacing={1} width={'100%'}>
                                <Typography
                                    variant={'body1'}
                                    color={'textSecondary'}
                                    paragraph
                                    textAlign={'center'}
                                    sx={{ mb: 0 }}
                                >
                                    Select a List you've built using the List Builder.
                                </Typography>
                                <Typography
                                    variant={'body1'}
                                    color={'textSecondary'}
                                    paragraph
                                    textAlign={'center'}
                                >
                                    You'll be able to view all of the Unit, Attachment, and NCU cards as you play.
                                </Typography>
                            </Stack>
                        </Stack>
                    }
                </Stack>
            </Container>
        </Page>
    )
}