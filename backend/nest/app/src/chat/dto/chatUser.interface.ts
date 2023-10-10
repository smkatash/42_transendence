import { UserInterface } from "./user.interface";

// tryout interface
export interface ChatUserInterface  {
    id?: number;
    socketId: string;
    user: UserInterface
}