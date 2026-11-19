/**
 * Creates downloadable image collection.
 *
 * Preconditions: Duplicate scan is already complete
 * Postconditions: Duplicate-free package generated
 */

async function generateDownloadPackage(imageID) {

    /* Retrieve all stored images from ImageModel */
    const allImages = retrieveImage();
    let filteredImages = [];

    /* If a specific array of IDs or single ID is passed, filter to those.
       Otherwise include every image NOT checked for removal */
    if (Array.isArray(imageID)) {
        filteredImages = imageID.map((id) => retrieveImage(id)).filter(Boolean);
    } else if (typeof imageID === 'string') {
        const single = retrieveImage(imageID);
        if (single) filteredImages = [single];
    } else {
        filteredImages = allImages.filter((img) => !img.selectedForRemoval);
    }

    /* Bundle any kept images into a ZIP archive if JSZip loaded in index.html */
    if (typeof JSZip !== 'undefined') {
        const zip = new JSZip();

        /* Tracks filenames already added to the ZIP to stop potential overwrites */
        const usedNames = new Map();
        filteredImages.forEach((img) => {
            let fileName = img.name;

            /* If two unique images have the exact same filename, append _2, _3, etc */
            if (usedNames.has(fileName)) {
                const count = usedNames.get(fileName) + 1;
                usedNames.set(fileName, count);
                const dotIndex = fileName.lastIndexOf('.');
                if (dotIndex !== -1) {
                    fileName = `${fileName.slice(0, dotIndex)}_${count}${fileName.slice(dotIndex)}`;
                } else {
                    fileName = `${fileName}_${count}`;
                }
            } else {
                usedNames.set(fileName, 1);
            }

            /* Add the raw binary byteArray of the image into the ZIP archive */
            zip.file(fileName, img.byteArray);
              });

        /* Generate the final ZIP 'blob' asynchronously and create a browser download URL.
        This means it'll download from the local browser instead of needing some other outside source. */
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const downloadUrl = URL.createObjectURL(zipBlob);
        const downloadPackage = {
            filename: 'CloneDetect_Download.zip',
            url: downloadUrl,
            count: filteredImages.length,
            images: filteredImages
        };
        return downloadPackage;
    }

    /* Fallback return object if JSZip failed to load somehow */
    const downloadPackage = {
        filename: 'CloneDetect_Download',
        url: null,
        count: filteredImages.length,
        images: filteredImages
    };
    return downloadPackage;
}