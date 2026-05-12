import { Actor } from 'apify';

export function isActorStandby(): boolean {
    return Actor.getEnv().metaOrigin === 'STANDBY';
}
