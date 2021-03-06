import { EntityBase } from "src/shared/base/entity.base";
import { PrimaryColumn, Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { GitRepositoryAPIResponse } from "../dtos/github.api.dto";

@Entity()
export class RepositoryEntity extends EntityBase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  user_id: string;

  @Column()
  external_id: string;

  @Column({default: false})
  sync: boolean;

  @Column()
  owner: string;

  static from(data: GitRepositoryAPIResponse): RepositoryEntity {
    return {
      ...new RepositoryEntity(),
      name: data.name,
      external_id: data.external_id,
      owner: data.owner
    };
  }
}
