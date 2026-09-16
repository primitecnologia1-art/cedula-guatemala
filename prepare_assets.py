"""Prepare the V2 web assets from approved project sources.

Run with ``python site/prepare_assets.py`` from any working directory.
Requires Pillow with WebP support. No generation, reconstruction, crop, colour
grading or video transcode is performed. The original technical JPG files and
the approved final MP4 are copied byte for byte. Existing V1 assets are kept.
"""

from __future__ import annotations

import hashlib
import json
from pathlib import Path
import shutil
import struct

from PIL import Image


PROJECT = Path(__file__).resolve().parent.parent
OUTPUT = PROJECT / "site/public/assets/v2"
SCENES = {
    "xibalba": "NOVO-CLIPE/images/Clip 01-02 — UV.png",
    "daylight": "NOVO-CLIPE/images/Clip 01-02 — DAYLIGHT.png",
    "ceiba": "NOVO-CLIPE/images/Clip 01-02 — Composição B Ceiba exterior.png",
    "quetzal": "NOVO-CLIPE/images/Clip 03 - Quetzal.png",
    "tecun": "NOVO-CLIPE/images/Clip 04 — Tecún Umán humano.png",
    "tikal": "NOVO-CLIPE/images/Clip 05 — Tikal realista v2.png",
    "jaguar": "NOVO-CLIPE/images/Clip 06 — Jaguar.png",
    "finale": "NOVO-CLIPE/images/END-CLIP.png",
}
MASTERS = {
    "front": "referencias/Prova_Cedula_Guatemala_V3-final.jpg",
    "back": "referencias/Prova_Cedula_Guatemala-verso-V3-final.jpg",
    "uv": "referencias/Prova_Cedula_Guatemala-verso-uv-com-vermelho.jpg",
}
FILM = "NOVO-CLIPE/cedula-final.mp4"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def file_info(path: Path) -> dict:
    return {
        "path": path.relative_to(PROJECT).as_posix(),
        "bytes": path.stat().st_size,
        "sha256": sha256(path),
    }


def image_info(path: Path) -> dict:
    info = file_info(path)
    with Image.open(path) as image:
        info.update(width=image.width, height=image.height, mode=image.mode)
    return info


def web_image(source: Path, output: Path, max_width: int, *, lossless: bool) -> dict:
    with Image.open(source) as original:
        # Palette decoding is exact. All original RGB sources keep their mode.
        image = original.convert("RGB") if original.mode == "P" else original.copy()
        if image.width > max_width:
            size = (max_width, round(image.height * max_width / image.width))
            image = image.resize(size, Image.Resampling.LANCZOS)
        options = {"format": "WEBP", "method": 6, "lossless": lossless}
        if not lossless:
            options["quality"] = 90
        if original.info.get("icc_profile"):
            options["icc_profile"] = original.info["icc_profile"]
        image.save(output, **options)
    result = image_info(output)
    result["operation"] = {
        "encoding": "lossless WebP" if lossless else "WebP quality 90",
        "max_width": max_width,
        "resize": "proportional Lanczos, downscale only",
        "crop": False,
        "reconstruction": False,
    }
    return result


def copy_exact(source: Path, output: Path) -> dict:
    shutil.copyfile(source, output)
    info = file_info(output)
    if info["sha256"] != sha256(source):
        raise RuntimeError(f"Copy verification failed: {output.name}")
    info["operation"] = "byte-for-byte copy; SHA-256 verified"
    return info


