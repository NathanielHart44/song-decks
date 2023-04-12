import { createContext, ReactNode, useEffect, useLayoutEffect, useState } from "react";
import { PlayerCard } from "src/@types/types";

type Props = { children: ReactNode };

export const MetadataContext = createContext<{
    isMobile: boolean;
    allCards: PlayerCard[];
    setAllCards: (cards: PlayerCard[]) => void;
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
    selectedSection: HTMLDivElement | null;
    setSelectedSection: (section: HTMLDivElement | null) => void;
    loadSelectedSection: (section_id: string | null) => void;
}>
({
    isMobile: true,
    allCards: [],
    setAllCards: () => {},
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
    loadSelectedSection: () => {},
});

export default function MetadataProvider({ children }: Props) {
    const userAgent = typeof navigator === 'undefined' ? 'SSR' : navigator.userAgent;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    const [allCards, setAllCards] = useState<PlayerCard[]>([]);

    // useeffect that tracks allCards, and says when there is a change
    useEffect(() => {
        console.log("allCards changed", allCards);
    }, [allCards]);

    const [viewedCards, setViewedCards] = useState<PlayerCard[]>([]);
    const [selectedCard, setSelectedCard] = useState<PlayerCard>();

    const [inDeck, setInDeck] = useState<PlayerCard[]>([]);
    const [deckCard, setDeckCard] = useState<PlayerCard | null>(null);

    const [inHand, setInHand] = useState<PlayerCard[]>([]);
    const [handCard, setHandCard] = useState<PlayerCard | null>(null);

    const [inPlay, setInPlay] = useState<PlayerCard[]>([]);
    const [playCard, setPlayCard] = useState<PlayerCard | null>(null);

    const [inDiscard, setInDiscard] = useState<PlayerCard[]>([]);
    const [discardCard, setDiscardCard] = useState<PlayerCard | null>(null);

    const [selectedSection, setSelectedSection] = useState<HTMLDivElement | null>(null);

    function loadSelectedSection(section_id: string | null) {
        if (typeof window !== 'undefined') {
            // console.log("getting section from local storage", section);
    
            const waitForElement = (section: string, retries: number = 10) => {
                if (retries <= 0) return;
    
                const allElements = document.getElementsByTagName("*");
                const sectionElement = Array.from(allElements).find((element) => element.id === section) as HTMLDivElement;
    
                if (sectionElement) {
                    // console.log("found sectionElement:", sectionElement);
                    setSelectedSection(sectionElement);
                } else {
                    // console.log("Element not found, trying again in 100ms");
                    setTimeout(() => waitForElement(section, retries - 1), 100);
                }
            };
    
            if (section_id) {
                waitForElement(section_id);
            } else {
                setSelectedSection(null);
            }
        }
    };

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const section = localStorage.getItem('selectedSection');
            loadSelectedSection(section);
        }

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
            const section_id = selectedSection.id;
            // console.log("setting selectedSection", section_id);
            localStorage.setItem('selectedSection', section_id);

            if (section_id === 'Deck') {
                setViewedCards(inDeck);
                setSelectedCard(inDeck[0]);
            } else if (section_id === 'Hand') {
                setViewedCards(inHand);
                setSelectedCard(inHand[0]);
            } else if (section_id === 'In Play') {
                setViewedCards(inPlay);
                setSelectedCard(inPlay[0]);
            } else if (section_id === 'Discard') {
                setViewedCards(inDiscard);
                setSelectedCard(inDiscard[0]);
            }
        }
    }, [selectedSection, inDeck, inHand, inPlay, inDiscard]);

    return (
        <MetadataContext.Provider
            value={{
                isMobile,
                allCards,
                setAllCards,
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
                loadSelectedSection,
            }}
        >
            {children}
        </MetadataContext.Provider>
    );
}