import { Dispatch, useContext, useEffect, useReducer, useState } from "react";
import {
    motion,
    useMotionValue,
    useTransform,
    AnimatePresence,
    MotionValue
} from "framer-motion";
import { enqueueSnackbar } from "notistack";
import { Box, useTheme } from "@mui/material";
import { PlayerCard } from "src/@types/types";
import { DefaultCardImg } from "../base/CardImg";
import Iconify from "../base/Iconify";
import { GameContext } from "src/contexts/GameContext";

// ----------------------------------------------------------------------

type CardProps = {
    isMobile: boolean;
    position: number;
    card_height: number;
    card_width: number;
    dispatch?: Dispatch<Action>;
    card: PlayerCard;
    selectedSection: string | null;
};

// ----------------------------------------------------------------------

function Card({ ...props }: CardProps) {

    const { isMobile, card, position, card_height, card_width, selectedSection, dispatch } = props;

    const drag_break_point = isMobile ? 100 : 300;
    const [exitX, setExitX] = useState(0);

    const x = useMotionValue(0);
    const scale = useTransform(x, [-150, 0, 150], [0.75, 1, 0.75]);
    const rotate = useTransform(x, [-150, 0, 150], [-15, 0, 15], {
        clamp: false
    });

    const variantsFrontCard = {
        animate: { scale: 1, y: 0, x: 0, opacity: 1 },
        exit: (custom: any) => ({
            x: custom,
            opacity: 0,
            scale: 0.5,
            transition: { duration: 0.2 }
        })
    };
    const variantsBackCard1 = {
        initial: { scale: 0, x: 100, opacity: 0 },
        animate: { scale: 0.90, x: -150, opacity: 1 }
    };

    const variantsBackCard2 = {
      initial: { scale: 0, x: 100, opacity: 0 },
    animate: { scale: 0.90, x: 150, opacity: 1 }
  };

    function handleDragEnd(_: any, info: any) {
        if (info.offset.x < -drag_break_point) {
            setExitX(0);
            if (dispatch) dispatch({ type: "NEXT" });
        }
        if (info.offset.x > drag_break_point) {
            setExitX(0);
            if (dispatch) dispatch({ type: "PREV" });
        }
    }

    const hide = selectedSection === 'Deck' || !selectedSection;

    return (
        <motion.div
            style={{
                width: card_width,
                height: card_height,
                position: "absolute",
                top: 0,
                x,
                rotate,
                cursor: "grab",
                // border: "2px solid yellow"
            }}
            whileTap={{ cursor: "grabbing" }}
            // Dragging
            drag={position === 0 ? "x" : false}
            dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
            onDragEnd={handleDragEnd}
            // Animation
            variants={
                position === 0
                    ? variantsFrontCard
                    : position === 1
                        ? variantsBackCard1
                        : variantsBackCard2
            }
            initial="initial"
            animate="animate"
            exit="exit"
            custom={exitX}
            transition={
                position === 0
                    ? { type: "spring", stiffness: 300, damping: 20 }
                    : { scale: { duration: 0.2 }, opacity: { duration: 0.4 } }
            }
        >
            <CardContents
                scale={scale}
                card_width={card_width}
                card_height={card_height}
                hide={hide}
                card={card}
                position={position}
            />
        </motion.div>
    );
}

// ----------------------------------------------------------------------

type CardContentsProps = {
    scale: MotionValue<number>;
    card_width: number;
    card_height: number;
    hide: boolean;
    card: PlayerCard;
    position: number;
}

function CardContents({ scale, card_width, card_height, hide, card, position}: CardContentsProps) {

    const theme = useTheme();

    return <Box
        component={motion.div}
        style={{
            border: `2px solid ${theme.palette.grey[900]}`,
            borderRadius: '6px',
            scale,
            width: card_width,
            height: card_height,
        }}
    >
        {/* Card Back */}
        {hide && (DefaultCardImg())}
        {/* Card Image */}
        {!hide && card && card.card_template &&
            <img
                src={card.card_template.img_url}
                alt="Overlay SVG"
                loading="lazy"
                style={{
                    pointerEvents: 'none',
                    width: card_width,
                    height: card_height,
                }} />}
        {/* Note Icon */}
        {!hide && card && card.card_template && card.play_notes && card.play_notes.length > 0 && position === 0 &&
            <Box
                position="absolute"
                top={-8}
                right={-8}
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                    width: '40px',
                    height: '40px',
                    border: `2px solid ${theme.palette.primary.main}`,
                    bgcolor: theme.palette.background.default,
                    borderRadius: '50%',
                }}
            >
                <Iconify
                    icon={"eva:file-text-outline"}
                    width={28}
                    height={28}
                    color={theme.palette.grey[400]} />
            </Box>}
    </Box>;
}

// ----------------------------------------------------------------------

type HSwipeProps = {
    isMobile: boolean;
    card_height: number;
    card_width: number;
    cards: PlayerCard[];
};

