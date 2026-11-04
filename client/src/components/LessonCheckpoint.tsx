import { useState } from "react";
import { ArrowRight, Check, CircleHelp, RotateCcw } from "lucide-react";

type RubricConcept = {
  label: string;
  alternatives: string[][];
};

type MultipleChoiceCheckpointProps = {
  id: string;
  kicker: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export function MultipleChoiceCheckpoint({
  id,
  kicker,
  prompt,
  options,
  correctIndex,
  explanation,
}: MultipleChoiceCheckpointProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const isCorrect = selected === correctIndex;
  const feedbackId = `${id}-feedback`;

  return (
    <article className={`checkpoint-card ${checked ? (isCorrect ? "is-correct" : "needs-review") : ""}`}>
      <div className="checkpoint-kicker"><span>{kicker}</span><CircleHelp size={17} aria-hidden="true" /></div>
      <fieldset className="checkpoint-fieldset">
        <legend>{prompt}</legend>
        <div className="checkpoint-options">
          {options.map((option, index) => (
            <label className={`checkpoint-option ${selected === index ? "is-selected" : ""} ${checked && index === correctIndex ? "is-right-answer" : ""} ${checked && selected === index && !isCorrect ? "is-wrong-choice" : ""}`} key={option}>
              <input
                type="radio"
                name={id}
                value={index}
                checked={selected === index}
                onChange={() => { setSelected(index); setChecked(false); }}
                aria-describedby={checked ? feedbackId : undefined}
              />
              <span className="checkpoint-option-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
              <span className="checkpoint-option-text">{option}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <button className="checkpoint-action" type="button" disabled={selected === null} aria-expanded={checked} aria-controls={feedbackId} onClick={() => setChecked(true)}>
        {checked ? "Checked · choose a different answer to retry" : "Check answer"}<ArrowRight size={17} aria-hidden="true" />
      </button>
      <div className={`checkpoint-feedback ${checked ? (isCorrect ? "is-correct" : "needs-review") : ""}`} id={feedbackId} role="status" aria-live="polite" hidden={!checked}>
        {checked && <>
          <strong>{isCorrect ? "Score 1/1 · Correct." : "Score 0/1 · Not quite—review the explanation."}</strong>
          <p><b>Best answer:</b> {options[correctIndex]}</p>
          <p>{explanation}</p>
        </>}
      </div>
    </article>
  );
}

type ShortAnswerCheckpointProps = {
  id: string;
  kicker: string;
  prompt: string;
  placeholder: string;
  modelAnswer: string;
  selfCheckPrompt?: string;
  rubric: RubricConcept[];
};

function normalizeForRubric(value: string) {
  return value.toLowerCase().replace(/⁺/g, "+").replace(/[^a-z0-9+]+/g, " ").trim().replace(/\s+/g, " ");
}

function matchesRubricConcept(response: string, concept: RubricConcept) {
  const normalizedResponse = normalizeForRubric(response);
  return concept.alternatives.some((alternative) =>
    alternative.every((term) => normalizedResponse.includes(normalizeForRubric(term))),
  );
}

export function ShortAnswerCheckpoint({
  id,
  kicker,
  prompt,
  placeholder,
  modelAnswer,
  selfCheckPrompt = "Compare your response with the model answer. Which key idea did you include?",
  rubric,
}: ShortAnswerCheckpointProps) {
  const [response, setResponse] = useState("");
  const [checked, setChecked] = useState(false);
  const [modelRevealed, setModelRevealed] = useState(false);
  const responseId = `${id}-response`;
  const feedbackId = `${id}-score-feedback`;
  const answerId = `${id}-model-answer`;
  const matchedConcepts = rubric.filter((concept) => matchesRubricConcept(response, concept));
  const missingConcepts = rubric.filter((concept) => !matchesRubricConcept(response, concept));

  return (
    <article className={`checkpoint-card short-answer-card ${checked ? (missingConcepts.length === 0 ? "is-correct" : "needs-review") : ""}`}>
      <div className="checkpoint-kicker"><span>{kicker}</span><CircleHelp size={17} aria-hidden="true" /></div>
      <label className="checkpoint-prompt" htmlFor={responseId}>{prompt}</label>
      <textarea id={responseId} value={response} onChange={(event) => { setResponse(event.target.value); setChecked(false); }} placeholder={placeholder} rows={3} />
      <button className="checkpoint-action" type="button" disabled={!response.trim()} aria-expanded={checked} aria-controls={feedbackId} onClick={() => setChecked(true)}>
        {checked ? `Auto-score · ${matchedConcepts.length}/${rubric.length} key ideas` : "Check answer"}<ArrowRight size={17} aria-hidden="true" />
      </button>
      <div className={`checkpoint-feedback ${checked ? (missingConcepts.length === 0 ? "is-correct" : "needs-review") : ""}`} id={feedbackId} role="status" aria-live="polite" hidden={!checked}>
        {checked && <>
          <strong>Auto-score: {matchedConcepts.length}/{rubric.length} key ideas identified.</strong>
          <p>{missingConcepts.length === 0 ? "All key ideas were detected. Compare with the model answer for nuance." : <>Ideas to revisit: {missingConcepts.map((concept) => concept.label).join("; ")}.</>}</p>
          <p className="self-check-prompt">This keyword check is a guide, not a final mark; different accurate wording may not match. Compare with the model answer.</p>
        </>}
      </div>
      <button className="checkpoint-action" type="button" disabled={!response.trim() || modelRevealed} aria-expanded={modelRevealed} aria-controls={answerId} onClick={() => setModelRevealed(true)}>
        {modelRevealed ? "Model answer shown" : "Reveal model answer"}{modelRevealed ? <Check size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
      </button>
      <div className="checkpoint-feedback model-answer" id={answerId} role="status" aria-live="polite" hidden={!modelRevealed}>
        {modelRevealed && <>
          <strong>Model answer</strong>
          <p>{modelAnswer}</p>
          <p className="self-check-prompt">{selfCheckPrompt}</p>
        </>}
      </div>
    </article>
  );
}

type SortItem = { id: string; label: string; correct: "retentate" | "filtrate" };

const filtrationItems: SortItem[] = [
  { id: "cell-walls", label: "Intact cell walls / coarse cell-wall fragments", correct: "retentate" },
  { id: "unmashed-tissue", label: "Unmashed strawberry tissue", correct: "retentate" },
  { id: "large-proteins", label: "Large structural proteins attached to debris", correct: "retentate" },
  { id: "soluble-dna", label: "Soluble DNA", correct: "filtrate" },
  { id: "water", label: "Water", correct: "filtrate" },
  { id: "salt", label: "Salt ions", correct: "filtrate" },
  { id: "detergent", label: "Soap / detergent molecules", correct: "filtrate" },
];

export function FiltrationSortCheckpoint() {
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const feedbackId = "session-2-filtration-feedback";
  const complete = filtrationItems.every((item) => selections[item.id]);
  const correctCount = filtrationItems.filter((item) => selections[item.id] === item.correct).length;

  return (
    <article className={`checkpoint-card filtration-sort-card ${checked ? "is-checked" : ""}`}>
      <div className="checkpoint-kicker"><span>SESSION 02 · Q1 / CATEGORISE &amp; SORT</span><CircleHelp size={17} aria-hidden="true" /></div>
      <h4>What stays in the filter, and what passes through?</h4>
      <p className="sort-instructions">Choose whether each item is retained as coarse retentate or passes into the liquid filtrate.</p>
      <div className="sort-list">
        {filtrationItems.map((item) => {
          const isRight = selections[item.id] === item.correct;
          return (
            <label className={`sort-row ${checked ? (isRight ? "is-right-answer" : "is-wrong-choice") : ""}`} key={item.id} htmlFor={`sort-${item.id}`}>
              <span>{item.label}</span>
              <select
                id={`sort-${item.id}`}
                value={selections[item.id] ?? ""}
                onChange={(event) => { setSelections((current) => ({ ...current, [item.id]: event.target.value })); setChecked(false); }}
                aria-label={`Classify ${item.label}`}
              >
                <option value="">Choose a destination</option>
                <option value="retentate">Retained in filter (retentate)</option>
                <option value="filtrate">Passes through (filtrate)</option>
              </select>
              {checked && <span className="sort-result">{isRight ? <><Check size={15} aria-hidden="true" /> Correct</> : `Correct: ${item.correct === "retentate" ? "Retained in filter" : "Passes through"}`}</span>}
            </label>
          );
        })}
      </div>
      <button className="checkpoint-action" type="button" disabled={!complete} aria-expanded={checked} aria-controls={feedbackId} onClick={() => setChecked(true)}>
        {checked ? `${correctCount} of ${filtrationItems.length} classified correctly` : "Check the sorting"}{checked ? <Check size={17} aria-hidden="true" /> : <ArrowRight size={17} aria-hidden="true" />}
      </button>
      <div className="checkpoint-feedback model-answer" id={feedbackId} role="status" aria-live="polite" hidden={!checked}>
        {checked && <>
          <strong>Score: {correctCount}/{filtrationItems.length} · {correctCount === filtrationItems.length ? "All sorted correctly." : "Check the corrections above."}</strong>
          <p>The filter retains coarse pulp and debris; soluble material—including DNA and some soluble proteins—can pass through. Filtration does not purify DNA by itself.</p>
          <p className="self-check-prompt"><RotateCcw size={15} aria-hidden="true" /> Change any selection to try the sort again.</p>
        </>}
      </div>
    </article>
  );
}
