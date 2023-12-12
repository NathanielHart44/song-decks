import { Commander, Faction } from "src/@types/types";
import { FileWithPreview } from "src/components/upload/UploadAvatarComp";
import { MAIN_API } from "src/config";

// ----------------------------------------------------------------------

type Props = {
    type: 'card' | 'faction' | 'commander';
    name: string;
    faction: Faction | null;
    commander: Commander | null;
    uploadFile: FileWithPreview | null;
};

// Function that creates a S3 url for the image.
export default function createImageURL({ type, name, faction, commander, uploadFile }: Props) {

    let url = MAIN_API.asset_url_base;

    let formatted_name = formatFunct(name);

    if (type === 'card') {
        url += 'cards/';
    } else if (type === 'faction') {
        url += 'factions/';
    } else if (type === 'commander') {
        url += 'commanders/';
    };

    if (faction) {
        const formatted_faction = formatFunct(faction.name);
        url += `${formatted_faction}/`;
    }
    if (commander) {
        const formatted_commander = formatFunct(commander.name);
        url += `${formatted_commander}/`;
    }
    url += `${formatted_name}`;

    if (uploadFile) {
        url += `.${uploadFile.name.split('.').pop()}`;
    } else {
        url += '.jpg';
    };

    return url;
};

function formatFunct(name: string) {
    // take all spaces and replace with underscores. Also replace all apostrophes with nothing. Then make it all lowercase.
    // also remove - from the name.
    let formatted_name = name.replace(/ /g, '_').replace(/'/g, '').replace(/-/g, '');
    // check if there are any double underscores and replace with single underscore.
    while (formatted_name.includes('__')) {
        formatted_name = formatted_name.replace('__', '_');
    };
    return formatted_name.toLowerCase();
};