import { Attachment, Commander, Faction, NCU, Unit } from "src/@types/types";
import { AvatarUploadType, FileWithPreview } from "src/components/upload/UploadAvatarComp";
import { MAIN_API } from "src/config";

// ----------------------------------------------------------------------

type Props = {
    type: AvatarUploadType;
    name: string;
    faction: Faction | null;
    item: Commander | Attachment | NCU |  Unit | null;
    uploadFile: FileWithPreview | null;
};

// Function that creates a S3 url for the image.
export default function createImageURL({ type, name, faction, item, uploadFile }: Props) {

    let url = MAIN_API.asset_url_base;

    let formatted_name = formatFunct(name);

    if (type === 'card') {
        url += 'cards/';
    } else if (type === 'faction') {
        url += 'factions/';
    } else if (type === 'commander') {
        url += 'commanders/';
    } else if (type === 'attachment' || type === 'attachment_card') {
        url += 'attachments/';
        if (type === 'attachment_card') { url += 'cards/' }
        else { url += 'previews/' };
    } else if (type === 'ncu' || type === 'ncu_card') {
        url += 'ncus/';
        if (type === 'ncu_card') { url += 'cards/' }
        else { url += 'previews/' };
    } else if (type === 'unit' || type === 'unit_card') {
        url += 'units/';
        if (type === 'unit_card') { url += 'cards/' }
        else { url += 'previews/' };
    };

    if (faction) {
        const formatted_faction = formatFunct(faction.name);
        url += `${formatted_faction}/`;
    }
    if (type === 'commander' && item) {
        const formatted_commander = formatFunct(item.name);
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