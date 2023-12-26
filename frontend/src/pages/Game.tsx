import Page from "src/components/base/Page";
import { useContext, useState } from "react";
import GameContent from "src/components/game-page/GameContent";
import { Stack, SpeedDial, SpeedDialIcon, Backdrop, SpeedDialAction } from "@mui/material";
import SectionStepper from "src/components/SectionStepper";
import { GameContext } from "src/contexts/GameContext";
import { ActionButtons } from "src/components/game-page/ActionButtons";
import { useParams } from "react-router-dom";
import CardProbability from "src/components/game-page/CardProbability";
import LoadingBackdrop from "src/components/base/LoadingBackdrop";
import Iconify from "src/components/base/Iconify";
import KeywordSearch from "src/components/KeywordSearch";

// ----------------------------------------------------------------------

export type GameModalOptions = 'probability' | 'word_search' | 'game';

export default function Game() {

    const { gameID = '' } = useParams();
    const { allCards } = useContext(GameContext);

    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    const [openModal, setOpenModal] = useState<GameModalOptions>('game');

    // TODO: Preload images here, but running into issues with allCards containing cards not partaining to the current game.

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
                    openModal={openModal}
                    setOpenModal={setOpenModal}
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
}

// ----------------------------------------------------------------------

type SpeedDialDivProps = {
    openModal: GameModalOptions;
    setOpenModal: (arg0: GameModalOptions) => void;
};

function SpeedDialDiv({ openModal, setOpenModal }: SpeedDialDivProps) {

    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    function handleSelect(selected_page: GameModalOptions) {
        setOpen(false);
        setOpenModal(selected_page);
    };
    
    const icon_sizing = '55%';

    const options: { name: string; source: GameModalOptions; icon: JSX.Element; }[] = [
        {
            name: 'Game',
            source: 'game' as GameModalOptions,
            icon: <Iconify icon={'ri:sword-line'} width={icon_sizing} height={icon_sizing} />
        },
        {
            name: 'Deck Cards',
            source: 'probability' as GameModalOptions,
            icon: <Iconify icon={'eva:percent-outline'} width={icon_sizing} height={icon_sizing} />
        },
        {
            name: 'Keyword Search',
            source: 'word_search' as GameModalOptions,
            icon: <Iconify icon={'eva:search-outline'} width={icon_sizing} height={icon_sizing} />
        },
    ];

    return (
        <div>
            <Backdrop open={open} />
            <SpeedDial
                ariaLabel="Main Speed Dial"
                // sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: (theme) => theme.zIndex.drawer + z_index }}
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                // icon={open ? <SpeedDialIcon /> : <Iconify icon={'eva:percent-outline'} width={'45%'} height={'45%'} />}
                icon={<SpeedDialIcon />}
                onClose={handleClose}
                onOpen={handleOpen}
                open={open}
            >
                {options.map((option) => (
                    <SpeedDialAction
                        key={option.name}
                        icon={option.icon}
                        tooltipTitle={option.name}
                        onClick={() => { handleSelect(option.source) }}
                    />
                ))}
            </SpeedDial>
        </div>
    );
}