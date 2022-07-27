import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

export class AttachmentUtils  {
    constructor(
        private readonly todosStorage = process.env.ATTACHMENT_S3_BUCKET,
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4'})
    ) {}

    getPresignedUploadURL(todoId: string) {
        let sigUrl = this.s3.getSignedUrl('putObject', {
            Bucket: this.todosStorage,
            Key: todoId,
            Expires: 300
        })
        return sigUrl;
    }
}
