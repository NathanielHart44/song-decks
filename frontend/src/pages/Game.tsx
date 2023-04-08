import Page from "src/components/Page";
import { RefObject, useContext, useEffect, useRef } from "react";
import { MetadataContext } from "src/contexts/MetadataContext";
import GameContent from "src/components/game-page/GameContent";
import { Stack } from "@mui/material";
// ----------------------------------------------------------------------

export default function Game() {

    const { isMobile } = useContext(MetadataContext);

    useEffect(() => {
        const originalOverflowY = document.body.style.overflowY;
        document.body.style.overflowY = "hidden";
    
        return () => {
            document.body.style.overflowY = originalOverflowY;
        };
    }, []);

    const sectionRef1 = useRef<HTMLDivElement>(null);
    const sectionRef2 = useRef<HTMLDivElement>(null);
    const sectionRef3 = useRef<HTMLDivElement>(null);
    const sectionRef4 = useRef<HTMLDivElement>(null);

    function scrollTo(section: RefObject<HTMLDivElement>, behavior: ScrollBehavior = "smooth") {
        if (section.current) { section.current.scrollIntoView({ behavior }) };
      }

    useEffect(() => {
        let currentSection = 1;
        let isScrolling = false;
        let startY: number | null = null;
        let startX: number | null = null;
    
        const handleScroll = (event: WheelEvent) => {

            event.preventDefault();
            const container = document.getElementById("container");
            if (isScrolling || !container) return;
    
            isScrolling = true;
            setTimeout(() => { isScrolling = false }, 500);

            if (event.deltaY > 0) {
                if (currentSection === 1) {
                    scrollTo(sectionRef2);
                    currentSection = 2;
                } else if (currentSection === 2) {
                    scrollTo(sectionRef3);
                    currentSection = 3;
                } else if (currentSection === 3) {
                    scrollTo(sectionRef4);
                    currentSection = 4;
                }
            } else {
                if (currentSection === 4) {
                    scrollTo(sectionRef3);
                    currentSection = 3;
                } else if (currentSection === 3) {
                    scrollTo(sectionRef2);
                    currentSection = 2;
                } else if (currentSection === 2) {
                    scrollTo(sectionRef1);
                    currentSection = 1;
                }
            }
        };
    
        function handleTouchStart(event: TouchEvent) {
            startX = event.touches[0].clientX
            startY = event.touches[0].clientY
        };

        function handleTouchMove(event: TouchEvent) {
            const container = document.getElementById("container");
            if (isScrolling || !container || startY === null || startX === null) return;

            const deltaX = event.touches[0].clientX - startX;
            const deltaY = event.touches[0].clientY - startY;
            const angle = Math.abs(Math.atan2(deltaY, deltaX) * 180 / Math.PI);
            if (angle < 80 || angle > 100) { startY = null };
          
            isScrolling = true;
            setTimeout(() => { isScrolling = false }, 500);
          
            if (deltaY < 0) {
                if (currentSection === 1) {
                    scrollTo(sectionRef2);
                    currentSection = 2;
                } else if (currentSection === 2) {
                    scrollTo(sectionRef3);
                    currentSection = 3;
                } else if (currentSection === 3) {
                    scrollTo(sectionRef4);
                    currentSection = 4;
                }
            } else {
                if (currentSection === 4) {
                    scrollTo(sectionRef3);
                    currentSection = 3;
                } else if (currentSection === 3) {
                    scrollTo(sectionRef2);
                    currentSection = 2;
                } else if (currentSection === 2) {
                    scrollTo(sectionRef1);
                    currentSection = 1;
                }
            }
        }

        const container = document.getElementById("container");
        if (container) {
            if (isMobile) {
                container.addEventListener("touchstart", handleTouchStart);
                container.addEventListener("touchmove", handleTouchMove);
            } else {
                container.addEventListener("wheel", handleScroll);
            }
        }
    
        return () => {
            if (container) {
                if (isMobile) {
                    container.removeEventListener("touchstart", handleTouchStart);
                    container.removeEventListener("touchmove", handleTouchMove);
                } else {
                    container.removeEventListener("wheel", handleScroll);
                }
            }
        };
    }, [sectionRef1, sectionRef2, sectionRef3, sectionRef4, isMobile]);

    return (
        <Page title="Play">
            <Stack spacing={10} height={'100%'} width={'100%'} id={'container'} sx={{ touchAction: 'none' }}>
                <GameContent
                    isMobile={isMobile}
                    sectionRefs={{sectionRef1, sectionRef2, sectionRef3, sectionRef4}}
                />
            </Stack>
        </Page>
    );
}