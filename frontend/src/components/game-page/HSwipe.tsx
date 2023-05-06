import { Box } from "@mui/material";
import React, { useEffect, useReducer, useRef, useState } from "react";
import { DefaultCardImg } from "../CardImg";
import { useSnackbar } from "notistack";

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

  return (
    <Box
      sx={{
        display: "grid",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      {(state.visibleCards).map((card, i) => {
        let offset = i - 1;
        let onClick;

        if (offset === 1) { onClick = () => dispatch({ type: "NEXT" }) }
        else if (offset === -1) { onClick = () => dispatch({ type: "PREV" }) };

        return (
          <Slide
            isMobile={isMobile}
            currentIndex={i}
            cards={state.visibleCards}
            offset={offset}
            key={state.slideIndex + i}
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
    currentIndex: number;
    cards: React.ReactNode[];
    offset: number;
    onClick?: () => void;
}

function Slide({ isMobile, currentIndex, cards, offset, onClick }: SlideProps) {

  const { enqueueSnackbar } = useSnackbar();
  const active = offset === 0 ? true : null;
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCardClicked, setIsCardClicked] = useState(true);
  const [showCardBack, setShowCardBack] = useState(false);

  const handleTouchStart = (event: React.TouchEvent) => {
    setTouchStartX(event.touches[0].clientX);
    setIsDragging(true);
    setIsCardClicked(true);
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!touchStartX || !active) return;
  
    const touchEndX = event.touches[0].clientX;
    const rotationDegree = (touchEndX - touchStartX) * 0.5;
  
    if (Math.abs(rotationDegree) > 5) {
      setRotation(rotationDegree);
      setIsCardClicked(false);
      setShowCardBack(rotationDegree < -90 || rotationDegree > 90);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
    setIsDragging(false);
    const remainingRotation = Math.abs(rotation) - 90;
    const timeoutDuration = (remainingRotation / 90) * 500;
    setRotation(0);
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 0.5s ease-in-out";
    }
    setTimeout(() => {
      setShowCardBack(false);
    }, timeoutDuration);
  };

  useEffect(() => {
    if (cardRef.current) {
      if (isDragging) {
        cardRef.current.style.transition = "none";
      }
      cardRef.current.style.transform = `perspective(1000px) translateX(calc(90% * var(--offset))) rotateY(${rotation}deg)`;
    }
  }, [rotation, isDragging]);
  

  return (
    <Box
      data-active={active}
      onClick={() => { (isCardClicked && onClick) && onClick() }}
      sx={{
        zIndex: offset === 0 ? 1 : 0,
        gridArea: "1 / -1",
        transformStyle: "preserve-3d",
        "--offset": offset,
        "--dir": offset === 0 ? 0 : offset > 0 ? 1 : -1,
      }}
    >
      <Box
        ref={cardRef}
        onTouchStart={event => currentIndex === 1 && handleTouchStart(event)}
        onTouchMove={event => currentIndex === 1 && handleTouchMove(event)}
        onTouchEnd={event => currentIndex === 1 && handleTouchEnd()}        
        sx={{
          ...!isMobile && {
            width: offset === 0 ? "20vw" : "16vw",
          },
          ...isMobile && {
            width: offset === 0 ? "70vw" : "50vw",
          },
          height: "100%",
          transition: "transform 0.5s ease-in-out, width 0.5s ease-in-out",
          display: "grid",
          transformStyle: "preserve-3d",
          transform: `perspective(1000px) translateX(calc(90% * var(--offset))) rotateY(calc(20deg * var(--dir)))`,
          overflow: "hidden",
        }}
      >
        {cards[currentIndex]}
        { currentIndex === 1 && showCardBack &&
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 1,
            }}
          >
            <DefaultCardImg />
          </Box>
        }
      </Box>
    </Box>
  );
}