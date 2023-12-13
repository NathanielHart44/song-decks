export type User = {
    id: number;
    username: string;
    profile: Profile;
    first_name: string;
    last_name: string;
    email: string;
    user_type: string;
    moderator: boolean;
}

export type Profile = {
    id: number;
    user: User;
};

export type Faction = {
    id: number;
    name: string;
    img_url: string;
    neutral: boolean;
};

export type Commander = {
    id: number;
    name: string;
    img_url: string;
    faction: Faction;
};

export type FakeCommander = {
    id: number;
    name: string;
    img_url: string;
    faction: Faction | null;
};

export type Game = {
    id: number;
    owner: Profile;
    faction: Faction;
    commander: Commander;
    status: 'in-progress' | 'completed' | 'abondoned';
    created_at: string;
    updated_at: string;
    round: number;
};

export type CardTemplate = {
    id: number;
    card_name: string;
    img_url: string;
    faction: Faction;
    commander: Commander | null;
    replaces: CardTemplate | null;
    game_count: number;
    player_count: number;
    discard_count: number;
};

export type FakeCardTemplate = {
    id: number;
    card_name: string;
    img_url: string;
    faction: Faction | null;
    commander: Commander | null;
    replaces: CardTemplate | null;
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

export type ChartData = {
    date: string;
    value: number;
};

export type ChartDataCohort = {
    data: ChartData[];
    dataLabel: string;
    graphType?: string;
};

export type ACTION_TYPE =  'draw' | 'place_in_deck' | 'place_in_hand' | 'discard' | 'play' | 'leave_note' | 'update_play_notes' ;
export const allSteps = ['Deck', 'Hand', 'In Play', 'Discard'];
