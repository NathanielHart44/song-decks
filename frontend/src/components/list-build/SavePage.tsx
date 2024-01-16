import {
    Grid,
    Stack, Typography,
    Divider,
    useTheme,
    ToggleButton,
    ToggleButtonGroup,
    TextField,
    Button
} from "@mui/material";
import { useContext, useState } from "react";
import { MetadataContext } from "src/contexts/MetadataContext";
import { processTokens } from "src/utils/jwt";
import useListBuildManager from "src/hooks/useListBuildManager";
import { DeleteDialog } from "../base/DeleteDialog";
import { useNavigate, useParams } from "react-router-dom";
import { PATH_PAGE } from "src/routes/paths";
import { resetListState } from "src/contexts/ListBuilderContext";

// ----------------------------------------------------------------------

export function SavePage() {

    const theme = useTheme();
    const title_grey = theme.palette.grey[600];
    const { isMobile } = useContext(MetadataContext);
    const navigate = useNavigate();
    const { lc } = useParams();
    const is_edit = (lc !== undefined && lc !== null);
    const { listState, listDispatch, handleSaveList, handleDeleteList, validSubmission } = useListBuildManager();

    const [deleteOpen, setDeleteOpen] = useState<boolean>(false);

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        listDispatch({ type: 'SET_LIST_TITLE', payload: event.target.value });
    };

    const validation_info = validSubmission(is_edit ? 'edit' : 'create');

    return (
        <Stack width={isMobile ? '98%' : '65%'} justifyContent={'center'} alignItems={'center'} spacing={3}>
            <TextField
                label={'List Name'}
                variant={'outlined'}
                fullWidth
                value={listState.listTitle}
                onChange={handleTitleChange}
            />
            <Stack width={'100%'}>
                <Typography color={title_grey} variant={'subtitle2'}>Max Points</Typography>
                <ToggleButtonGroup
                    color="primary"
                    value={listState.maxPoints}
                    exclusive
                    fullWidth
                    size={'small'}
                >
                    {[30, 40, 50].map((points) => (
                        <ToggleButton
                            key={'points_' + points}
                            value={points}
                            onClick={() => { listDispatch({ type: 'SET_MAX_POINTS', payload: points }); }}
                        >
                            {points}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </Stack>
            <Grid container columnGap={2} rowGap={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                <Grid item xs={12} md={3.5}>
                    <Button
                        variant={'contained'}
                        fullWidth
                        onClick={() => { processTokens(() => { handleSaveList(is_edit ? 'edit' : 'create') }) }}
                        disabled={!validation_info.valid}
                    >
                        Save
                    </Button>
                </Grid>
                <Grid item xs={12} md={3.5}>
                    <Button
                        variant={'contained'}
                        fullWidth
                        color={'secondary'}
                        onClick={() => { setDeleteOpen(true) }}
                    >
                        {is_edit ? 'Delete' : 'Cancel'}
                    </Button>
                    <DeleteDialog
                        open={deleteOpen}
                        onClose={() => { setDeleteOpen(false) }}
                        onClick={() => {
                            if (is_edit) {
                                processTokens(() => { handleDeleteList() });
                            } else {
                                resetListState(listDispatch);
                                navigate(PATH_PAGE.list_manager);
                            }
                        }}
                    />
                </Grid>
                {is_edit &&
                    <Grid item xs={12} md={3.5}>
                        <Button
                            variant={'contained'}
                            fullWidth
                            onClick={() => {
                                resetListState(listDispatch);
                                navigate(PATH_PAGE.list_manager);
                            }}
                        >
                            Cancel
                        </Button>
                    </Grid>
                }
            </Grid>
            {validation_info.failure_reasons.length > 0 &&
                <Stack width={'100%'} justifyContent={'center'} alignItems={'center'} spacing={1}>
                    <Typography color={theme.palette.secondary.main} variant={'subtitle2'}>Invalid Submission</Typography>
                    <Divider sx={{ width: '65%' }} />
                    <Stack width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        {validation_info.failure_reasons.map((reason, index) => (
                            <Typography key={'reason_' + index} color={theme.palette.secondary.main} variant={'subtitle2'}>{reason}</Typography>
                        ))}
                    </Stack>
                </Stack>
            }
        </Stack>
    );
}
