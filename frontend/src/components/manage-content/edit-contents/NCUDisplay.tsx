import { Box } from "@mui/material";
import { useState } from "react";
import { NCU, Faction } from "src/@types/types";
import EditAddNCU from "./EditAddNCU";

// ----------------------------------------------------------------------

type CardDisplayProps = {
    isMobile: boolean;
    ncu: NCU;
    ncus: NCU[];
    setNCUs: (arg0: NCU[]) => void;
    factions: Faction[];
};
export function NCUDisplay({ isMobile, ncu, ncus, setNCUs, factions }: CardDisplayProps) {

    const [editOpen, setEditOpen] = useState<boolean>(false);

    return (
        <>
            <Box
                onClick={() => { setEditOpen(true); }}
                sx={{
                    height: '100%',
                    width: '200px',
                    ...!isMobile ? {
                        transition: 'transform 0.3s',
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.075)' },
                    } : {},
                }}
            >
                <img
                    src={ncu.main_url}
                    alt={ncu.name}
                    loading="eager"
                    style={{ borderRadius: '6px', width: '100%', height: '100%', objectFit: 'contain' }}
                />
            </Box>
            <EditAddNCU
                ncu={ncu}
                editOpen={editOpen}
                setEditOpen={setEditOpen}
                ncus={ncus}
                setNCUs={setNCUs}
                factions={factions}
            />
        </>
    );
}
;
