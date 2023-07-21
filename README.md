# Intro
This application can be deploy on lambda to compress image from S3 bucket and place it in another S3 bucket.

# Feature
- Support latest Nodejs (18.x). There are many sample on the internet but not support latest nodejs.
- Auto delete original image once the resource been moved to compressed bucket
- Cloudfront fallback (no need to worry the delay between compress and display to end user) 
- Fallback when unsupport file occoured (e.g. when there are non-image file been send to lambda, system will skip compress and move original file to compressed bucket directly.)
- Compress file 


# Getting Start
## IAM
1. Create a role with `S3` and `Lambda` full access


## Lambda
[MAKE SURE YOUR LAMBDA AND S3 ARE IN SAME REGION]
1. Attach the previous role to the lambda function
2. Upload deploy.zip to lambda
3. On configuration page > Environment variables, add `COMPRESSED_BUCKET` and `UNCOMPRESSED_BUCKET` with your bucket name
4. On configuration page > General configuration, Change Memory to 1024MB, Storage to 1024MB and Timeout to 0 min 30 sec.

## S3
[MAKE SURE YOUR LAMBDA AND S3 ARE IN SAME REGION]
1. Create on bucket to place original files
2. Create another bucket to place compressed files


## Cloudfront
1. Create a cloudfront distributions
2. Create two origin pointing to two previous created buckets
3. Create one origin group, pointing to two origin (p.s. bucket )


# How to compile
And upload to lambda
````
cd lambda-compress-image-node18.x
zip -r deploy.zip .
````


# Infrastructure
<img src="/img/infrastructure.png" width="700px"></img>
