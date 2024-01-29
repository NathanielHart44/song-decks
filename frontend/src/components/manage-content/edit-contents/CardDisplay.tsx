import { Box } from "@mui/material";
import { useState } from "react";
import { Commander, Faction, CardTemplate } from "src/@types/types";
import EditAddCard from "src/components/manage-content/edit-contents/EditAddCard";

// ----------------------------------------------------------------------

type CardDisplayProps = {
    isMobile: boolean;
    card: CardTemplate;
    cards: CardTemplate[];
    defaultCards: CardTemplate[] | null;
    factions: Faction[];
    commanders: Commander[];
    setCards: (arg0: CardTemplate[]) => void;
};
export function CardDisplay({ isMobile, card, cards, defaultCards, factions, commanders, setCards }: CardDisplayProps) {

    const [editOpen, setEditOpen] = useState<boolean>(false);

    return (
        <>
            <Box
                onClick={() => { setEditOpen(true); }}
                sx={{
                    height: '100%',
                    width: '200px',
                    ...!isMobile ? {
                        transition: 'transform 0.3s',
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.075)' },
                    } : {},
                }}
            >
                <img
                    // TODO: Remove the query string when the image is updated
                    src={card.img_url + '?s04'}
                    alt={card.card_name}
                    loading="eager"
                    style={{ borderRadius: '6px', width: '100%', height: '100%', objectFit: 'contain' }}
                />
            </Box>
            <EditAddCard
                card={card}
                cards={cards}
                defaultCards={defaultCards}
                factions={factions}
                commanders={commanders}
                editOpen={editOpen}
                setEditOpen={setEditOpen}
                setCards={setCards}
            />
        </>
    );
}
;
