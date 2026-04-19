export interface User {
    id: string;
    pseudo: string;
    email: string;
    age: number|null;
    familyId: string| null;
    isFamilyOwner: boolean;
    createdAt: string;
}

export interface AuthResponse{
    access_token: string;
}

export interface Avatar{
    id: string;
    level: number;
    xp: number;
    heroClass: string;
    strength: number
    agility: number
    endurance: number
    intelligence: number
    spirit: number
    vitality: number
}

export interface AvatarResponse extends Avatar{
    xpNextLevel: number;
}

export interface Parts{
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
  duration: number;
  intensity: number;
  xpGained: number;
  partsUnlocked: number;
  loggedAt: string;
}