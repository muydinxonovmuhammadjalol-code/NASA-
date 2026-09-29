// Safe image to base64 converter for both data URLs and static assets

export async function urlToBase64(url: string): Promise<{ base64: string; mimeType: string; dataUrl: string }> {
  if (url.startsWith('data:')) {
    const parts = url.split(',');
    const base64 = parts[1] || '';
    const mimeMatch = parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    return { base64, mimeType, dataUrl: url };
  }

  // Fetch static asset or remote image
  const response = await fetch(url);
  const blob = await response.blob();
  const mimeType = blob.type || 'image/jpeg';

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1] || '';
      resolve({ base64, mimeType, dataUrl });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
