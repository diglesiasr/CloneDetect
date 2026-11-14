/* Only supports these file types */
const SUPPORTED_EXTENSIONS = new Set([
    'jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'heic', 'tiff', 'tif', 'bmp',
    'raw', 'cr2', 'nef', 'arw', 'dng'
]);

/* Max images allowed to be uploaded at once */
const MAX_IMAGE_LIMIT = 100;

/* Checks whether a file matches the supported image formats. */
function isSupportedImageFile(file) {
    if (!file || !file.name) return false;
    const parts = file.name.split('.');
    if (parts.length < 2) return false;
    const ext = parts[parts.length - 1].toLowerCase();
    return SUPPORTED_EXTENSIONS.has(ext);
}

/**
 * Reads a File into an internal object containing both a DataURL (for preview)
 * and a Uint8Array (for accurate byte hashing).
 * Returns a promise so FileReaders works async with event callbacks.
 */
function readFileData(file, index) {
    return new Promise((resolve, reject) => {
        /* File reader to read the binary */
        const bufferReader = new FileReader();

        /* Convert the raw ArrayBuffer into a byte array so HashModel can loop through each byte */
        bufferReader.onload = (e) => {
            const byteArray = new Uint8Array(e.target.result);

            /* File reader to get Base64 DataURL for image previews  */
            const urlReader = new FileReader();
            
            /* Resolves the promise from earlier with the image object */
            urlReader.onload = (urlEvent) => {
                resolve({
                    id: `img_${Date.now()}_${index}`,
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    lastModified: file.lastModified,
                    byteArray: byteArray,
                    dataUrl: urlEvent.target.result,
                    file: file
                });
            };
            /* Error handling when making a preview */
            urlReader.onerror = () => reject(new Error(`Failed to read preview for ${file.name}`));
            urlReader.readAsDataURL(file);
        };
        /* Error handling for read errors while binary reading */
        bufferReader.onerror = () => reject(new Error(`Failed to read binary data for ${file.name}`));
        bufferReader.readAsArrayBuffer(file);
    });
}

/**
 * Uploads selected images.
 *
 *
 * Preconditions: Files array is not empty
 * Postconditions: Files are forwarded for processing
 */

/* async to make sure the browser tab doesn't lag */
async function uploadImages(files) {
    const fileArray = Array.from(files || []);
    const unsupportedFiles = [];
    const validFiles = [];

    for (const file of fileArray) {
        /* Ignore hidden system files that start with . in folder uploads */
        if (file.name.startsWith('.')) continue;

        if (isSupportedImageFile(file)) {
            validFiles.push(file);
        } else {
            /* Track unsupported file to let the UI warn the user */
            unsupportedFiles.push(file.name);
        }
    }

    /* Max of 100 images enforced */
    if (validFiles.length > MAX_IMAGE_LIMIT) {
        return {
            success: false,
            error: `Maximum limit exceeded: Please select at most ${MAX_IMAGE_LIMIT} images (you selected ${validFiles.length}).`,
            unsupportedFiles
        };
    }

    /* Minimum of 2 images enforced */
    if (validFiles.length < 2) {
        return {
            success: false,
            error: 'Please upload at least two or more images.',
            unsupportedFiles
        };
    }

    /* Read all valid files */
    const loadedImages = await Promise.all(
        validFiles.map((file, idx) => readFileData(file, idx))
    );

     /* Send image objects to DuplicateController.js */
    const scanResults = processUploadedImages(loadedImages);

    /* Returns the final batch of images to the UI */
    return {
        success: true,
        unsupportedFiles,
        scanResults
    };
}