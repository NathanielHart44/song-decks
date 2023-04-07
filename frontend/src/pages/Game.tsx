import Page from "src/components/Page";
import { useContext, createRef, RefObject } from "react";
import { MetadataContext } from "src/contexts/MetadataContext";
import EndButtons from "src/components/EndButtons";
import GameContent from "src/components/game-page/GameContent";
import React from "react";
import GameScroll from "src/components/game-page/GameScroll";
// ----------------------------------------------------------------------

export default function Game() {

    const { isMobile } = useContext(MetadataContext);

    const sectionRefs: RefObject<HTMLDivElement>[] = [
        createRef(),
        createRef(),
        createRef(),
        createRef(),
    ];

    return (
        <Page title="Play">
            <GameScroll sectionRefs={sectionRefs}>
                <GameContent isMobile={isMobile} sectionRefs={sectionRefs} />
                <EndButtons />
            </GameScroll>
        </Page>
    );
}