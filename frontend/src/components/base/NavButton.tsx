import { Box, Button, Card, CardActionArea, CardContent, CardMedia, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from '@mui/material/styles';

// ----------------------------------------------------------------------

type Props = {
    title: string;
    text: string;
    onClick: () => void;
    image?: string;
    isDisabled?: boolean;
};

// ----------------------------------------------------------------------

export default function NavButton({ title, text, image, onClick, isDisabled }: Props) {

    const theme = useTheme();
    // const title_color = theme.palette.grey.default_canvas;
    const title_color = isDisabled ? theme.palette.grey.default_canvas : theme.palette.primary.main;

    return (
        <Card
            sx={{
                width: '100%',
                border: 2,
                borderColor: title_color,
                height: { xs: 280, xl: 320 }
            }}
        >
            <CardActionArea onClick={onClick} disabled={isDisabled}>
                {image ?
                    <>
                        <CardMedia
                            component="img"
                            image={image}
                            alt={title}
                            sx={{
                            height: { xs: 280, xl: 320 },
                            objectFit: 'cover',
                            }}
                        />
                        <CardContent
                            sx={{
                                bottom: 0,
                                width: '100%',
                                zIndex: 9,
                                textAlign: 'left',
                                position: 'absolute',
                                backgroundColor: (theme) => alpha(theme.palette.grey[900], 0.9),
                            }}
                        >
                            <ContentDiv
                                title={title}
                                text={text}
                                isDisabled={isDisabled}
                            />
                        </CardContent>
                    </> :
                    <CardContent sx={{ height: { xs: 280, xl: 320 } }}>
                        <ContentDiv
                            title={title}
                            text={text}
                            isDisabled={isDisabled}
                        />
                    </CardContent>
                }
            </CardActionArea>
        </Card>
    );
};

// ----------------------------------------------------------------------

type ContentDivProps = {
    title: string;
    text: string;
    isDisabled?: boolean;
};

export function ContentDiv({ title, text, isDisabled }: ContentDivProps) {

    return (
        <Stack justifyContent={'space-between'} width={'100%'} height={'100%'} spacing={1}>
            <Stack width={'100%'}>
                <Typography variant="h5" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="body2">
                    {text}
                </Typography>
            </Stack>
            <Button
                component={Box}
                variant={'contained'}
                disabled={isDisabled}
                fullWidth
                size={'small'}
            >
                {title}
            </Button>
        </Stack>
    );
};