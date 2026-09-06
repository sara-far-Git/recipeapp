import io
import uuid

from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile, File
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.recipe import StoredImage
from app.models.user import User

router = APIRouter(prefix="/upload", tags=["upload"])
images_router = APIRouter(prefix="/images", tags=["upload"])

# Big enough to fill a card on a large screen, small enough that a book of
# recipes fits in the free database tier.
MAX_EDGE = 1600
WEBP_QUALITY = 82

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
# What a phone will hand over, not what we intend to keep: a modern camera
# produces eight to twelve megabytes, and the photo is re-encoded down to a few
# hundred kilobytes before anything is stored. A five-megabyte cap here refused
# ordinary photographs.
MAX_SIZE = 25 * 1024 * 1024


@router.post("")
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP, and GIF images are allowed")

    contents = await file.read()
    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="התמונה חייבת להיות עד 25MB")

    ext = file.content_type.split("/")[-1]
    if ext == "jpeg":
        ext = "jpg"
    filename = f"recipes/{current_user.id}/{uuid.uuid4().hex}.{ext}"

    if settings.CLOUDINARY_CLOUD_NAME and settings.CLOUDINARY_API_KEY:
        return await _upload_cloudinary(contents, filename)
    if settings.AWS_ACCESS_KEY_ID and settings.AWS_BUCKET_NAME:
        return await _upload_s3(contents, filename)
    # No provider configured, and none needed: keep it ourselves.
    return _store_in_db(contents, current_user, db)


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



def _store_in_db(contents: bytes, user: User, db: Session) -> dict:
    """Shrink the photo, then keep it in our own database.

    Phones hand over four-megabyte photographs for a card that is shown a few
    hundred pixels wide. Storing that verbatim would fill the free tier in a
    couple of dozen recipes, so everything is capped on its longest edge and
    re-encoded before it is written.
    """
    from PIL import Image, ImageOps

    try:
        img = Image.open(io.BytesIO(contents))
        # Phone photos carry their rotation in EXIF rather than in the pixels.
        img = ImageOps.exif_transpose(img)
        img = img.convert("RGB")
        img.thumbnail((MAX_EDGE, MAX_EDGE), Image.LANCZOS)
        buf = io.BytesIO()
        img.save(buf, format="WEBP", quality=WEBP_QUALITY, method=6)
        data = buf.getvalue()
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=400, detail="לא הצלחנו לקרוא את התמונה. נסו קובץ אחר.")

    image = StoredImage(
        id=uuid.uuid4().hex,
        owner_id=user.id,
        content_type="image/webp",
        byte_size=len(data),
        data=data,
    )
    db.add(image)
    db.commit()

    # Relative on purpose: the browser reaches the API through the same origin
    # as the site, so the photo has no second domain a filter could block.
    return {"url": f"{settings.API_V1_PREFIX}/images/{image.id}"}


@images_router.get("/{image_id}")
def get_image(image_id: str, db: Session = Depends(get_db)):
    """Serve a stored photo. Public, like the recipe it belongs to."""
    image = db.query(StoredImage).filter(StoredImage.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(
        content=image.data,
        media_type=image.content_type,
        headers={
            # The id is random and the bytes never change under it.
            "Cache-Control": "public, max-age=31536000, immutable",
            "Content-Length": str(image.byte_size),
        },
    )
