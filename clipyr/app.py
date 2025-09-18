import json
import os
import re
import shutil
import tempfile
import threading
import time
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple

import emoji
import librosa
import moviepy as mp
import numpy as np
import torch
import whisper
import yt_dlp
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from textblob import TextBlob  # noqa: F401  # retained for potential future use
from transformers import AutoModel, AutoTokenizer, pipeline  # noqa: F401  # allow extension


os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")


class AIVideoClipper:
    """Utility that finds high-impact segments from long-form video content."""

    def __init__(self) -> None:
        print("Loading models...")
        # Use base model to balance accuracy and resource usage
        self.whisper_model = whisper.load_model("base")
        self.sentiment_analyzer = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
        )
        self.emotion_analyzer = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
        )

        self.viral_keywords = [
            "wow",
            "amazing",
            "incredible",
            "unbelievable",
            "shocking",
            "surprise",
            "secret",
            "trick",
            "hack",
            "tip",
            "mistake",
            "fail",
            "success",
            "breakthrough",
            "discovery",
            "reveal",
            "expose",
            "truth",
            "lie",
            "before",
            "after",
            "transformation",
            "change",
            "upgrade",
            "improve",
            "money",
            "rich",
            "poor",
            "expensive",
            "cheap",
            "free",
            "save",
            "love",
            "hate",
            "angry",
            "happy",
            "sad",
            "funny",
            "laugh",
            "cry",
            "first time",
            "last time",
            "never",
            "always",
            "everyone",
            "nobody",
            "finally",
            "suddenly",
            "immediately",
            "instantly",
            "quickly",
        ]

        self.hook_patterns = [
            r"you won't believe",
            r"this will change",
            r"nobody talks about",
            r"the truth about",
            r"what happens when",
            r"here's what",
            r"this is why",
            r"the secret",
            r"watch this",
            r"wait for it",
        ]

    @staticmethod
    def is_valid_youtube_url(url: str) -> bool:
        youtube_regex = re.compile(
            r"(https?://)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)/"
            r"(watch\?v=|embed/|v/|.+\?v=)?([^&=%\?]{11})"
        )
        return youtube_regex.match(url) is not None

    def download_youtube_video(self, url: str, temp_dir: str) -> Tuple[str, Dict]:
        print(f"Downloading YouTube video: {url}")
        if not self.is_valid_youtube_url(url):
            raise ValueError("Invalid YouTube URL. Please provide a valid YouTube video link.")

        ydl_opts = {
            "format": "best[height<=720][ext=mp4]/best[ext=mp4]/best",
            "outtmpl": os.path.join(temp_dir, "%(title)s.%(ext)s"),
            "noplaylist": True,
            "extractaudio": False,
            "audioformat": "mp3",
            "ignoreerrors": False,
            "no_warnings": False,
            "extract_flat": False,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
                duration = info.get("duration", 0) or 0
                if duration > 3600:
                    raise ValueError("Video too long. Please use videos shorter than 1 hour.")

                ydl.download([url])
                video_title = info.get("title", "video")
                video_ext = info.get("ext", "mp4")
                video_path = os.path.join(temp_dir, f"{video_title}.{video_ext}")

                downloaded_files = [
                    f
                    for f in os.listdir(temp_dir)
                    if f.lower().endswith((".mp4", ".mkv", ".webm"))
                ]
                if downloaded_files:
                    video_path = os.path.join(temp_dir, downloaded_files[0])

                metadata = {
                    "title": video_title,
                    "duration": duration,
                    "uploader": info.get("uploader", "Unknown"),
                    "view_count": info.get("view_count", 0),
                    "upload_date": info.get("upload_date", "Unknown"),
                }
                print(f"Successfully downloaded: {video_title}")
                return video_path, metadata
        except Exception as exc:  # pragma: no cover - network interaction
            raise RuntimeError(f"Failed to download YouTube video: {exc}") from exc

        raise RuntimeError("Unable to download YouTube video")

    @staticmethod
    def extract_audio_features(video_path: str) -> Dict:
        """Extract audio features from a video file for engagement analysis."""
        # moviepy writes audio track into a temporary wav for librosa
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp_audio:
            temp_audio_path = tmp_audio.name

        try:
            clip = mp.VideoFileClip(video_path)
            clip.audio.write_audiofile(temp_audio_path, fps=16000, logger=None)
            clip.close()

            y, sr = librosa.load(temp_audio_path, sr=None)
            tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
            spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
            spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
            mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
            energy_variance = float(np.var(librosa.feature.rms(y=y)[0]))
        finally:
            try:
                os.remove(temp_audio_path)
            except OSError:
                pass

        return {
            "tempo": float(tempo),
            "spectral_centroid_mean": float(np.mean(spectral_centroids)),
            "spectral_rolloff_mean": float(np.mean(spectral_rolloff)),
            "mfcc_mean": float(np.mean(mfccs)),
            "energy_variance": energy_variance,
        }

    def transcribe_video(self, video_path: str) -> List[Dict]:
        print("Transcribing video...")
        result = self.whisper_model.transcribe(video_path, word_timestamps=True)
        segments: List[Dict] = []
        for segment in result.get("segments", []):
            segments.append(
                {
                    "start": segment["start"],
                    "end": segment["end"],
                    "text": segment["text"].strip(),
                    "words": segment.get("words", []),
                }
            )
        return segments

    def calculate_virality_score(
        self, text: str, audio_features: Dict, segment_duration: float
    ) -> float:
        score = 0.0
        text_lower = text.lower()

        sentiment = self.sentiment_analyzer(text)[0]
        if sentiment["label"] == "POSITIVE" and sentiment["score"] > 0.8:
            score += 2.0
        elif sentiment["label"] == "NEGATIVE" and sentiment["score"] > 0.8:
            score += 1.5

        emotion = self.emotion_analyzer(text)[0]
        high_engagement_emotions = {"surprise", "excitement", "anger", "joy"}
        if emotion["label"].lower() in high_engagement_emotions and emotion["score"] > 0.7:
            score += 2.0

        for keyword in self.viral_keywords:
            if keyword in text_lower:
                score += 1.0

        for pattern in self.hook_patterns:
            if re.search(pattern, text_lower):
                score += 3.0

        if audio_features.get("tempo", 0) > 120:
            score += 1.0
        if audio_features.get("energy_variance", 0) > 0.01:
            score += 1.0

        if 25 <= segment_duration <= 65:
            score += 2.0
        elif 15 <= segment_duration <= 90:
            score += 1.0

        word_count = len(text.split())
        if 20 <= word_count <= 100:
            score += 1.0

        return min(score, 10.0)

    def find_best_moments(
        self, segments: List[Dict], audio_features: Dict, clip_duration: int = 30
    ) -> List[Dict]:
        print("Analyzing segments for viral potential...")
        scored_segments: List[Dict] = []

        for i, segment in enumerate(segments):
            clip_segments = [segment]
            current_duration = segment["end"] - segment["start"]
            j = i + 1
            while j < len(segments) and current_duration < clip_duration:
                next_segment = segments[j]
                if next_segment["end"] - segment["start"] <= clip_duration * 1.5:
                    clip_segments.append(next_segment)
                    current_duration = next_segment["end"] - segment["start"]
                    j += 1
                else:
                    break

            combined_text = " ".join(s["text"] for s in clip_segments)
            virality_score = self.calculate_virality_score(
                combined_text, audio_features, current_duration
            )

            scored_segments.append(
                {
                    "start": segment["start"],
                    "end": clip_segments[-1]["end"],
                    "text": combined_text,
                    "duration": current_duration,
                    "virality_score": virality_score,
                    "segments": clip_segments,
                }
            )

        scored_segments.sort(key=lambda x: x["virality_score"], reverse=True)

        final_segments: List[Dict] = []
        for segment in scored_segments:
            overlap = False
            for existing in final_segments:
                if segment["start"] < existing["end"] and segment["end"] > existing["start"]:
                    overlap = True
                    break
            if not overlap:
                final_segments.append(segment)
            if len(final_segments) >= 5:
                break

        return final_segments

    @staticmethod
    def add_emojis_to_text(text: str) -> str:
        emoji_map = {
            "money": "💰",
            "rich": "💰",
            "dollar": "💵",
            "love": "❤️",
            "heart": "❤️",
            "like": "👍",
            "fire": "🔥",
            "hot": "🔥",
            "amazing": "🔥",
            "laugh": "😂",
            "funny": "😂",
            "lol": "😂",
            "wow": "😱",
            "omg": "😱",
            "shocking": "😱",
            "cool": "😎",
            "awesome": "😎",
            "great": "😎",
            "think": "🤔",
            "question": "❓",
            "why": "🤔",
            "warning": "⚠️",
            "careful": "⚠️",
            "danger": "⚠️",
            "success": "✅",
            "win": "🏆",
            "winner": "🏆",
            "music": "🎵",
            "song": "🎵",
            "sound": "🔊",
        }

        words = text.lower().split()
        for word in words:
            clean_word = re.sub(r"[^\w]", "", word)
            if clean_word in emoji_map:
                text = re.sub(
                    f"\\b{re.escape(word)}\\b",
                    f"{word} {emoji_map[clean_word]}",
                    text,
                    flags=re.IGNORECASE,
                )
        return text

    def create_clip(
        self,
        video_path: str,
        start_time: float,
        end_time: float,
        text: str,
        output_path: str,
        add_subtitles: bool = True,
    ) -> str:
        print(f"Creating clip: {start_time:.1f}s - {end_time:.1f}s")
        base_clip = mp.VideoFileClip(video_path)
        segment_clip = None
        background = None
        video_resized = None
        video_centered = None
        base_composite = None
        txt_clip = None
        final_video = None
        try:
            segment_clip = base_clip.subclipped(start_time, end_time)

            target_width = 1080
            target_height = 1920

            scale_w = target_width / segment_clip.w
            scale_h = target_height / segment_clip.h
            scale = min(scale_w, scale_h)
            video_resized = segment_clip.resized(new_size=scale)

            background = mp.ColorClip(
                size=(target_width, target_height), color=(0, 0, 0)
            ).with_duration(video_resized.duration)
            video_centered = video_resized.with_position(("center", "center"))
            base_composite = mp.CompositeVideoClip(
                [background, video_centered], size=(target_width, target_height)
            )

            final_video = base_composite

            if add_subtitles and text:
                text_with_emojis = self.add_emojis_to_text(text)
                txt_clip = (
                    mp.TextClip(
                        text=text_with_emojis,
                        font_size=60,
                        color="white",
                        stroke_color="black",
                        stroke_width=3,
                        size=(target_width - 100, None),
                        method="caption",
                    )
                    .with_position(("center", 0.8), relative=True)
                    .with_duration(final_video.duration)
                )
                final_video = mp.CompositeVideoClip(
                    [final_video, txt_clip], size=(target_width, target_height)
                )

            final_video.write_videofile(
                output_path,
                codec="libx264",
                audio_codec="aac",
                temp_audiofile="temp-audio.m4a",
                remove_temp=True,
                fps=30,
                preset="ultrafast",
            )
        finally:
            base_clip.close()
            if segment_clip is not None:
                segment_clip.close()
            if background is not None:
                background.close()
            if video_resized is not None:
                video_resized.close()
            if video_centered is not None:
                video_centered.close()
            if base_composite is not None and base_composite is not final_video:
                base_composite.close()
            if txt_clip is not None:
                txt_clip.close()
            if final_video is not None:
                final_video.close()

        return output_path


def generate_clips(
    *,
    clipper: AIVideoClipper,
    input_type: str,
    uploaded_path: str | None,
    youtube_url: str | None,
    clip_duration: int,
    num_clips: int,
    add_subtitles: bool,
    output_dir: str,
) -> Tuple[str, List[Dict], Dict]:
    """Core processing routine reused by API handlers."""

    clip_duration = max(15, min(int(clip_duration), 120))
    num_clips = max(1, min(int(num_clips), 5))
    os.makedirs(output_dir, exist_ok=True)

    with tempfile.TemporaryDirectory() as temp_dir:
        video_path: str | None = None
        video_metadata: Dict = {}

        if input_type == "Upload Video File":
            if not uploaded_path or not os.path.exists(uploaded_path):
                raise ValueError("Video file not found. Please upload a valid file.")
            video_path = uploaded_path
            video_metadata = {
                "title": os.path.basename(video_path),
                "source": "upload",
            }
        elif input_type == "YouTube URL":
            if not youtube_url or not youtube_url.strip():
                raise ValueError("Please enter a YouTube URL.")
            try:
                video_path, video_metadata = clipper.download_youtube_video(
                    youtube_url.strip(), temp_dir
                )
                video_metadata["source"] = "youtube"
            except Exception as exc:  # pragma: no cover - network interaction
                raise ValueError(f"Error downloading YouTube video: {exc}") from exc
        else:
            raise ValueError("Unsupported input type. Choose upload or YouTube.")

        if not video_path or not os.path.exists(video_path):
            raise ValueError("Video file not found or invalid.")

        print("Extracting audio features...")
        audio_features = clipper.extract_audio_features(video_path)

        segments = clipper.transcribe_video(video_path)
        if not segments:
            raise ValueError("Could not transcribe video. Please check the audio quality.")

        best_moments = clipper.find_best_moments(segments, audio_features, clip_duration)
        best_moments = best_moments[:num_clips]
        if not best_moments:
            raise ValueError("No suitable clips found. Try adjusting parameters.")

        clip_info: List[Dict] = []

        for idx, moment in enumerate(best_moments, start=1):
            temp_output = os.path.join(temp_dir, f"clip_{idx}.mp4")
            clipper.create_clip(
                video_path,
                moment["start"],
                moment["end"],
                moment["text"],
                temp_output,
                add_subtitles,
            )
            final_path = os.path.join(output_dir, f"clip_{idx}.mp4")
            shutil.move(temp_output, final_path)
            clip_info.append(
                {
                    "clip_number": idx,
                    "start_time": float(moment["start"]),
                    "end_time": float(moment["end"]),
                    "duration": float(moment["duration"]),
                    "virality_score": float(moment["virality_score"]),
                    "text_preview": (
                        moment["text"][:200] + "..."
                        if len(moment["text"]) > 200
                        else moment["text"]
                    ),
                    "source_video": video_metadata.get("title", "Unknown"),
                    "file_name": os.path.basename(final_path),
                }
            )

        status_msg = (
            f"Successfully created {len(clip_info)} clip(s) from "
            f"{video_metadata.get('title', 'video')}"
        )
        return status_msg, clip_info, video_metadata


def _parse_bool(value: str | bool | None, default: bool = True) -> bool:
    if isinstance(value, bool):
        return value
    if value is None:
        return default
    return str(value).lower() in {"1", "true", "yes", "on"}


def _ensure_job_root() -> Path:
    job_root = Path(os.environ.get("CLIPPER_STORAGE_DIR", "/tmp/firstclass_clips"))
    job_root.mkdir(parents=True, exist_ok=True)
    return job_root


JOB_ROOT = _ensure_job_root()
JOB_TTL_SECONDS = int(os.environ.get("CLIPPER_JOB_TTL_SECONDS", "7200"))
_jobs_index: Dict[str, Dict] = {}
_jobs_lock = threading.Lock()


app = FastAPI(title="FirstClass AI Video Clipper", version="1.0.0")

allowed_origins_env = os.environ.get("CLIPPER_ALLOWED_ORIGINS", "*")
if allowed_origins_env.strip() == "*":
    allowed_origins = ["*"]
else:
    allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)


