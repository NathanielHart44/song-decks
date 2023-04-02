import { Box } from "@mui/material";
import { IMG_STORAGE } from "src/config";

// ----------------------------------------------------------------------

type Props = {
    faction: string;
    card_name: string;
}

export default function CardImg({ faction, card_name }: Props) {
    return (
        <Box>
            <img
                src={IMG_STORAGE + `${faction}/${card_name}.jpg`}
                alt={card_name}
            />
        </Box>
    )
}