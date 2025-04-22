import { useState, useRef, useEffect } from "react";

const AudioUploadForm = ({ setEvaluationDisplayed, showNotification, setResponse }) => {
  const [text, setText] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  function handleTextChange(e) {
    setText(e.target.value);
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      const value = (audio.currentTime / audio.duration) * 100 || 0;
      setProgress(value);
    };

    audio.addEventListener("timeupdate", updateProgress);
    return () => audio.removeEventListener("timeupdate", updateProgress);
  }, [audioUrl]);

  useEffect(() => {
    // Handle play/pause from audio element actual events, not just on button click
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnd = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnd);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnd);
    };
  }, [audioUrl]);

  function handleFileChange(e) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith("audio/")) {
        showNotification("Please upload an audio file", "error");
        return;
      }
      setAudioFile(file);
      // Revoke previous URL
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl(URL.createObjectURL(file));
      setIsPlaying(false);
    }
  }

  function togglePlayPause() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play();
    } else {
      audio.pause();
    }
    // Don't toggle isPlaying here; let audio event handlers manage it
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text && !audioFile) {
      showNotification("Please enter text or upload an audio file", "error");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      if (audioFile) formData.append("audio", audioFile);

      const response = await fetch("http://127.0.0.1:8000/evaluar-lectura", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to submit data");
      setResponse(await response.json());
      showNotification("Data submitted successfully!");

      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setEvaluationDisplayed(true);
      setTimeout(() => {
        setAudioUrl(null);
        setText("");
        setAudioFile(null);
      }, 2000);
    } catch (err) {
      console.log(err);
      showNotification("Failed to submit data. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="input-row">
          <div className="form-group flex-1">
            <label htmlFor="text-input" className="form-label">
              The text
            </label>
            <textarea id="text-input" className="textarea" value={text} onChange={handleTextChange} placeholder="Type the text here..." />
          </div>

          <div className="form-group flex-1">
            <label className="form-label">Audio File</label>
            <input type="file" id="audio-file" accept="audio/*" onChange={handleFileChange} style={{ display: "none", minHeight: "100%" }} />
            <label htmlFor="audio-file" className="file-upload">
              <div className="file-upload-text">
                {audioFile ? <div className="file-name">{audioFile.name}</div> : <div>Drag & drop your audio file here or click to browse</div>}
              </div>
            </label>
          </div>
        </div>
        {audioUrl ? (
          <div className="audio-player">
            <button type="button" onClick={togglePlayPause} className="play-button">
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                  <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="-2 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4.75L17.25 12L6 19.25V4.75Z" fill="currentColor" />
                </svg>
              )}
            </button>
            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={() => {
                if (audioRef.current) {
                  const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
                  setProgress(progress);
                }
              }}
              onEnded={() => setIsPlaying(false)}
            />
          </div>
        ) : (
          <div style={{ height: "110px" }}></div>
        )}
        <div className="form-group" style={{ marginTop: "30px" }}>
          <button type="submit" className="submit-button" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="loading-spinner"></div>
                Processing...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: "8px" }}>
                  <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Send Message
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AudioUploadForm;
