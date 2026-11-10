const hashRegistry = new Map();

/**
 * Generates a hash for an image.
 *
 *
 * Preconditions: Image exists
 * Postconditions: Hash value generated
 */
function generateHash(image) {
    if (!image) {
        return null;
    }

    /* Uses byte data hashing to try and detect identical images
       even with different file names. */
    const bytes = image.byteArray;
    let hash1 = 0x811c9dc5;
    let hash2 = 0x01000193;

    if (bytes && bytes.length) {
        for (let i = 0; i < bytes.length; i++) {
            hash1 ^= bytes[i];
            hash1 = Math.imul(hash1, 0x01000193) >>> 0;
            hash2 ^= bytes[bytes.length - 1 - i];
            hash2 = Math.imul(hash2, 0x811c9dc5) >>> 0;
        }
        
        const hash = `${bytes.length.toString(16)}-${hash1.toString(16).padStart(8, '0')}-${hash2.toString(16).padStart(8, '0')}`;
        if (image.id) {
            hashRegistry.set(image.id, hash);
        }
        return hash;
    }
    
    return null;
}

/**
 * Compares two hashes and returns the result.
 *
 *
 * Preconditions: Both hashes exist
 * Postconditions: Comparison result returned
 */
function compareHashes(hash1, hash2) {
    if (!hash1 || !hash2) {
        return false;
    }
    const result = hash1 === hash2;
    return result;
}