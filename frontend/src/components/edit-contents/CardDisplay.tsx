import { Box } from "@mui/material";
import { useState } from "react";
import { Commander, Faction, CardTemplate } from "src/@types/types";
import EditAddCard from "src/components/edit-contents/EditAddCard";

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
                    src={card.img_url}
                    alt={card.card_name}
                    loading="lazy"
                    style={{ borderRadius: '6px', width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
            <EditAddCard
                card={card}
                cards={cards}
                defaultCards={defaultCards}
                factions={factions}
                commanders={commanders}
                editOpen={editOpen}
                setEditOpen={setEditOpen}
                setCards={setCards} />
        </>
    );
}
;
