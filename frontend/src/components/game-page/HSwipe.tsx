import { Box } from "@mui/material";
import React, { useEffect, useReducer, useState } from "react";
import { motion, useMotionValue } from 'framer-motion';

// ----------------------------------------------------------------------

interface State {
    slideIndex: number;
    visibleCards: React.ReactNode[];
}

type Props = {
    isMobile: boolean;
    cards: React.ReactNode[];
};

export default function HSwipe({ isMobile, cards }: Props) {

    const slidesReducer = (state: State, event: Action) => {
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
            // cardSwipeFunctions[newIndex]();
            return { ...state, slideIndex: newIndex < cards.length ? newIndex : 0, visibleCards: newVisibleCards };
        }
        
        else if (event.type === "PREV") {
            const [previousIndex, newIndex, nextIndex] = getIndexes(state.slideIndex - 1);
            const newVisibleCards = cards.length > 2
                ? [cards[previousIndex], cards[newIndex], cards[nextIndex]]
                : cards.length === 2
                ? [null, cards[newIndex], cards[nextIndex]]
                : [null, cards[newIndex], null];
            // cardSwipeFunctions[newIndex]();
            return { ...state, slideIndex: newIndex >= 0 ? newIndex : cards.length - 1, visibleCards: newVisibleCards };
        }

        else if (event.type === "CARDS_CHANGED") {
          const [previousIndex, newIndex, nextIndex] = getIndexes(state.slideIndex);
          const newVisibleCards = cards.length > 2
            ? [cards[previousIndex], cards[newIndex], cards[nextIndex]]
            : cards.length === 2
            ? [null, cards[newIndex], cards[nextIndex]]
            : [null, cards[newIndex], null];
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
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (event: React.TouchEvent) => { setTouchStartX(event.touches[0].clientX) };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!touchStartX) return;

    const touchEndX = event.touches[0].clientX;
    const threshold = 0;

    if (touchEndX - touchStartX > threshold) {
      setTouchStartX(null);
      dispatch({ type: "PREV" });
    } else if (touchStartX - touchEndX > threshold) {
      setTouchStartX(null);
      dispatch({ type: "NEXT" });
    }
  };

  const handleTouchEnd = () => { setTouchStartX(null) };

  return (
    <Box
      sx={{
        display: "grid",
        justifyContent: "center",
        alignItems: "center",
        alignContent: "start",
        height: "100%",
        width: "100%",
        margin: 0,
        mt: 2,
        padding: 0,
        overflow: "hidden",
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {(state.visibleCards).map((card, i) => {
        let offset = i - 1;
        let onClick;

        if (offset === 1) { onClick = () => dispatch({ type: "NEXT" }) }
        else if (offset === -1) { onClick = () => dispatch({ type: "PREV" }) };

        return (
          <Slide
            key={'Slide' + i}
            isMobile={isMobile}
            card={card}
            offset={offset}
            onClick={onClick}
          />
        );
      })}
    </Box>
  );
}

type Action = { type: "NEXT" } | { type: "PREV" } | { type: "CARDS_CHANGED" };

interface SlideProps {
    isMobile: boolean;
    card: React.ReactNode;
    offset: number;
    onClick?: () => void;
}

function Slide({ isMobile, card, offset, onClick }: SlideProps) {

  const active = offset === 0 ? true : null;
  const x = useMotionValue(0);

  return (
    <Box
      component={motion.div}
      drag="x"
      data-active={active}
      onClick={onClick}
      style={{
        x,
        zIndex: offset === 0 ? 1 : 0,
        gridArea: "1 / -1",
        transformStyle: "preserve-3d",
        // "--offset": offset,
        // "--dir": offset === 0 ? 0 : offset > 0 ? 1 : -1,
      }}
      dragConstraints={{ left: 0, right: 0 }}
      transition={{
        type: "spring",
        stiffness: 100,
        damping: 20,
      }}
      // animate={{
      //   transform: `perspective(1000px) translateX(calc(90% * var(--offset))) rotateY(calc(20deg * var(--dir)))`,
      // }}
    >
      <Box
        // component={motion.div}
        // drag="x"
        sx={{
          ...!isMobile && {
              width: offset === 0 ? "20vw" : "16vw",
          },
          ...isMobile && {
              width: offset === 0 ? "70vw" : offset === 1 ? "50vw" : "50vw",
          },
          height: "100%",
          display: "grid",
          transformStyle: "preserve-3d",
          "--offset": offset,
          "--dir": offset === 0 ? 0 : offset > 0 ? 1 : -1,
          transform: `perspective(1000px) translateX(calc(90% * var(--offset))) rotateY(calc(20deg * var(--dir)))`,
        }}
      >
        {card}
      </Box>
    </Box>
  );
};