import sharp from "sharp";

export const detectImageType = async (buf: Buffer) => {
  const img = sharp(buf);
  let metadata!: sharp.Metadata;
  try {
    metadata = await img.metadata();
  } catch (err) {
    console.error(err);
    throw new Error(`Invalid image`);
  }
  const format = metadata.format;

  if (format === "jpeg" || format === "jpg") return "image/jpeg";
  else if (format === "png") return "image/png";
  else throw new Error(`Unsupported image format ${format}`);
};

export const combineImage = async (
  buffer1: Buffer,
  buffer2: Buffer,
  FIXED_HEIGHT = 1024
): Promise<Buffer> => {
  const img1 = sharp(buffer1);
  const meta1: any = await img1.metadata();
  const img2 = sharp(buffer2);
  const meta2: any = await img2.metadata();

  const frontScale = (meta1.width * 1.0) / meta1.height;
  const backScale = (meta2.height * 1.0) / meta2.width;
  const width = Math.ceil(FIXED_HEIGHT * frontScale);
  const height = Math.ceil(FIXED_HEIGHT + width * backScale);

  const jpgQuality = 60;
  const kernel = sharp.kernel.lanczos3;

  const _scaledImg2 = await img2
    .resize(width, height - FIXED_HEIGHT, { kernel })
    .toBuffer();

  const exif = { IFD0: {} };

  // const output = await img1
  const output = await img1
    .resize(width, height, {
      kernel,
      fit: "contain",
      position: "left top",
      background: { r: 255, g: 255, b: 255 },
    })
    .composite([
      {
        input: _scaledImg2,
        gravity: "south",
      },
    ])
    .jpeg({ quality: jpgQuality })
    .withMetadata({ exif })
    .toBuffer()
    .catch((err: any) => {
      console.log("Error:", err);
      return null;
    });

  if (!output) {
    throw new Error("combine image error");
  }

  return output;
};
