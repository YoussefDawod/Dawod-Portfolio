import { useState, useEffect, useRef, useCallback } from "react";
import "./typewriter.css";

const WORDS = ["UI/UX", "React", "JavaScript", "Frontend"];
const WRITE_SPEED = 90;
const DELETE_SPEED = 55;
const PAUSE_AFTER_WRITE = 1800;
const PAUSE_AFTER_DELETE = 300;

function Typewriter() {
  const [displayed, setDisplayed] = useState("");
  const wordIndex = useRef(0);
  const charIndex = useRef(0);
  const isDeleting = useRef(false);
  const timeoutId = useRef(null);

  const tick = useCallback(() => {
    const currentWord = WORDS[wordIndex.current];

    if (!isDeleting.current) {
      charIndex.current++;
      setDisplayed(currentWord.slice(0, charIndex.current));

      if (charIndex.current === currentWord.length) {
        isDeleting.current = true;
        timeoutId.current = setTimeout(() => tick(), PAUSE_AFTER_WRITE);
      } else {
        timeoutId.current = setTimeout(() => tick(), WRITE_SPEED);
      }
    } else {
      charIndex.current--;
      setDisplayed(currentWord.slice(0, charIndex.current));

      if (charIndex.current === 0) {
        isDeleting.current = false;
        wordIndex.current = (wordIndex.current + 1) % WORDS.length;
        timeoutId.current = setTimeout(() => tick(), PAUSE_AFTER_DELETE);
      } else {
        timeoutId.current = setTimeout(() => tick(), DELETE_SPEED);
      }
    }
  }, []);

  useEffect(() => {
    timeoutId.current = setTimeout(tick, PAUSE_AFTER_DELETE);
    return () => clearTimeout(timeoutId.current);
  }, [tick]);

  return (
    <span className="typewriter">
      <span className="typewriter-text">{displayed}</span>
      <span className="typewriter-cursor" />
      <span className="typewriter-sep" />
      <span className="typewriter-fixed">Entwickler</span>
    </span>
  );
}

export default Typewriter;
