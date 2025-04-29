import AudioUploadForm from "@/components/AudioUploadForm";
import EvaluationTable from "@/components/EvaluationTable";
import Notification from "@/components/Notification";
import { useApiNotification } from "@/hooks/useApiNotification";
import { useState, useRef } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Home() {
  const [evaluationDisplayed, setEvaluationDisplayed] = useState(false);
  const [response, setResponse] = useState(null);
  const nodeRef = useRef(null);
  const { notification, showNotification, hideNotification } = useApiNotification();

  return (
    <div className="container">
      <div className="header">
        {evaluationDisplayed && (
          <Button
            style={{ zIndex: 50, cursor: "pointer" }}
            className="left-[10px] absolute text-black"
            variant="outline"
            size="lg"
            onClick={() => setEvaluationDisplayed(false)}
          >
            <ArrowLeft className=" h-4 w-4" />
            Volver
          </Button>
        )}
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
