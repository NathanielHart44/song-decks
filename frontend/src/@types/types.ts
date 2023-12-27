export type User = {
    id: number;
    username: string;
    profile: Profile;
    first_name: string;
    last_name: string;
    email: string;
    user_type: string;
    moderator: boolean;
    admin: boolean;
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

export type ChartDataCohortGroup = {
    data: ChartDataCohort[];
    dataLabel: string;
};

export type Tag = {
    id: number;
    name: string;
    use_count: number;
    created_at: string;
};

export type Proposal = {
    id: number;
    creator: Profile;
    status: 'pending' | 'rejected' | 'closed' | 'confirmed';
    text: string;
    tags: Tag[];
    favorited_by: number[];
    created_at: string;
};

export type ProposalImage = {
    id: number;
    proposal: Proposal;
    img_url: string;
    created_at: string;
};

export type Task = {
    id: number;
    title: string;
    description: string;
    state: 'not_started' | 'assigned' | 'in_progress' | 'finished';
    complexity: number;
    priority: number;
    is_private: boolean;
    notes: string;
    tags: Tag[];
    favorited_by: number[];
    assigned_admins: Profile[];
    subtasks: Subtask[];
    created_at: string;
};

export type Subtask = {
    id: number;
    task: Task;
    title: string;
    description: string;
    state: 'not_started' | 'assigned' | 'in_progress' | 'finished';
    complexity: number;
    priority: number;
    is_private: boolean;
    notes: string;
    assigned_admins: Profile[];
    created_at: string;
};

export type KeywordType = {
    id: number;
    name: string;
    description: string;
};

export type KeywordPairType = {
    id: number;
    keyword: string;
    keyword_types: KeywordType[];
    description: string;
};

export type ACTION_TYPE =  'draw' | 'place_in_deck' | 'place_in_hand' | 'discard' | 'play' | 'leave_note' | 'update_play_notes' ;
export const allSteps = ['Deck', 'Hand', 'In Play', 'Discard'];