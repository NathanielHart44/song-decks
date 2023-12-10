import { Card } from '@mui/material';
import { useCallback, useState } from 'react';
import UploadAvatar from './upload/UploadAvatar';

// ----------------------------------------------------------------------

interface FileWithPreview extends File {
    preview: string;
}

// ----------------------------------------------------------------------

export default function UploadAvatarComp() {

    const size = 200;

    const [uploadFile, setUploadFile] = useState<FileWithPreview | null>(null);

    const handleDrop = useCallback((acceptedFiles: File[]) => {
        const newFile = acceptedFiles[0] as FileWithPreview;

        if (newFile) {
            setUploadFile(Object.assign(newFile, {
                preview: URL.createObjectURL(newFile)
            }));
        }
    }, []);

    return (
        <Card 
            sx={{
                height: size,
                width: size,
                p: 1,
            }}
        >
            <UploadAvatar
                file={uploadFile}
                maxSize={3145728}
                onDrop={handleDrop}
                removeFile={() => setUploadFile(null)}
                sx={{
                    height: size * 0.5,
                    width: size * 0.5,
                }}
            />
        </Card>
    );
};