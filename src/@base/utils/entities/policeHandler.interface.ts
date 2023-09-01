import { AppAbility } from '@casl';

export interface IPolicyHandler {
    handle(ability: AppAbility): boolean;
}

type PolicyHandlerCallback = (ability: AppAbility, can?, user?) => boolean;

export declare type PolicyHandler = IPolicyHandler | PolicyHandlerCallback;
