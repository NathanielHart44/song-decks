import { Card, useTheme } from "@mui/material";
import Iconify from "src/components/base/Iconify";

// ----------------------------------------------------------------------
type AddNewProps = {
    isMobile: boolean;
    handleClick: () => void;
};
export default function AddNewWB({ isMobile, handleClick }: AddNewProps) {

    const theme = useTheme();

    let card_sizing = isMobile ? 100 : 80;
    let icon_sizing = isMobile ? 50 : 40;
    const size_modifier = 1;
    card_sizing = card_sizing * size_modifier;
    icon_sizing = icon_sizing * size_modifier;

    return (
        <Card
            sx={{
                width: card_sizing,
                height: card_sizing,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                ...!isMobile ? {
                    transition: 'transform 0.3s',
                    cursor: 'pointer',
                    '&:hover': { transform: 'scale(1.1)' },
                } : {},
            }}
            onClick={handleClick}
        >
            <Iconify
                icon={'eva:plus-outline'}
                color={theme.palette.primary.main}
                width={icon_sizing}
                height={icon_sizing}
            />
        </Card>
    );
}
;
