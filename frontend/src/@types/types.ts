export type User = {
    id: number;
    username: string;
    profile: Profile;
    first_name: string;
    last_name: string;
    email: string;
    user_type: string;
}

export type Profile = {
    id: number;
    user: User;
};

export type Faction = {
    id: number;
    name: string;
    img_url: string;
};

export type Commander = {
    id: number;
    name: string;
    img_url: string;
    faction: Faction;
};

export type Game = {
    id: number;
    owner: Profile;
    faction: Faction;
    commander: Commander;
    status: 'in-progress' | 'completed' | 'abondoned';
    created_at: string;
    updated_at: string;
};

export type CardTemplate = {
    id: number;
    card_name: string;
    img_url: string;
    faction: Faction;
    commander: Commander | null;
    game_count: number;
    player_count: number;
    discard_count: number;
};

export type PlayerCard = {
    id: number;
    game: Game;
    card_template: CardTemplate;
    owner: Profile;
    status: 'in-deck' | 'in-hand' | 'in-play' | 'discarded';
    play_notes: string;
    drawn_this_round: boolean;
    discarded_this_round: boolean;
};

export type UserCardStats = {
    id: number;
    card_template: CardTemplate;
    user: Profile;
    times_included: number;
    times_drawn: number;
    times_discarded: number;
};

export type ACTION_TYPE =  'draw' | 'place_in_deck' | 'place_in_hand' | 'discard' | 'play' | 'leave_note' | 'update_play_notes' ;
export const allSteps = ['Deck', 'Hand', 'In Play', 'Discard'];