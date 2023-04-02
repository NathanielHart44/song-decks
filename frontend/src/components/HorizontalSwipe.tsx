import { Box } from "@mui/material";
import { useContext, useState } from "react";
import SwipeableViews from 'react-swipeable-views';
import { SlideRenderProps, virtualize } from 'react-swipeable-views-utils';
import { MetadataContext } from "src/contexts/MetadataContext";

// ----------------------------------------------------------------------

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

type Props = {
    cards: React.ReactNode[];
}

export default function HorizontalSwipe({ cards }: Props) {

    const { isMobile } = useContext(MetadataContext);

    const [pageIndex, setPageIndex] = useState<number>(0);

    const handleChangeIndex = (index: number) => { setPageIndex(index) };

    const handleSwipe = (index: number, type: string) => {
        if (type === 'move') { return };
        setPageIndex(index);
    };

    const slideRenderer = ({ index, key }: SlideRenderProps) => {
        const current_card_index = ((index % cards.length) + cards.length) % cards.length;
        // const next_card_index = ((index + 1) % cards.length + cards.length) % cards.length;
        // const previous_card_index = ((index - 1) % cards.length + cards.length) % cards.length;

        return (
            <div key={key} style={{ display: "flex" }}>
                <div style={{ width: '30%' }} />
                {cards[current_card_index]}
                <div style={{ width: '30%' }} />
            </div>
        );
    };

    return (
        <>
            { isMobile &&
                <VirtualizeSwipeableViews
                    index={pageIndex}
                    onChangeIndex={handleChangeIndex}
                    enableMouseEvents
                    slideRenderer={slideRenderer}
                    resistance
                    onSwitching={handleSwipe}
                />
            }
            { !isMobile &&
                <Box sx={{ display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory' }}>
                    {cards.map((card, index) => (
                        <Box key={index} sx={{ minWidth: 350, px: 2 }}>
                            {card}
                        </Box>
                    ))}
                </Box>
            }
        </>
    );
};