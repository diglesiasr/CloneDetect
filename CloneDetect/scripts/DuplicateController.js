/**
 * Detects duplicate images and returns the list.
 *
 *
 * Preconditions: Images have been uploaded
 * Postconditions: Duplicate list generated
 */

function detectDuplicates(Hashes) {
    /* Array for any matching image copies */
    const duplicateGroups = [];
    /* Prevents rechecking the same images */
    const visited = new Set();

    /* Hashes is an array of { id, hash } objects */
    for (let i = 0; i < Hashes.length; i++) {
        if (visited.has(Hashes[i].id)) continue;

        const currentGroup = [retrieveImage(Hashes[i].id)];
        visited.add(Hashes[i].id);

        for (let j = i + 1; j < Hashes.length; j++) {
            /* Skip if already done before*/
            if (visited.has(Hashes[j].id)) continue;

            /* Checks hash with HashModel to see if images are identical */
            if (compareHashes(Hashes[i].hash, Hashes[j].hash)) {
                const dupImg = retrieveImage(Hashes[j].id);
                /* Marks duplicates */
                if (dupImg) {
                    dupImg.isDuplicate = true;
                    /* Pre-select extra copies for removal so the user can keep the og */
                    dupImg.selectedForRemoval = true;
                    currentGroup.push(dupImg);
                    /* Marks as visited so it doesn't get rescanned */
                    visited.add(Hashes[j].id);
                }
            }
        }

        /* Only saves if duplicates were actually found (at least 1)*/
        if (currentGroup.length > 1) {
            duplicateGroups.push(currentGroup);
        }
    }

    return duplicateGroups;
}