import { MobileStepper, useTheme, Tabs, Tab, Stack, IconButton } from "@mui/material";
import { useContext } from "react";
import { MetadataContext } from "src/contexts/MetadataContext";
import Iconify from "./Iconify";
import { PlayerCard, allSteps } from "src/@types/types";
import { GroupingHeader } from "./game-page/GameContent";

// ----------------------------------------------------------------------

export default function SectionStepper() {

    const { isMobile, inDeck, inHand, inPlay, inDiscard, selectedSection, loadSelectedSection } = useContext(MetadataContext);
    const game_status = { inDeck, inHand, inPlay, inDiscard, selectedSection, loadSelectedSection };

    return (
        <Stack
            direction={'row'}
            width={'100%'}
            sx={{
                position: 'fixed',
                top: 60,
                left: 0,
                zIndex: 100,
                justifyContent: 'center'
            }}
        >
            {
                isMobile ?
                <DotsMobileStepper game_status={game_status} /> :
                <SectionTabs game_status={game_status} />
            }
        </Stack>
    )
}

// ----------------------------------------------------------------------

type StepProps = {
    game_status: {
        inDeck: PlayerCard[];
        inHand: PlayerCard[];
        inPlay: PlayerCard[];
        inDiscard: PlayerCard[];
        selectedSection: HTMLDivElement | null;
        loadSelectedSection: (section: string) => void;
    };
}

function DotsMobileStepper({ game_status }: StepProps) {
    
    const theme = useTheme();
    const { inDeck, inHand, inPlay, inDiscard, selectedSection, loadSelectedSection } = game_status;
    const button_size = 22;

    const handleNext = () => {
        if (!selectedSection) return;
        const section_id = selectedSection.id;
        const section_index = allSteps.indexOf(section_id);
        if (section_index === allSteps.length - 1) { loadSelectedSection(allSteps[0]) }
        else { loadSelectedSection(allSteps[section_index + 1]) };
    };

    const handleBack = () => {
        if (!selectedSection) return;
        const section_id = selectedSection.id;
        const section_index = allSteps.indexOf(section_id);
        if (section_index === 0) { loadSelectedSection(allSteps[allSteps.length - 1]) }
        else { loadSelectedSection(allSteps[section_index - 1]) };
    };

    function getStepCount(step: string) {
        switch (step) {
            case 'Deck': return inDeck.length;
            case 'Hand': return inHand.length;
            case 'In Play': return inPlay.length;
            case 'Discard': return inDiscard.length;
            default: return 0;
        }
    };

    return (
        <Stack spacing={0} width={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
            <MobileStepper
                variant="dots"
                steps={allSteps.length}
                position="static"
                activeStep={selectedSection ? allSteps.indexOf(selectedSection.id) : 0}
                sx={{
                    pb: 0,
                    mb: 0,
                    width: '100%',
                    flexGrow: 1,
                    '& .MuiMobileStepper-dot': {
                        width: 16,
                        height: 16,
                        margin: theme.spacing(0, 1.5),
                        padding: 0,
                        backgroundColor: theme.palette.grey[500],
                        '&.MuiMobileStepper-dotActive': {
                            width: 16,
                            height: 16,
                            margin: theme.spacing(0, 1.5),
                            padding: 0,
                            backgroundColor: theme.palette.primary.main,
                        }
                    }
                }}

                onClick={(event) => {
                    const target = event.target as HTMLButtonElement;
                    if (!target.classList.contains('MuiMobileStepper-dot')) return;
                    const dotIndex = Array.from(target.parentElement?.children || []).indexOf(target);
                    loadSelectedSection(allSteps[dotIndex]);
                }}

                nextButton={
                    <IconButton size="small" onClick={handleNext}>
                        <Iconify icon={'eva:arrow-ios-forward-outline'} sx={{ width: button_size, height: button_size }} />
                    </IconButton>
                }
                backButton={
                    <IconButton size="small" onClick={handleBack}>
                        <Iconify icon={'eva:arrow-ios-back-outline'} sx={{ width: button_size, height: button_size }} />
                    </IconButton>
                }
            />
            <GroupingHeader
                title={selectedSection ? selectedSection.id : allSteps[0]}
                count={selectedSection ? getStepCount(selectedSection.id) : inDeck.length}
            />
        </Stack>
    );
}

// ----------------------------------------------------------------------

function SectionTabs({ game_status }: StepProps) {

    const { inDeck, inHand, inPlay, inDiscard, selectedSection, loadSelectedSection } = game_status;
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        loadSelectedSection(newValue);
    };

    function getStepCount(step: string) {
        switch (step) {
            case 'Deck': return inDeck.length;
            case 'Hand': return inHand.length;
            case 'In Play': return inPlay.length;
            case 'Discard': return inDiscard.length;
            default: return 0;
        }
    };

    return (
        <Tabs
            value={selectedSection ? selectedSection.id : allSteps[0]}
            onChange={handleChange}
            sx={{ alignItems: 'center', width: '100%' }}
        >
            { allSteps.map((step, index) =>
                <Tab
                    key={index}
                    label={`${step} (${getStepCount(step)})`}
                    value={step}
                    disableRipple
                    disabled={getStepCount(step) === 0}
                    sx={{ mx: 'auto' }}
                />
            )}
        </Tabs>
    )
}
