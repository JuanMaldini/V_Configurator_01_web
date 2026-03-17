import { useEffect, useRef, useState } from "react";
import { BsRecordCircle } from "react-icons/bs";
import { createIframeRecorderSession, downloadBlob } from "./iframeRecorder";
import "./recorder.css";

function runAfterPaint(task) {
  window.requestAnimationFrame(() => {
    window.setTimeout(task, 0);
  });
}

function RecorderToggle({ iframeRef }) {
  const sessionRef = useRef(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (status !== "error") return undefined;

    const timeoutId = window.setTimeout(() => {
      setStatus("idle");
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [status]);

  const handleStart = async () => {
    setStatus("requesting");
    runAfterPaint(async () => {
      try {
        const session = await createIframeRecorderSession({
          iframe: iframeRef.current,
        });

        sessionRef.current = session;
        setStatus("recording");

        session.result
          .then(({ blob, fileName }) => {
            downloadBlob(blob, fileName);
            sessionRef.current = null;
            setStatus("idle");
          })
          .catch(() => {
            sessionRef.current = null;
            setStatus("error");
          });
      } catch {
        sessionRef.current = null;
        setStatus("error");
      }
    });
  };

  const handleStop = () => {
    const session = sessionRef.current;
    if (!session) return;

    setStatus("converting");
    runAfterPaint(() => {
      session.stop().catch(() => {
        sessionRef.current = null;
        setStatus("error");
      });
    });
  };

  const isBusy = status === "requesting" || status === "converting";
  const isRecording = status === "recording" || status === "converting";

  return (
    <div className="vp-recorder-shell">
      <button
        type="button"
        className={[
          "vp-recorder-toggle",
          isRecording ? "is-recording" : "",
          status === "converting" ? "is-converting" : "",
          status === "requesting" ? "is-requesting" : "",
          status === "error" ? "is-error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={isRecording ? handleStop : handleStart}
        disabled={isBusy}
        aria-pressed={isRecording}
        aria-label={isRecording ? "Detener grabacion" : "Iniciar grabacion"}
      >
        <BsRecordCircle className="vp-recorder-icon" />
      </button>
    </div>
  );
}

export default RecorderToggle;