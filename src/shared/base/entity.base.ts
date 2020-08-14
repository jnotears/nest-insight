import { CreateDateColumn, UpdateDateColumn } from "typeorm";

export class EntityBase {
    @CreateDateColumn()
    created_at: Date;
    @UpdateDateColumn()
    updated_at: Date;
}