import {
    Button,
    Checkbox,
    Dialog,
    Stack,
    TextField,
    Typography,
    useTheme
} from "@mui/material"
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
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
    const [urlLock, setURLLock] = useState<boolean>(false);

    const [currentFaction, setCurrentFaction] = useState<Faction | null>(faction);
    const [uploadFile, setUploadFile] = useState<FileWithPreview | null>(null);

    useEffect(() => {
        setCurrentFaction(faction);
        setUploadFile(null);
    }, [faction, editOpen]);

    const formValid = (): boolean => {
        return !!(currentFaction?.name && currentFaction?.img_url);
    }

    const handleFactionChange = (key: keyof Faction, value: any) => {
        setCurrentFaction({ ...currentFaction, [key]: value } as Faction);
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
        formData.append('name', currentFaction!.name);
        formData.append('img_url', currentFaction!.img_url);
        if (uploadFile) {
            formData.append('img_file', uploadFile);
        }

        return formData;
    };

    const handleFactionAction = async (type: 'create' | 'edit' | 'delete') => {
        if (awaitingResponse) return;
        setAwaitingResponse(true);

        let url;
        let requestType: 'GET' | 'POST' | 'DELETE';

        switch (type) {
            case 'create':
                url = 'add_edit_faction';
                requestType = 'POST';
                break;
            case 'edit':
                url = `add_edit_faction/${currentFaction?.id}`;
                requestType = 'POST';
                break;
            case 'delete':
                url = `delete_faction/${currentFaction?.id}`;
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
                        setFactions([...factions, data]);
                        break;
                    case 'edit':
                        setFactions(factions.map(f => f.id === currentFaction?.id ? data : f));
                        break;
                    case 'delete':
                        setFactions(factions.filter(f => f.id !== currentFaction?.id));
                        break;
                }
                closeScreen();
            });
        } else {
            // Handle DELETE request
            apiCall(url, requestType, null, () => {
                setFactions(factions.filter(f => f.id !== currentFaction?.id));
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
                            width: isMobile ? '85%' : '65%',
                            padding: isMobile ? 2 : 4,
                        }}
                        onClick={event => event.stopPropagation()}
                    >
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={currentFaction?.name}
                            sx={{ labelWidth: "text".length * 9 }}
                            onChange={(event) => { handleFactionChange('name', event.target.value) }}
                            label={"Faction Name"}
                        />
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={currentFaction?.img_url}
                            sx={{ labelWidth: "text".length * 9 }}
                            onChange={(event) => { handleFactionChange('img_url', event.target.value) }}
                            label={"Image URL"}
                            disabled={urlLock}
                        />

                        <UploadAvatarComp
                            type={'faction'}
                            size={'avatar'}
                            name={currentFaction?.name ?? ''}
                            faction={faction}
                            item={null}
                            uploadFile={uploadFile}
                            setUploadFile={setUploadFile}
                            imgURL={currentFaction?.img_url ?? ''}
                            setImgURL={(url: string) => {
                                    handleFactionChange('img_url', url);
                                    setURLLock(true);
                                }
                            }
                            setURLLock={setURLLock}
                        />

                        <Stack direction={'row'} alignItems={'center'}>
                            <Checkbox
                                checked={currentFaction?.neutral ?? false}
                                onChange={(event) => { handleFactionChange('neutral', event.target.checked) }}
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
                                disabled={!formValid() || awaitingResponse}
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
                </Stack>
            </Dialog>
        </div>
    )
}