import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  IMAGE_ACCEPT,
  MAX_IMAGE_BYTES,
  readImage,
  readTextAttachment,
  releaseImage,
} from './attachments';

// Signature-only synthetic fixtures: browser decoding is deliberately mocked, not verified here.
const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const jpeg = [0xff, 0xd8, 0xff, 0xe1]; // Camera JPEGs may start with an EXIF APP1 marker.
const webp = [0x52, 0x49, 0x46, 0x46, 0x10, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];
const imageFile = (bytes = png, type = 'image/png', name = 'screenshot.png') =>
  new File([new Uint8Array(bytes)], name, { type });
const textFile = (text = 'Synthetic rejection text.', name = 'remarks.txt', type = 'text/plain') =>
  new File([text], name, { type });

let decode: ReturnType<typeof vi.fn<() => Promise<void>>>;
let createObjectURL: ReturnType<typeof vi.fn<typeof URL.createObjectURL>>;
let revokeObjectURL: ReturnType<typeof vi.fn<typeof URL.revokeObjectURL>>;
let fetchMock: ReturnType<typeof vi.fn>;
let xhrMock: ReturnType<typeof vi.fn>;
let storeMock: ReturnType<typeof vi.spyOn>;
let dimensions: [number, number];
let useDecode: boolean;
let loadFails: boolean;
let images: FakeImage[];

class FakeImage {
  naturalWidth = dimensions[0];
  naturalHeight = dimensions[1];
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  decode = useDecode ? decode : undefined;
  removeAttribute = vi.fn();
  private source = '';

  constructor() {
    images.push(this);
  }

  get src() {
    return this.source;
  }

  set src(value: string) {
    this.source = value;
    if (!this.decode) {
      queueMicrotask(() => {
        if (loadFails) this.onerror?.();
        else this.onload?.();
      });
    }
  }
}

beforeEach(() => {
  dimensions = [1200, 800];
  useDecode = true;
  loadFails = false;
  images = [];
  decode = vi.fn().mockResolvedValue(undefined);
  createObjectURL = vi
    .fn<typeof URL.createObjectURL>()
    .mockReturnValue('blob:synthetic-local-preview');
  revokeObjectURL = vi.fn<typeof URL.revokeObjectURL>();
  const NativeURL = URL;
  vi.stubGlobal(
    'URL',
    class extends NativeURL {
      static createObjectURL = createObjectURL;
      static revokeObjectURL = revokeObjectURL;
    },
  );
  vi.stubGlobal('Image', FakeImage);
  fetchMock = vi.fn();
  xhrMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  vi.stubGlobal('XMLHttpRequest', xhrMock);
  storeMock = vi.spyOn(Storage.prototype, 'setItem');
});

