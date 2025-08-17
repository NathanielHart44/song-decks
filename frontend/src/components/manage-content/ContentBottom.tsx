import {
    Box,
    Divider,
    Stack,
} from "@mui/material";
import { Action, State } from "./ManageCardContent";
import { CardOptions } from "./edit-contents/CardOptions";
import { CardTemplate } from "src/@types/types";
import EditAddCard from "./edit-contents/EditAddCard";

// ----------------------------------------------------------------------

type ContentBottomProps = {
    contentState: State;
    contentDispatch: React.Dispatch<Action>;
    isMobile: boolean;
};

// ----------------------------------------------------------------------

export default function ContentBottom({ contentState, contentDispatch, isMobile }: ContentBottomProps) {

    const faction_card_display = (contentState.mode === 'type_select' || contentState.mode === 'commander_select') && contentState.factionCards && contentState.factions;
    const commander_card_display = contentState.mode === 'commander' && contentState.commanderCards && contentState.selectedFaction && contentState.factions && contentState.allCommanders;
    const display_any = faction_card_display || commander_card_display;

    return (
        <Stack width={'100%'} justifyContent={'center'} alignItems={'center'}>
            { display_any &&
                <Box width={'75%'} sx={{ pb: 8 }}>
                    <Divider flexItem />
                </Box>
            }
            { faction_card_display && contentState.factionCards &&
                <CardOptions
                    isMobile={isMobile}
                    cards={contentState.factionCards}
                    defaultCards={null}
                    factions={contentState.factions}
                    commanders={contentState.allCommanders ?? []}
                    handleClick={() => {
                        contentDispatch({ type: 'TOGGLE_ADD_NEW_CARD' });
                    } }
                    setCards={(cards: CardTemplate[]) => { contentDispatch({ type: 'SET_FACTION_CARDS', payload: cards }); } }
                />
            }
            { commander_card_display && contentState.commanderCards &&
                <CardOptions
                    isMobile={isMobile}
                    cards={contentState.commanderCards}
                    defaultCards={contentState.factionCards ? contentState.factionCards : null}
                    factions={contentState.factions}
                    commanders={contentState.allCommanders ?? []}
                    handleClick={() => {
                        contentDispatch({ type: 'TOGGLE_ADD_NEW_CARD' });
                    } }
                    setCards={(cards: CardTemplate[]) => { contentDispatch({ type: 'SET_COMMANDER_CARDS', payload: cards }); } }
                />
            }
            { (faction_card_display || commander_card_display) &&
                <EditAddCard
                    card={{
                        id: -1,
                        card_name: '',
                        img_url: '',
                        faction: contentState.selectedFaction ? contentState.selectedFaction : null,
                        commander: contentState.selectedCommander ? contentState.selectedCommander : null,
                        replaces: null,
                    }}
                    cards={contentState.commanderCards ? contentState.commanderCards : contentState.factionCards ? contentState.factionCards : []}
                    defaultCards={contentState.commanderCards ? contentState.commanderCards : contentState.factionCards ? contentState.factionCards : []}
                    factions={contentState.factions}
                    commanders={contentState.allCommanders}
                    editOpen={contentState.addNewCard}
                    setEditOpen={() => { contentDispatch({ type: 'TOGGLE_ADD_NEW_CARD' }); } }
                    setCards={contentState.commanderCards ?
                        (cards: CardTemplate[]) => { contentDispatch({ type: 'SET_COMMANDER_CARDS', payload: cards }); } :
                        (cards: CardTemplate[]) => { contentDispatch({ type: 'SET_FACTION_CARDS', payload: cards }); } }
                />
            }
            {/* Unit/Attachment/NCU displays removed */}
        </Stack>
    );
};
