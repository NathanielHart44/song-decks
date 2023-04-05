import { Button, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import Page from "src/components/Page";
import { PATH_PAGE } from "src/routes/paths";

// ----------------------------------------------------------------------

export default function Home() {
    const navigate = useNavigate();
    return (
        <Page title="Home">
            <Stack spacing={3} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                <Typography variant={'h2'}>Home</Typography>
                <Button variant={'contained'} onClick={() => { navigate(PATH_PAGE.select_deck) }}>
                    Start New Game
                </Button>
            </Stack>
        </Page>
    );
}