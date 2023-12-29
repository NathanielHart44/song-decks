import { Box } from "@mui/material";
import { useState } from "react";
import { Attachment, Faction } from "src/@types/types";
import EditAddAttachment from "./EditAddAttachment";

// ----------------------------------------------------------------------

type CardDisplayProps = {
    isMobile: boolean;
    attachment: Attachment;
    attachments: Attachment[];
    setAttachments: (arg0: Attachment[]) => void;
    factions: Faction[];
};
export function AttachmentDisplay({ isMobile, attachment, attachments, setAttachments, factions }: CardDisplayProps) {

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
                    src={attachment.main_url}
                    alt={attachment.name}
                    loading="lazy"
                    style={{ borderRadius: '6px', width: '100%', height: '100%', objectFit: 'contain' }}
                />
            </Box>
            <EditAddAttachment
                attachment={attachment}
                editOpen={editOpen}
                setEditOpen={setEditOpen}
                attachments={attachments}
                setAttachments={setAttachments}
                factions={factions}
            />
        </>
    );
}
;
