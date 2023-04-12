import { useState, useContext } from "react";
import { useSnackbar } from "notistack";
import axios from "axios";
import { MAIN_API } from "src/config";
import { ACTION_TYPE, PlayerCard } from "src/@types/types";
import { processTokens } from "src/utils/jwt";
import { Button, Stack, TextField, useTheme } from "@mui/material";
import { MetadataContext } from "src/contexts/MetadataContext";

// ----------------------------------------------------------------------
type ButtonProps = {
    category: 'hand' | 'play' | 'discard';
    selected: boolean;
    currentCard: PlayerCard;
    gameID: string;
    setAllCards: (cards: PlayerCard[]) => void;
    setAwaitingResponse: (value: boolean) => void;
};
export function ActionButtons({ category, selected, currentCard, gameID, setAllCards, setAwaitingResponse }: ButtonProps) {

    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const [updatePlayNotes, setUpdatePlayNotes] = useState<string>(currentCard.play_notes ?? '');
    const [noteEdit, setNoteEdit] = useState<boolean>(false);

    function getSnackbarMessage(action: ACTION_TYPE) {
        switch (action) {
            case 'play':
                return "Played: " + currentCard.card_template.card_name;
            case 'discard':
                return "Discarded: " + currentCard.card_template.card_name;
            case 'update_play_notes':
                return "Updated note for: " + currentCard.card_template.card_name;
            case 'place_in_deck':
                return "Placed in deck: " + currentCard.card_template.card_name;
            case 'place_in_hand':
                return "Placed in hand: " + currentCard.card_template.card_name;
        }
    };

    const handleCardAction = async (action: ACTION_TYPE) => {
        if (action === 'leave_note') { setNoteEdit(true); return };
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';

        const formData = new FormData();
        formData.append('game_id', gameID);
        formData.append('card_id', (currentCard.id).toString());
        if (action === 'update_play_notes') { formData.append('update_play_notes', updatePlayNotes); }

        await axios.post(`${MAIN_API.base_url}/handle_card_action/${action}/`, formData, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                setAllCards(res);
                enqueueSnackbar(getSnackbarMessage(action));
            } else { enqueueSnackbar(response.data.response); };
            setAwaitingResponse(false);
        }).catch((error) => {
            console.error(error);
        });
    };

    return (
        <Stack
            spacing={2}
            justifyContent={'center'}
            alignItems={'center'}
            sx={{ width: '100%', opacity: selected ? 1 : 0, transition: 'opacity 0.5s' }}
        >
            <ButtonStack
                disabled={!selected}
                category={category}
                handleCardAction={handleCardAction}
            />
            { category === 'play' &&
                <TextField
                    size={'small'}
                    variant="outlined"
                    type="string"
                    fullWidth
                    value={updatePlayNotes}
                    onChange={(event) => setUpdatePlayNotes(event.target.value)}
                    onBlur={(event) => {
                        event.stopPropagation();
                        if (updatePlayNotes !== currentCard.play_notes) {
                            processTokens(handleCardAction, 'update_play_notes');
                        };
                    }}
                    sx={{
                        opacity: (noteEdit || updatePlayNotes.length > 0) && selected ? 1 : 0,
                        transition: 'opacity 0.5s',
                        ".MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: theme.palette.primary.lighter,
                            color: theme.palette.primary.lighter
                          }
                    }}
                    multiline
                    disabled={!noteEdit}
                />
            }
        </Stack>
    );
}
// ----------------------------------------------------------------------

type ButtonStackProps = {
    disabled: boolean;
    category: 'hand' | 'play' | 'discard';
    handleCardAction: (action: ACTION_TYPE) => void;
};
type ButtonConfig = {
    label: string;
    action: string;
};
function ButtonStack({ disabled, category, handleCardAction }: ButtonStackProps) {

    const { isMobile } = useContext(MetadataContext);

    const getButtonConfigs = (category: 'hand' | 'play' | 'discard'): ButtonConfig[] => {
        switch (category) {
            case 'hand':
                return [
                    { label: 'Play', action: 'play' },
                    { label: 'Discard', action: 'discard' },
                ];
            case 'play':
                return [
                    { label: 'Note', action: 'leave_note' },
                    { label: 'Discard', action: 'discard' },
                ];
            case 'discard':
                return [
                    { label: 'To Hand', action: 'place_in_hand' },
                    { label: 'To Deck', action: 'place_in_deck' },
                ];
            default:
                return [];
        }
    };

    const buttonConfigs = getButtonConfigs(category);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>, action: string) => {
        event.stopPropagation();
        processTokens(handleCardAction, action);
    };

    return (
        <Stack
            spacing={2}
            direction={'row'}
            justifyContent={'center'}
            alignItems={'center'}
            height={'100%'}
            width={isMobile ? '50%' : '25%'}
        >
            {buttonConfigs.map((buttonConfig) => (
                <Button
                    key={buttonConfig.action}
                    variant={'contained'}
                    onClick={(event) => handleClick(event, buttonConfig.action)}
                    disabled={disabled}
                    fullWidth
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    {buttonConfig.label}
                </Button>
            ))}
        </Stack>
    );
}