export default function HSwipe3({ ...props }: HSwipeProps) {

    const { isMobile, cards, card_height, card_width } = props;

    const { selectedSection, setHandCard, setPlayCard, setDiscardCard } = useContext(GameContext);

    const slidesReducer = (state: State, event: Action) => {

        const display_msg = false;

        function handleSelectCard(card: PlayerCard | null, hide_msg?: boolean) {
            if (selectedSection === "Deck" || !selectedSection || !card) { return }
            else if (selectedSection === "Hand") { setHandCard(card) }
            else if (selectedSection === "In Play") { setPlayCard(card) }
            else if (selectedSection === "Discard") { setDiscardCard(card) };
            if (hide_msg) { return }
            else { enqueueSnackbar("Selected: " + card.card_template.card_name) };
        };

        function getIndexes(index: number) {
            let newIndex = index;
            if (newIndex < 0) { newIndex = cards.length - 1 }
            else if (newIndex >= cards.length) { newIndex = 0 }
    
            let previousIndex = newIndex - 1;
            if (previousIndex < 0) { previousIndex = cards.length - 1 }
            let nextIndex = newIndex + 1;
            if (nextIndex >= cards.length) { nextIndex = 0 }
            return [previousIndex, newIndex, nextIndex];
        }
    
        if (event.type === "NEXT") {
            const [previousIndex, newIndex, nextIndex] = getIndexes(state.slideIndex + 1);
            const newVisibleCards = cards.length > 2
                ? [cards[previousIndex], cards[newIndex], cards[nextIndex]]
                : cards.length === 2
                ? [null, cards[newIndex], cards[nextIndex]]
                : [null, cards[newIndex], null];
            handleSelectCard(newVisibleCards[1], !display_msg);
            return { ...state, slideIndex: newIndex < cards.length ? newIndex : 0, visibleCards: newVisibleCards };
        }else if (event.type === "PREV") {
            const [previousIndex, newIndex, nextIndex] = getIndexes(state.slideIndex - 1);
            const newVisibleCards = cards.length > 2
                ? [cards[previousIndex], cards[newIndex], cards[nextIndex]]
                : cards.length === 2
                ? [null, cards[newIndex], cards[nextIndex]]
                : [null, cards[newIndex], null];
            handleSelectCard(newVisibleCards[1], !display_msg);
            return { ...state, slideIndex: newIndex >= 0 ? newIndex : cards.length - 1, visibleCards: newVisibleCards };
        } else if (event.type === "CARDS_CHANGED") {
            const [previousIndex, newIndex, nextIndex] = getIndexes(state.slideIndex);
            const newVisibleCards = cards.length > 2
                ? [cards[previousIndex], cards[newIndex], cards[nextIndex]]
                : cards.length === 2
                ? [null, cards[newIndex], cards[nextIndex]]
                : [null, cards[newIndex], null];
            handleSelectCard(newVisibleCards[1], !display_msg);
          return { ...state, visibleCards: newVisibleCards };
        }
        return state;
    };

    const initialState: State = {
        slideIndex: 0,
        visibleCards: cards.length > 2
            ? [cards[cards.length - 1], cards[0], cards[1]]
            : cards.length === 2
            ? [null, cards[0], cards[1]]
            : [null, cards[0], null],
    };

    useEffect(() => { dispatch({ type: "CARDS_CHANGED" }) }, [cards]);

    const [state, dispatch] = useReducer(slidesReducer, initialState);

    const { slideIndex, visibleCards } = state;

    return (
        <Box 
            component={motion.div}
            style={{
                width: card_width,
                height: card_height,
                position: "relative",
                // border: "2px solid green",
            }}
        >
            <AnimatePresence initial={false}>
                { visibleCards[2] &&
                    <Card
                        key={slideIndex + 2}
                        isMobile={isMobile}
                        position={2}
                        card_height={card_height}
                        card_width={card_width}
                        card={visibleCards[2]}
                        selectedSection={selectedSection}
                    />
                }
                { visibleCards[0] &&
                    <Card
                        key={slideIndex + 1}
                        isMobile={isMobile}
                        position={1}
                        card_height={card_height}
                        card_width={card_width}
                        card={visibleCards[0]}
                        selectedSection={selectedSection}
                    />
                }
                { visibleCards[1] &&
                    <Card
                        key={slideIndex}
                        isMobile={isMobile}
                        position={0}
                        card_height={card_height}
                        card_width={card_width}
                        dispatch={dispatch}
                        card={visibleCards[1]}
                        selectedSection={selectedSection}
                    />
                }
            </AnimatePresence>
        </Box>
    );
}

// ----------------------------------------------------------------------

interface State {
    slideIndex: number;
    visibleCards: (PlayerCard | null)[];
}

type Action = { type: "NEXT" } | { type: "PREV" } | { type: "CARDS_CHANGED" };