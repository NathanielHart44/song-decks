import { Button, Stack } from "@mui/material"
import { useSnackbar } from "notistack";
import { useContext } from "react";
import { MetadataContext } from "src/contexts/MetadataContext";

// ----------------------------------------------------------------------

export default function EndButtons() {

    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);

    return (
        <Stack
            direction={'row'}
            spacing={2}
            width={'100%'}
            sx={{
                position: 'fixed',
                bottom: 20,
                left: 0,
                zIndex: 100,
                justifyContent: 'center'
            }}
        >
            <Button
                variant="contained"
                onClick={() => { enqueueSnackbar('Test') }}
                sx={{ width: isMobile ? '35%' : '25%' }}
            >
                End Round
            </Button>
            <Button
                variant="contained"
                onClick={() => { enqueueSnackbar('Test') }}
                sx={{ width: isMobile ? '35%' : '25%' }}
            >
                End Game
            </Button>
        </Stack>
    )
}