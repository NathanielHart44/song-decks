/* eslint-disable react-hooks/exhaustive-deps */
import {
    Button,
    Dialog,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
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
    const [urlLock, setURLLock] = useState<boolean>(false);

    const [currentCommander, setCurrentCommander] = useState<Commander | FakeCommander>(commander);
    const [uploadFile, setUploadFile] = useState<FileWithPreview | null>(null);

    useEffect(() => {
        setCurrentCommander(commander);
        setUploadFile(null);
    }, [commander, editOpen]);

    const formValid = (): boolean => {
        return !!(currentCommander.name && currentCommander.img_url && currentCommander.faction);
    }

    const handleCommanderChange = (key: keyof Commander, value: any) => {
        setCurrentCommander({ ...currentCommander, [key]: value } as Commander);
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
        formData.append('name', currentCommander.name);
        formData.append('img_url', currentCommander.img_url);
        formData.append('commander_type', currentCommander.commander_type);
        if (currentCommander.faction) {
            formData.append('faction_id', currentCommander.faction.id.toString());
        }
        if (currentCommander.id !== -1) {
            formData.append('commander_id', currentCommander.id.toString());
        }
        if (uploadFile) {
            formData.append('img_file', uploadFile);
        }

        return formData;
    };

    const handleCommanderAction = async (type: 'create' | 'edit' | 'delete') => {
        if (awaitingResponse) return;
        setAwaitingResponse(true);

        let url;
        let requestType: 'GET' | 'POST' | 'DELETE';

        switch (type) {
            case 'create':
                url = 'add_edit_commander';
                requestType = 'POST';
                break;
            case 'edit':
                url = `add_edit_commander/${currentCommander.id}`;
                requestType = 'POST';
                break;
            case 'delete':
                url = `delete_commander/${currentCommander.id}`;
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
                        setCommanders([...commanders, data]);
                        break;
                    case 'edit':
                        setCommanders(commanders.map(c => c.id === currentCommander.id ? data : c));
                        break;
                    case 'delete':
                        setCommanders(commanders.filter(c => c.id !== currentCommander.id));
                        break;
                }
                closeScreen();
            });
        } else {
            // Handle DELETE request
            apiCall(url, requestType, null, () => {
                setCommanders(commanders.filter(c => c.id !== currentCommander.id));
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
                            select
                            fullWidth
                            value={currentCommander.faction ? currentCommander.faction.id : ''}
                            onChange={(event) => {
                                const faction_id = event.target.value;
                                const faction = factions.find((faction) => faction.id === parseInt(faction_id));
                                if (faction) { handleCommanderChange('faction', faction) };
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
                            value={currentCommander.name}
                            sx={{ labelWidth: "text".length * 9 }}
                            onChange={(event) => { handleCommanderChange('name', event.target.value) }}
                            label={"Commander Name"}
                        />
                        <ToggleButtonGroup
                            color="primary"
                            value={currentCommander.commander_type}
                            exclusive
                            size={'small'}
                        >
                            <ToggleButton value={'attachment'} onClick={() => { handleCommanderChange('commander_type', 'attachment') }}>
                                <Typography>Attachment</Typography>
                            </ToggleButton>
                            <ToggleButton value={'unit'} onClick={() => { handleCommanderChange('commander_type', 'unit') }}>
                                <Typography>Unit</Typography>
                            </ToggleButton>
                        </ToggleButtonGroup>
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={currentCommander.img_url}
                            sx={{ labelWidth: "text".length * 9 }}
                            onChange={(event) => { handleCommanderChange('img_url', event.target.value) }}
                            disabled={urlLock}
                            label={"Image URL"}
                        />

                        <UploadAvatarComp
                            type={'commander'}
                            size={'avatar'}
                            name={currentCommander.name}
                            faction={currentCommander.faction}
                            item={null}
                            uploadFile={uploadFile}
                            setUploadFile={setUploadFile}
                            imgURL={currentCommander.img_url}
                            setImgURL={(url: string) => {
                                handleCommanderChange('img_url', url);
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
                                onClick={() => { processTokens(() => handleCommanderAction(commander.id === -1 ? 'create' : 'edit')) }}
                                sx={{ width: isMobile ? '35%' : '25%' }}
                                disabled={!formValid() || awaitingResponse}
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
                </Stack>
            </Dialog>
        </div>
    )
};