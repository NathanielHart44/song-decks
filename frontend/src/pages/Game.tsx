import CardImg from "src/components/CardImg";
import HorizontalSwipe from "src/components/HorizontalSwipe";
import Page from "src/components/Page";
// import { Link } from 'react-scroll';
import useScrollSnap from 'react-use-scroll-snap';
import { Box, Button, Stack } from "@mui/material";
import { useRef } from "react";
import { useSnackbar } from 'notistack';
// ----------------------------------------------------------------------

export default function Home() {

    const { enqueueSnackbar } = useSnackbar();
    const num_items = 5;
    const scrollRef = useRef(null);
    useScrollSnap({ ref: scrollRef, duration: 100, delay: 50 });

    return (
        <Page title="Play">
            <Stack spacing={10} ref={scrollRef}>
                { Array.from(Array(num_items).keys()).map((i) => {
                    return (
                        <Box
                            key={i}
                            sx={{
                                height: '100vh',
                                scrollSnapStop: 'always',
                                scrollSnapAlign: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <HorizontalSwipe
                                cards={[
                                    <CardImg faction={'baratheon'} card_name={'baratheon-justice'} />,
                                    <CardImg faction={'baratheon'} card_name={'ours-is-the-fury'} />,
                                    <CardImg faction={'baratheon'} card_name={'oath-of-duty'} />,
                                ]}
                            />
                        </Box>
                        );
                    })
                }
                <Button
                    variant="contained"
                    onClick={() => { enqueueSnackbar('Test') }}
                >
                    Test Snackbar
                </Button>
            </Stack>
        </Page>
    );
}