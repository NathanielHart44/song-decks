import Page from "src/components/base/Page";
import { useContext, useState } from "react";
import GameContent from "src/components/game-page/GameContent";
import { Stack } from "@mui/material";
import SectionStepper from "src/components/SectionStepper";
import { GameContext } from "src/contexts/GameContext";
import { ActionButtons } from "src/components/game-page/ActionButtons";
import { useParams } from "react-router-dom";
import CardProbability from "src/components/game-page/CardProbability";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";

// ----------------------------------------------------------------------

export default function Game() {

    const { gameID = '' } = useParams();
    const { allCards, inDeck, selectedCard, selectedSection, setAllCards } = useContext(GameContext);

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const [probabilityOpen, setProbabilityOpen] = useState<boolean>(false);

    return (
        <Page title="Play">
            { awaitingResponse && <LoadingBackdrop /> }
            <Stack
                height={'100%'}
                width={'100%'}
                justifyContent={'space-between'}
                alignItems={'center'}
            >
                <SectionStepper />

                <ActionButtons
                    category={
                        selectedSection === null ? "deck" :
                            (selectedSection === "In Play" ? "play" :
                            selectedSection.toLowerCase() as "hand" | "discard" | "deck")
                    }
                    selected={true}
                    currentCard={selectedCard ? selectedCard : inDeck[0]}
                    gameID={gameID}
                    setAllCards={setAllCards}
                    setAwaitingResponse={setAwaitingResponse}
                />

                <GameContent />
                <CardProbability
                    gameID={gameID}
                    deck_count={allCards.length}
                    open={probabilityOpen}
                    setOpen={setProbabilityOpen}
                />
            </Stack>
        </Page>
    );
}