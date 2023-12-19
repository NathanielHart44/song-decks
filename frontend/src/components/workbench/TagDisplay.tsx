import { Card, Grid, Typography, useTheme } from '@mui/material';
import { Tag } from 'src/@types/types';

// ----------------------------------------------------------------------

type Props = {
    allTags: Tag[];
    selectedTags: Tag[];
    updateTags: (tags: Tag[]) => void;
};

export default function TagDisplay({ allTags, selectedTags, updateTags }: Props) {

    const icon_transition_duration = 300;
    const theme = useTheme();
    const default_color = theme.palette.grey[500];
    const selected_color = theme.palette.primary.main;

    const icon_transition = `
        width ${icon_transition_duration}ms,
        height ${icon_transition_duration}ms,
        background-color ${icon_transition_duration}ms,
        border ${icon_transition_duration}ms,
        border-color ${icon_transition_duration}ms,
        scale ${icon_transition_duration}ms,
        color ${icon_transition_duration}ms
    `;

    // const color_list: string[] = getGameStyleColor((game.game_style).length);
    const hover_ratio = '1.02';
    const tap_ratio = '0.98';

    function getTagSelected(tag: Tag) {
        const all_selected_tag_ids = selectedTags.map((t: Tag) => t.id);
        if (all_selected_tag_ids.includes(tag.id)) {
            return true;
        } else {
            return false;
        }
    }

    function handleClick(event: any, tag: Tag) {
        event.stopPropagation();
        event.preventDefault();
        if (getTagSelected(tag)) {
            updateTags(selectedTags.filter((t: Tag) => t.id !== tag.id));
        } else {
            updateTags(selectedTags.concat([tag]));
        }
    }

    return (
        <Grid container spacing={1} sx={{ justifyContent: 'center', alignItems: 'center' }}>
            {allTags.map((tag: Tag) => (
                <Grid key={'tag_display_' + tag.id} item>
                    <Card
                        onClick={(event: any) => { handleClick(event, tag) }}
                        sx={{
                            pt: 0.2, pb: 0.2, pl: 0.75, pr: 0.75,
                            border: 1,
                            borderColor: getTagSelected(tag) ? 'transparent' : default_color,
                            backgroundColor: getTagSelected(tag) ? 
                                selected_color : 'transparent',
                            justifyContent: 'center',
                            alignItems: 'center',
                            display: 'flex',
                            // transition: '0.25s background-color; border; borderColor;',
                            transition: icon_transition,
                            color: getTagSelected(tag) ? 'white' : default_color,
                            // backgroundColor: color_list[index],
                            '&:hover': {
                                cursor: 'pointer',
                                border: 1,
                                backgroundColor: 'transparent',
                                textDecorationColor: theme.palette.primary.main,
                                borderColor: selected_color,
                                color: theme.palette.primary.main,
                                scale: hover_ratio
                            },
                            '&:tap': {
                                scale: tap_ratio
                            }
                        }}
                    >
                        <Typography variant={'button'}>
                            {tag.name}
                        </Typography>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}