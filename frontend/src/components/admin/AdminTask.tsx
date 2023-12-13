  import { useEffect, useState, Profiler, useRef, useMemo } from 'react';
  import axios from 'axios';
  import { processTokens } from 'src/utils/jwt';
  // @mui
  import {
      Button,
      Card,
      IconButton,
      InputAdornment,
      LinearProgress,
      OutlinedInput,
      Stack,
      Typography,
  } from '@mui/material';
  // sections
  import Iconify from 'src/components/base/Iconify';
  import JsonDisplay from '../JsonDisplay'

  // ----------------------------------------------------------------------

  type Props = {
      title: string;
      url: string;
      placeholder: string;
      open: boolean;
  };

  type HighlightTextProps = {
      text: any;
      term: string;
      clockPerformance: any
  };

  export default function AdminTask({ title, url, placeholder, open }: Props) {
      

      const [awaitingResponse, setAwaitingResponse] = useState(false);

      const [requestInput, setRequestInput] = useState<string>('');
      const requestItems = (requestValue: string) => { setRequestInput(requestValue) };
      const clearRequestText = () => { setRequestInput('') };

      const [response, setResponse] = useState<string | null>(null);

      const totalTime = useRef(0)
      const highlightTime = useRef(0)
      const responseDisplayTime = useRef(0)
      const requestItemsTime = useRef(0)
      const clockPerformance = (profilerId: any, mode: any, actualTime: any, baseTime: any, startTime: any, commitTime: any) => {
        totalTime.current += actualTime
        if(profilerId === 'responseDisplay'){
          responseDisplayTime.current += actualTime

        }  
        if(profilerId === 'highlightText'){
          highlightTime.current += actualTime
        }
        if(profilerId === 'requestItemsDiv'){
          requestItemsTime.current += actualTime
        }
      }

      async function submitRequest() {
        setAwaitingResponse(true);
        let token = localStorage.getItem('accessToken') ?? '';
        const res_url = requestInput.length > 0 ? (url + requestInput + '/') : url;
        await axios.get(res_url, { headers: { Authorization: `JWT ${token}` } }).then((response) => {
            if (response.data) { setResponse(JSON.stringify(response.data, null, 2)) };
            setAwaitingResponse(false);
        }).catch((error) => { console.error(error) });
      }

      function resetReponse() { setResponse(null); clearRequestText() };

      // eslint-disable-next-line react-hooks/exhaustive-deps
      useEffect(() => { if (!open) resetReponse() }, [open]);

      return (
          <Stack spacing={2}>
              <Stack direction={'row'} spacing={2} justifyContent={'space-between'} alignItems={'center'}>
                  <Typography variant='h5'>{title}</Typography>
                  { response === null &&
                      <Button
                          variant='contained'
                          disabled={(requestInput.length < 1 && placeholder.length > 1) || awaitingResponse}
                          onClick={() => processTokens(submitRequest) }
                      >
                          Submit
                      </Button>
                  }

                  { response !== null && <Button variant='contained' onClick={resetReponse}>Reset</Button> }
              </Stack>
              <>
                  { awaitingResponse && <LinearProgress /> }

                  { !awaitingResponse && response === null &&
                      <RequestItemsDiv
                          placeholder={placeholder}
                          requestInput={requestInput}
                          requestItems={requestItems}
                          clearRequestText={clearRequestText}
                          clockPerformance={clockPerformance}
                      />
                  }

                  { !awaitingResponse && response !== null && 
                    <ResponseDisplay
                      response={response}
                      clockPerformance={clockPerformance}
                    />
                  }
              </>
          </Stack>
      );
  }

  // ----------------------------------------------------------------------

  type RequestItemsProps = {
      placeholder: string;
      requestInput: string;
      requestItems: (requestValue: string) => void;
      clearRequestText: () => void;
      clockPerformance: any
  };

  function RequestItemsDiv({ placeholder, requestInput, requestItems, clearRequestText, clockPerformance }: RequestItemsProps) {
      return (
        <Profiler id='requestItemsDiv' onRender={clockPerformance}>
          <OutlinedInput
              onChange={(e) => requestItems(e.target.value)}
              fullWidth
              placeholder={placeholder}
              value={requestInput}
              disabled={placeholder.length < 1}
              endAdornment={
                  requestInput &&
                  <InputAdornment position="end">
                      <IconButton onClick={() => { clearRequestText() }}>
                          <Iconify icon={'eva:close-outline'} sx={{ color: 'text.disabled' }} width={20} height={20} />
                      </IconButton>
                  </InputAdornment>
              }                            
              sx={{ mr: 1, fontWeight: 'fontWeightBold', color: 'grey.300', height: '51px' }}
          />
        </Profiler>
      );
  }

  // ----------------------------------------------------------------------
  function HighlightText({ text, term, clockPerformance }: HighlightTextProps) {
    
    return( 
        <>
          <Profiler id='highlightText' onRender={clockPerformance}>
            <Stack direction={'column'}>
                {`{`}
                {Object.keys(text).map((key) => (
                    <JsonDisplay key={key} label={key} val={JSON.stringify(text[key as keyof Object])} term={term ? term : ''} valIsSingle={false}/>
                ))
                }
                {`}`}
            </Stack>
          </Profiler>
        </>
    ) 
  };

  type ResponseDisplayProps = {
      response: string;
      clockPerformance: any;
  };

  function ResponseDisplay({ response, clockPerformance }: ResponseDisplayProps) {

      const memoizedJson = useMemo(() => JSON.parse(response), [response]);

      return (
        <Profiler id='responseDisplay' onRender={clockPerformance}>
          <Card sx={{ p: 2 }}>
              <Stack spacing={2}>
                  <pre style={{ width: '100%', overflow: 'auto' }}>
                      <code>
                          {<HighlightText text={memoizedJson} term={''} clockPerformance={clockPerformance}/>}
                      </code>
                  </pre>
              </Stack>
          </Card>
        </Profiler>
      );
  }