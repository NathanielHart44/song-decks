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
import LoadingBackdrop from "../../base/LoadingBackdrop";
import { processTokens } from "src/utils/jwt";
import UploadAvatarComp, { FileWithPreview } from "../../upload/UploadAvatarComp";
import { useApiCall } from "src/hooks/useApiCall";

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
    const { apiCall } = useApiCall();
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
    };

    function getFormData() {
        const formData = new FormData();
        if (!factionName || !imgURL) {
            enqueueSnackbar('Please fill out all fields', { variant: 'error' });
            return {formData: formData, success: false};
        };

        formData.append('name', factionName);
        formData.append('img_url', imgURL);
        formData.append('neutral', neutral.toString());
        if (uploadFile) { formData.append('img_file', uploadFile) };

        return {formData: formData, success: true};
    };

    const handleFactionAction = async (type: 'create' | 'edit' | 'delete') => {
        if (awaitingResponse) { return };
        setAwaitingResponse(true);

        let url;
        let request_type: 'GET' | 'POST' | 'DELETE';
        switch (type) {
            case 'create':
                url = `add_edit_faction`;
                request_type = 'POST';
                break;
            case 'edit':
                url = `add_edit_faction/${faction?.id}`;
                request_type = 'POST';
                break;
            case 'delete':
                url = `delete_faction/${faction?.id}`;
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
                    setFactions([...factions, data]);
                    break;
                case 'edit':
                    setFactions(factions.map((c) => c.id === faction?.id ? data : c));
                    break;
                case 'delete':
                    setFactions(factions.filter((c) => c.id !== faction?.id));
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
                                    onClick={() => { processTokens(() => handleFactionAction(faction ? 'edit' : 'create')) }}
                                    sx={{ width: isMobile ? '35%' : '25%' }}
                                    disabled={!factionName || !imgURL || awaitingResponse}
                                >
                                    Confirm
                                </Button>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => { processTokens(() => handleFactionAction('delete')) }}
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