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

            /* +Checks hash with HashModel to see if images are identical */
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

/**
 * Called by UploadController:
 * Clears old data, stores new images in ImageModel, hashes them with HashModel,
 * and returns scan statistics + duplicate groups for the UI.
 */
function processUploadedImages(imageObjects) {
    /* Wipe any images left over in memory from a previous scan */
    clearImages();

    /* Array to hold just { id, hash } pairs for fast comparison */
    const hashes = [];

    /* Loop through every valid image object passed in from UploadController */
    for (const img of imageObjects) {
        /* Generate hash using HashModel */
        const hash = generateHash(img);

        /* Attach the generated hash to the image object and save it in ImageModel */
        img.hash = hash;
        storeImage(img);

        /* Record the ID and hash pair to feed into the duplicate detector */
        hashes.push({ id: img.id, hash: hash });
    }

    /* Run the comparison loops to group all matching hashes together */
    const duplicateGroups = detectDuplicates(hashes);

    /* Return the scan summary back to UploadController */
    return {
        totalScanned: imageObjects.length,
        duplicateGroups: duplicateGroups,
        allImages: retrieveImage()
    };
}