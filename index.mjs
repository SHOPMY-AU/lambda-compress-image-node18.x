
import Sharp from 'sharp';
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
const client = new S3Client({})


export const handler = async (event) => {
  const { key } = event.Records[0].s3.object;
  const fileExtension = "";

  async function getFileAsBuffer() {
    try {
        // Create a helper function to convert a ReadableStream to a buffer.
        const streamToBuffer = (stream) =>
        new Promise((resolve, reject) => {
            const chunks = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks)));
        });

        // Get the object from the Amazon S3 bucket. It is returned as a ReadableStream.
        const command = new GetObjectCommand({
            Bucket: process.env.UNCOMPRESSED_BUCKET,
            Key: key
        });
  
        var originalImage = await client.send(command);
        return await streamToBuffer(originalImage.Body);
    } catch (err) {
        console.log("Error", err);
    }
  }

  // upload back to bucket
  async function upload(file) {
    try {
      const command = new PutObjectCommand({
        Bucket: process.env.COMPRESSED_BUCKET,
        Key: key,
        Body: file,
      });

      const response = await client.send(command);
      console.log("UPLOAD SUCCESS");

    } catch (err) {
      console.error(err);
    }

    return true;
  }

  // get extension
  function getExtension() {
     //Get the file Extension     
     return (key.split('.').pop());
  }


  // processing image
    const fileBuffer = await getFileAsBuffer();

    const compressedImagePromise = Sharp(fileBuffer)
      .toFormat('jpeg')
      .jpeg({
          force: true,
      })
      .resize({
        width: 1000,
        withoutEnlargement: true,
      })
      .toBuffer();
  

  try {
    // try to compress file
    const [compressedImage] = await Promise.all([
      compressedImagePromise
    ]);

    // excludes upload compress file (gif)
    if(getExtension().includes("gif")){
      throw new Error('Is Excluded');

    } else {
      // if success upload to s3
      await upload(compressedImage);

    }

    
  } catch (err) {
    // if error happens then upload the original file to bucket instead
    await upload(fileBuffer);
  }



  // delete original file
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.UNCOMPRESSED_BUCKET,
      Key: key,
    });

    const response = await client.send(command);
    console.log("DELETE SUCCESS");

  } catch (err) {
    console.error(err);
  }


};
