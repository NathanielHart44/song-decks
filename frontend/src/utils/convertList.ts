import brotliPromise from 'brotli-wasm';
import { List } from 'src/@types/types';

let brotli: any = null;
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// Asynchronous function to initialize Brotli
export async function initializeBrotli() {
    brotli = await brotliPromise;
}

// Convert Base64 to URL-safe format
const base64ToUrlSafe = (base64: string) => {
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// Convert URL-safe format back to Base64
const urlSafeToBase64 = (urlSafe: string) => {
    let base64 = urlSafe.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    return base64;
};

export const encodeList = (list: List) => {
    if (!brotli) {
        throw new Error('Brotli is not initialized');
    }

    const jsonString = JSON.stringify(list);
    const uncompressedData = textEncoder.encode(jsonString);
    const compressed = brotli.compress(uncompressedData);

    const binaryString = Array.from(compressed).reduce((acc, byte) => acc + String.fromCharCode(byte as number), '');
    const base64String = btoa(binaryString as string);

    if (base64String.length > 2000) {
        throw new Error('Encoded string exceeds 2000 characters');
    };

    return base64ToUrlSafe(base64String);
};

export const decodeList = (base64UrlSafeString: string) => {
    if (!brotli) {
        throw new Error('Brotli is not initialized');
    }

    const base64String = urlSafeToBase64(base64UrlSafeString);
    const decodedString = atob(base64String);
    const compressedArray = new Uint8Array(Array.from(decodedString).map((char) => char.charCodeAt(0)));
    const decompressedBuffer = brotli.decompress(compressedArray);
    const jsonString = textDecoder.decode(decompressedBuffer);

    return JSON.parse(jsonString);
};