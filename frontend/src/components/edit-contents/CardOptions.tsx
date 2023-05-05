import {
    Grid, SxProps,
    Theme
} from "@mui/material";
import { Commander, Faction, CardTemplate } from "src/@types/types";
import { CardDisplay } from "./CardDisplay";
import { AddNew } from "./AddNew";

// ----------------------------------------------------------------------
type CardOptionsProps = {
    isMobile: boolean;
    cards: CardTemplate[];
    factions: Faction[];
    commanders: Commander[];
    handleClick: (arg0: any) => void;
    setCards: (arg0: CardTemplate[]) => void;
};
export function CardOptions({ isMobile, cards, factions, commanders, handleClick, setCards }: CardOptionsProps) {

    const gridContainerStyles: SxProps<Theme> = {
        justifyContent: 'space-around',
        alignItems: 'center',
        display: 'grid',
        width: '100%',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))'
    };

    const gridItemStyles: SxProps<Theme> = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    };

    return (
        <Grid
            container
            rowSpacing={2}
            columnSpacing={2}
            sx={gridContainerStyles}
        >
            {cards.map((card) => (
                <Grid item key={card.id + 'card'} sx={gridItemStyles}>
                    <CardDisplay
                        isMobile={isMobile}
                        card={card}
                        cards={cards}
                        factions={factions}
                        commanders={commanders}
                        setCards={setCards} />
                </Grid>
            ))}
            <Grid item sx={gridItemStyles}>
                <AddNew
                    type={'card'}
                    isMobile={isMobile}
                    handleClick={(arg) => { handleClick(arg); }} />
            </Grid>
        </Grid>
    );
}
;
