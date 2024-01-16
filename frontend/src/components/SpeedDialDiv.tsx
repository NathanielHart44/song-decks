import { Backdrop, SpeedDial, SpeedDialAction, SpeedDialIcon, Typography, useTheme } from "@mui/material";
import { useState } from "react";
import { GameModalOptions } from "src/pages/Game";
import Iconify from "./base/Iconify";

// ----------------------------------------------------------------------

export type SpeedDialOptions = {
    name: string;
    source: GameModalOptions;
    icon: string;
};

type SpeedDialDivProps = {
    openModal: GameModalOptions;
    setOpenModal: (arg0: any) => void;
    options: SpeedDialOptions[];
    sx?: any;
};

// ----------------------------------------------------------------------

export default function SpeedDialDiv({ openModal, setOpenModal, options, sx }: SpeedDialDivProps) {

    const theme = useTheme();
    
    const [open, setOpen] = useState<boolean>(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    function handleSelect(selected_page: string) {
        setOpen(false);
        setOpenModal(selected_page);
    };

    return (
        <div>
            <Backdrop
                open={open}
                sx={{
                    ...(open) ? { zIndex: 1000 } : {},
                }}
            />
            <SpeedDial
                ariaLabel="Main Speed Dial"
                sx={{ position: 'fixed', bottom: 16, right: 16, ...sx }}
                icon={<SpeedDialIcon />}
                onClose={handleClose}
                onOpen={handleOpen}
                open={open}
            >
                {options.map((option) => (
                    <SpeedDialAction
                        key={option.name}
                        icon={
                            <Iconify
                                icon={option.icon}
                                width={'55%'}
                                height={'55%'}
                                color={(option.source === openModal) ? theme.palette.primary.main : 'default'}
                            />
                        }
                        tooltipTitle={
                            <Typography variant={'body2'} color={'text.secondary'} sx={{ whiteSpace: 'nowrap' }}>
                                {option.name}
                            </Typography>
                        }
                        tooltipOpen
                        onClick={() => { handleSelect(option.source) }}
                    />
                ))}
            </SpeedDial>
        </div>
    );
};