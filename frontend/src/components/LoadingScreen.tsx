import { CircularProgress, useTheme } from "@mui/material";

export default function LoadingScreen() {

    const theme = useTheme();

    return (
        <div
            style={{
                right: 0,
                bottom: 0,
                zIndex: 99999,
                width: '100%',
                height: '100%',
                position: 'fixed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: theme.palette.background.default,
            }}
        >
            <CircularProgress />
        </div>
    )
}