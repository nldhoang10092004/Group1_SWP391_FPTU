/**
 * Utility functions for image processing
 */

/**
 * Compress and resize image file
 * @param {File} file - Image file to process
 * @param {number} maxWidth - Maximum width in pixels
 * @param {number} maxHeight - Maximum height in pixels  
 * @param {number} quality - JPEG quality (0-1)
 * @returns {Promise<Blob>} - Processed image blob
 */
export const compressImage = (
  file,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.8
) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      } else {
        reject(new Error('Failed to get canvas context'));
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convert blob to base64 string
 * @param {Blob} blob - Blob to convert
 * @returns {Promise<string>} - Base64 string
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {number} maxSizeInMB - Maximum file size in MB
 * @returns {object} object with isValid boolean and error message
 */
export const validateImageFile = (file, maxSizeInMB = 5) => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: 'Vui lòng chọn file ảnh (JPG, PNG, GIF, WebP)'
    };
  }

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File ảnh không ��ược vượt quá ${maxSizeInMB}MB`
    };
  }

  // Check image dimensions (optional - would require loading the image)
  return {
    isValid: true,
    error: null
  };
};

/**
 * Create image preview URL with automatic cleanup
 * @param {File} file - Image file
 * @returns {object} object with preview URL and cleanup function
 */
export const createImagePreview = (file) => {
  const url = URL.createObjectURL(file);
  
  return {
    url,
    cleanup: () => URL.revokeObjectURL(url)
  };
};
