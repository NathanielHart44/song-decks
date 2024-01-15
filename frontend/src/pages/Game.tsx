/* eslint-disable react-hooks/exhaustive-deps */
import Page from "src/components/base/Page";
import { useContext, useEffect, useState } from "react";
import GameContent from "src/components/game-page/GameContent";
import { Stack } from "@mui/material";
import SectionStepper from "src/components/game-page/SectionStepper";
import { GameContext } from "src/contexts/GameContext";
import { ActionButtons } from "src/components/game-page/ActionButtons";
import { useParams } from "react-router-dom";
import CardProbability from "src/components/game-page/CardProbability";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";
import KeywordSearch from "src/components/KeywordSearch";
import SpeedDialDiv, { SpeedDialOptions } from "src/components/SpeedDialDiv";
import { decodeList } from "src/utils/convertList";
import { List } from "src/@types/types";
import { ListOverviewDiv } from "src/components/list-manage/ListOverview";

// ----------------------------------------------------------------------

export type GameModalOptions = 'probability' | 'word_search' | 'game' | 'list';

// ----------------------------------------------------------------------

export default function Game() {

    const { gameID = '', lc } = useParams();
    const { allCards } = useContext(GameContext);

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<GameModalOptions>('game');
    const [gameList, setGameList] = useState<List>();
    const [speedDialOptions, setSpeedDialOptions] = useState<SpeedDialOptions[]>(defaultSpeedDialOptions);

    // TODO: Preload images here, but running into issues with allCards containing cards not partaining to the current game.

    const using_list = (lc !== undefined && lc !== null);
    useEffect(() => {
        if (using_list && !gameList) {
            const loaded_list = decodeList(lc);
            setGameList(loaded_list);
            const new_speed_dial_options = [...speedDialOptions];
            new_speed_dial_options.push({
                name: 'List',
                source: 'list',
                icon: 'game-icons:swords-emblem'
            });
            setSpeedDialOptions(new_speed_dial_options);

        };
    }, [gameList, lc]);

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
            { openModal === 'list' &&
                <ListOverviewDiv
                    isMobile={false}
                    currentList={gameList as List}
                />
            }
                <SpeedDialDiv
                    setOpenModal={setOpenModal}
                    options={speedDialOptions}
                    openModal={openModal}
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

// ----------------------------------------------------------------------

const defaultSpeedDialOptions: SpeedDialOptions[] = [
    {
        name: 'Tactics Deck',
        source: 'game',
        icon: 'mdi:cards'
    },
    {
        name: 'Cards In Deck',
        source: 'probability',
        icon: 'icon-park-solid:layers'
    },
    {
        name: 'Keyword Search',
        source: 'word_search',
        icon: 'eva:search-outline'
    },
];