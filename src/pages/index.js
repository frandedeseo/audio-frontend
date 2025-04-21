import EvaluationTable from "@/components/EvaluationTable";
import { useState, useRef, useEffect } from "react";

// If in Next.js, keep style jsx global. Otherwise, place styles in a CSS file.
export default function AudioUploadForm() {
  const [text, setText] = useState("");
  const [evaluationDisplayed, setEvaluationDisplayed] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [response, setResponse] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const audioRef = useRef(null);
  const notificationTimeout = useRef();

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

  // Handle focus issue by not returning html/head/body

  useEffect(() => {
    // Cleanup object URL
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      // Cleanup notifications timeout
      if (notificationTimeout.current) clearTimeout(notificationTimeout.current);
    };
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

  useEffect(() => {
    if (notification.show) {
      if (notificationTimeout.current) clearTimeout(notificationTimeout.current);

      notificationTimeout.current = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }));
      }, 5000);
    }
  }, [notification.show]);

  function showNotification(message, type = "success") {
    setNotification({ show: true, message, type });
  }

  function handleTextChange(e) {
    setText(e.target.value);
  }

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

      // Replace with your own endpoint!
      const response = await fetch("http://127.0.0.1:8000/evaluar-lectura", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to submit data");
      showNotification("Data submitted successfully!");
      setText("");
      setAudioFile(null);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setEvaluationDisplayed(true);
      setAudioUrl(null);
    } catch (err) {
      showNotification("Failed to submit data. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Analizador de fonética</h1>
        {!evaluationDisplayed && <p>Subí el audio del alumno leyendo y su respectivo texto que leyó</p>}
      </div>
      {evaluationDisplayed ? (
        <EvaluationTable />
      ) : (
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
                  {/* Icon omitted for brevity */}
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
                <audio ref={audioRef} src={audioUrl} />
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
      )}
      {notification.show && (
        <div className={`notification ${notification.type === "success" ? "notification-success" : "notification-error"}`}>
          <span className="notification-icon">
            {notification.type === "success" ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.709 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 9V13M12 17H12.01M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
          {notification.message}
        </div>
      )}
    </div>
  );
}
