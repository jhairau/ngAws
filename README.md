# ngAwsS3
Angular + AWS S3. Uses AWS JS SDK for listing, reading, uploading and removing objects

This project generates and uses S3 Access Policies to allow for HTTP POST and GET requests, making it easier to work
with html5 file upload applications

## Requirements
This project requires CryptoLib to be included
````
<form action="" class="dropzone" drop-zone="" id="file-dropzone" action="{{creds.bucket}}">
  <input name="key" type="hidden" value="assets/{{key}}/original.jpg">
  <input name="acl" type="hidden" value="private">
  <input name="policy" type="hidden" value="{{creds.policy}}">
  <input name="signature" type="hidden" value="{{creds.signature}}">
  <input name="Content-Type" type="hidden" value="image/jpeg" />
  <input name="AWSAccessKeyId" type="hidden" value="{{creds.access_key}}">
</form>
````

The above is how you would implement HTTP Post request