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
import { Commander, Faction, FakeCommander } from "src/@types/types";
import { MetadataContext } from "src/contexts/MetadataContext";
import LoadingBackdrop from "../LoadingBackdrop";
import { processTokens } from "src/utils/jwt";
import axios from "axios";
import { MAIN_API } from "src/config";

// ----------------------------------------------------------------------

type EditAddCardProps = {
    commander: Commander | FakeCommander;
    commanders: Commander[];
    factions: Faction[];
    editOpen: boolean;
    setEditOpen: (arg0: boolean) => void;
    setCommanders: (arg0: Commander[]) => void;
};

export default function EditAddCommander({ commander, commanders, factions, editOpen, setEditOpen, setCommanders }: EditAddCardProps) {

    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const [commanderName, setCommanderName] = useState<string>(commander.name);
    const [imgURL, setImgURL] = useState<string>(commander.img_url);
    const [faction, setFaction] = useState<Faction | null>(commander.faction);

    const handleCommanderNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCommanderName(event.target.value);
    };

    const handleImgURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setImgURL(event.target.value);
    };

    function closeScreen() {
        if (commander) {
            setCommanderName(commander.name);
            setImgURL(commander.img_url);
            setFaction(commander.faction);
        } else {
            setCommanderName('');
            setImgURL('');
            setFaction(null);
        };
        setEditOpen(false);
    }

    const deleteCommander = async () => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';

        await axios.get(`${MAIN_API.base_url}delete_commander/${commander && commander.id + '/'}`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                setCommanders(commanders.filter((c) => c.id !== commander?.id));
                setEditOpen(false);
                enqueueSnackbar(res);
            } else { enqueueSnackbar(response.data.response); };
            setAwaitingResponse(false);
        });
    };

    const submitForm = async () => {
        if (!commanderName || !imgURL || !faction) {
            enqueueSnackbar('Please fill out all fields', { variant: 'error' });
            return;
        };
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';

        const formData = new FormData();
        formData.append('name', commanderName);
        formData.append('img_url', imgURL);
        formData.append('faction_id', (faction.id).toString());
        if (commander.id !== -1) { formData.append('commander_id', (commander.id).toString()) };

        const url = (commander.id !== -1) ? `${MAIN_API.base_url}add_edit_commander/${commander.id}/` : `${MAIN_API.base_url}add_edit_commander/`;
        await axios.post(url, formData, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                const new_commander = response.data.commander;
                if (commander.id !== -1) {
                    setCommanders(commanders.map((c) => c.id === commander.id ? new_commander : c));
                } else {
                    setCommanders([...commanders, new_commander]);
                };
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
                        zIndex: (theme) => theme.zIndex.drawer + 1
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
                                variant="outlined"
                                fullWidth
                                value={commanderName}
                                sx={{ labelWidth: "text".length * 9 }}
                                onChange={handleCommanderNameChange}
                                label={"Commander Name"}
                            />
                            <TextField
                                variant="outlined"
                                fullWidth
                                value={imgURL}
                                sx={{ labelWidth: "text".length * 9 }}
                                onChange={handleImgURLChange}
                                label={"Image URL"}
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
                                    disabled={!commanderName || !imgURL || !faction || awaitingResponse}
                                >
                                    Confirm
                                </Button>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => { processTokens(deleteCommander) }}
                                    sx={{ width: isMobile ? '35%' : '25%' }}
                                    color={'secondary'}
                                    disabled={commander.id === -1 || awaitingResponse}
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