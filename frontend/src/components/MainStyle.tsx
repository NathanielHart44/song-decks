import { styled } from "@mui/material";

// ----------------------------------------------------------------------

type Props ={
    children: React.ReactNode;
}

export default function MainStyle({ children }: Props) {

    const HEADER = {
        MOBILE_HEIGHT: 88,
        MOBILE_OFFSET_HEIGHT: 88 - 32,
        MAIN_DESKTOP_HEIGHT: 88,
        DASHBOARD_DESKTOP_HEIGHT: 92,
        DASHBOARD_DESKTOP_OFFSET_HEIGHT: 92 - 32,
    };

    const MainStyle = styled('main', {})(({ theme }) => ({
    flexGrow: 1,
    paddingTop: HEADER.MOBILE_HEIGHT,
    paddingBottom: HEADER.MOBILE_OFFSET_HEIGHT,
    [theme.breakpoints.down('lg')]: {
        paddingLeft: 10,
        paddingRight: 10,
    },
    [theme.breakpoints.up('lg')]: {
        paddingLeft: 16,
        paddingRight: 16,
        paddingTop: HEADER.DASHBOARD_DESKTOP_HEIGHT,
        paddingBottom: HEADER.DASHBOARD_DESKTOP_HEIGHT,
        width: `calc(100% - 0px)`,
    },
    }));

    return (
        <MainStyle>
            {children}
        </MainStyle>
    )
};