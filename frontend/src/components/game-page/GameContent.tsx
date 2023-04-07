import CardImg from "src/components/CardImg";
import { CSSProperties, RefObject } from "react";
import HSwipe from "src/components/HSwipe";
import EndButtons from "src/components/EndButtons";
// ----------------------------------------------------------------------

type GameContentProps = {
    isMobile: boolean;
    sectionRefs: RefObject<HTMLDivElement>[];
};

export default function GameContent({ isMobile, sectionRefs }: GameContentProps) {

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
        <>
            <div style={div_style} ref={sectionRefs[0]}>
                <HSwipe
                    isMobile={isMobile}
                    cards={[
                        <CardImg faction={'baratheon'} card_name={'baratheon-justice'} />,
                        <CardImg faction={'baratheon'} card_name={'oath-of-duty'} />,
                        <CardImg faction={'baratheon'} card_name={'ours-is-the-fury'} />,
                    ]}
                />
            </div>
            <div style={div_style} ref={sectionRefs[1]}>
                <HSwipe
                    isMobile={isMobile}
                    cards={[
                        <CardImg faction={'baratheon'} card_name={'baratheon-justice'} />,
                        <CardImg faction={'baratheon'} card_name={'oath-of-duty'} />,
                        <CardImg faction={'baratheon'} card_name={'ours-is-the-fury'} />,
                    ]}
                />
            </div>
            <div style={div_style} ref={sectionRefs[2]}>
                <HSwipe
                    isMobile={isMobile}
                    cards={[
                        <CardImg faction={'baratheon'} card_name={'baratheon-justice'} />,
                        <CardImg faction={'baratheon'} card_name={'oath-of-duty'} />,
                        <CardImg faction={'baratheon'} card_name={'ours-is-the-fury'} />,
                    ]}
                />
            </div>
            <div style={div_style} ref={sectionRefs[3]}>
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
        </>
    );
}