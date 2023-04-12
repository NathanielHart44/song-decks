import Page from "src/components/Page";
import { RefObject, useContext, useEffect, useRef, useState } from "react";
import { MetadataContext } from "src/contexts/MetadataContext";
import GameContent from "src/components/game-page/GameContent";
import { Stack } from "@mui/material";
import SectionStepper from "src/components/SectionStepper";
// ----------------------------------------------------------------------

export default function Game() {

    const { isMobile, selectedSection, setSelectedSection } = useContext(MetadataContext);
    const [scrollValid, setScrollValid] = useState<boolean>(true);
    const mountedRef = useRef(0);
    const scroll_disable_length = 750;

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
        if (section.current) {
            setSelectedSection(section.current);
            section.current.scrollIntoView({ behavior });
        };
    };

    function findCurrentSection() {
        if (!selectedSection) return 1;
        if (selectedSection.id === sectionRef1.current?.id) {
            scrollTo(sectionRef1);
            return 1;
        } else if (selectedSection.id === sectionRef2.current?.id) {
            scrollTo(sectionRef2);
            return 2;
        } else if (selectedSection.id === sectionRef3.current?.id) {
            scrollTo(sectionRef3);
            return 3;
        } else if (selectedSection.id === sectionRef4.current?.id) {
            scrollTo(sectionRef4);
            return 4;
        } else {
            scrollTo(sectionRef1);
            return 1;
        }
    };

    useEffect(() => {
        let currentSection = findCurrentSection();

        let isScrolling = false;
        let startY: number | null = null;
        let startX: number | null = null;
    
        function handleIsScrolling() {
            isScrolling = true;
            setScrollValid(false);
            setTimeout(() => {
                isScrolling = false;
                setScrollValid(true);
            }, scroll_disable_length);
        }

        const handleScroll = (event: WheelEvent) => {

            event.preventDefault();
            const container = document.getElementById("container");
            if (!scrollValid || isScrolling || !container) return;

            if (event.deltaY > 0) {
                if (currentSection === 1 && sectionRef2.current) {
                    scrollTo(sectionRef2);
                    handleIsScrolling();
                    currentSection = 2;
                } else if (currentSection === 2 && sectionRef3.current) {
                    scrollTo(sectionRef3);
                    handleIsScrolling();
                    currentSection = 3;
                } else if (currentSection === 3 && sectionRef4.current) {
                    scrollTo(sectionRef4);
                    handleIsScrolling();
                    currentSection = 4;
                }
            } else {
                if (currentSection === 4 && sectionRef3.current) {
                    scrollTo(sectionRef3);
                    handleIsScrolling();
                    currentSection = 3;
                } else if (currentSection === 3 && sectionRef2.current) {
                    scrollTo(sectionRef2);
                    handleIsScrolling();
                    currentSection = 2;
                } else if (currentSection === 2 && sectionRef1.current) {
                    scrollTo(sectionRef1);
                    handleIsScrolling();
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
            setTimeout(() => { isScrolling = false }, scroll_disable_length);
          
            if (deltaY < 0) {
                if (currentSection === 1 && sectionRef2.current) {
                    scrollTo(sectionRef2);
                    handleIsScrolling();
                    currentSection = 2;
                } else if (currentSection === 2 && sectionRef3.current) {
                    scrollTo(sectionRef3);
                    handleIsScrolling();
                    currentSection = 3;
                } else if (currentSection === 3 && sectionRef4.current) {
                    scrollTo(sectionRef4);
                    handleIsScrolling();
                    currentSection = 4;
                }
            } else {
                if (currentSection === 4 && sectionRef3.current) {
                    scrollTo(sectionRef3);
                    handleIsScrolling();
                    currentSection = 3;
                } else if (currentSection === 3 && sectionRef2.current) {
                    scrollTo(sectionRef2);
                    handleIsScrolling();
                    currentSection = 2;
                } else if (currentSection === 2 && sectionRef1.current) {
                    scrollTo(sectionRef1);
                    handleIsScrolling();
                    currentSection = 1;
                }
            }
        }

        if (mountedRef.current === 0) {
            mountedRef.current = 1;
            scrollTo(sectionRef1);
            return;
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
    }, [scrollValid, sectionRef1, sectionRef2, sectionRef3, sectionRef4, isMobile, selectedSection]);

    return (
        <Page title="Play">
            <Stack spacing={10} height={'100%'} width={'100%'} id={'container'} justifyContent={'center'} alignItems={'center'}
            sx={{
                touchAction: 'none',
                border: scrollValid ? '8px solid green' : '8px solid red',
            }}
            >
                <SectionStepper />
                <GameContent
                    isMobile={isMobile}
                    sectionRefs={{sectionRef1, sectionRef2, sectionRef3, sectionRef4}}
                />
            </Stack>
        </Page>
    );
}