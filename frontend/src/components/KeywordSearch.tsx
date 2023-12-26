import {
    Accordion,
    AccordionDetails,
    Button,
    Dialog,
    DialogContent,
    Grid,
    Input,
    InputAdornment,
    Stack,
    TextField,
    Typography
} from "@mui/material";
import AccordionSummaryDiv from "./workbench/AccordionSummaryDiv";
import { useContext, useEffect, useState } from "react";
import { KeywordPairType } from "src/@types/types";
import Iconify from "./base/Iconify";
import { objectToFormData, useApiCall } from "src/hooks/useApiCall";
import { processTokens } from "src/utils/jwt";
import AddNewWB from "./workbench/AddNewWB";
import { MetadataContext } from "src/contexts/MetadataContext";
import { WORKBENCH_SETTINGS } from "src/utils/workbenchSettings";

// ----------------------------------------------------------------------

const default_pair: KeywordPairType = {
    id: -1,
    keyword: '',
    description: '',
};

type Props = {
    is_game: boolean;
    awaitingResponse: boolean;
    setAwaitingResponse: (arg0: boolean) => void;
}

export default function KeywordSearch({ is_game, awaitingResponse, setAwaitingResponse }: Props) {

    const { isMobile } = useContext(MetadataContext);
    const [allPairs, setAllPairs] = useState<KeywordPairType[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedPair, setSelectedPair] = useState<KeywordPairType>(default_pair);
    const [createPairOpen, setCreatePairOpen] = useState<boolean>(false);
    const [editPairOpen, setEditPairOpen] = useState<boolean>(false);
    const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

    const { apiCall } = useApiCall();

    const filteredPairs = allPairs.filter((keyword_pair) => searchTerm ?
        keyword_pair.keyword.toLowerCase().includes(searchTerm.toLowerCase()) :
        keyword_pair
    );

    const getKeywordPairs = async () => {
        if (awaitingResponse) { return };
        setAwaitingResponse(true);
        apiCall('get_keyword_pairs', 'GET', null, (data) => {
            setAllPairs(data);
        });
        setAwaitingResponse(false);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { processTokens(getKeywordPairs) }, []);

    const handleCreate = async (type: 'edit' | 'create') => {
        if (awaitingResponse) { return };
        setAwaitingResponse(true);
        const url = type === 'edit' ? `edit_keyword_pair/${selectedPair?.id}` : 'create_keyword_pair';
        const formData = objectToFormData(selectedPair);
        apiCall(url, 'POST', formData, () => {
            getKeywordPairs();
            setSelectedPair(default_pair);
        });
        setAwaitingResponse(false);
    };

    const deleteKeywordPair = async (keyword_pair: KeywordPairType) => {
        if (awaitingResponse) { return };
        setAwaitingResponse(true);
        apiCall(`delete_keyword_pair/${keyword_pair.id}`, 'DELETE', null, () => {
            getKeywordPairs();
        });
        setAwaitingResponse(false);
    };

    function handleEditStart(keyword_pair: KeywordPairType) {
        setSelectedPair(keyword_pair);
        setEditPairOpen(true);
    };

    function handleDeleteStart(keyword_pair: KeywordPairType) {
        setSelectedPair(keyword_pair);
        setDeleteOpen(true);
    };

    return (
        <Stack spacing={2} width={'100%'} height={'100%'} justifyContent={'center'} alignItems={'center'}>
            <Searchbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            {filteredPairs.map((keyword_pair) => (
                <KeywordPair
                    key={keyword_pair.id}
                    keyword_pair={keyword_pair}
                    onlySearched={filteredPairs.length === 1 ? true : false}
                    is_game={is_game}
                    handleEditStart={handleEditStart}
                    handleDeleteStart={handleDeleteStart}
                />
            ))}
            { !is_game &&
                <>
                    <AddNewWB
                        isMobile={isMobile}
                        handleClick={() => { setSelectedPair(default_pair); setCreatePairOpen(true) }}
                    />
                    <CreationPair
                        is_new={createPairOpen ? true :
                            editPairOpen ? false : false
                        }
                        selectedPair={selectedPair}
                        setSelectedPair={setSelectedPair}
                        open={createPairOpen || editPairOpen}
                        setOpen={
                            createPairOpen ? setCreatePairOpen :
                            editPairOpen ? setEditPairOpen : () => { }
                        }
                        handleCreate={handleCreate}
                    />
                    <DeleteDialog
                        keyword_pair={selectedPair}
                        open={deleteOpen}
                        setOpen={setDeleteOpen}
                        deleteKeywordPair={deleteKeywordPair}
                    />
                </>
            }

        </Stack>
    )
};

// ----------------------------------------------------------------------

type KeywordPairProps = {
    keyword_pair: KeywordPairType;
    onlySearched: boolean;
    is_game: boolean;
    handleEditStart: (arg0: KeywordPairType) => void;
    handleDeleteStart: (arg0: KeywordPairType) => void;
};

