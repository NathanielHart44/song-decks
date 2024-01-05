import { Backdrop, SpeedDial, SpeedDialAction, SpeedDialIcon } from "@mui/material";
import { useState } from "react";

// ----------------------------------------------------------------------

type SpeedDialDivProps = {
    setOpenModal: (arg0: any) => void;
    options: { name: string; source: string; icon: JSX.Element; }[];
};

// ----------------------------------------------------------------------

export default function SpeedDialDiv({ setOpenModal, options }: SpeedDialDivProps) {

    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    function handleSelect(selected_page: string) {
        setOpen(false);
        setOpenModal(selected_page);
    };

    return (
        <div>
            <Backdrop open={open} />
            <SpeedDial
                ariaLabel="Main Speed Dial"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
                icon={<SpeedDialIcon />}
                onClose={handleClose}
                onOpen={handleOpen}
                open={open}
            >
                {options.map((option) => (
                    <SpeedDialAction
                        key={option.name}
                        icon={option.icon}
                        tooltipTitle={option.name}
                        onClick={() => { handleSelect(option.source) }}
                    />
                ))}
            </SpeedDial>
        </div>
    );
};