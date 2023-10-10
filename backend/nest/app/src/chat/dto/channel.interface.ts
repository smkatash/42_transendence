import { UserInterface } from "./user.interface";

export interface ChannelInterface   {
    chatId?: number;
    createdAt?: Date;
    updatedAt?: Date;
    name: string;
    private?: boolean;
    owner?: UserInterface;
    hash?: string;
    topic?: string;
    users: UserInterface[];
}