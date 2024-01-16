import { createContext, ReactNode, useEffect, useState } from "react";
import { PlayerCard } from "src/@types/types";

type Props = { children: ReactNode };

export const GameContext = createContext<{
    gameRound: number;
    setGameRound: (round: number) => void;

    allCards: PlayerCard[];
    setAllCards: (cards: PlayerCard[]) => void;
    selectedCard: PlayerCard | null;
    inDeck: PlayerCard[];
    setInDeck: (cards: PlayerCard[]) => void;
    deckCard: PlayerCard | null;
    setDeckCard: (card: PlayerCard | null) => void;
    inHand: PlayerCard[];
    setInHand: (cards: PlayerCard[]) => void;
    handCard: PlayerCard | null;
    setHandCard: (card: PlayerCard | null) => void;
    inPlay: PlayerCard[];
    setInPlay: (cards: PlayerCard[]) => void;
    playCard: PlayerCard | null;
    setPlayCard: (card: PlayerCard | null) => void;
    inDiscard: PlayerCard[];
    setInDiscard: (cards: PlayerCard[]) => void;
    discardCard: PlayerCard | null;
    setDiscardCard: (card: PlayerCard | null) => void;

    selectedSection: string | null;
    setSelectedSection: (section_id: string | null) => void;
}>
({
    gameRound: 1,
    setGameRound: () => {},

    allCards: [],
    setAllCards: () => {},
    selectedCard: null,
    inDeck: [],
    setInDeck: () => {},
    deckCard: null,
    setDeckCard: () => {},
    inHand: [],
    setInHand: () => {},
    handCard: null,
    setHandCard: () => {},
    inPlay: [],
    setInPlay: () => {},
    playCard: null,
    setPlayCard: () => {},
    inDiscard: [],
    setInDiscard: () => {},
    discardCard: null,
    setDiscardCard: () => {},

    selectedSection: null,
    setSelectedSection: () => {},
});

export default function GameProvider({ children }: Props) {

    const [gameRound, setGameRound] = useState<number>(1);

    const [allCards, setAllCards] = useState<PlayerCard[]>([]);

    const [selectedCard, setSelectedCard] = useState<PlayerCard | null>(null);

    const [inDeck, setInDeck] = useState<PlayerCard[]>([]);
    const [deckCard, setDeckCard] = useState<PlayerCard | null>(null);

    const [inHand, setInHand] = useState<PlayerCard[]>([]);
    const [handCard, setHandCard] = useState<PlayerCard | null>(null);

    const [inPlay, setInPlay] = useState<PlayerCard[]>([]);
    const [playCard, setPlayCard] = useState<PlayerCard | null>(null);

    const [inDiscard, setInDiscard] = useState<PlayerCard[]>([]);
    const [discardCard, setDiscardCard] = useState<PlayerCard | null>(null);

    const [selectedSection, setSelectedSection] = useState<string | null>(null);

    useEffect(() => {
        if (allCards && allCards.length > 0) {
            let in_deck: PlayerCard[] = [];
            let in_hand: PlayerCard[] = [];
            let in_play: PlayerCard[] = [];
            let in_discard: PlayerCard[] = [];
            allCards.forEach((card: PlayerCard) => {
                switch (card.status) {
                    case 'in-deck':
                        in_deck.push(card);
                        break;
                    case 'in-hand':
                        in_hand.push(card);
                        break;
                    case 'in-play':
                        in_play.push(card);
                        break;
                    case 'discarded':
                        in_discard.push(card);
                        break;
                    default:
                        break;
                }
            });
            setInDeck(in_deck);
            setInHand(in_hand);
            setInPlay(in_play);
            setInDiscard(in_discard);
        };
    }, [allCards]);

    useEffect(() => {
        if (selectedSection) {
            const section_id = selectedSection;
            localStorage.setItem('selectedSection', section_id);

            if (section_id === 'Deck') {
                setSelectedCard(inDeck[0]);
            } else if (section_id === 'Hand') {
                setSelectedCard(inHand[0]);
            } else if (section_id === 'In Play') {
                setSelectedCard(inPlay[0]);
            } else if (section_id === 'Discard') {
                setSelectedCard(inDiscard[0]);
            }
        }
    }, [selectedSection, inDeck, inHand, inPlay, inDiscard]);

    useEffect(() => {
        if (selectedSection) {
            const section_id = selectedSection;
            if (section_id === 'Deck') {
                // setSelectedCard(deckCard);
            } else if (section_id === 'Hand') {
                if (handCard) {
                    setSelectedCard(handCard);
                } else {
                    setSelectedCard(inHand[0]);
                }
            } else if (section_id === 'In Play') {
                if (playCard) {
                    setSelectedCard(playCard);
                } else {
                    setSelectedCard(inPlay[0]);
                }
            } else if (section_id === 'Discard') {
                if (discardCard) {
                    setSelectedCard(discardCard);
                } else {
                    setSelectedCard(inDiscard[0]);
                }
            }
        }
    }, [selectedSection, deckCard, inDeck, handCard, inHand, playCard, inPlay, discardCard, inDiscard]);

    return (
        <GameContext.Provider
            value={{
                gameRound,
                setGameRound,
                allCards,
                setAllCards,
                selectedCard,
                inDeck,
                setInDeck,
                deckCard,
                setDeckCard,
                inHand,
                setInHand,
                handCard,
                setHandCard,
                inPlay,
                setInPlay,
                playCard,
                setPlayCard,
                inDiscard,
                setInDiscard,
                discardCard,
                setDiscardCard,

                selectedSection,
                setSelectedSection,
            }}
        >
            {children}
        </GameContext.Provider>
    );
};