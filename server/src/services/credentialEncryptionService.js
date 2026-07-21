import crypto from 'node:crypto';
import { env } from '../config/env.js';
const key=()=>crypto.createHash('sha256').update(env.JWT_REFRESH_SECRET).digest();
export function encryptSecret(value){if(!value)return null;const iv=crypto.randomBytes(12);const cipher=crypto.createCipheriv('aes-256-gcm',key(),iv);const encrypted=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);return `${iv.toString('base64')}.${cipher.getAuthTag().toString('base64')}.${encrypted.toString('base64')}`;}
export function decryptSecret(value){if(!value)return null;const[iv,tag,data]=value.split('.').map(x=>Buffer.from(x,'base64'));const decipher=crypto.createDecipheriv('aes-256-gcm',key(),iv);decipher.setAuthTag(tag);return Buffer.concat([decipher.update(data),decipher.final()]).toString('utf8');}
