export type Profile = { id: string; name: string; avatar: string };
export type Participant = {
  user_id: string;
  name: string;
  avatar: string;
  ready: boolean;
  last_seen: string;
  in_game: boolean;
};
export type Suspect = {
  id: string;
  name: string;
  description: string;
  motive: string;
  alibi: string;
};
export type Evidence = {
  id: string;
  title: string;
  body: string;
  user_id: string | null;
  stage: number;
};
export type RoomSnapshot = {
  room: {
    id: string;
    code: string;
    host_id: string;
    status: string;
    allow_guests: boolean;
    minutes: number;
    vote_minutes: number;
  };
  game: {
    id: string;
    stage: number;
    phase_ends_at: string;
    success: boolean;
    team_suspect: string | null;
  } | null;
  case: {
    title: string;
    intro: string;
    stages: { title: string; story: string }[];
  };
  participants: Participant[];
  suspects: Suspect[];
  evidence: Evidence[];
  messages: {
    id: string;
    user_id: string;
    name: string;
    body: string;
    sent_at: string;
  }[];
  my_vote: string | null;
  vote_count: number;
  results: {
    user_id: string;
    name: string;
    points: number;
    correct: boolean;
  }[];
  solution: { suspect_id: string; explanation: string } | null;
  server_now: string;
};
export type HomeSnapshot = {
  profile: Profile | null;
  rooms: { code: string; status: string; created_at: string }[];
  history: {
    points: number;
    correct: boolean;
    finished_at: string;
    title: string;
    code: string;
  }[];
  stats: { games: number; correct: number; points: number };
  leaderboard: {
    name: string;
    avatar: string;
    points: number;
    games: number;
  }[];
};
