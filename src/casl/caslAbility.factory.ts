/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Ability, InferSubjects, AbilityBuilder, AbilityClass } from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { ActionEnum } from './action.enum';

// type Subjects = InferSubjects<typeof User | typeof Tag | typeof Item> | 'all';

type Subjects = InferSubjects<any> | 'all';

export type AppAbility = Ability<[ActionEnum, Subjects]>;

interface IUserCast {
    [key: string]: any;
}

@Injectable()
export class CaslAbilityFactory {
    createForUser(user: IUserCast): Ability<any> {
        const { can, cannot, build, rules } = new AbilityBuilder<Ability<[ActionEnum, Subjects]>>(Ability as AbilityClass<AppAbility>);

        if (user.role === 'ADMIN') {
            can(ActionEnum.MANAGE, 'all');
        } else {
            can(ActionEnum.READ, 'all');
            // can(ActionEnum.CREATE, Item);
            //   can(ActionEnum.CREATE, Business);

            //   can(ActionEnum.UPDATE, Item, { userId: user.id });

            //   can(ActionEnum.UPDATE, Business, { userId: user.id });
            //   can(ActionEnum.DELETE, Business, { userId: user.id });

            //   can(ActionEnum.UPDATE, User);

            //   cannot(ActionEnum.READ, User);
            //   cannot(ActionEnum.READ, Business);
            //
        }

        return new Ability(rules);
    }
}
