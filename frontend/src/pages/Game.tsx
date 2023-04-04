import CardImg from "src/components/CardImg";
import Page from "src/components/Page";
import { Stack } from "@mui/material";
import { CSSProperties, useContext, useEffect, createRef, RefObject } from "react";
import HSwipe from "src/components/HSwipe";
import { MetadataContext } from "src/contexts/MetadataContext";
import EndButtons from "src/components/EndButtons";
// ----------------------------------------------------------------------

export default function Game() {

    useEffect(() => {
        const originalOverflowY = document.body.style.overflowY;
        document.body.style.overflowY = "hidden";
    
        return () => {
            document.body.style.overflowY = originalOverflowY;
        };
    }, []);

    const { isMobile } = useContext(MetadataContext);

    const section1 = createRef<HTMLDivElement>();
    const section2 = createRef<HTMLDivElement>();
    const section3 = createRef<HTMLDivElement>();
    const section4 = createRef<HTMLDivElement>();

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
    
    const div_style: CSSProperties = {
        height: isMobile ? '90vh' : '80vh',
        width: '100%',
        display: 'flex',
        scrollSnapStop: 'always',
        scrollSnapAlign: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    };

    return (
        <Page title="Play">
            <Stack spacing={10} height={'100%'} id={'container'} sx={{ touchAction: 'none' }}>
                <div style={div_style} ref={section1}>
                    <HSwipe
                        isMobile={isMobile}
                        cards={[
                            <CardImg faction={'baratheon'} card_name={'baratheon-justice'} />,
                            <CardImg faction={'baratheon'} card_name={'oath-of-duty'} />,
                            <CardImg faction={'baratheon'} card_name={'ours-is-the-fury'} />,
                        ]}
                    />
                </div>
                <div style={div_style} ref={section2}>
                    <HSwipe
                        isMobile={isMobile}
                        cards={[
                            <CardImg faction={'baratheon'} card_name={'baratheon-justice'} />,
                            <CardImg faction={'baratheon'} card_name={'oath-of-duty'} />,
                            <CardImg faction={'baratheon'} card_name={'ours-is-the-fury'} />,
                        ]}
                    />
                </div>
                <div style={div_style} ref={section3}>
                    <HSwipe
                        isMobile={isMobile}
                        cards={[
                            <CardImg faction={'baratheon'} card_name={'baratheon-justice'} />,
                            <CardImg faction={'baratheon'} card_name={'oath-of-duty'} />,
                            <CardImg faction={'baratheon'} card_name={'ours-is-the-fury'} />,
                        ]}
                    />
                </div>
                <div style={div_style} ref={section4}>
                    <HSwipe
                        isMobile={isMobile}
                        cards={[
                            <CardImg faction={'baratheon'} card_name={'baratheon-justice'} />,
                            <CardImg faction={'baratheon'} card_name={'oath-of-duty'} />,
                            <CardImg faction={'baratheon'} card_name={'ours-is-the-fury'} />,
                        ]}
                    />
                </div>

                <EndButtons />
            </Stack>
        </Page>
    );
}