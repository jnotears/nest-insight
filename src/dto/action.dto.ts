export class ActionDTO{
    id: number;
    act: string;
    content: string;
    actor: string;
    createdAt: Date;
    updatedAt: Date;
    closedAt: Date;
    actionUrl: string;
    event: string
    fromLocation: number;
    toLocation: number;
}