import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from app.core.config import settings
from app.core.security import get_current_user
from app.models.user import User

router = APIRouter(prefix="/upload", tags=["upload"])

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, and GIF images are allowed")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Image must be under 5MB")

    ext = file.content_type.split("/")[-1]
    if ext == "jpeg":
        ext = "jpg"
    filename = f"recipes/{current_user.id}/{uuid.uuid4().hex}.{ext}"

    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
        return await _upload_cloudinary(contents, filename)
    elif settings.AWS_ACCESS_KEY_ID and settings.AWS_BUCKET_NAME:
        return await _upload_s3(contents, filename)
    else:
        raise HTTPException(status_code=503, detail="No storage provider configured")


async def _upload_cloudinary(contents: bytes, filename: str) -> dict:
    import cloudinary
    import cloudinary.uploader

    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
    )

    result = cloudinary.uploader.upload(
        contents,
        public_id=filename.rsplit(".", 1)[0],
        folder="recipeapp",
        resource_type="image",
    )
    return {"url": result["secure_url"]}


async def _upload_s3(contents: bytes, filename: str) -> dict:
    import boto3

    s3 = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    s3.put_object(
        Bucket=settings.AWS_BUCKET_NAME,
        Key=filename,
        Body=contents,
        ContentType="image/jpeg",
    )
    url = f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{filename}"
    return {"url": url}
