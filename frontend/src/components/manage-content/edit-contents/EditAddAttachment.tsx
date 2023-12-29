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
import { Attachment, Faction, FakeAttachment } from "src/@types/types";
import { MetadataContext } from "src/contexts/MetadataContext";
import LoadingBackdrop from "../../base/LoadingBackdrop";
import UploadAvatarComp, { FileWithPreview } from "../../upload/UploadAvatarComp";
import { useApiCall } from "src/hooks/useApiCall";
import { processTokens } from "src/utils/jwt";

type EditAddAttachmentProps = {
    attachment: Attachment | FakeAttachment;
    attachments: Attachment[];
    factions: Faction[];
    editOpen: boolean;
    setEditOpen: (open: boolean) => void;
    setAttachments: (attachments: Attachment[]) => void;
};

export default function EditAddAttachment({
    attachment,
    attachments,
    factions,
    editOpen,
    setEditOpen,
    setAttachments
}: EditAddAttachmentProps) {

    const { apiCall } = useApiCall();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const [mainAttachment, setMainAttachment] = useState<Attachment | FakeAttachment>(attachment);

    const [uploadFile, setUploadFile] = useState<FileWithPreview | null>(null);
    const [urlLock, setURLLock] = useState<boolean>(false);

    const [mainFile, setMainFile] = useState<FileWithPreview | null>(null);
    const [mainURLLock, setMainURLLock] = useState<boolean>(false);

    useEffect(() => {
        setMainAttachment(attachment);
        setUploadFile(null);
        setMainFile(null);
    }, [attachment, editOpen]);

    const handleAttachmentNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMainAttachment({ ...mainAttachment, name: event.target.value });
    };

    const handleImgURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMainAttachment({ ...mainAttachment, img_url: event.target.value });
    };

    const handleMainImgURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMainAttachment({ ...mainAttachment, main_url: event.target.value });
    };

    const handlePointsCostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (isNaN(parseInt(value))){
            setMainAttachment({ ...mainAttachment, points_cost: 0 });
        } else {
            setMainAttachment({ ...mainAttachment, points_cost: parseInt(value) });
        }
    };

    const formValid = () => {
        if (!mainAttachment.name || !mainAttachment.img_url || !mainAttachment.faction || !mainAttachment.main_url || !mainAttachment.points_cost || !mainAttachment.type) {
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
        if (!formValid() || !mainAttachment.faction) {
            enqueueSnackbar('Please fill out all fields', { variant: 'error' });
            return null;
        }

        formData.append('name', mainAttachment.name);
        formData.append('points_cost', mainAttachment.points_cost.toString());
        formData.append('img_url', mainAttachment.img_url);
        formData.append('main_url', mainAttachment.main_url);
        formData.append('faction_id', mainAttachment.faction.id.toString());
        formData.append('type', mainAttachment.type);
        if (attachment.id !== -1) {
            formData.append('attachment_id', attachment.id.toString());
        }
        if (uploadFile) {
            formData.append('img_file', uploadFile);
        }
        if (mainFile) {
            formData.append('main_file', mainFile);
        }

        return formData;
    };

    const handleAttachmentAction = async (type: 'create' | 'edit' | 'delete') => {
        if (awaitingResponse) return;
        setAwaitingResponse(true);

        processTokens(() => {
            let url;
            let requestType: 'GET' | 'POST' | 'DELETE';
    
            switch (type) {
                case 'create':
                url = 'add_edit_attachment';
                requestType = 'POST';
                break;
                case 'edit':
                url = `add_edit_attachment/${attachment.id}`;
                requestType = 'POST';
                break;
                case 'delete':
                url = `delete_attachment/${attachment.id}`;
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
                        setAttachments([...attachments, data]);
                        break;
                        case 'edit':
                        setAttachments(attachments.map(a => a.id === attachment.id ? data : a));
                        break;
                        case 'delete':
                        setAttachments(attachments.filter(a => a.id !== attachment.id));
                        break;
                    }
                    closeScreen();
                });
            } else {
                // Handle DELETE request
                    apiCall(url, requestType, null, () => {
                    setAttachments(attachments.filter(a => a.id !== attachment.id));
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
                            width: isMobile ? '85%' : '65%',
                            padding: isMobile ? 2 : 4,
                        }}
                        onClick={event => event.stopPropagation()}
                    >
                        <TextField
                            select
                            fullWidth
                            value={mainAttachment.faction ? mainAttachment.faction.id : ''}
                            onChange={(event) => {
                                const faction_id = event.target.value;
                                const faction = factions.find((faction) => faction.id === parseInt(faction_id));
                                setMainAttachment({ ...mainAttachment, faction: faction ? faction : null });
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
                            value={mainAttachment.name}
                            onChange={handleAttachmentNameChange}
                            label="Attachment Name"
                        />
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={mainAttachment.points_cost}
                            onChange={handlePointsCostChange}
                            label="Points Cost"
                        />
                        <TextField
                            select
                            fullWidth
                            value={mainAttachment.type ? mainAttachment.type : 'infantry'}
                            onChange={(event) => {
                                const type = event.target.value;
                                setMainAttachment({ ...mainAttachment, type: type as 'infantry' | 'cavalry' | 'war_machine' | 'monster' });
                            }}
                            SelectProps={{ native: true }}
                            variant="outlined"
                            sx={{ labelWidth: "text".length * 9 }}
                            label="Type"
                        >
                            <option value={'infantry'}>Infantry</option>
                            <option value={'cavalry'}>Cavalry</option>
                            <option value={'war_machine'}>War Machine</option>
                            <option value={'monster'}>Monster</option>
                        </TextField>
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={mainAttachment.img_url}
                            sx={{ labelWidth: "text".length * 9 }}
                            onChange={handleImgURLChange}
                            disabled={urlLock}
                            label={"Image URL"}
                        />
                        <UploadAvatarComp
                            type="attachment"
                            size={'avatar'}
                            name={mainAttachment.name}
                            faction={mainAttachment.faction}
                            item={null}
                            uploadFile={uploadFile}
                            setUploadFile={setUploadFile}
                            imgURL={mainAttachment.img_url}
                            setImgURL={
                                (url) => {
                                    setMainAttachment({ ...mainAttachment, img_url: url });
                                }
                            }
                            setURLLock={setURLLock}
                        />
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={mainAttachment.main_url}
                            sx={{ labelWidth: "text".length * 9 }}
                            onChange={handleMainImgURLChange}
                            disabled={mainURLLock}
                            label={"Main URL"}
                        />
                        <UploadAvatarComp
                            type="attachment"
                            size={'card'}
                            name={mainAttachment.name}
                            faction={mainAttachment.faction}
                            item={null}
                            uploadFile={mainFile}
                            setUploadFile={setMainFile}
                            imgURL={mainAttachment.main_url}
                            setImgURL={
                                (url) => {
                                    setMainAttachment({ ...mainAttachment, main_url: url });
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
                                onClick={() => handleAttachmentAction(attachment.id === -1 ? 'create' : 'edit')}
                                disabled={!formValid() || awaitingResponse}
                            >
                                Confirm
                            </Button>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => handleAttachmentAction('delete')}
                                color="secondary"
                                disabled={attachment.id === -1 || awaitingResponse}
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