def mp4_metadata(path: Path) -> dict:
    """Read exact movie duration and video geometry from ISO BMFF metadata."""
    def boxes(handle, start, end):
        offset = start
        while offset + 8 <= end:
            handle.seek(offset)
            size, kind = struct.unpack(">I4s", handle.read(8))
            header = 8
            if size == 1:
                size = struct.unpack(">Q", handle.read(8))[0]
                header = 16
            elif size == 0:
                size = end - offset
            if size < header or offset + size > end:
                raise ValueError("Invalid MP4 box bounds")
            yield kind, offset + header, offset + size
            offset += size

    metadata = {}
    with path.open("rb") as handle:
        for kind, start, end in boxes(handle, 0, path.stat().st_size):
            if kind != b"moov":
                continue
            for child, child_start, child_end in boxes(handle, start, end):
                if child == b"mvhd":
                    handle.seek(child_start)
                    version = handle.read(1)[0]
                    handle.seek(child_start + (20 if version == 1 else 12))
                    timebase = struct.unpack(">I", handle.read(4))[0]
                    duration = struct.unpack(">Q" if version == 1 else ">I", handle.read(8 if version == 1 else 4))[0]
                    metadata.update(movie_duration_seconds=duration / timebase, movie_duration_units=duration, movie_timescale=timebase)
                elif child == b"trak":
                    dimensions = None
                    is_video = False
                    media_duration = None
                    for track_kind, track_start, track_end in boxes(handle, child_start, child_end):
                        if track_kind == b"tkhd":
                            handle.seek(track_end - 8)
                            width, height = struct.unpack(">II", handle.read(8))
                            dimensions = (width // 65536, height // 65536)
                        elif track_kind == b"mdia":
                            for media_kind, media_start, _ in boxes(handle, track_start, track_end):
                                if media_kind == b"hdlr":
                                    handle.seek(media_start + 8)
                                    is_video = handle.read(4) == b"vide"
                                elif media_kind == b"mdhd":
                                    handle.seek(media_start)
                                    version = handle.read(1)[0]
                                    handle.seek(media_start + (20 if version == 1 else 12))
                                    media_timebase = struct.unpack(">I", handle.read(4))[0]
                                    media_units = struct.unpack(">Q" if version == 1 else ">I", handle.read(8 if version == 1 else 4))[0]
                                    media_duration = (media_units, media_timebase)
                    if is_video and dimensions:
                        metadata.update(width=dimensions[0], height=dimensions[1])
                        if media_duration:
                            units, timebase = media_duration
                            metadata.update(duration_seconds=units / timebase, duration_units=units, timescale=timebase)
    if not all(key in metadata for key in ("duration_seconds", "width", "height")):
        raise ValueError("Could not verify final film metadata")
    return metadata


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest = {
        "version": 2,
        "source_of_truth": ["NOVO-CLIPE/", "referencias/"],
        "policy": {
            "ai_generations": 0,
            "generated_or_reconstructed_print_details": False,
            "technical_masters": "Original JPG bytes, SHA-256 verified after copy",
            "technical_previews": "Proportional downscale only; lossless WebP encoding, not full-resolution masters",
            "scenes": "Approved new-film images; proportional downscale only; WebP quality 90",
            "film": "Approved final MP4 copied without alteration; Spanish captions already burned in; no old VTT",
            "poster": "/assets/v2/finale-wide.webp",
            "old_assets": "Preserved, never deleted by this script",
        },
        "assets": [],
    }
    for name, relative in SCENES.items():
        source = PROJECT / relative
        entry = {"id": name, "type": "film-scene", "source": image_info(source), "outputs": []}
        for variant, width in (("wide", 1920), ("mobile", 900)):
            entry["outputs"].append(web_image(source, OUTPUT / f"{name}-{variant}.webp", width, lossless=False))
        manifest["assets"].append(entry)

    for name, relative in MASTERS.items():
        source = PROJECT / relative
        source_info = image_info(source)
        master = copy_exact(source, OUTPUT / f"{name}-master.jpg")
        master.update(width=source_info["width"], height=source_info["height"], mode=source_info["mode"])
        preview = web_image(source, OUTPUT / f"{name}.webp", 1800, lossless=True)
        manifest["assets"].append({"id": name, "type": "technical-master", "source": source_info, "outputs": [master, preview]})

    source = PROJECT / FILM
    video_metadata = mp4_metadata(source)
    source_info = file_info(source) | video_metadata
    film_copy = copy_exact(source, OUTPUT / "cedula-final.mp4") | video_metadata
    manifest["assets"].append({"id": "film", "type": "final-film", "source": source_info, "outputs": [film_copy]})
    outputs = [output for entry in manifest["assets"] for output in entry["outputs"]]
    manifest["totals"] = {"output_files": len(outputs), "output_bytes": sum(item["bytes"] for item in outputs), "ai_generations": 0}
    (OUTPUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"directory": str(OUTPUT), **manifest["totals"], "film": video_metadata}, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
