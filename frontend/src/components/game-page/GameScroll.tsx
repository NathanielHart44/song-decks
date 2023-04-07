import { Stack } from "@mui/material";
import { useContext, useEffect, RefObject, ReactNode } from "react";
import { MetadataContext } from "src/contexts/MetadataContext";
// ----------------------------------------------------------------------

type GameScrollProps = {
    children: ReactNode[];
    sectionRefs: RefObject<HTMLDivElement>[];
};

export default function GameScroll({ children, sectionRefs }: GameScrollProps) {

    useEffect(() => {
        const originalOverflowY = document.body.style.overflowY;
        document.body.style.overflowY = "hidden";
    
        return () => {
            document.body.style.overflowY = originalOverflowY;
        };
    }, []);

    const { isMobile } = useContext(MetadataContext);

    const section1 = sectionRefs[0];
    const section2 = sectionRefs[1];
    const section3 = sectionRefs[2];
    const section4 = sectionRefs[3];

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
                    scrollTo(section2);
                    currentSection = 2;
                } else if (currentSection === 2) {
                    scrollTo(section3);
                    currentSection = 3;
                } else if (currentSection === 3) {
                    scrollTo(section4);
                    currentSection = 4;
                }
            } else {
                if (currentSection === 4) {
                    scrollTo(section3);
                    currentSection = 3;
                } else if (currentSection === 3) {
                    scrollTo(section2);
                    currentSection = 2;
                } else if (currentSection === 2) {
                    scrollTo(section1);
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
                    scrollTo(section2);
                    currentSection = 2;
                } else if (currentSection === 2) {
                    scrollTo(section3);
                    currentSection = 3;
                } else if (currentSection === 3) {
                    scrollTo(section4);
                    currentSection = 4;
                }
            } else {
                if (currentSection === 4) {
                    scrollTo(section3);
                    currentSection = 3;
                } else if (currentSection === 3) {
                    scrollTo(section2);
                    currentSection = 2;
                } else if (currentSection === 2) {
                    scrollTo(section1);
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
    }, [section1, section2, section3, section4, isMobile]);

    return (
        <Stack spacing={10} height={'100%'} id={'container'} sx={{ touchAction: 'none' }}>
            {children}
        </Stack>
    );
}