export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (type: string): string => {
  if (type.includes('pdf')) return '📄';
  if (type.includes('word')) return '📝';
  if (type.includes('presentation')) return '📊';
  if (type.includes('image')) return '🖼️';
  return '📁';
};

export const isValidFileType = (type: string): boolean => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png'
  ];
  return allowedTypes.includes(type);
};

export const getConversionOptions = (fileType: string): string[] => {
  if (fileType.includes('pdf')) {
    return ['jpg'];
  }
  if (fileType.includes('word') || fileType.includes('presentation')) {
    return ['pdf'];
  }
  if (fileType.includes('image')) {
    return ['pdf', 'webp'];
  }
  return [];
};

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || '';
};