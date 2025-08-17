import { Container, Grid, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import NavButton from "src/components/base/NavButton";
import Page from "src/components/base/Page";
import { MAIN_API } from "src/config";
import { PATH_PAGE } from "src/routes/paths";

// ----------------------------------------------------------------------

export default function GameStartRouter() {

    const navigate = useNavigate();

    return (
        <Page title="New Game">
            <Container maxWidth={false}>
                <Stack justifyContent={'center'} alignItems={'center'} spacing={4} width={'100%'} >
                    <Grid container gap={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        <Grid item xs={8} sm={6} md={4} lg={3} xl={3}>
                            <NavButton
                                title={'Classic Game'}
                                text={"Select a Faction and Commander, and you're ready to go!"}
                                onClick={() => { navigate(PATH_PAGE.select_deck + '/classic') }}
                                image={`${MAIN_API.asset_url_base}additional-assets/example_6.png`}
                            />
                        </Grid>
                        
                    </Grid>
                </Stack>
            </Container>
        </Page>
    )
}
