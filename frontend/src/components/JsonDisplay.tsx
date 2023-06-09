import { Stack, useTheme, Theme, ToggleButton } from "@mui/material";
import { useState, useMemo, memo } from "react";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

function getHighlightedText(term: string, text: string, theme: Theme){
    const highlightStyle = { backgroundColor: theme.palette.primary.main, color: 'black', display: 'inline-block' };
  
    const parts = text.split(new RegExp(`(${term})`)).filter((s: string) => s !== '');
    const resLabel = parts.map((part: string, i: number) => (
      <span key={i} style={part.toLowerCase() === term.toLowerCase() ? highlightStyle : {}}>{part}</span>
    ))
  
    return resLabel;
}

type ArrayDisplayProps = {
    arr: any[];
    term: string;
  }
  
function ArrayDisplay({ arr, term } : ArrayDisplayProps){
    if(arr === null){
        return <></>
    }
    return (
    <>
        {arr.map((e: Object | string | number | boolean, i: number) => (
            <>
            <div key={i}>
                {typeof e !== "object" && <JsonDisplay label={''} val={JSON.stringify(e)} term={term} valIsSingle={true}/>}
                {JSON.stringify(e)[0] === '{' && 
                <>{' {'}
                {Object.keys(e).map((newKey) => (
                    <JsonDisplay key={newKey} label={newKey} val={JSON.stringify(e[newKey as keyof Object])} term={term} valIsSingle={false}/>
                ))} 

                {' }'}</>}
                {Array.isArray(e) && <ArrayDisplay arr={e} term={term}/>}
            </div>
            </>
        ))}
    </>
    )
}

type JsonDisplayProps = {
    label: any;
    val: any;
    term: string;
    valIsSingle: boolean;
}

function JsonDisplay({ label, val, term, valIsSingle }: JsonDisplayProps){
    const[minimized, setMinimized] = useState(false)
    const theme = useTheme();

    const labelToRender = useMemo(() => {
      if (term && label.includes(term)) {
          return getHighlightedText(term, label, theme)
      } else {
          return label;
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [label, term]);

    const valToRender = useMemo(() => {
      if(typeof val !== 'object' && term && val.includes(term)) {
          return getHighlightedText(term, val, theme);
      } else {
          return val;
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [val, term]);

    if(minimized){
        return (
            <Stack direction={'row'}>
                <ToggleButton value="right" sx={{ padding: '0px', border: 'none', alignSelf: 'flex-start', color: `${theme.palette.primary.main}` }} onClick={() => setMinimized(!minimized)}><ArrowRightIcon /></ToggleButton>
                {term ? 
                    <>{`"${labelToRender}"`}{`-,`}</> : 
                    <>{`"`}{labelToRender}{`": `}{`-,`}</>
                }
            </Stack>         
        );
    }

    if(typeof JSON.parse(val) !== 'object'){
        return (
            <Stack direction={'row'}>
                {valIsSingle ? 
                  <>   
                    <pre>   {valToRender}{','}</pre>
                  </> : 
                  <>
                    {!term ? <pre>   {`"${labelToRender}": ${valToRender},`}</pre> : <pre>   {`"`}{labelToRender}{`": `}{valToRender}{`,`}</pre>}
                  </>
                }
            </Stack>
        )
    }
    
    val = JSON.parse(val);
    
    return (
        <>
        <Stack direction={'row'}>
            <ToggleButton sx={{ padding: '0px', border: 'none', alignSelf: 'flex-start' }} value="down" onClick={() => setMinimized(!minimized)}><ArrowDropDownIcon /></ToggleButton>
            <pre>
                {!term ? 
                  <>
                    {JSON.stringify(val)[0] === '{' ? <>{`"${labelToRender}": {`}</> : <>{`"${labelToRender}": [`}</>}
                  </> : 
                  <>
                    {JSON.stringify(val)[0] === '{' ? <>{`"`}{labelToRender}{`": `}{`{`}</> : <>{`"`}{labelToRender}{`": `}{`[`}</>}
                  </>}
                <span>
                  {JSON.stringify(val)[0] === '{' ?
                    <>
                      {Object.keys(val).map((newKey) => (
                      <JsonDisplay key={newKey} label={newKey} val={JSON.stringify(val[newKey as keyof Object])} term={term} valIsSingle={false}/>
                      
                      ))}
                    </> :
                    <>
                      <ArrayDisplay arr={val} term={term} />
                    </>
                  }   
                </span>
                {JSON.stringify(val)[0] === '{' ? `}` : `]`}
            </pre>
        </Stack>
        </>
    )

}

export default memo(JsonDisplay);