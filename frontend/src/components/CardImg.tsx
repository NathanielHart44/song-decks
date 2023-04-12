import { Box, Stack, useTheme } from "@mui/material";

// ----------------------------------------------------------------------

type Props = {
    img_url: string;
    card_name: string;
    hide?: boolean;
    onClickFunc?: () => void;
}

export default function CardImg({ img_url, card_name, hide, onClickFunc }: Props) {

    const theme = useTheme();

    return (
        <Box
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            sx={{ cursor: 'pointer' }}
            onClick={onClickFunc}
            flexDirection={'column'}
        >
            <Stack spacing={hide ? 0 : 1} justifyContent={'center'} alignItems={'center'} sx={{ width: '100%' }}>
                <img
                    src={img_url}
                    alt={card_name}
                    style={{
                        border: `1px solid ${theme.palette.grey[900]}`,
                        borderRadius: '6px',
                    }}
                />
                {hide && (
                    <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        bgcolor={theme.palette.grey.default_canvas}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        borderRadius="6px"
                        sx={{
                            border: `2px solid ${theme.palette.grey[900]}`,
                        }}
                    >
                        <img
                            src="/icons/crown.svg"
                            alt="Overlay SVG"
                        />
                    </Box>
                )}
            </Stack>
        </Box>
    )
}