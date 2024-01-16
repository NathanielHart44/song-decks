/* eslint-disable react-hooks/exhaustive-deps */
import {
    Button,
    Dialog,
    Stack,
    TextField,
    useTheme
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import { NCU, Faction, FakeNCU } from "src/@types/types";
import { MetadataContext } from "src/contexts/MetadataContext";
import LoadingBackdrop from "../../base/LoadingBackdrop";
import UploadAvatarComp, { FileWithPreview } from "../../upload/UploadAvatarComp";
import { useApiCall } from "src/hooks/useApiCall";
import { processTokens } from "src/utils/jwt";

type EditAddNCUProps = {
    ncu: NCU | FakeNCU;
    ncus: NCU[];
    factions: Faction[];
    editOpen: boolean;
    setEditOpen: (open: boolean) => void;
    setNCUs: (ncus: NCU[]) => void;
};

export default function EditAddNCU({
    ncu,
    ncus,
    factions,
    editOpen,
    setEditOpen,
    setNCUs,
}: EditAddNCUProps) {

    const { apiCall } = useApiCall();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const [mainNCU, setMainNCU] = useState<NCU | FakeNCU>(ncu);

    const [uploadFile, setUploadFile] = useState<FileWithPreview | null>(null);
    const [urlLock, setURLLock] = useState<boolean>(false);

    const [mainFile, setMainFile] = useState<FileWithPreview | null>(null);
    const [mainURLLock, setMainURLLock] = useState<boolean>(false);

    useEffect(() => {
        setMainNCU(ncu);
        setUploadFile(null);
        setMainFile(null);
    }, [ncu, editOpen]);

    const handleNCUNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMainNCU({ ...mainNCU, name: event.target.value });
    };

    const handleImgURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMainNCU({ ...mainNCU, img_url: event.target.value });
    };

    const handleMainImgURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMainNCU({ ...mainNCU, main_url: event.target.value });
    };

    const handlePointsCostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (isNaN(parseInt(value))){
            setMainNCU({ ...mainNCU, points_cost: 0 });
        } else {
            setMainNCU({ ...mainNCU, points_cost: parseInt(value) });
        }
    };

    const formValid = () => {
        if (!mainNCU.name || !mainNCU.img_url || !mainNCU.faction || !mainNCU.main_url || !mainNCU.points_cost) {
            return false;
        }
        return true;
    }

    const closeScreen = () => {
        setEditOpen(false);
        setAwaitingResponse(false);
    };

    const getFormData = () => {
        const formData = new FormData();
        if (!formValid() || !mainNCU.faction) {
            enqueueSnackbar('Please fill out all fields', { variant: 'error' });
            return null;
        }

        formData.append('name', mainNCU.name);
        formData.append('points_cost', mainNCU.points_cost.toString());
        formData.append('img_url', mainNCU.img_url);
        formData.append('main_url', mainNCU.main_url);
        formData.append('faction_id', mainNCU.faction.id.toString());
        if (mainNCU.id !== -1) {
            formData.append('ncu_id', mainNCU.id.toString());
        }
        if (uploadFile) {
            formData.append('img_file', uploadFile);
        }
        if (mainFile) {
            formData.append('main_file', mainFile);
        }

        return formData;
    };

    const handleNCUAction = async (type: 'create' | 'edit' | 'delete') => {
        if (awaitingResponse) return;
        setAwaitingResponse(true);

        processTokens(() => {
            let url;
            let requestType: 'GET' | 'POST' | 'DELETE';
    
            switch (type) {
                case 'create':
                url = 'add_edit_ncu';
                requestType = 'POST';
                break;
                case 'edit':
                url = `add_edit_ncu/${mainNCU.id}`;
                requestType = 'POST';
                break;
                case 'delete':
                url = `delete_ncu/${mainNCU.id}`;
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
                        setNCUs([...ncus, data]);
                        break;
                        case 'edit':
                        setNCUs(ncus.map(a => a.id === mainNCU.id ? data : a));
                        break;
                        case 'delete':
                        setNCUs(ncus.filter(a => a.id !== mainNCU.id));
                        break;
                    }
                    closeScreen();
                });
            } else {
                // Handle DELETE request
                    apiCall(url, requestType, null, () => {
                    setNCUs(ncus.filter(a => a.id !== mainNCU.id));
                    closeScreen();
                });
            }
        });
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
                            value={mainNCU.faction ? mainNCU.faction.id : ''}
                            onChange={(event) => {
                                const faction_id = event.target.value;
                                const faction = factions.find((faction) => faction.id === parseInt(faction_id));
                                setMainNCU({ ...mainNCU, faction: faction ? faction : null });
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
                            value={mainNCU.name}
                            onChange={handleNCUNameChange}
                            label="NCU Name"
                        />
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={mainNCU.points_cost}
                            onChange={handlePointsCostChange}
                            label="Points Cost"
                        />
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={mainNCU.img_url}
                            sx={{ labelWidth: "text".length * 9 }}
                            onChange={handleImgURLChange}
                            disabled={urlLock}
                            label={"Image URL"}
                        />
                        <UploadAvatarComp
                            type="ncu"
                            size={'avatar'}
                            name={mainNCU.name}
                            faction={mainNCU.faction}
                            item={null}
                            uploadFile={uploadFile}
                            setUploadFile={setUploadFile}
                            imgURL={mainNCU.img_url}
                            setImgURL={
                                (url) => {
                                    setMainNCU({ ...mainNCU, img_url: url });
                                }
                            }
                            setURLLock={setURLLock}
                        />
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={mainNCU.main_url}
                            sx={{ labelWidth: "text".length * 9 }}
                            onChange={handleMainImgURLChange}
                            disabled={mainURLLock}
                            label={"Main URL"}
                        />
                        <UploadAvatarComp
                            type="ncu"
                            size={'card'}
                            name={mainNCU.name}
                            faction={mainNCU.faction}
                            item={null}
                            uploadFile={mainFile}
                            setUploadFile={setMainFile}
                            imgURL={mainNCU.main_url}
                            setImgURL={
                                (url) => {
                                    setMainNCU({ ...mainNCU, main_url: url });
                                }
                            }
                            setURLLock={setMainURLLock}
                        />
                        <Stack
                            direction="row"
                            spacing={2}
                            width="100%"
                            sx={{ justifyContent: 'center', alignItems: 'center' }}
                        >
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => handleNCUAction(mainNCU.id === -1 ? 'create' : 'edit')}
                                disabled={!formValid() || awaitingResponse}
                                fullWidth
                            >
                                Confirm
                            </Button>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => handleNCUAction('delete')}
                                color="secondary"
                                disabled={mainNCU.id === -1 || awaitingResponse}
                                fullWidth
                            >
                                Delete
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            </Dialog>
        </div>
    );
}