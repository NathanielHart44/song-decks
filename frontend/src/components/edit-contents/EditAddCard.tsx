import {
    Backdrop,
    Button,
    Slide,
    Stack,
    TextField,
    useTheme
} from "@mui/material"
import { useSnackbar } from "notistack";
import { useContext, useState } from "react";
import { CardTemplate, Commander, Faction, FakeCardTemplate } from "src/@types/types";
import { MetadataContext } from "src/contexts/MetadataContext";
import LoadingBackdrop from "../LoadingBackdrop";
import { processTokens } from "src/utils/jwt";
import axios from "axios";
import { MAIN_API } from "src/config";
import UploadAvatarComp, { FileWithPreview } from "../upload/UploadAvatarComp";

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
    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const [cardName, setCardName] = useState<string>(card.card_name);
    const [imgURL, setImgURL] = useState<string>(card.img_url);
    const [urlLock, setURLLock] = useState<boolean>(false);
    const [uploadFile, setUploadFile] = useState<FileWithPreview | null>(null);
    const [faction, setFaction] = useState<Faction | null>(card.faction);
    const [commander, setCommander] = useState<Commander | null>(card.commander);
    const [replacement, setReplacement] = useState<CardTemplate | null>(card.replaces ? card.replaces : null);

    const handleCardNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCardName(event.target.value);
    };

    const handleImgURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setImgURL(event.target.value);
    };

    function closeScreen() {
        if (card) {
            setCardName(card.card_name);
            setImgURL(card.img_url);
            setFaction(card.faction);
            setCommander(card.commander);
        } else {
            setCardName('');
            setImgURL('');
            setFaction(null);
            setCommander(null);
        };
        setEditOpen(false);
    }

    const deleteCard = async () => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';

        await axios.get(`${MAIN_API.base_url}delete_card/${card && card.id + '/'}`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                setCards(cards.filter((c) => c.id !== card?.id));
                setEditOpen(false);
                enqueueSnackbar(res);
            } else { enqueueSnackbar(response.data.response); };
            setAwaitingResponse(false);
        });
    };

    const submitForm = async () => {
        if (!cardName || !imgURL || !faction) {
            enqueueSnackbar('Please fill out all fields', { variant: 'error' });
            return;
        };
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';

        const formData = new FormData();
        formData.append('card_name', cardName);
        formData.append('img_url', imgURL);
        formData.append('faction_id', (faction.id).toString());
        if (commander) { formData.append('commander_id', (commander.id).toString()) };
        if (replacement) { formData.append('replaces_id', (replacement.id).toString()) };
        if (uploadFile) { formData.append('img_file', uploadFile) };

        const url = (card.id !== -1) ? `${MAIN_API.base_url}add_edit_card/${card.id}/` : `${MAIN_API.base_url}add_edit_card/`;
        await axios.post(url, formData, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                const new_card = response.data.card;
                if (card) {
                    setCards(cards.map((c) => c.id === card.id ? new_card : c));
                } else {
                    setCards([...cards, new_card]);
                }
                setEditOpen(false);
                enqueueSnackbar(res);
            } else { enqueueSnackbar(response.data.response); };
            setAwaitingResponse(false);
        }).catch((error) => {
            console.error(error);
        });
    };

    return (
        <div>
            { awaitingResponse && <LoadingBackdrop /> }
            <div>
                <Backdrop
                    open={editOpen}
                    sx={{
                        backgroundColor: 'rgba(0, 0, 0, 0.75)',
                        color: theme.palette.primary.main,
                        zIndex: (theme) => theme.zIndex.drawer + 1,
                    }}
                    onClick={closeScreen}
                >
                    <Slide direction="up" in={editOpen} mountOnEnter unmountOnExit>

                        <Stack
                            spacing={2}
                            justifyContent={'center'}
                            alignItems={'center'}
                            sx={{ width: isMobile ? '90%' : '50%' }}
                            onClick={(event) => { event.stopPropagation() }}
                        >
                            <TextField
                                select
                                fullWidth
                                value={faction ? faction.id : ''}
                                onChange={(event) => {
                                    const faction_id = event.target.value;
                                    const faction = factions.find((faction) => faction.id === parseInt(faction_id));
                                    if (faction) { setFaction(faction) };
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
                                value={commander ? commander.id : ''}
                                onChange={(event) => {
                                    const commander_id = event.target.value;
                                    const commander = commanders.find((commander) => commander.id === parseInt(commander_id));
                                    if (commander) { setCommander(commander) };
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
                                value={cardName}
                                sx={{ labelWidth: "text".length * 9 }}
                                onChange={handleCardNameChange}
                                label={"Card Name"}
                            />
                            { defaultCards &&
                                <TextField
                                    select
                                    fullWidth
                                    value={replacement ? replacement.id : ''}
                                    onChange={(event) => {
                                        const card_id = event.target.value;
                                        const replacement = defaultCards.find((card) => card.id === parseInt(card_id));
                                        if (replacement) { setReplacement(replacement) }
                                        else { setReplacement(null) };
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
                                value={imgURL}
                                sx={{ labelWidth: "text".length * 9 }}
                                onChange={handleImgURLChange}
                                label={"Image URL"}
                                disabled={urlLock}
                            />

                            <UploadAvatarComp
                                type={'card'}
                                name={cardName}
                                faction={faction}
                                commander={
                                    (commander && commander.id !== -1) ? commander : null
                                }
                                uploadFile={uploadFile}
                                setUploadFile={setUploadFile}
                                imgURL={imgURL}
                                setImgURL={setImgURL}
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
                                    onClick={() => { processTokens(submitForm) }}
                                    sx={{ width: isMobile ? '35%' : '25%' }}
                                    disabled={!cardName || !imgURL || !faction || awaitingResponse}
                                >
                                    Confirm
                                </Button>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => { processTokens(deleteCard) }}
                                    sx={{ width: isMobile ? '35%' : '25%' }}
                                    color={'secondary'}
                                    disabled={card.id === -1 || awaitingResponse}
                                >
                                    Delete
                                </Button>
                            </Stack>
                        </Stack>
                    </Slide>
                </Backdrop>
            </div>
        </div>
    )
}