import { useState, useRef, useEffect } from "react";

const AudioUploadForm = ({ setEvaluationDisplayed, showNotification, setResponse }) => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  // Add these new state variables at the top of the component with the other state declarations
  const [mode, setMode] = useState("upload"); // "upload" or "record"
  const [recordingStatus, setRecordingStatus] = useState("idle"); // "idle", "recording", "recorded"
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  // Predefined texts for each grade
  const gradeTexts = {
    "1ro": "Los perros tienen muy buen olfato y oído. El perro es un animal fiel. Es el mejor amigo del hombre.",
    "2do":
      "En el sistema solar hay ocho planetas. Marte es el cuarto planeta más cercano al sol. Es el segundo más pequeño. Su color es rojizo. Desde la Tierra se lo puede observar con un telescopio. Hace varios años los científicos investigan si hubo vida en ese planeta.",
    "3er":
      "Los dinosaurios son animales que vivieron en la tierra hace muchos años. Eran animales salvajes, muy feroces y peligrosos. El Tiranosaurio Rex era uno de los dinosaurios más conocidos. Era un animal de gran tamaño. Tenía dientes muy filosos y grandes garras para atrapar a sus presas.",
    "4to":
      "El búho es un ave de comportamiento nocturno. Por lo tanto, al haber escasez de luz, intercepta a sus presas a través del sonido. Es famoso y conocido por permanecer despierto durante la noche y descansar de día. A diferencia de las lechuzas, los búhos poseen plumas sobre su cabeza que son confundidas con orejas. La lechuza no posee estas plumas.",
    "5to":
      "El avestruz está dotado de un apetito insaciable. Puede llenar su estómago de los alimentos más disparatados.  Es vegetariana pero muy selectiva.  Prefiere los granos, frutos y flores a las hierbas. Ingiere también piedras para triturar los alimentos y facilitar la digestión. Es activa incluso al mediodía, a las horas de máximo calor, ya que no le hace falta descansar a la sombra como los antílopes y otros mamíferos.",
    "6to":
      "La corteza terrestre es la capa externa del planeta tierra, donde nosotros vivimos. Está dividida en placas que se denominan  tectónicas. Los sismos o terremotos se producen a causa de movimientos de las placas tectónicas de la corteza terrestre. Cuando estas enormes masas de tierra se chocan o se desliza, se libera energía que provoca estas sacudidas terrestres.",
    "7to":
      "Los delfines son un tipo de mamíferos cetáceos. Pueden vivir más de treinta años en cautividad y tienen una longitud de tres coma cinco metros aproximadamente. En la naturaleza, estos nadadores elegantes pueden alcanzar velocidades de más de treinta kilómetros por hora. Durante sus desplazamientos surgen a menudo a la superficie del mar para respirar, haciéndolo una media de dos o tres veces por minuto.",
  };

  // Get the text based on selected grade
  const getText = () => {
    return selectedGrade ? gradeTexts[selectedGrade] : "";
  };

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

  function handleGradeChange(e) {
    setSelectedGrade(e.target.value);
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
    if (!selectedGrade && !audioFile) {
      showNotification("Please select a grade or upload an audio file", "error");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("text", getText()); // Send the predefined text based on grade
      if (audioFile) formData.append("audio", audioFile);

      const response = await fetch("https://audio-cleaner.vercel.app/evaluar-lectura", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Failed to submit data");
      }

      // Check if the backend returned a mismatch warning
      if (data.error && data.error.includes("no coincide con el audio")) {
        showNotification("El texto proporcionado no coincide con el audio", "error");
        return; // Stop further execution
      }

      setResponse(data);
      showNotification("¡Datos enviados correctamente!");

      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setEvaluationDisplayed(true);
      setTimeout(() => {
        setAudioUrl(null);
        setSelectedGrade("");
        setAudioFile(null);
      }, 2000);
    } catch (err) {
      console.log(err);
      showNotification("No se pudo enviar la información. Intenta de nuevo.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  // Add these new functions after the existing functions but before the return statement
  function toggleMode() {
    // Reset audio states when switching modes
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioFile(null);
    setRecordingStatus("idle");
    setRecordedChunks([]);
    setProgress(0);

    // Toggle between upload and record modes
    setMode((prevMode) => (prevMode === "upload" ? "record" : "upload"));
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioFile(new File([blob], "recorded-audio.webm", { type: "audio/webm" }));
        setRecordedChunks(chunks);
        setRecordingStatus("recorded");
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecordingStatus("recording");
    } catch (err) {
      console.error("Error accessing microphone:", err);
      showNotification("Could not access microphone. Please check permissions.", "error");
    }
  }

  function stopRecording() {
    if (mediaRecorder && recordingStatus === "recording") {
      mediaRecorder.stop();
      // Stop all audio tracks
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <div className="input-row">
          <div className="form-group flex-1">
            <label htmlFor="grade-select" className="form-label">
              Seleccione el grado
            </label>
            <select
              id="grade-select"
              className="textarea"
              value={selectedGrade}
              onChange={handleGradeChange}
              style={{ height: "auto", padding: "10px" }}
            >
              <option value="">Seleccione un grado</option>
              <option value="1ro">1ro grado</option>
              <option value="2do">2do grado</option>
              <option value="3er">3er grado</option>
              <option value="4to">4to grado</option>
              <option value="5to">5to grado</option>
              <option value="6to">6to grado</option>
              <option value="7to">7to grado</option>
            </select>

            <div style={{ marginTop: "15px" }}>
              <label className="form-label">Texto de lectura:</label>
              <div
                className="textarea"
                style={{
                  minHeight: "100px",
                  backgroundColor: "#f9f9f9",
                  cursor: "default",
                  overflow: "auto",
                }}
              >
                {getText()}
              </div>
            </div>
          </div>

          <div className="form-group flex-1">
            <div style={{ justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <label className="form-label" style={{ margin: 0 }}>
                Audio
              </label>
              <div
                className="toggle-container"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", height: "60px", marginBottom: "37px" }}
              >
                <span style={{ fontSize: "14px", color: mode === "upload" ? "#ff6b6b" : "#666" }}>Upload</span>
                <div
                  className="toggle-switch"
                  onClick={toggleMode}
                  style={{
                    width: "40px",
                    height: "20px",
                    backgroundColor: "#eaeaea",
                    borderRadius: "10px",
                    position: "relative",
                    cursor: "pointer",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      backgroundColor: "#ff6b6b",
                      top: "1px",
                      left: mode === "upload" ? "1px" : "21px",
                      transition: "left 0.3s ease",
                    }}
                  ></div>
                </div>
                <span style={{ fontSize: "14px", color: mode === "record" ? "#ff6b6b" : "#666" }}>Record</span>
              </div>
            </div>

            {mode === "upload" ? (
              <>
                <input type="file" id="audio-file" accept="audio/*" onChange={handleFileChange} style={{ display: "none", minHeight: "100%" }} />
                <label htmlFor="audio-file" className="file-upload">
                  <div className="file-upload-text">
                    {audioFile ? <div className="file-name">{audioFile.name}</div> : <div>Drag & drop your audio file here or click to browse</div>}
                  </div>
                </label>
              </>
            ) : (
              <div className="file-upload" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                {recordingStatus === "idle" && (
                  <button
                    type="button"
                    onClick={startRecording}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 15C13.6569 15 15 13.6569 15 12V6C15 4.34315 13.6569 3 12 3C10.3431 3 9 4.34315 9 6V12C9 13.6569 10.3431 15 12 15Z"
                        fill="#ff6b6b"
                      />
                      <path d="M5 12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" />
                      <path d="M12 19V22" stroke="#ff6b6b" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span style={{ color: "#666", fontSize: "14px" }}>Click to start recording</span>
                  </button>
                )}

                {recordingStatus === "recording" && (
                  <button
                    type="button"
                    onClick={stopRecording}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "50%",
                        backgroundColor: "#ff6b6b",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        animation: "pulse 1.5s infinite",
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="6" y="6" width="12" height="12" rx="2" fill="white" />
                      </svg>
                    </div>
                    <span style={{ color: "#666", fontSize: "14px" }}>Recording... Click to stop</span>
                  </button>
                )}

                {recordingStatus === "recorded" && (
                  <div className="file-name" style={{ textAlign: "center" }}>
                    Recording complete
                  </div>
                )}
              </div>
            )}
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
        <style jsx>{`
          @keyframes pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
            }
            70% {
              box-shadow: 0 0 0 10px rgba(255, 107, 107, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
            }
          }
        `}</style>
      </form>
    </div>
  );
};

export default AudioUploadForm;
