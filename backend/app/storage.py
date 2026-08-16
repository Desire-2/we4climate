"""
Unified file storage: Vercel Blob in production, local disk for development.

When BLOB_READ_WRITE_TOKEN is set, files are uploaded to Vercel Blob.
Otherwise they are saved to the local uploads/ directory and served via Flask.
"""
import logging
import os
import uuid
from pathlib import Path

from flask import current_app, url_for
from werkzeug.utils import secure_filename

logger = logging.getLogger(__name__)

_USE_BLOB: bool | None = None


def _use_blob() -> bool:
    """Check once whether Vercel Blob is available."""
    global _USE_BLOB
    if _USE_BLOB is None:
        token = os.environ.get("BLOB_READ_WRITE_TOKEN", "")
        _USE_BLOB = token.startswith("vercel_blob_rw_") and "xxx" not in token
        if _USE_BLOB:
            logger.info("BLOB_READ_WRITE_TOKEN detected – using Vercel Blob storage")
        else:
            logger.info("No valid BLOB_READ_WRITE_TOKEN – falling back to local disk storage")
    return _USE_BLOB


def _get_upload_folder() -> str:
    folder = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "uploads", "applications")
    )
    os.makedirs(folder, exist_ok=True)
    return folder


def upload_file(field_name: str, file_storage, allowed_extensions: set[str], prefix: str) -> str:
    """Upload a file and return a URL pointing to it.

    Args:
        field_name: The form field name (used for error messages).
        file_storage: A Werkzeug FileStorage object from request.files.
        allowed_extensions: Set of allowed extensions e.g. {".pdf", ".jpg"}.
        prefix: Blob path prefix e.g. "volunteers" or "applications".

    Returns:
        A URL string (Vercel Blob URL or local /uploads/... path).
    """
    safe_name = secure_filename(file_storage.filename or "")
    extension = Path(safe_name).suffix.lower()
    if not safe_name or extension not in allowed_extensions:
        raise ValueError(f"Unsupported file type for {field_name}")

    stored_name = f"{prefix}/{uuid.uuid4().hex[:12]}_{safe_name}"
    file_data = file_storage.read()

    if _use_blob():
        import vercel_blob
        result = vercel_blob.put(stored_name, file_data, {"addRandomSuffix": "false"})
        return result["url"]
    else:
        disk_path = os.path.join(_get_upload_folder(), stored_name)
        os.makedirs(os.path.dirname(disk_path), exist_ok=True)
        with open(disk_path, "wb") as f:
            f.write(file_data)
        return f"/uploads/applications/{stored_name}"


def delete_file(path_or_url: str) -> None:
    """Delete a file by its blob pathname or local path. Best-effort."""
    if _use_blob():
        import vercel_blob
        try:
            vercel_blob.delete(path_or_url)
        except Exception:
            logger.warning("Failed to delete blob %s", path_or_url)
    else:
        # Local: path_or_url is like /uploads/applications/volunteers/xxx.pdf
        try:
            relative = path_or_url.replace("/uploads/applications/", "")
            full = os.path.join(_get_upload_folder(), relative)
            if os.path.exists(full):
                os.remove(full)
        except OSError:
            logger.warning("Failed to delete local file %s", path_or_url)
