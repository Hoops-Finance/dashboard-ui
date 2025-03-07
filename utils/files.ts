export function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error(reader.error?.message ?? "An unknown error occurred"));
    };
    reader.readAsDataURL(file);
  });
}