CLIPPER = AIVideoClipper()


def _register_job(job_id: str, directory: Path, metadata: Dict) -> None:
    with _jobs_lock:
        _jobs_index[job_id] = {
            "dir": directory,
            "created": datetime.utcnow(),
            "metadata": metadata,
        }


def _remove_job(job_id: str) -> None:
    with _jobs_lock:
        data = _jobs_index.pop(job_id, None)
    if data:
        shutil.rmtree(data["dir"], ignore_errors=True)


def _cleanup_worker() -> None:
    while True:
        time.sleep(600)
        now = datetime.utcnow()
        expired: List[str] = []
        with _jobs_lock:
            for job_id, payload in list(_jobs_index.items()):
                if now - payload["created"] > timedelta(seconds=JOB_TTL_SECONDS):
                    expired.append(job_id)
                    _jobs_index.pop(job_id, None)
        for job_id in expired:
            directory = JOB_ROOT / job_id
            shutil.rmtree(directory, ignore_errors=True)


def _start_cleanup_thread() -> None:
    thread = threading.Thread(target=_cleanup_worker, daemon=True)
    thread.start()


_start_cleanup_thread()


async def _save_upload(upload: UploadFile, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with destination.open("wb") as buffer:
        while chunk := await upload.read(1024 * 1024):
            buffer.write(chunk)


@app.get("/api/healthz")
def healthcheck() -> Dict[str, object]:
    with _jobs_lock:
        job_count = len(_jobs_index)
    return {"ok": True, "jobs_cached": job_count, "ttl_seconds": JOB_TTL_SECONDS}


@app.post("/api/process")
async def process_endpoint(
    request: Request,
    input_type: str = Form(..., description="Upload Video File or YouTube URL"),
    clip_duration: int = Form(30, ge=15, le=120),
    num_clips: int = Form(3, ge=1, le=5),
    add_subtitles: bool | None = Form(True),
    youtube_url: str | None = Form(None),
    video_file: UploadFile | None = File(None),
):
    job_id = uuid.uuid4().hex
    job_dir = JOB_ROOT / job_id
    job_dir.mkdir(parents=True, exist_ok=True)

    uploaded_path: Path | None = None
    try:
        if input_type == "Upload Video File":
            if video_file is None:
                raise HTTPException(status_code=400, detail="Please upload a video file.")
            filename = video_file.filename or "upload.mp4"
            uploaded_path = job_dir / filename
            await _save_upload(video_file, uploaded_path)
        elif input_type == "YouTube URL":
            if not youtube_url or not youtube_url.strip():
                raise HTTPException(status_code=400, detail="Please provide a YouTube URL.")
        else:
            raise HTTPException(status_code=400, detail="Unsupported input_type provided.")

        status_msg, clips, metadata = generate_clips(
            clipper=CLIPPER,
            input_type=input_type,
            uploaded_path=str(uploaded_path) if uploaded_path else None,
            youtube_url=youtube_url,
            clip_duration=clip_duration,
            num_clips=num_clips,
            add_subtitles=_parse_bool(add_subtitles, True),
            output_dir=str(job_dir),
        )
    except HTTPException:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise
    except ValueError as exc:
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - heavy pipeline
        shutil.rmtree(job_dir, ignore_errors=True)
        raise HTTPException(status_code=500, detail="Failed to process video") from exc

    _register_job(job_id, job_dir, metadata)

    clips_payload: List[Dict] = []
    for clip in clips:
        download_url = request.url_for(
            "download_clip", job_id=job_id, filename=clip["file_name"]
        )
        clips_payload.append({**clip, "download_url": download_url})

    return {
        "job_id": job_id,
        "status_message": status_msg,
        "metadata": metadata,
        "clips": clips_payload,
        "expires_in_seconds": JOB_TTL_SECONDS,
    }


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str, request: Request):
    with _jobs_lock:
        job = _jobs_index.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    clips: List[Dict] = []
    for file in sorted(job["dir"].glob("clip_*.mp4")):
        download_url = request.url_for(
            "download_clip", job_id=job_id, filename=file.name
        )
        clips.append({
            "file_name": file.name,
            "download_url": download_url,
            "size_bytes": file.stat().st_size,
        })

    return {
        "job_id": job_id,
        "metadata": job["metadata"],
        "created_at": job["created"].isoformat() + "Z",
        "clips": clips,
        "expires_in_seconds": max(
            0,
            JOB_TTL_SECONDS - int((datetime.utcnow() - job["created"]).total_seconds()),
        ),
    }


@app.get("/api/jobs/{job_id}/{filename}", name="download_clip")
def download_clip(job_id: str, filename: str):
    with _jobs_lock:
        job = _jobs_index.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    file_path = job["dir"] / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Clip not found")

    return FileResponse(
        file_path,
        media_type="video/mp4",
        filename=filename,
    )


@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: str):
    with _jobs_lock:
        exists = job_id in _jobs_index
    if not exists:
        raise HTTPException(status_code=404, detail="Job not found")
    _remove_job(job_id)
    return JSONResponse({"ok": True})


def run() -> None:
    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=int(os.environ.get("PORT", "7860")),
        reload=False,
    )


if __name__ == "__main__":
    run()
