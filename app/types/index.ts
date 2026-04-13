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