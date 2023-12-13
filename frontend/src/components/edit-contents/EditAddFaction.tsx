import {
    Backdrop,
    Button,
    Checkbox,
    Slide,
    Stack,
    TextField,
    Typography,
    useTheme
} from "@mui/material"
import { useSnackbar } from "notistack";
import { useContext, useState } from "react";
import { Faction } from "src/@types/types";
import { MetadataContext } from "src/contexts/MetadataContext";
import LoadingBackdrop from "../base/LoadingBackdrop";
import { processTokens } from "src/utils/jwt";
import axios from "axios";
import { MAIN_API } from "src/config";
import UploadAvatarComp, { FileWithPreview } from "../upload/UploadAvatarComp";

// ----------------------------------------------------------------------

type EditAddCardProps = {
    faction: Faction | null;
    factions: Faction[];
    editOpen: boolean;
    setEditOpen: (arg0: boolean) => void;
    setFactions: (arg0: Faction[]) => void;
};

export default function EditAddFaction({ faction, factions, editOpen, setEditOpen, setFactions }: EditAddCardProps) {

    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const [factionName, setFactionName] = useState<string>(faction ? faction.name : '');
    const [imgURL, setImgURL] = useState<string>(faction ? faction.img_url : '');
    const [urlLock, setURLLock] = useState<boolean>(false);
    const [uploadFile, setUploadFile] = useState<FileWithPreview | null>(null);
    const [neutral, setNeutral] = useState<boolean>(faction ? faction.neutral : false);

    const handleFactionNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFactionName(event.target.value);
    };

    const handleImgURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setImgURL(event.target.value);
    };

    function closeScreen() {
        if (faction) {
            setFactionName(faction.name);
            setImgURL(faction.img_url);
        } else {
            setFactionName('');
            setImgURL('');
        };
        setEditOpen(false);
    }

    const deleteFaction = async () => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';

        await axios.get(`${MAIN_API.base_url}delete_faction/${faction && faction.id + '/'}`, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                setFactions(factions.filter((f) => f.id !== faction?.id));
                setEditOpen(false);
                enqueueSnackbar(res);
            } else { enqueueSnackbar(response.data.response); };
            setAwaitingResponse(false);
        });
    };

    const submitForm = async () => {
        if (!factionName || !imgURL) {
            enqueueSnackbar('Please fill out all fields', { variant: 'error' });
            return;
        };
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';

        const formData = new FormData();
        formData.append('name', factionName);
        formData.append('img_url', imgURL);
        formData.append('neutral', neutral.toString());
        if (uploadFile) { formData.append('img_file', uploadFile) };

        const url = faction ? `${MAIN_API.base_url}add_edit_faction/${faction.id}/` : `${MAIN_API.base_url}add_edit_faction/`;
        await axios.post(url, formData, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response?.data && response.data.success) {
                const res = response.data.response;
                const new_faction = response.data.faction;
                if (faction) {
                    setFactions(factions.map((f) => f.id === faction.id ? new_faction : f));
                } else {
                    setFactions([...factions, new_faction]);
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
                                variant="outlined"
                                fullWidth
                                value={factionName}
                                sx={{ labelWidth: "text".length * 9 }}
                                onChange={handleFactionNameChange}
                                label={"Faction Name"}
                            />
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
                                type={'faction'}
                                name={factionName}
                                faction={faction}
                                commander={null}
                                uploadFile={uploadFile}
                                setUploadFile={setUploadFile}
                                imgURL={imgURL}
                                setImgURL={setImgURL}
                                setURLLock={setURLLock}
                            />

                            <Stack direction={'row'} alignItems={'center'}>
                                <Checkbox
                                    checked={neutral}
                                    onChange={(event) => { setNeutral(event.target.checked) }}
                                    inputProps={{ 'aria-label': 'controlled' }}
                                />
                                <Typography variant={'body1'} sx={{ color: theme.palette.text.disabled }}>Neutral</Typography>
                            </Stack>

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
                                    disabled={!factionName || !imgURL || awaitingResponse}
                                >
                                    Confirm
                                </Button>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => { processTokens(deleteFaction) }}
                                    sx={{ width: isMobile ? '35%' : '25%' }}
                                    color={'secondary'}
                                    disabled={!faction || awaitingResponse}
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