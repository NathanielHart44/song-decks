/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Card, CircularProgress, FormHelperText, Grid, Stack, SxProps, TextField, Theme, styled } from '@mui/material';
import { useCallback, useContext, useEffect, useState } from 'react';
import { CustomFile } from './type';
import { fData } from 'src/utils/formatNumber';
import { useDropzone } from 'react-dropzone';
import Iconify from '../base/Iconify';
import RejectionFiles from './RejectionFiles';
import LazyImage from '../base/MainImage';
import { Attachment, Commander, Faction, Unit, NCU } from "src/@types/types";
import createImageURL from 'src/utils/createImgURL';
import isValidHttpUrl from 'src/utils/isValidHttpUrl';
import { processTokens } from 'src/utils/jwt';
import { MAIN_API } from 'src/config';
import axios from 'axios';
import { MetadataContext } from 'src/contexts/MetadataContext';

// ----------------------------------------------------------------------

export type AvatarUploadType = 'card' | 'faction' | 'commander' | 'attachment' | 'ncu' | 'unit' | 'attachment_card' | 'ncu_card' | 'unit_card';

// ----------------------------------------------------------------------

export interface FileWithPreview extends File {
    preview: string;
}

type UploadProps = {
    size: 'card' | 'unit' | 'avatar';
    type: AvatarUploadType;
    name: string;
    faction: Faction | null;
    item: Commander | Attachment | NCU | Unit | null;
    uploadFile: FileWithPreview | null;
    setUploadFile: (arg0: FileWithPreview | null) => void;
    imgURL: string;
    setImgURL: (arg0: string) => void;
    setURLLock: (arg0: boolean) => void;
}

// ----------------------------------------------------------------------

export default function UploadAvatarComp({ size, type, name, faction, item, uploadFile, setUploadFile, imgURL, setImgURL, setURLLock }: UploadProps) {

    const [newUrl, setNewUrl] = useState<string>('');

    useEffect(() => {
        const img_url = createImageURL({ type, name, faction, item, uploadFile });
        setNewUrl(img_url);
    }, [type, name, faction, item, uploadFile]);

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
                width: '100%',
                // height: is_card ? 350 : 300,
                height: 'auto',
                p: 1,
            }}
        >
            <UploadAvatar
                file={uploadFile}
                newUrl={newUrl}
                imgURL={imgURL}
                setImgURL={setImgURL}
                maxSize={3145728}
                onDrop={handleDrop}
                removeFile={() => setUploadFile(null)}
                size={size}
                setURLLock={setURLLock}
            />
        </Card>
    );
};

// ----------------------------------------------------------------------

type UploadAvatarProps = {
    file: CustomFile | string | null;
    newUrl: string;
    imgURL: string;
    setImgURL: (arg0: string) => void;
    maxSize: number;
    size: 'card' | 'unit' | 'avatar';
    onDrop: (acceptedFiles: File[]) => void;
    removeFile: () => void;
    setURLLock: (arg0: boolean) => void;
    sx?: SxProps<Theme>;
};
  
// ----------------------------------------------------------------------
  
