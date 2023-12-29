import { Box } from "@mui/material";
import { useState } from "react";
import { Unit, Faction } from "src/@types/types";
import EditAddUnit from "./EditAddUnit";

// ----------------------------------------------------------------------

type CardDisplayProps = {
    isMobile: boolean;
    unit: Unit;
    units: Unit[];
    setUnits: (arg0: Unit[]) => void;
    factions: Faction[];
};
export function UnitDisplay({ isMobile, unit, units, setUnits, factions }: CardDisplayProps) {

    const [editOpen, setEditOpen] = useState<boolean>(false);

    return (
        <>
            <Box
                onClick={() => { setEditOpen(true); }}
                sx={{
                    height: '100%',
                    width: isMobile ? '300px' : '420px',
                    ...!isMobile ? {
                        transition: 'transform 0.3s',
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.075)' },
                    } : {},
                }}
            >
                <img
                    src={unit.main_url}
                    alt={unit.name}
                    loading="lazy"
                    style={{ borderRadius: '6px', width: '100%', height: '100%', objectFit: 'contain' }}
                />
            </Box>
            <EditAddUnit
                unit={unit}
                editOpen={editOpen}
                setEditOpen={setEditOpen}
                units={units}
                setUnits={setUnits}
                factions={factions}
            />
        </>
    );
}
;
