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
import { Unit, Faction, FakeUnit } from "src/@types/types";
import { MetadataContext } from "src/contexts/MetadataContext";
import LoadingBackdrop from "../../base/LoadingBackdrop";
import UploadAvatarComp, { FileWithPreview } from "../../upload/UploadAvatarComp";
import { useApiCall } from "src/hooks/useApiCall";
import { processTokens } from "src/utils/jwt";

type EditAddUnitProps = {
    unit: Unit | FakeUnit;
    units: Unit[];
    factions: Faction[];
    editOpen: boolean;
    setEditOpen: (open: boolean) => void;
    setUnits: (units: Unit[]) => void;
};

export default function EditAddUnit({
    unit,
    units,
    factions,
    editOpen,
    setEditOpen,
    setUnits,
}: EditAddUnitProps) {

    const { apiCall } = useApiCall();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();
    const { isMobile } = useContext(MetadataContext);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);

    const [mainUnit, setMainUnit] = useState<Unit | FakeUnit>(unit);

    const [uploadFile, setUploadFile] = useState<FileWithPreview | null>(null);
    const [urlLock, setURLLock] = useState<boolean>(false);

    const [mainFile, setMainFile] = useState<FileWithPreview | null>(null);
    const [mainURLLock, setMainURLLock] = useState<boolean>(false);

    useEffect(() => {
        setMainUnit(unit);
        setUploadFile(null);
        setMainFile(null);
    }, [unit, editOpen]);

    const handleUnitNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMainUnit({ ...mainUnit, name: event.target.value });
    };

    const handleImgURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMainUnit({ ...mainUnit, img_url: event.target.value });
    };

    const handleMainImgURLChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMainUnit({ ...mainUnit, main_url: event.target.value });
    };

    const handlePointsCostChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (isNaN(parseInt(value))){
            setMainUnit({ ...mainUnit, points_cost: 0 });
        } else {
            setMainUnit({ ...mainUnit, points_cost: parseInt(value) });
        }
    };

    const formValid = () => {
        if (!mainUnit.name || !mainUnit.img_url || !mainUnit.faction || !mainUnit.main_url || !mainUnit.points_cost) {
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
        if (!formValid() || !mainUnit.faction) {
            enqueueSnackbar('Please fill out all fields', { variant: 'error' });
            return null;
        }

        formData.append('name', mainUnit.name);
        formData.append('points_cost', mainUnit.points_cost.toString());
        formData.append('img_url', mainUnit.img_url);
        formData.append('main_url', mainUnit.main_url);
        formData.append('faction_id', mainUnit.faction.id.toString());
        formData.append('unit_type', mainUnit.unit_type);
        if (mainUnit.id !== -1) {
            formData.append('unit_id', mainUnit.id.toString());
        }
        if (uploadFile) {
            formData.append('img_file', uploadFile);
        }
        if (mainFile) {
            formData.append('main_file', mainFile);
        }

        return formData;
    };

    const handleUnitAction = async (type: 'create' | 'edit' | 'delete') => {
        if (awaitingResponse) return;
        setAwaitingResponse(true);

        processTokens(() => {
            let url;
            let requestType: 'GET' | 'POST' | 'DELETE';
    
            switch (type) {
                case 'create':
                url = 'add_edit_unit';
                requestType = 'POST';
                break;
                case 'edit':
                url = `add_edit_unit/${mainUnit.id}`;
                requestType = 'POST';
                break;
                case 'delete':
                url = `delete_unit/${mainUnit.id}`;
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
                        setUnits([...units, data]);
                        break;
                        case 'edit':
                        setUnits(units.map(a => a.id === mainUnit.id ? data : a));
                        break;
                        case 'delete':
                        setUnits(units.filter(a => a.id !== mainUnit.id));
                        break;
                    }
                    closeScreen();
                });
            } else {
                // Handle DELETE request
                    apiCall(url, requestType, null, () => {
                    setUnits(units.filter(a => a.id !== mainUnit.id));
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
                            value={mainUnit.faction ? mainUnit.faction.id : ''}
                            onChange={(event) => {
                                const faction_id = event.target.value;
                                const faction = factions.find((faction) => faction.id === parseInt(faction_id));
                                setMainUnit({ ...mainUnit, faction: faction ? faction : null });
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
                            value={mainUnit.name}
                            onChange={handleUnitNameChange}
                            label="Unit Name"
                        />
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={mainUnit.points_cost}
                            onChange={handlePointsCostChange}
                            label="Points Cost"
                        />
                        <TextField
                            select
                            fullWidth
                            value={mainUnit.unit_type ? mainUnit.unit_type : 'infantry'}
                            onChange={(event) => {
                                const type = event.target.value;
                                setMainUnit({ ...mainUnit, unit_type: type as 'infantry' | 'cavalry' | 'war_machine' | 'monster' });
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
                            value={mainUnit.img_url}
                            sx={{ labelWidth: "text".length * 9 }}
                            onChange={handleImgURLChange}
                            disabled={urlLock}
                            label={"Image URL"}
                        />
                        <UploadAvatarComp
                            type="unit"
                            size={'avatar'}
                            name={mainUnit.name}
                            faction={mainUnit.faction}
                            item={null}
                            uploadFile={uploadFile}
                            setUploadFile={setUploadFile}
                            imgURL={mainUnit.img_url}
                            setImgURL={
                                (url) => {
                                    setMainUnit({ ...mainUnit, img_url: url });
                                }
                            }
                            setURLLock={setURLLock}
                        />
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={mainUnit.main_url}
                            sx={{ labelWidth: "text".length * 9 }}
                            onChange={handleMainImgURLChange}
                            disabled={mainURLLock}
                            label={"Main URL"}
                        />
                        <UploadAvatarComp
                            type="unit"
                            size={'unit'}
                            name={mainUnit.name}
                            faction={mainUnit.faction}
                            item={null}
                            uploadFile={mainFile}
                            setUploadFile={setMainFile}
                            imgURL={mainUnit.main_url}
                            setImgURL={
                                (url) => {
                                    setMainUnit({ ...mainUnit, main_url: url });
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
                                onClick={() => handleUnitAction(mainUnit.id === -1 ? 'create' : 'edit')}
                                disabled={!formValid() || awaitingResponse}
                            >
                                Confirm
                            </Button>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => handleUnitAction('delete')}
                                color="secondary"
                                disabled={mainUnit.id === -1 || awaitingResponse}
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