function UploadAvatar({ file, newUrl, imgURL, setImgURL, maxSize, size, onDrop, removeFile, setURLLock, sx, ...other }: UploadAvatarProps) {

    const { isMobile } = useContext(MetadataContext);
    const [awaitingResponse, setAwaitingResponse] = useState<boolean>(false);
    const card_mod = 0.3;
    const unit_mod = isMobile ? 0.2 : 0.26;
    const [dimensions, setDimensions] = useState<number[]>([0, 0]);

    useEffect(() => {
        if (size === 'avatar') {
            setDimensions([150, 150]);
        } else if (size === 'card') {
            setDimensions([750 * card_mod, 1050 * card_mod]);
        } else {
            setDimensions([1250 * unit_mod, 750 * unit_mod]);
        }
    }, [size]);

    const [error, setError] = useState(false);
    const [helperText, setHelperText] = useState('');

    useEffect(() => {
        setHelperText(`Allowed: *.jpeg, *.jpg, *.png\nMax size: ${fData(maxSize)}`);
    }, [maxSize]);

    const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
        multiple: false,
        onDropAccepted: (acceptedFiles) => {
            setError(false);
            setHelperText('');
            onDrop(acceptedFiles);
        },
        onDropRejected: () => {
            setError(true);
            setHelperText('Invalid file type or size');
        },
        ...other,
    });

    const downloadImg = async () => {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';

        const formData = new FormData();
        formData.append('img_url', imgURL);

        await axios.post(`${MAIN_API.base_url}download_img/`, formData,
            { headers: { Authorization: `JWT ${token}` }, responseType: 'blob' }
        ).then((response) => {
            const contentType = response.headers['content-type'];

            if (contentType.startsWith('image')) {
                // Handle image response
                const urlSegments = new URL(imgURL).pathname.split('/');
                const originalFileName = urlSegments[urlSegments.length - 1] || 'image.jpg';
    
                const imageBlob = new Blob([response.data], { type: contentType });
                const imageFile = new File([imageBlob], originalFileName, { type: contentType });
    
                onDrop([imageFile]);
            } else {
                // TODO: Handle JSON response with specific error messages
                removeFile();
                setError(true);
                setHelperText("Unnable to download image from URL.");
            }
            setAwaitingResponse(false);
        });
    };

    function handleDownloadImgURL(url : string) {
        if (!isValidHttpUrl(url)) {
            setError(true);
            setHelperText('Invalid URL');
            return;
        };
        if (file && (url === newUrl)) { return };
        setError(false);
        setHelperText('');
        processTokens(downloadImg);
    };

    useEffect(() => {
        if (awaitingResponse) { return };
        handleDownloadImgURL(imgURL);
    }, [imgURL]);

    useEffect(() => {
        if (awaitingResponse) { setURLLock(true) }
        else { setURLLock(false) };
    }, [awaitingResponse]);

    const grid_sizing = {
        xs: 12,
        sm: 12,
        md: size === 'unit' ? 12 : 6,
        lg: 6,
        xl: 6,
    }

    return (
        <>
            <Grid container spacing={2} justifyContent="center" alignItems="center" sx={{ p: 1, width: '100%' }}>
                <Grid item {...grid_sizing}>
                    <RootStyle
                        sx={{
                            ...((isDragReject || error) && {
                                borderColor: 'error.light',
                            }),
                            borderRadius: size === 'avatar' ? '25%' : '4%',
                            width: `${dimensions[0]}px`,
                            height: `${dimensions[1]}px`,
                            ...sx,
                        }}
                    >
                        <DropZoneStyle
                            {...getRootProps()}
                            sx={{
                                ...(isDragActive && { opacity: 0.72 }),
                                borderRadius: size === 'avatar' ? '25%' : '4%',
                            }}
                        >
                            <input {...getInputProps()} />

                            {file && (
                                <LazyImage alt="avatar" src={isString(file) ? file : file.preview} sx={{ zIndex: 8 }} />
                            )}

                            <PlaceholderStyle
                                className="placeholder"
                                sx={{
                                    ...(file && {
                                        opacity: 0,
                                        '&:hover': { opacity: 0.72 },
                                    }),
                                }}
                            >
                                { awaitingResponse ?
                                    <CircularProgress /> :
                                    <Iconify icon={'mdi:file-document-add-outline'} sx={{ width: 24, height: 24, mb: 1 }} />
                                }
                            </PlaceholderStyle>
                        </DropZoneStyle>
                    </RootStyle>

                    { (helperText && !awaitingResponse) && (
                        <FormHelperText error={error} sx={{ textAlign: 'center' }}>
                            {helperText}
                        </FormHelperText>
                    )}
                </Grid>

                <Grid item {...grid_sizing}>
                    <Stack direction="column" justifyContent="center" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                        <TextField
                            variant="outlined"
                            fullWidth
                            value={newUrl}
                            size={"small"}
                            sx={{ labelWidth: "text".length * 9, mt: 2 }}
                            disabled
                            label={"Generated URL"}
                        />

                        <Stack direction="row" justifyContent="center" alignItems="center" spacing={1} sx={{ width: '100%' }}>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => { setImgURL(newUrl) }}
                                sx={{ width: '100%' }}
                                disabled={newUrl === imgURL || !file}
                            >
                                Use URL
                            </Button>
                            <Button
                                variant="contained"
                                size="small"
                                color='secondary'
                                onClick={() => { removeFile(); setImgURL(''); }}
                                sx={{ width: '100%' }}
                                disabled={!file}
                            >
                                Remove
                            </Button>
                        </Stack>
                    </Stack>
                </Grid>

                { fileRejections.length > 0 &&
                    <Grid item xs={12}>
                        <RejectionFiles fileRejections={fileRejections} />
                    </Grid>
                }
            </Grid>
        </>
    );
};

// ----------------------------------------------------------------------

export function isString(file: CustomFile | string): file is string {
    return typeof file === 'string';
};

const RootStyle = styled('div')(({ theme }) => ({
    margin: 'auto',
    padding: theme.spacing(1),
    border: `1px dashed ${theme.palette.grey[500_32]}`,
}));

const DropZoneStyle = styled('div')({
    zIndex: 0,
    width: '100%',
    height: '100%',
    outline: 'none',
    display: 'flex',
    overflow: 'hidden',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    '& > *': { width: '100%', height: '100%' },
    '&:hover': {
        cursor: 'pointer',
        '& .placeholder': {
            zIndex: 9,
        },
    },
});

const PlaceholderStyle = styled('div')(({ theme }) => ({
    display: 'flex',
    position: 'absolute',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
    backgroundColor: theme.palette.background.neutral,
    transition: theme.transitions.create('opacity', {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.shorter,
    }),
    '&:hover': { opacity: 0.72 },
}));