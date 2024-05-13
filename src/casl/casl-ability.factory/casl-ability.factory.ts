import {
  Ability,
  AbilityBuilder,
  AbilityClass,
  createMongoAbility,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';

import { Action } from 'src/enums/action.enum';
import { Role } from 'src/enums/role.enum';
import { User as UserPrisma } from '@prisma/client';

export class User {
  role: Role;
}

type Subjects = InferSubjects<typeof User> | 'all';

// export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: UserPrisma) {
    const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

    if (user.role == Role.ADMIN) {
      can(Action.Manage, 'all'); // read-write access to everything
    } else {
      can(Action.Read, 'all'); // read-only access to everything
    }

    can(Action.Update, User, { role: Role.ADMIN });
    // cannot(Action.Delete, User, { isPublished: true });

    return build({
      // Read https://casl.js.org/v6/en/guide/subject-type-detection#use-classes-as-subject-types for details
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}
