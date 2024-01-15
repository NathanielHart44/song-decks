import Page from "src/components/base/Page";
import { useContext, useState } from "react";
import GameContent from "src/components/game-page/GameContent";
import { Stack, useTheme } from "@mui/material";
import SectionStepper from "src/components/game-page/SectionStepper";
import { GameContext } from "src/contexts/GameContext";
import { ActionButtons } from "src/components/game-page/ActionButtons";
import { useParams } from "react-router-dom";
import CardProbability from "src/components/game-page/CardProbability";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";
import Iconify from "src/components/base/Iconify";
import KeywordSearch from "src/components/KeywordSearch";
import SpeedDialDiv from "src/components/SpeedDialDiv";

// ----------------------------------------------------------------------

export type GameModalOptions = 'probability' | 'word_search' | 'game';

export default function Game() {

    const theme = useTheme();
    const { gameID = '' } = useParams();
    const { allCards } = useContext(GameContext);

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<GameModalOptions>('game');

    // TODO: Preload images here, but running into issues with allCards containing cards not partaining to the current game.

    const getDialColor = (option: GameModalOptions) => {
        if (option === openModal) {
            return theme.palette.primary.main;
        } else {
            return 'default';
        }
    };

    return (
        <Page title="Play">
            { awaitingResponse && <LoadingBackdrop /> }
            { openModal === 'probability' &&
                <CardProbability
                    gameID={gameID}
                    deck_count={allCards.length}
                    openModal={openModal}
                    setOpenModal={setOpenModal}
                />
            }
            { openModal === 'game' &&
                <GameContentDiv setAwaitingResponse={setAwaitingResponse} />
            }
            { openModal === 'word_search' &&
                <KeywordSearch
                    is_game={true}
                    awaitingResponse={awaitingResponse}
                    setAwaitingResponse={setAwaitingResponse}
                />
            }
                <SpeedDialDiv
                    setOpenModal={setOpenModal}
                    options={[
                        {
                            name: 'Game',
                            source: 'game' as GameModalOptions,
                            icon: <Iconify icon={'ri:sword-line'} width={'55%'} height={'55%'} color={getDialColor('game')} />
                        },
                        {
                            name: 'Deck Cards',
                            source: 'probability' as GameModalOptions,
                            icon: <Iconify icon={'eva:percent-outline'} width={'55%'} height={'55%'} color={getDialColor('probability')} />
                        },
                        {
                            name: 'Keyword Search',
                            source: 'word_search' as GameModalOptions,
                            icon: <Iconify icon={'eva:search-outline'} width={'55%'} height={'55%'} color={getDialColor('word_search')} />
                        },
                    ]}
                />
        </Page>
    );
}

// ----------------------------------------------------------------------

type GameContentDivProps = {
    setAwaitingResponse: (arg0: boolean) => void;
};

function GameContentDiv({ setAwaitingResponse }: GameContentDivProps) {

    const { gameID = '' } = useParams();
    const { inDeck, selectedCard, selectedSection, setAllCards } = useContext(GameContext);

    return (
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
        </Stack>
    );
};