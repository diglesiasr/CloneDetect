const imageStorage = new Map();

/*
 * ImageModel stores uploaded images
 * 
 * Precondition: Image exists
 * Postcondition: Image is stores successfully
 */

function storeImage(image) {
    if (!image || !image.id) {
        return false;
    }

const record = {
        id: image.id,
        name: image.name,
        type: image.type || '',
        size: image.size || 0,
        lastModified: image.lastModified || null,
        dataUrl: image.dataUrl || '',
        byteArray: image.byteArray || null,
        file: image.file || null,
        hash: image.hash || null,
        isDuplicate: Boolean(image.isDuplicate),
        selectedForRemoval: Boolean(image.selectedForRemoval)
    };
    
    imageStorage.set(image.id, record);
    return true;
}


/*
 * Retrieves an image from storage
 *
 *
 * Preconditions: Image exists in storage
 * Postconditions: Image data is returned
 */

function retrieveImage(imageID) {
    if (!imageID) {
        return Array.from(imageStorage.values());
    }
    return imageStorage.get(imageID) || null;
}

/*
 * Updates selection state when a user selects/deselects an image for removal.
 */
function updateImageSelection(imageID, selectedForRemoval) {
    const img = imageStorage.get(imageID);
    if (img) {
        img.selectedForRemoval = Boolean(selectedForRemoval);
        return true;
    }
    return false;
}

/*
 * Clears stored images prior to a new scan.
 */
function clearImages() {
    imageStorage.clear();
}