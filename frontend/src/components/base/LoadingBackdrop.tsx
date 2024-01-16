import { useTheme } from '@mui/material';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

export default function LoadingBackdrop() {

    const theme = useTheme();

    return (
        <div>
            <Backdrop
                sx={{ color: theme.palette.primary.main, zIndex: (theme) => theme.zIndex.drawer + 1000 }}
                open={true}
            >
                <CircularProgress />
            </Backdrop>
        </div>
    );
}