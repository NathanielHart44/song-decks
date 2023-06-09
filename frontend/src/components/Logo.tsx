import { Box, Stack, Typography } from "@mui/material";

// ----------------------------------------------------------------------

export default function Logo() {
    return (
        <Stack direction={'row'} alignItems={'center'}>
            <Box sx={{ maxHeight: '100%', maxWidth: '60px' }}>
                <img src="/icons/throne.png" alt="ASOIAF Logo" loading="lazy" />
            </Box>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, whiteSpace: 'nowrap' }}>
                ASOIAF Decks
            </Typography>
        </Stack>
    )
}