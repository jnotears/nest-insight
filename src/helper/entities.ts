import { User } from '../g-users/user.entity'
import { GIssue } from 'src/g-issues/issue.entity'
import { GColumn } from 'src/g-columns/column.entity'
import { Milestone } from 'src/g-milestones/milestone.entity'
import { GRepository } from 'src/g-repositories/repository.entity'

export const entities = [
    User,
    GIssue,
    GColumn,
    Milestone,
    GRepository
]