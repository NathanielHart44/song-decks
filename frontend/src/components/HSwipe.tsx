import { Box } from "@mui/material";
import React, { useReducer, useState } from "react";

// ----------------------------------------------------------------------

interface State {
    slideIndex: number;
    visibleCards: React.ReactNode[];
}

type Props = {
    cards: React.ReactNode[];
    isMobile: boolean;
};

export default function HSwipe({ cards, isMobile }: Props) {

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
            return { ...state, slideIndex: newIndex < cards.length ? newIndex : 0, visibleCards: newVisibleCards };
        }
        
        if (event.type === "PREV") {
            const [previousIndex, newIndex, nextIndex] = getIndexes(state.slideIndex - 1);
            const newVisibleCards = cards.length > 2
                ? [cards[previousIndex], cards[newIndex], cards[nextIndex]]
                : cards.length === 2
                ? [null, cards[newIndex], cards[nextIndex]]
                : [null, cards[newIndex], null];
            return { ...state, slideIndex: newIndex >= 0 ? newIndex : cards.length - 1, visibleCards: newVisibleCards };
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

  const [state, dispatch] = useReducer(slidesReducer, initialState);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (event: React.TouchEvent) => { setTouchStartX(event.touches[0].clientX) };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (!touchStartX) return;

    const touchEndX = event.touches[0].clientX;
    const threshold = 100;

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
        height: "100%",
        width: "100%",
        margin: 0,
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

type Action = { type: "NEXT" } | { type: "PREV" };

interface SlideProps {
    isMobile: boolean;
    currentIndex: number;
    cards: React.ReactNode[];
    offset: number;
    onClick?: () => void;
}

function Slide({ isMobile, currentIndex, cards, offset, onClick }: SlideProps) {
    const active = offset === 0 ? true : null;
  
    return (
        <Box
          data-active={active}
          onClick={onClick}
          sx={{
            zIndex: offset === 0 ? 1 : 0,
            gridArea: "1 / -1",
            transformStyle: "preserve-3d",
            "--offset": offset,
            "--dir": offset === 0 ? 0 : offset > 0 ? 1 : -1,
          }}
        >
          <Box
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
            }}
          >
            {cards[currentIndex]}
          </Box>
        </Box>
      );
  }

  // function useTilt(active: boolean | null) {
//     const ref = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         if (!ref.current) { return };

//         const state = {
//             rect: undefined as DOMRect | undefined,
//             mouseX: undefined as number | undefined,
//             mouseY: undefined as number | undefined
//         };
        
//         let el = ref.current;
        
//         const handleMouseMove = (e: MouseEvent) => {
//             if (!el) { return };
//             if (!state.rect) { state.rect = el.getBoundingClientRect() };
//             state.mouseX = e.clientX;
//             state.mouseY = e.clientY;
//             const px = (state.mouseX - state.rect.left) / state.rect.width;
//             const py = (state.mouseY - state.rect.top) / state.rect.height;
        
//             el.style.setProperty("--px", String(px));
//             el.style.setProperty("--py", String(py));
//             console.log(px, py);
//         };
        
//         el.addEventListener("mousemove", handleMouseMove);
        
//         return () => { el.removeEventListener("mousemove", handleMouseMove) };
//     }, [active]);

//     return ref;
// }