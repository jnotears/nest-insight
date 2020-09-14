import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { EntityBase } from "src/shared/base/entity.base";
import { GithubProfileAPIResponse } from "../dtos/github.api.dto";

@Entity()
export class User extends EntityBase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({nullable: true})
  external_token: string;

  @Column()
  avatar_url: string;

  static from(data: GithubProfileAPIResponse): User {
      return Object.assign(new User(), data);
  }
}