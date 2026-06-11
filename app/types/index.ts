export interface User {
  id: string;
  pseudo: string;
  email: string;
  age: number | null;
  familyId: string | null;
  isFamilyOwner: boolean;
  createdAt: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  access_token: string;
}

export interface AvatarCustomization {
  silhouette: string;
  skinTone: number;
  hairStyle: number;
  hairColor: number;
  showHood: boolean;
}

export interface Avatar {
  id: string;
  level: number;
  xp: number;
  heroClass: string;
  strength: number;
  agility: number;
  endurance: number;
  intelligence: number;
  spirit: number;
  vitality: number;
  silhouette: string;
  skinTone: number;
  hairStyle: number;
  hairColor: number;
  showHood: boolean;
}

export interface AvatarResponse extends Avatar {
  xpNextLevel: number;
}

export interface Parts {
  stock: number;
}

export interface Activity {
  id: string;
  name: string;
  category: string;
  statPrimary: string;
  statSecondary: string | null;
  xpMultiplier: number;
}

export interface ActivityLog {
  id: string;
  activityId: string | null;
  activity: { name: string; category: string } | null;
  customName: string | null;
  customCategory: string | null;
  duration: number;
  intensity: number;
  xpGained: number;
  partsUnlocked: number;
  loggedAt: string;
}

export interface ChallengeCatalog {
  id: string;
  stat: string;
  type: 'OBJECTIVE' | 'TIMED' | 'QUIZ_IA' | 'ENIGMA_IA';
  title: string;
  description: string;
  targetSeconds: number | null;
  weekSlot: number;
}

export interface TodayChallenge {
  challenge: ChallengeCatalog;
  alreadyDoneToday: boolean;
  monthlyBonus: number;
  atCap: boolean;
  canAfford: boolean;
}

export interface QuizStartResponse {
  sessionId: string;
  message: string;
}

export interface QuizMessageResponse {
  type: 'message' | 'score';
  message: string;
  score?: number;
  xpGained?: number;
  partsUnlocked?: number;
}
