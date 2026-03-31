export enum UserRole {
  CLIENT = "CLIENT",
  FREELANCER = "FREELANCER",
}

export interface UserProfileDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  skills: string[];
  rating: number;
  trustScore: number;
  experience: string;
  portfolio: string[];
}

export interface AuthResponseDto {
  token: string;
  user: UserProfileDto;
}
