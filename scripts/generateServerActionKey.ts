import crypto from "crypto";

// --- Configuration ---
// AES-256-GCM requires a 32-byte (256-bit) key.
const KEY_LENGTH = 32; 

// --- Key Generation ---

/**
 * 1. Master Key (K): Used to encrypt the Payload. 
 * Keep this Key K SECURE and persistent across builds.
 */
const masterKey = crypto.randomBytes(KEY_LENGTH); 
console.log(`\n** Master Key (K) - KEEP THIS SECURE! **`);
console.log(`Hex: ${masterKey.toString('hex')}`);

// The actual payload P to be encrypted (this is what Next.js uses internally)
const secretPayload = crypto.randomBytes(KEY_LENGTH);

// --- Encryption Process (AES-256-GCM) ---

// 1. Generate a random Initialization Vector (IV)
const iv = crypto.randomBytes(16); // GCM typically uses a 12-byte IV, but 16 is fine too.

// 2. Create the AES-GCM cipher
const cipher = crypto.createCipheriv('aes-256-gcm', masterKey, iv);

// 3. Encrypt the payload
let ciphertext = cipher.update(secretPayload);
ciphertext = Buffer.concat([ciphertext, cipher.final()]);

// 4. Get the Authentication Tag
const tag = cipher.getAuthTag();

// --- Final Encrypted Value Formatting ---

// The required format is a base64 string combining IV, Ciphertext, and Tag.
// Concatenate: IV | Ciphertext | Tag
const encryptedKeyBuffer = Buffer.concat([iv, ciphertext, tag]);
const finalEncryptedKey = encryptedKeyBuffer.toString('base64');

console.log(`\n** The Value for NEXT_SERVER_ACTIONS_ENCRYPTION_KEY **`);
console.log(finalEncryptedKey);
console.log(`\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -`);
console.log(`NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="${finalEncryptedKey}"`);
console.log(`\n- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -`);

console.log(`\n📢 IMPORTANT:`);
console.log(`1. You MUST use the SAME Master Key (K) for ALL future key generations if you repeat this process.`);
console.log(`2. The variable must be set as an environment variable (e.g., in your .env file or deployment pipeline).`);