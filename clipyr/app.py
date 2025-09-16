import os
import re
import tempfile
from typing import Dict, List, Tuple

import gradio as gr
import librosa  # type: ignore
import moviepy.editor as mp
import numpy as np
import torch  # type: ignore
import whisper  # type: ignore
import yt_dlp  # type: ignore
from transformers import AutoModel, AutoTokenizer, pipeline  # noqa: F401  # allow future reuse


os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")


class AIVideoClipper:
    """Utility that finds high-impact segments from long-form video content."""

    def __init__(self) -> None:
        print("Loading models...")
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

    @staticmethod
    def extract_audio_features(video_path: str) -> Dict:
        """Extract audio features from a video file for engagement analysis."""
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
            segment_clip = base_clip.subclip(start_time, end_time)

            target_width = 1080
            target_height = 1920

            scale_w = target_width / segment_clip.w
            scale_h = target_height / segment_clip.h
            scale = min(scale_w, scale_h)
            video_resized = segment_clip.resize(newsize=scale)

            background = mp.ColorClip(
                size=(target_width, target_height), color=(0, 0, 0)
            ).set_duration(video_resized.duration)
            video_centered = video_resized.set_position("center")
            base_composite = mp.CompositeVideoClip(
                [background, video_centered], size=(target_width, target_height)
            )

            final_video = base_composite

            if add_subtitles and text:
                text_with_emojis = self.add_emojis_to_text(text)
                txt_clip = (
                    mp.TextClip(
                        text=text_with_emojis,
                        fontsize=60,
                        color="white",
                        stroke_color="black",
                        stroke_width=3,
                        size=(target_width - 100, None),
                        method="caption",
                    )
                    .set_position(("center", 0.8), relative=True)
                    .set_duration(final_video.duration)
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


def process_video(
    input_type,
    video_file,
    youtube_url,
    clip_duration,
    num_clips,
    add_subtitles,
):
    clipper = AIVideoClipper()

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            video_path: str | None = None
            video_metadata: Dict = {}

            if input_type == "Upload Video File":
                if not video_file:
                    return "Please upload a video file.", [], []
                video_path = video_file if isinstance(video_file, str) else getattr(video_file, "name", None)
                if not video_path:
                    return "Unable to read uploaded file path.", [], []
                video_metadata = {"title": os.path.basename(video_path), "source": "upload"}
            elif input_type == "YouTube URL":
                if not youtube_url or not youtube_url.strip():
                    return "Please enter a YouTube URL.", [], []
                try:
                    video_path, video_metadata = clipper.download_youtube_video(
                        youtube_url.strip(), temp_dir
                    )
                    video_metadata["source"] = "youtube"
                except Exception as exc:
                    return f"Error downloading YouTube video: {exc}", [], []
            else:
                return "Please select an input method.", [], []

            if not video_path or not os.path.exists(video_path):
                return "Video file not found or invalid.", [], []

            print("Extracting audio features...")
            audio_features = clipper.extract_audio_features(video_path)

            segments = clipper.transcribe_video(video_path)
            if not segments:
                return "Could not transcribe video. Please check the audio quality.", [], []

            best_moments = clipper.find_best_moments(segments, audio_features, clip_duration)
            best_moments = best_moments[:num_clips]
            if not best_moments:
                return "No suitable clips found. Try adjusting parameters.", [], []

            output_videos: List[str] = []
            clip_info: List[Dict] = []

            for idx, moment in enumerate(best_moments, start=1):
                output_path = os.path.join(temp_dir, f"clip_{idx}.mp4")
                try:
                    clipper.create_clip(
                        video_path,
                        moment["start"],
                        moment["end"],
                        moment["text"],
                        output_path,
                        add_subtitles,
                    )
                    final_path = os.path.abspath(f"clip_{idx}_{hash(video_path)}_{idx}.mp4")
                    os.replace(output_path, final_path)
                    output_videos.append(final_path)
                    clip_info.append(
                        {
                            "clip_number": idx,
                            "start_time": f"{moment['start']:.1f}s",
                            "end_time": f"{moment['end']:.1f}s",
                            "duration": f"{moment['duration']:.1f}s",
                            "virality_score": f"{moment['virality_score']:.2f}/10",
                            "text_preview": (
                                moment["text"][:100] + "..."
                                if len(moment["text"]) > 100
                                else moment["text"]
                            ),
                            "source_video": video_metadata.get("title", "Unknown"),
                        }
                    )
                except Exception as exc:
                    print(f"Error creating clip {idx}: {exc}")
                    continue

            success_msg = (
                f"✅ Successfully created {len(output_videos)} clips from: "
                f"{video_metadata.get('title', 'video')}"
            )
            return success_msg, output_videos, clip_info
    except Exception as exc:
        return f"Error processing video: {exc}", [], []


def create_interface() -> gr.Blocks:
    with gr.Blocks(title="AI Video Clipper", theme=gr.themes.Soft()) as demo:
        gr.Markdown(
            """
            # 🎬 AI Video Clipper

            Transform your long videos into viral short clips automatically!
            Upload a video file or paste a YouTube URL and let AI find the most engaging moments.

            **Features:**
            - 🤖 AI-powered moment detection
            - 📱 Auto 9:16 aspect ratio conversion
            - 📝 Automatic subtitles with emojis
            - 📊 Virality scoring
            - 🎯 Multi-language support
            - 🔗 YouTube video download support
            """
        )

        with gr.Row():
            with gr.Column():
                input_type = gr.Radio(
                    choices=["Upload Video File", "YouTube URL"],
                    value="Upload Video File",
                    label="Choose Input Method",
                    interactive=True,
                )

                video_input = gr.File(
                    label="Upload Video File",
                    file_types=[".mp4", ".avi", ".mov", ".mkv", ".webm"],
                    type="filepath",
                    visible=True,
                )

                youtube_input = gr.Textbox(
                    label="YouTube URL",
                    placeholder="https://www.youtube.com/watch?v=...",
                    visible=False,
                    info="Paste any YouTube video URL (supports various formats)",
                )

                url_examples = gr.Markdown(
                    """
                    **Supported URL formats:**
                    - `https://www.youtube.com/watch?v=VIDEO_ID`
                    - `https://youtu.be/VIDEO_ID`
                    - `https://www.youtube.com/embed/VIDEO_ID`
                    """,
                    visible=False,
                )

                with gr.Row():
                    clip_duration = gr.Slider(
                        minimum=15,
                        maximum=90,
                        value=30,
                        step=5,
                        label="Target Clip Duration (seconds)",
                    )
                    num_clips = gr.Slider(
                        minimum=1,
                        maximum=5,
                        value=3,
                        step=1,
                        label="Number of Clips to Generate",
                    )

                add_subtitles = gr.Checkbox(
                    label="Add Subtitles with Emojis",
                    value=True,
                )

                process_btn = gr.Button("🚀 Create Clips", variant="primary")

            with gr.Column():
                status_output = gr.Textbox(label="Status", interactive=False, lines=3)
                clips_output = gr.Gallery(
                    label="Generated Clips",
                    show_label=True,
                    columns=1,
                    rows=3,
                    height="auto",
                    allow_preview=True,
                    show_download_button=True,
                )

        info_output = gr.JSON(label="Clip Analysis", visible=True)

        def update_input_visibility(choice: str):
            if choice == "Upload Video File":
                return (
                    gr.update(visible=True),
                    gr.update(visible=False),
                    gr.update(visible=False),
                )
            return (
                gr.update(visible=False),
                gr.update(visible=True),
                gr.update(visible=True),
            )

        input_type.change(
            update_input_visibility,
            inputs=[input_type],
            outputs=[video_input, youtube_input, url_examples],
        )

        gr.Markdown("### 📺 Tips for Best Results:")
        gr.Markdown(
            """
            **📁 File Upload:**
            - Upload videos with clear speech (podcasts, interviews, tutorials work great!)
            - Supported formats: MP4, AVI, MOV, MKV, WebM
            - Maximum recommended duration: 2 hours

            **🔗 YouTube Videos:**
            - Any public YouTube video (no age restrictions)
            - Automatically downloads in optimal quality (720p max for performance)
            - Works with livestreams, premieres, and regular videos
            - Maximum duration: 1 hour for free tier

            **🎯 Content Tips:**
            - Longer videos (5+ minutes) provide more clip opportunities
            - Videos with engaging content and emotional moments score higher
            - Good audio quality improves transcription accuracy
            - Educational content, podcasts, and interviews work exceptionally well
            """
        )

        process_btn.click(
            process_video,
            inputs=[
                input_type,
                video_input,
                youtube_input,
                clip_duration,
                num_clips,
                add_subtitles,
            ],
            outputs=[status_output, clips_output, info_output],
        )

    return demo


def main() -> None:
    demo = create_interface()
    port = int(os.environ.get("PORT", "7860"))
    demo.launch(server_name="0.0.0.0", server_port=port, share=False)


if __name__ == "__main__":
    main()
