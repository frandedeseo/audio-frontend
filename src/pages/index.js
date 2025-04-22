import AudioUploadForm from "@/components/AudioUploadForm";
import EvaluationTable from "@/components/EvaluationTable";
import Notification from "@/components/Notification";
import { useApiNotification } from "@/hooks/useApiNotification";
import { useState, useRef } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";

// Make sure your global or module CSS includes the .fade-* classes
// with both opacity and transform rules for enter and exit states.
// Example (in your external CSS file):
// .fade-enter { opacity: 0; transform: translateY(10px); }
// .fade-enter-active { opacity: 1; transform: translateY(0); transition: opacity 400ms ease-in-out, transform 400ms ease-in-out; }
// .fade-exit { opacity: 1; transform: translateY(0); }
// .fade-exit-active { opacity: 0; transform: translateY(-10px); transition: opacity 400ms ease-in-out, transform 400ms ease-in-out; }

export default function Home() {
  const [evaluationDisplayed, setEvaluationDisplayed] = useState(false);
  const [response, setResponse] = useState(null);
  const nodeRef = useRef(null);
  const { notification, showNotification, hideNotification } = useApiNotification();

  return (
    <div className="container">
      <div className="header">
        <h1>Analizador de fonética</h1>
        {!evaluationDisplayed && <p>Subí el audio del alumno leyendo y su respectivo texto que leyó</p>}
      </div>

      <SwitchTransition mode="out-in">
        <CSSTransition key={evaluationDisplayed ? "table" : "form"} nodeRef={nodeRef} timeout={400} classNames="fade" unmountOnExit>
          <div ref={nodeRef}>
            {evaluationDisplayed ? (
              <EvaluationTable response={response} />
            ) : (
              <AudioUploadForm setResponse={setResponse} setEvaluationDisplayed={setEvaluationDisplayed} showNotification={showNotification} />
            )}
          </div>
        </CSSTransition>
      </SwitchTransition>

      <Notification notification={notification} hideNotification={hideNotification} />
    </div>
  );
}
