export type ImageAttachment = {
  kind: 'image';
  file: File;
  name: string;
  url: string;
  width: number;
  height: number;
};

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp';

const MAX_IMAGE_PIXELS = 40_000_000;
const MAX_TEXT_BYTES = 64 * 1024;
const MAX_TEXT_POINTS = 8000;
const IMAGE_DECODE_TIMEOUT_MS = 15_000;
const IMAGE_DECODE_ERROR =
  'This image could not be opened. Try another PNG, JPEG or WebP image, or paste the text.';

async function readBytes(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  // Older browsers (and jsdom) may only expose FileReader.
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) resolve(reader.result);
      else reject(new Error('File read failed.'));
    };
    reader.onerror = reader.onabort = () => reject(new Error('File read failed.'));
    reader.readAsArrayBuffer(blob);
  });
}

function matchesImageSignature(bytes: Uint8Array, mime: string): boolean {
  const matches = (signature: number[], offset = 0) =>
    signature.every((byte, index) => bytes[offset + index] === byte);
  switch (mime) {
    case 'image/png':
      return matches([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case 'image/jpeg':
      return matches([0xff, 0xd8, 0xff]);
    case 'image/webp':
      return matches([0x52, 0x49, 0x46, 0x46]) && matches([0x57, 0x45, 0x42, 0x50], 8);
    default:
      return false;
  }
}

function decodeLocalImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    let settled = false;
    const finish = (failed: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      image.onload = image.onerror = null;
      if (failed) {
        image.removeAttribute('src');
        reject(new Error(IMAGE_DECODE_ERROR));
      } else resolve(image);
    };
    const timer = setTimeout(() => finish(true), IMAGE_DECODE_TIMEOUT_MS);
    image.onerror = () => finish(true);
    try {
      if (typeof image.decode === 'function') {
        image.src = url;
        void image.decode().then(
          () => finish(false),
          () => finish(true),
        );
      } else {
        // Never accept dimensions alone: older browsers must emit a successful load.
        image.onload = () => finish(false);
        image.src = url;
      }
    } catch {
      finish(true);
    }
  });
}

/** Local preview only; does not extract text, store or transmit the file. */
export async function readImage(file: File): Promise<ImageAttachment> {
  if (!IMAGE_ACCEPT.split(',').includes(file.type)) {
    throw new Error(
      'Choose a PNG, JPEG or WebP image. SVG, GIF and other file types are not supported.',
    );
  }
  if (file.size === 0) throw new Error('This image is empty. Choose another image.');
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('This image is too large. Choose an image of 10 MiB or less.');
  }
  let header: Uint8Array;
  try {
    header = new Uint8Array(await readBytes(file.slice(0, 12)));
  } catch {
    throw new Error('This image could not be read. Choose it again or paste the text.');
  }
  if (!matchesImageSignature(header, file.type)) {
    throw new Error(
      'The image contents do not match its file type. Choose a valid PNG, JPEG or WebP image.',
    );
  }

  let url: string;
  try {
    url = URL.createObjectURL(file);
  } catch {
    throw new Error('Image previews are unavailable in this browser. Paste the text instead.');
  }
  try {
    let image: HTMLImageElement;
    try {
      image = await decodeLocalImage(url);
    } catch {
      throw new Error(IMAGE_DECODE_ERROR);
    }
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (
      !Number.isSafeInteger(width) ||
      !Number.isSafeInteger(height) ||
      width <= 0 ||
      height <= 0
    ) {
      throw new Error('This image has invalid dimensions. Choose another image.');
    }
    if (width * height > MAX_IMAGE_PIXELS) {
      throw new Error('This image exceeds 40 megapixels. Resize it or choose a smaller image.');
    }
    return { kind: 'image', file, name: file.name || 'Attached image', url, width, height };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

/** Call on removal, replacement, unmount, or a stale selection completing after cancellation. */
export function releaseImage(image: ImageAttachment): void {
  URL.revokeObjectURL(image.url);
}

/** Returns plain text for local editing; the caller still controls any later submission. */
export async function readTextAttachment(file: File): Promise<string> {
  if (!/\.txt$/i.test(file.name) || (file.type !== '' && file.type !== 'text/plain')) {
    throw new Error('Choose a plain-text .txt file, not a document, HTML or another file type.');
  }
  if (file.size === 0)
    throw new Error('This text file is empty. Choose another file or paste the text.');
  if (file.size > MAX_TEXT_BYTES) {
    throw new Error('This text file is too large. Choose a .txt file of 64 KiB or less.');
  }
  let bytes: ArrayBuffer;
  try {
    bytes = await readBytes(file);
  } catch {
    throw new Error('This text file could not be read. Choose it again or paste the text.');
  }
  let text: string;
  try {
    // File.text() replaces malformed bytes; fatal decoding must reject them instead.
    text = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error(
      'This file is not valid UTF-8 text. Save it as a UTF-8 .txt file and try again.',
    );
  }
  const points = Array.from(text);
  if (points.some((point) => /\p{Cc}/u.test(point) && !/\p{White_Space}/u.test(point))) {
    throw new Error(
      'This file contains binary or control characters. Choose a plain UTF-8 .txt file.',
    );
  }
  if (points.length > MAX_TEXT_POINTS) {
    throw new Error(
      'Keep the text file within 8,000 Unicode characters, including surrounding spaces.',
    );
  }
  if (!text.trim() || /^\p{White_Space}+$/u.test(text)) {
    throw new Error('This text file has no readable text. Add some text and try again.');
  }
  return text;
}