afterEach(() => {
  expect(fetchMock).not.toHaveBeenCalled();
  expect(xhrMock).not.toHaveBeenCalled();
  expect(storeMock).not.toHaveBeenCalled();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('local image attachments', () => {
  it('exports the agreed picker types and byte budget', () => {
    expect(IMAGE_ACCEPT).toBe('image/png,image/jpeg,image/webp');
    expect(MAX_IMAGE_BYTES).toBe(10 * 1024 * 1024);
  });

  it.each([
    ['image/png', png, 'screenshot.png'],
    ['image/jpeg', jpeg, 'camera.jpg'],
    ['image/webp', webp, 'clipboard.webp'],
  ] as const)('accepts matching %s bytes after decode', async (type, bytes, name) => {
    const file = imageFile([...bytes], type, name);
    const attachment = await readImage(file);
    expect(attachment).toEqual({
      kind: 'image',
      file,
      name,
      url: 'blob:synthetic-local-preview',
      width: 1200,
      height: 800,
    });
    expect(createObjectURL).toHaveBeenCalledExactlyOnceWith(file);
    expect(decode).toHaveBeenCalledOnce();
    expect(images[0].src).toBe(attachment.url);
    expect(images[0].onload).toBeNull();
    expect(images[0].onerror).toBeNull();
    expect(revokeObjectURL).not.toHaveBeenCalled();
    releaseImage(attachment);
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith(attachment.url);
  });

  it('accepts an unnamed clipboard image and supplies a display name', async () => {
    const attachment = await readImage(imageFile(png, 'image/png', ''));
    expect(attachment.name).toBe('Attached image');
    releaseImage(attachment);
  });

  it.each(['image/svg+xml', 'image/gif', 'text/html', 'application/pdf', '', 'image/jpg'])(
    'rejects unsupported MIME %s before reading or decoding',
    async (type) => {
      const file = imageFile(png, type);
      const slice = vi.spyOn(file, 'slice');
      await expect(readImage(file)).rejects.toThrow('Choose a PNG, JPEG or WebP image');
      expect(slice).not.toHaveBeenCalled();
      expect(createObjectURL).not.toHaveBeenCalled();
      expect(images).toHaveLength(0);
    },
  );

  it.each([
    ['image/png', jpeg],
    ['image/jpeg', png],
    ['image/webp', png],
    ['image/png', [0x89, 0x50, 0x4e, 0x47]],
    ['image/jpeg', [0xff, 0xd8]],
    ['image/webp', [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x41, 0x56, 0x49, 0x20]],
    ['image/png', Array.from(new TextEncoder().encode('<html>not an image</html>'))],
    ['image/jpeg', Array.from(new TextEncoder().encode('<svg xmlns="fake"/>'))],
    ['image/webp', Array.from(new TextEncoder().encode('GIF89a'))],
  ] as const)('rejects forged or truncated %s signatures %#', async (type, bytes) => {
    await expect(readImage(imageFile([...bytes], type))).rejects.toThrow('contents do not match');
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(decode).not.toHaveBeenCalled();
  });

  it('rejects empty images before making a preview', async () => {
    await expect(readImage(imageFile([]))).rejects.toThrow('image is empty');
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(decode).not.toHaveBeenCalled();
  });

  it('rejects more than 10 MiB without reading bytes', async () => {
    const file = new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], 'large.png', {
      type: 'image/png',
    });
    const slice = vi.spyOn(file, 'slice');
    await expect(readImage(file)).rejects.toThrow('10 MiB or less');
    expect(slice).not.toHaveBeenCalled();
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('allows exactly 10 MiB and reads only the signature before decoding', async () => {
    const bytes = new Uint8Array(MAX_IMAGE_BYTES);
    bytes.set(png);
    const file = new File([bytes], 'limit.png', { type: 'image/png' });
    const slice = vi.spyOn(file, 'slice');
    const attachment = await readImage(file);
    expect(slice).toHaveBeenCalledExactlyOnceWith(0, 12);
    releaseImage(attachment);
  });

  it.each([
    [0, 100],
    [100, 0],
    [-1, 100],
    [1.5, 100],
    [NaN, 100],
    [Infinity, 100],
  ])('rejects invalid decoded dimensions %s by %s and revokes', async (width, height) => {
    dimensions = [width, height];
    await expect(readImage(imageFile())).rejects.toThrow('invalid dimensions');
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:synthetic-local-preview');
  });

  it('accepts exactly 40 MP but rejects larger decoded images', async () => {
    dimensions = [8000, 5000];
    releaseImage(await readImage(imageFile()));
    revokeObjectURL.mockClear();
    dimensions = [8001, 5000];
    await expect(readImage(imageFile())).rejects.toThrow('exceeds 40 megapixels');
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:synthetic-local-preview');
  });

  it('rejects a corrupt image even with a valid signature and dimensions', async () => {
    decode.mockRejectedValue(new Error('Private browser diagnostic'));
    await expect(readImage(imageFile())).rejects.toThrow(
      'This image could not be opened. Try another',
    );
    expect(revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:synthetic-local-preview');
    expect(images[0].removeAttribute).toHaveBeenCalledWith('src');
    expect(images[0].onerror).toBeNull();
  });

  it('revokes on a synchronous decoder failure', async () => {
    decode.mockImplementation(() => {
      throw new Error('Private failure');
    });
    await expect(readImage(imageFile())).rejects.toThrow('This image could not be opened');
    expect(revokeObjectURL).toHaveBeenCalledOnce();
  });

  it('uses a successful load event when Image.decode is unavailable', async () => {
    useDecode = false;
    const attachment = await readImage(imageFile());
    expect(decode).not.toHaveBeenCalled();
    expect(attachment.width).toBe(1200);
    releaseImage(attachment);
  });

  it('rejects load errors when Image.decode is unavailable', async () => {
    useDecode = false;
    loadFails = true;
    await expect(readImage(imageFile())).rejects.toThrow('could not be opened');
    expect(revokeObjectURL).toHaveBeenCalledOnce();
  });

  it('releases a stale result when the caller cancels its selection', async () => {
    let complete!: () => void;
    decode.mockReturnValue(
      new Promise<void>((resolve) => {
        complete = resolve;
      }),
    );
    const pending = readImage(imageFile());
    await vi.waitFor(() => expect(decode).toHaveBeenCalledOnce());
    expect(revokeObjectURL).not.toHaveBeenCalled();
    complete();
    const stale = await pending;
    releaseImage(stale);
    releaseImage(stale); // Browser URL revocation is safe to repeat.
    expect(revokeObjectURL.mock.calls).toEqual([[stale.url], [stale.url]]);
  });

  it('times out stalled decoding, revokes once, and ignores late completion', async () => {
    vi.useFakeTimers();
    const file = imageFile();
    const header = file.slice(0, 12);
    Object.defineProperty(header, 'arrayBuffer', { value: async () => new Uint8Array(png).buffer });
    vi.spyOn(file, 'slice').mockReturnValue(header);
    let complete!: () => void;
    decode.mockReturnValue(
      new Promise<void>((resolve) => {
        complete = resolve;
      }),
    );
    const pending = expect(readImage(file)).rejects.toThrow('could not be opened');
    await vi.advanceTimersByTimeAsync(15_000);
    await pending;
    complete();
    await Promise.resolve();
    expect(revokeObjectURL).toHaveBeenCalledOnce();
    expect(images[0].onerror).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('sanitizes object URL creation errors', async () => {
    createObjectURL.mockImplementation(() => {
      throw new Error('Private failure');
    });
    await expect(readImage(imageFile())).rejects.toThrow('previews are unavailable');
    expect(revokeObjectURL).not.toHaveBeenCalled();
    expect(decode).not.toHaveBeenCalled();
  });

  it('sanitizes file read failures without creating a URL', async () => {
    const file = imageFile();
    vi.spyOn(file, 'slice').mockImplementation(() => {
      throw new Error('Private failure');
    });
    await expect(readImage(file)).rejects.toThrow('This image could not be read');
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});

describe('local plain-text attachments', () => {
  it('preserves multilingual content, whitespace and literal URLs without fetching', async () => {
    const text = '  Synthetic हिन्दी ಕನ್ನಡ 😀\r\n\thttps://example.invalid/\n';
    await expect(readTextAttachment(textFile(text))).resolves.toBe(text);
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(images).toHaveLength(0);
  });

  it('accepts uppercase .TXT and missing MIME when the content is UTF-8', async () => {
    await expect(readTextAttachment(textFile('Synthetic text', 'NOTES.TXT', ''))).resolves.toBe(
      'Synthetic text',
    );
  });

  it.each([
    ['remarks.html', 'text/plain'],
    ['remarks.txt.html', 'text/plain'],
    ['remarks.txt', 'text/html'],
    ['remarks.txt', 'image/png'],
    ['remarks.txt', 'application/octet-stream'],
    ['remarks.pdf', 'application/pdf'],
    ['remarks.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ['remarks', 'text/plain'],
  ])('rejects misleading or non-text files %s (%s)', async (name, type) => {
    await expect(readTextAttachment(textFile('Synthetic text', name, type))).rejects.toThrow(
      'Choose a plain-text .txt',
    );
  });

  it.each(['', ' \r\n\t', '\uFEFF', '\u0085'])('rejects empty or blank text %#', async (text) => {
    await expect(readTextAttachment(textFile(text))).rejects.toThrow(/empty|no readable text/);
  });

  it('enforces 64 KiB before reading the file', async () => {
    const file = textFile('a'.repeat(64 * 1024 + 1));
    const read = vi.fn();
    Object.defineProperty(file, 'arrayBuffer', { value: read });
    await expect(readTextAttachment(file)).rejects.toThrow('64 KiB or less');
    expect(read).not.toHaveBeenCalled();
    // At the byte boundary reading is allowed, but the independent code-point limit still applies.
    await expect(readTextAttachment(textFile('a'.repeat(64 * 1024)))).rejects.toThrow(
      '8,000 Unicode characters',
    );
  });

  it('counts 8,000 Unicode points, not UTF-16 units, without trimming', async () => {
    const text = '😀'.repeat(8000);
    await expect(readTextAttachment(textFile(text))).resolves.toBe(text);
    await expect(readTextAttachment(textFile(`${text} `))).rejects.toThrow(
      '8,000 Unicode characters',
    );
  });

  it.each([
    [0xc3, 0x28], // Invalid continuation.
    [0xe2, 0x82], // Truncated sequence.
    [0xc0, 0xaf], // Overlong sequence.
    [0xed, 0xa0, 0x80], // UTF-8-encoded surrogate.
    [0xff, 0xfe, 0x41, 0], // UTF-16 is not UTF-8.
  ])('rejects malformed UTF-8 %# without replacement characters', async (...bytes) => {
    const file = new File([new Uint8Array(bytes)], 'bad.txt', { type: 'text/plain' });
    await expect(readTextAttachment(file)).rejects.toThrow('not valid UTF-8');
  });

  it.each(['\0', '\u0001', '\u001b', '\u001f', '\u007f', '\u0080', '\u009f'])(
    'rejects binary and non-whitespace control text %#',
    async (control) => {
      await expect(readTextAttachment(textFile(`text${control}text`))).rejects.toThrow(
        'binary or control characters',
      );
    },
  );

  it('allows whitespace controls and a UTF-8 BOM', async () => {
    await expect(readTextAttachment(textFile('\uFEFFtext\t\n\r\v\f\u0085'))).resolves.toBe(
      'text\t\n\r\v\f\u0085',
    );
  });

  it('uses native arrayBuffer where available and still decodes strictly', async () => {
    const file = textFile();
    const read = vi
      .fn()
      .mockResolvedValue(new TextEncoder().encode('Synthetic native read').buffer);
    Object.defineProperty(file, 'arrayBuffer', { value: read });
    await expect(readTextAttachment(file)).resolves.toBe('Synthetic native read');
    expect(read).toHaveBeenCalledOnce();
  });

  it('sanitizes native read failures', async () => {
    const file = textFile();
    Object.defineProperty(file, 'arrayBuffer', {
      value: vi.fn().mockRejectedValue(new Error('Private failure')),
    });
    await expect(readTextAttachment(file)).rejects.toThrow('This text file could not be read');
  });

  it.each(['onerror', 'onabort'] as const)('sanitizes FileReader %s', async (event) => {
    vi.stubGlobal(
      'FileReader',
      class {
        onerror: (() => void) | null = null;
        onabort: (() => void) | null = null;
        readAsArrayBuffer() {
          this[event]?.();
        }
      },
    );
    const file = textFile();
    Object.defineProperty(file, 'arrayBuffer', { value: undefined });
    await expect(readTextAttachment(file)).rejects.toThrow('This text file could not be read');
  });
});
