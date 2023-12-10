import { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
// @mui
import { FormHelperText, Button } from '@mui/material';
import { SxProps, Theme, styled } from '@mui/material/styles';
// type
import { CustomFile } from './type';
//
import Image from '../Image';
import Iconify from '../Iconify';
import RejectionFiles from './RejectionFiles';
import isString from 'src/utils/isString';
import { fData } from 'src/utils/formatNumber';

// ----------------------------------------------------------------------

const RootStyle = styled('div')(({ theme }) => ({
  margin: 'auto',
  borderRadius: '25%',
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
  borderRadius: '25%',
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

type UploadAvatarProps = {
  file: CustomFile | string | null;
  maxSize: number;
  onDrop: (acceptedFiles: File[]) => void;
  removeFile: () => void;
  sx?: SxProps<Theme>;
};

// ----------------------------------------------------------------------

export default function UploadAvatar({ file, maxSize, onDrop, removeFile, sx, ...other }: UploadAvatarProps) {
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');

  useEffect(() => {
    setHelperText(`Allowed *.jpeg, *.jpg, *.png, *.gif\nmax size of ${fData(maxSize)}`);
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

  return (
    <>
      <RootStyle
        sx={{
          ...((isDragReject || error) && {
            borderColor: 'error.light',
          }),
          ...sx,
        }}
      >
        <DropZoneStyle
          {...getRootProps()}
          sx={{
            ...(isDragActive && { opacity: 0.72 }),
          }}
        >
          <input {...getInputProps()} />

          {file && (
            <Image alt="avatar" src={isString(file) ? file : file.preview} sx={{ zIndex: 8 }} />
          )}

          <PlaceholderStyle
            className="placeholder"
            sx={{
              ...(file && {
                opacity: 0,
                color: 'common.white',
                bgcolor: 'grey.900',
                '&:hover': { opacity: 0.72 },
              }),
              ...((isDragReject || error) && {
                bgcolor: 'error.lighter',
              }),
            }}
          >
            <Iconify icon={'mdi:file-document-add-outline'} sx={{ width: 24, height: 24, mb: 1 }} />
          </PlaceholderStyle>
        </DropZoneStyle>
      </RootStyle>

      {helperText && (
        <FormHelperText error={error} sx={{ textAlign: 'center' }}>
          {helperText}
        </FormHelperText>
      )}

      <Button
        variant="outlined"
        size="small"
        color="inherit"
        onClick={removeFile}
        sx={{ mt: 2, mx: 'auto', display: 'block' }}
        disabled={!file}
      >
        Remove Image
      </Button>

      {fileRejections.length > 0 && <RejectionFiles fileRejections={fileRejections} />}
    </>
  );
}