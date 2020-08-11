import { GUser } from '../g-users/user.entity'
import { GIssue } from 'src/g-issues/issue.entity'
import { GColumn } from 'src/g-columns/column.entity'
import { GMilestone } from 'src/g-milestones/milestone.entity'
import { GRepository } from 'src/g-repositories/repository.entity'
import { GProject } from 'src/g-projects/project.entity'
import { GAction } from 'src/g-actions/action.entity'

export const entities = [
    GUser,
    GIssue,
    GColumn,
    GMilestone,
    GRepository,
    GProject,
    GAction
]