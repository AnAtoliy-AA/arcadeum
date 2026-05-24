/**
 * Generates a VAPID keypair for Web Push. Run once per environment.
 *
 * Usage: pnpm --filter be exec tsx scripts/generate-vapid-keys.ts
 *
 * Copy the printed values into your .env (BE) and .env.local (web).
 */
import webpush from 'web-push';

const keys = webpush.generateVAPIDKeys();
console.log('VAPID_PUBLIC_KEY=' + keys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + keys.privateKey);
console.log('VAPID_SUBJECT=mailto:support@arcadeum.com');
console.log('');
console.log('# For apps/web/.env.local:');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY=' + keys.publicKey);
