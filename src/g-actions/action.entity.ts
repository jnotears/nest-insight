import {Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
export class GAction{
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    act: string;

    @Column()
    content: string;

    @Column()
    actor: string;

    @Column({nullable: true})
    createdAt: Date;

    @Column({nullable: true})
    updatedAt: Date;

    @Column({nullable: true})
    closedAt: Date;

    @Column({nullable: true})
    actionUrl: string;

    @Column({nullable:true})
    event: string;

    @Column({nullable: true})
    fromLocation: number;

    @Column({nullable: true})
    toLocation: number;
}