/* eslint-disable react-hooks/exhaustive-deps */
import {
    Backdrop,
    Button,
    Slide,
    Stack,
    TextField,
    useTheme
} from "@mui/material"
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { Commander, Faction, FakeCommander } from "src/@types/types";
import { MetadataContext } from "src/contexts/MetadataContext";
import LoadingBackdrop from "../../base/LoadingBackdrop";
import { processTokens } from "src/utils/jwt";
import UploadAvatarComp, { FileWithPreview } from "../../upload/UploadAvatarComp";
import { useApiCall } from "src/hooks/useApiCall";

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
    const { apiCall } = useApiCall();
    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const [commanderName, setCommanderName] = useState<string>(commander.name);
    const [imgURL, setImgURL] = useState<string>(commander.img_url);
    const [urlLock, setURLLock] = useState<boolean>(false);
    const [uploadFile, setUploadFile] = useState<FileWithPreview | null>(null);
    const [faction, setFaction] = useState<Faction | null>(commander.faction);

    useEffect(() => {
        setCommanderName(commander.name);
        setFaction(commander.faction);
        setImgURL(commander.img_url);
        setUploadFile(null);
    }, [commander]);

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

    function getFormData() {
        const formData = new FormData();
        if (!commanderName || !imgURL || !faction) {
            enqueueSnackbar('Please fill out all fields', { variant: 'error' });
            return {formData: formData, success: false};
        };

        formData.append('name', commanderName);
        formData.append('img_url', imgURL);
        formData.append('faction_id', (faction.id).toString());
        if (commander.id !== -1) { formData.append('commander_id', (commander.id).toString()) };
        if (uploadFile) { formData.append('img_file', uploadFile) };

        return {formData: formData, success: true};
    };

    const handleCommanderAction = async (type: 'create' | 'edit' | 'delete') => {
        if (awaitingResponse) { return };
        setAwaitingResponse(true);

        let url;
        let request_type: 'GET' | 'POST' | 'DELETE';
        switch (type) {
            case 'create':
                url = `add_edit_commander`;
                request_type = 'POST';
                break;
            case 'edit':
                url = `add_edit_commander/${commander.id}`;
                request_type = 'POST';
                break;
            case 'delete':
                url = `delete_commander/${commander.id}`;
                request_type = 'DELETE';
                break;
            default:
                url = '';
                request_type = 'GET';
                break;
        };
        const form_data_res = getFormData();
        let formData;
        if (!form_data_res.success) {
            setAwaitingResponse(false);
            return;
        }
        if (request_type === 'DELETE') {
            formData = null;
        } else {
            if (!form_data_res.success) {
                setAwaitingResponse(false);
                return;
            } else {
                formData = form_data_res.formData;
            }
        }
        apiCall(url, request_type, formData, (data) => {
            switch (type) {
                case 'create':
                    setCommanders([...commanders, data]);
                    break;
                case 'edit':
                    setCommanders(commanders.map((c) => c.id === commander.id ? data : c));
                    break;
                case 'delete':
                    setCommanders(commanders.filter((c) => c.id !== commander.id));
                    break;
                default:
                    break;
            };
        });
        setEditOpen(false);
        setAwaitingResponse(false);
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
                                disabled={urlLock}
                                label={"Image URL"}
                            />

                            <UploadAvatarComp
                                type={'commander'}
                                name={commanderName}
                                faction={faction}
                                commander={null}
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
                                    onClick={() => { processTokens(() => handleCommanderAction(commander.id === -1 ? 'create' : 'edit')) }}
                                    sx={{ width: isMobile ? '35%' : '25%' }}
                                    disabled={!commanderName || !imgURL || !faction || awaitingResponse}
                                >
                                    Confirm
                                </Button>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => { processTokens(() => handleCommanderAction('delete')) }}
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
};