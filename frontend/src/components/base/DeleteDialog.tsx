import {
    Button,
    Dialog,
    DialogContent,
    Grid,
    Stack,
    Typography
} from "@mui/material";
import { WORKBENCH_SETTINGS } from "src/utils/workbenchSettings";

// ----------------------------------------------------------------------

type DeleteDialogProps = {
    open: boolean;
    onClose: any;
    onClick: any;
};

// ----------------------------------------------------------------------

export function DeleteDialog({ open, onClose, onClick }: DeleteDialogProps) {

    return (
        <Dialog
            open={open}
            fullWidth={true}
            onClose={() => { onClose() }}
        >
            <DialogContent sx={{ p: 2 }}>
                <Stack width={'100%'} justifyContent={'center'} alignItems={'center'}>
                    <Typography variant={'h6'} paragraph>Are you sure?</Typography>
                    <Grid container spacing={2} width={'100%'} justifyContent={'center'} alignItems={'center'}>
                        <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                            <Button
                                variant={"contained"}
                                onClick={() => { onClick() }}
                                fullWidth
                            >
                                Delete
                            </Button>
                        </Grid>
                        <Grid item {...WORKBENCH_SETTINGS.grid_sizing}>
                            <Button
                                color={"secondary"}
                                variant={"contained"}
                                onClick={() => { onClose() }}
                                fullWidth
                            >
                                Cancel
                            </Button>
                        </Grid>
                    </Grid>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
