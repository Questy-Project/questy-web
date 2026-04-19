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
    npNextLevel: number;
}

export interface Parts{
    stock: number;
}