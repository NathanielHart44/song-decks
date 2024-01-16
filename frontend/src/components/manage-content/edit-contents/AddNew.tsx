import { Card, useTheme } from "@mui/material";
import Iconify from "src/components/base/Iconify";

// ----------------------------------------------------------------------

type AddNewProps = {
    isMobile: boolean;
    handleClick: (arg0: any) => void;
    type: 'faction' | 'commander' | 'card' | 'attachment' | 'ncu' | 'unit';
};
export function AddNew({ isMobile, handleClick, type }: AddNewProps) {

    const theme = useTheme();

    return (
        <Card
            sx={{
                width: isMobile ? 100 : 80,
                height: isMobile ? 100 : 80,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                ...!isMobile ? {
                    transition: 'transform 0.3s',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.1)' },
                } : {},
            }}
            onClick={() => { handleClick(`Clicked add new ${type}`) }}
        >
            <Iconify
                icon={'eva:plus-outline'}
                color={theme.palette.primary.main}
                width={isMobile ? 50 : 40}
                height={isMobile ? 50 : 40}
            />
        </Card>
    );
};
