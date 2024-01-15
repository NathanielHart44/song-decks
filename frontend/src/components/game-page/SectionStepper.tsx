import { Tabs, Tab, Typography, Stack, Grid } from "@mui/material";
import { useContext, useState } from "react";
import Iconify from "../base/Iconify";
import { allSteps } from "src/@types/types";
import { MetadataContext } from "src/contexts/MetadataContext";
import { GameContext } from "src/contexts/GameContext";
import EndBackdrop from "./EndBackdrop";
import { useParams } from "react-router-dom";

// ----------------------------------------------------------------------

export default function SectionStepper() {

    const { isMobile } = useContext(MetadataContext);
    const { inDeck, inHand, inPlay, inDiscard, selectedSection, setSelectedSection, gameRound } = useContext(GameContext);

    const { gameID = '' } = useParams();
    const [open, setOpen] = useState<boolean>(false);

    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        if (newValue === 'Exit') {
            setOpen(!open);
        } else {
            setSelectedSection(newValue);
        }
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

    const icons = {
        'Deck': 'icon-park-solid:layers',
        'Hand': 'mdi:cards',
        'In Play': 'mdi:card',
        'Discard': 'game-icons:card-discard',
        'Exit': 'ic:round-exit-to-app'
    };

    const icon_size = isMobile ? 24 : 34;

    return (
        <Stack spacing={1} width={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
            <Stack spacing={0} direction={'row'} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                <Tabs
                    value={selectedSection ? selectedSection : allSteps[0]}
                    onChange={handleChange}
                    sx={{ alignItems: 'center', width: '100%' }}
                >
                    { allSteps.map((step, index) =>
                        <Tab
                            wrapped
                            key={index}
                            value={step}
                            disableRipple
                            icon={
                                <Iconify icon={icons[step as keyof typeof icons]} fontSize={icon_size} />
                            }
                            sx={{ mx: 'auto', minWidth: 'auto' }}
                        />
                    )}
                        <Tab
                            wrapped
                            key={'Exit'}
                            value={'Exit'}
                            disableRipple
                            icon={
                                <Iconify icon={icons['Exit']} fontSize={icon_size} />
                            }
                            sx={{ mx: 'auto', minWidth: 'auto' }}
                        />
                </Tabs>

                <EndBackdrop
                    gameID={gameID}
                    open={open}
                    setOpen={setOpen}
                />
            </Stack>
            <Grid container gap={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                <Grid item sm={2} md={1}>
                    <Typography variant={'body1'} sx={{ textAlign: 'center', mx: 'auto' }}>
                        {selectedSection ? selectedSection : allSteps[0]}: {getStepCount(selectedSection ? selectedSection : allSteps[0])}
                    </Typography>
                </Grid>
                <Grid item sm={2} md={1}>
                    <Typography variant={'body1'} sx={{ textAlign: 'center', mx: 'auto' }} color={'text.disabled'}>
                        |
                    </Typography>
                </Grid>
                <Grid item sm={2} md={1}>
                    <Typography variant={'body1'} sx={{ textAlign: 'center', mx: 'auto' }}>
                        Round: {gameRound}
                    </Typography>
                </Grid>
            </Grid>
        </Stack>
    )
};
