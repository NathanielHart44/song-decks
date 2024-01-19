import {
    Button,
    Dialog,
    Stack,
    TextField,
    useTheme
} from "@mui/material"
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { CardTemplate, Commander, Faction, FakeCardTemplate } from "src/@types/types";
import { MetadataContext } from "src/contexts/MetadataContext";
import LoadingBackdrop from "../../base/LoadingBackdrop";
import { processTokens } from "src/utils/jwt";
import UploadAvatarComp, { FileWithPreview } from "../../upload/UploadAvatarComp";
import { useApiCall } from "src/hooks/useApiCall";

// ----------------------------------------------------------------------

type EditAddCardProps = {
    card: CardTemplate | FakeCardTemplate;
    cards: CardTemplate[];
    defaultCards: CardTemplate[] | null;
    factions: Faction[];
    commanders: Commander[];
    editOpen: boolean;
    setEditOpen: (arg0: boolean) => void;
    setCards: (arg0: CardTemplate[]) => void;
};

export default function EditAddCard({ card, cards, defaultCards, factions, commanders, editOpen, setEditOpen, setCards }: EditAddCardProps) {

    const theme = useTheme();
    const { apiCall } = useApiCall();
    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    const [urlLock, setURLLock] = useState<boolean>(false);

    const [currentCard, setCurrentCard] = useState<CardTemplate | FakeCardTemplate>(card);
    const [uploadFile, setUploadFile] = useState<FileWithPreview | null>(null);

    useEffect(() => {
        setCurrentCard(card);
        setUploadFile(null);
    }, [card, editOpen]);

    const formValid = (): boolean => {
        return !!(currentCard.card_name && currentCard.img_url && currentCard.faction);
    }

    const handleCardChange = (key: keyof CardTemplate, value: any) => {
        setCurrentCard({ ...currentCard, [key]: value } as CardTemplate);
    };

    const closeScreen = () => {
        setEditOpen(false);
        setAwaitingResponse(false);
    };

    const getFormData = (): FormData | null => {
        if (!formValid()) {
            enqueueSnackbar('Please fill out all fields', { variant: 'error' });
            return null;
        }

        const formData = new FormData();
        formData.append('card_name', currentCard.card_name);
        formData.append('img_url', currentCard.img_url);
        if (currentCard.faction) {
            formData.append('faction_id', currentCard.faction.id.toString());
        }
        if (currentCard.commander) {
            formData.append('commander_id', currentCard.commander.id.toString());
        }
        if (currentCard.replaces) {
            formData.append('replaces_id', currentCard.replaces.id.toString());
        }
        if (uploadFile) {
            formData.append('img_file', uploadFile);
        }

        return formData;
    };

    const handleCardAction = async (type: 'create' | 'edit' | 'delete') => {
        if (awaitingResponse) return;
        setAwaitingResponse(true);

        let url;
        let requestType: 'GET' | 'POST' | 'DELETE';

        switch (type) {
            case 'create':
                url = 'add_edit_card';
                requestType = 'POST';
                break;
            case 'edit':
                url = `add_edit_card/${currentCard.id}`;
                requestType = 'POST';
                break;
            case 'delete':
                url = `delete_card/${currentCard.id}`;
                requestType = 'DELETE';
                break;
            default:
                url = '';
                requestType = 'GET';
                break;
        }

        if (requestType !== 'DELETE') {
            const formData = getFormData();
            if (!formData) {
                setAwaitingResponse(false);
                return;
            }

            apiCall(url, requestType, formData, (data) => {
                switch (type) {
                    case 'create':
                        setCards([...cards, data]);
                        break;
                    case 'edit':
                        setCards(cards.map(c => c.id === currentCard.id ? data : c));
                        break;
                    case 'delete':
                        setCards(cards.filter(c => c.id !== currentCard.id));
                        break;
                }
                closeScreen();
            });
        } else {
            // Handle DELETE request
            apiCall(url, requestType, null, () => {
                setCards(cards.filter(c => c.id !== currentCard.id));
                closeScreen();
            });
        }
    };

    return (
        <div>
            {awaitingResponse && <LoadingBackdrop />}
            <Dialog
                open={editOpen}
                scroll={"body"}
                fullScreen
                maxWidth={false}
                sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.75)',
                    color: theme.palette.primary.main,
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '.MuiDialog-paperFullScreen': { backgroundColor: 'transparent' },
                    '.MuiDialog-container': { width: '100%' }
                }}
                onClick={closeScreen}
            >
                <Stack justifyContent={'center'} alignItems={'center'} sx={{ width: '100%' }}>
                    <Stack
                        spacing={2}
                        justifyContent="center"
                        alignItems="center"
                        sx={{
                            width: isMobile ? '80%' : '65%',
                            py: isMobile ? 2 : 4
                        }}
                        onClick={event => event.stopPropagation()}
                    >
                        <TextField
                            select
                            fullWidth
                            value={currentCard.faction ? currentCard.faction.id : ''}
                            onChange={(event) => {
                                const faction_id = event.target.value;
                                const faction = factions.find((faction) => faction.id === parseInt(faction_id));
                                if (faction) { handleCardChange('faction', faction) };
                            }}
                            SelectProps={{ native: true }}
                            variant="outlined"
                            sx={{ labelWidth: "text".length * 9 }}
                            label="Faction"
                        >
                            <option value={''}></option>
                            {factions.map((faction) => (
                                <option key={faction.id} value={faction.id}>
                                    {faction.name}
                                </option>
                            ))}
                        </TextField>
                        <TextField
                            select
                            fullWidth
                            value={currentCard.commander ? currentCard.commander.id : ''}
                            onChange={(event) => {
                                const commander_id = event.target.value;
                                const commander = commanders.find((commander) => commander.id === parseInt(commander_id));
                                if (commander) { handleCardChange('commander', commander) };
                            }}
                            SelectProps={{ native: true }}
                            variant="outlined"
                            sx={{ labelWidth: "text".length * 9 }}
                            label="Commander"
                        >
                            <option value={''}></option>
                            {commanders.map((commander) => (
                                <option key={commander.id} value={commander.id}>
                                    {commander.name}
                                </option>
                            ))}
                        </TextField>
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={currentCard.card_name}
                            sx={{ labelWidth: "text".length * 9 }}
                            onChange={(event) => { handleCardChange('card_name', event.target.value) }}
                            label={"Card Name"}
                        />
                        { defaultCards &&
                            <TextField
                                select
                                fullWidth
                                value={currentCard.replaces ? currentCard.replaces.id : ''}
                                onChange={(event) => {
                                    const card_id = event.target.value;
                                    const replacement = defaultCards.find((card) => card.id === parseInt(card_id));
                                    if (replacement) { handleCardChange('replaces', replacement) }
                                    else { handleCardChange('replaces', null) };
                                }}
                                SelectProps={{ native: true }}
                                variant="outlined"
                                sx={{ labelWidth: "text".length * 9 }}
                                label="Replacement For"
                            >
                                <option value={''}></option>
                                {defaultCards.map((card) => (
                                    <option key={card.id} value={card.id}>
                                        {card.card_name}
                                    </option>
                                ))}
                            </TextField>
                        }
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={currentCard.img_url}
                            sx={{ labelWidth: "text".length * 9 }}
                            onChange={(event) => { handleCardChange('img_url', event.target.value) }}
                            label={"Image URL"}
                            disabled={urlLock}
                        />

                        <UploadAvatarComp
                            type={'card'}
                            size={'card'}
                            name={currentCard.card_name}
                            faction={currentCard.faction}
                            item={
                                (currentCard.commander && currentCard.commander.id !== -1) ? currentCard.commander : null
                            }
                            uploadFile={uploadFile}
                            setUploadFile={setUploadFile}
                            // imgURL={imgURL}
                            // setImgURL={setImgURL}
                            imgURL={currentCard.img_url}
                            setImgURL={(url: string) => {
                                handleCardChange('img_url', url);
                            }}
                            setURLLock={setURLLock}
                        />

                        <Stack
                            direction={'row'}
                            spacing={2}
                            width={'100%'}
                            sx={{
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => { processTokens(() => { handleCardAction(card.id === -1 ? 'create' : 'edit') }) }}
                                disabled={!formValid() || awaitingResponse}
                                fullWidth
                            >
                                Confirm
                            </Button>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => { processTokens(() => { handleCardAction('delete') }) }}
                                color={'secondary'}
                                disabled={card.id === -1 || awaitingResponse}
                                fullWidth
                            >
                                Delete
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            </Dialog>
        </div>
    )
}