function KeywordPair({ keyword_pair, onlySearched, is_game, handleEditStart, handleDeleteStart }: KeywordPairProps) {

    const [accordionOpen, setAccordionOpen] = useState<boolean>(false);

    useEffect(() => {
        if (onlySearched) { setAccordionOpen(true) };
        if (!onlySearched) { setAccordionOpen(false) };
    }, [onlySearched]);

    return (
        <Stack sx={{ width: '85%' }}>
            <Accordion
                disableGutters={true}
                expanded={accordionOpen}
                sx={{ ...(accordionOpen && { bgcolor: 'transparent' }) }}
                TransitionProps={{ unmountOnExit: true }}
            >
                <AccordionSummaryDiv
                    accordionOpen={accordionOpen}
                    setAccordionOpen={setAccordionOpen}
                    title={keyword_pair.keyword}
                />
                <AccordionDetails sx={{ pt: 3 }}>
                    <Typography paragraph>{keyword_pair.description}</Typography>
                    { !is_game &&
                        <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                            <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                                <Button
                                    variant={"contained"}
                                    onClick={() => { handleEditStart(keyword_pair) }}
                                    fullWidth
                                >
                                    Edit Keyword
                                </Button>
                            </Grid>
                            <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                                <Button
                                    color={"secondary"}
                                    variant={"contained"}
                                    onClick={() => { handleDeleteStart(keyword_pair) }}
                                    fullWidth
                                >
                                    Delete Keyword
                                </Button>
                            </Grid>
                        </Grid>
                    }
                </AccordionDetails>
            </Accordion>
        </Stack>
    )
};

// ----------------------------------------------------------------------

type SearchbarProps = {
    searchTerm: string;
    setSearchTerm: (arg0: string) => void;
};

function Searchbar({ searchTerm, setSearchTerm }: SearchbarProps) {

    function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        setSearchTerm(event.target.value);
    }

    return (
        <Stack width={'80%'} justifyContent={'center'} alignItems={'center'}>
            <Input
                fullWidth
                placeholder="Search…"
                startAdornment={
                    <InputAdornment position="start">
                        <Iconify
                            icon={'eva:search-fill'}
                            sx={{ color: 'text.disabled', width: 20, height: 20 }}
                        />
                    </InputAdornment>
                }
                value={searchTerm}
                onChange={handleChange}
                sx={{ mr: 1, fontWeight: 'fontWeightBold' }}
            />
        </Stack>
    )
};

// ----------------------------------------------------------------------

type CreationDialogProps = {
    is_new: boolean;
    selectedPair: KeywordPairType;
    setSelectedPair: (arg0: KeywordPairType) => void;
    open: boolean;
    setOpen: (arg0: boolean) => void;
    handleCreate: (type: 'edit' | 'create') => void;
};

function CreationPair({ is_new, selectedPair, setSelectedPair, open, setOpen, handleCreate }: CreationDialogProps) {

    function handleCancel() {
        setSelectedPair(default_pair);
        setOpen(false);
    };

    return (
        <Dialog
            open={open}
            fullWidth={true}
            onClose={() => { setOpen(false) }}
        >
            <DialogContent sx={{ p: 2 }}>
                <Stack spacing={2} width={'100%'}>
                    <TextField
                        label={"Keyword"}
                        variant={"outlined"}
                        value={selectedPair?.keyword}
                        onChange={(event) => { setSelectedPair({ ...selectedPair, keyword: event.target.value }); } }
                        fullWidth
                    />
                    <TextField
                        label={"Description"}
                        variant={"outlined"}
                        value={selectedPair?.description}
                        onChange={(event) => { setSelectedPair({ ...selectedPair, description: event.target.value }); } }
                        fullWidth
                        multiline
                        rows={4}
                    />
                    <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                            <Button
                                variant={"contained"}
                                onClick={() => {
                                    processTokens(() => { handleCreate(is_new ? 'create' : 'edit') });
                                    setOpen(false);
                                }}
                                fullWidth
                            >
                                {is_new ? 'Create Keyword' : 'Edit Keyword'}
                            </Button>
                        </Grid>
                        <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                            <Button
                                color={"secondary"}
                                variant={"contained"}
                                onClick={handleCancel}
                                fullWidth
                            >
                                Cancel
                            </Button>
                        </Grid>
                    </Grid>
                </Stack>
            </DialogContent>
        </Dialog>
    )
};

// ----------------------------------------------------------------------

type DeleteDialogProps = {
    keyword_pair: KeywordPairType;
    open: boolean;
    setOpen: (arg0: boolean) => void;
    deleteKeywordPair: (arg0: KeywordPairType) => void;
};

function DeleteDialog({ keyword_pair, open, setOpen, deleteKeywordPair }: DeleteDialogProps) {

    return (
        <Dialog
            open={open}
            fullWidth={true}
            onClose={() => { setOpen(false) }}
        >
            <DialogContent sx={{ p: 2 }}>
                <Stack width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <Typography variant={'h6'} paragraph>Are you sure?</Typography>
                    <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                            <Button
                                variant={"contained"}
                                onClick={() => {
                                    deleteKeywordPair(keyword_pair);
                                    setOpen(false);
                                }}
                                fullWidth
                            >
                                Delete Keyword
                            </Button>
                        </Grid>
                        <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                            <Button
                                color={"secondary"}
                                variant={"contained"}
                                onClick={() => { setOpen(false) }}
                                fullWidth
                            >
                                Cancel
                            </Button>
                        </Grid>
                    </Grid>
                </Stack>
            </DialogContent>
        </Dialog>
    )
}