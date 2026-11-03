import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Dna,
  FlaskConical,
  Leaf,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";

const media = "/images/pptx/";
const pdfMedia = "/images/pdf/";

type ScienceTab = "what" | "why" | "how";

const scienceTabs: Array<{
  id: ScienceTab;
  label: string;
  kicker: string;
  title: string;
  copy: string;
  image: string;
  alt: string;
  caption: string;
  source?: "ppt" | "pdf";
}> = [
  {
    id: "what",
    label: "What",
    kicker: "The target",
    title: "A thread you can see.",
    copy: "DNA is packaged inside the nucleus of each strawberry cell. Mash the fruit, disrupt its membranes, remove the pulp, then make the DNA leave the liquid as pale, stringy fibres. The material you collect is a crude extract—not purified DNA.",
    image: "pdf-dna-model-diagonal.jpg",
    alt: "Colourful three-dimensional model of a DNA double helix, shown as two twisting molecular strands.",
    caption: "DNA / A double-helix model of the molecule packaged inside the nucleus.",
    source: "pdf",
  },
  {
    id: "why",
    label: "Why",
    kicker: "The strawberry advantage",
    title: "Eight sets. One visible result.",
    copy: "The cultivated strawberry used for this practical is octoploid: its cells have eight sets of chromosomes (8n). That can mean more DNA per cell than in a diploid organism, helping the precipitated material become easier to see. Ripe fruit is also soft and easy to mash.",
    image: "image-3-1.png",
    alt: "PowerPoint illustration comparing two chromosome sets with eight chromosome sets.",
    caption: "Octoploid means eight chromosome sets in each cell (8n).",
  },
  {
    id: "how",
    label: "How",
    kicker: "The route",
    title: "Break, separate, collect.",
    copy: "The method changes the solution in stages: mash the tissue, use detergent and salt to help release and gather DNA, filter away much of the pulp, and carefully layer cold ethanol over the filtrate. DNA fibres form where the two liquids meet.",
    image: "image-22-2.png",
    alt: "Diagram of the extraction stages from lysis buffer to filtration and DNA collection.",
    caption: "A sequence of physical separation and chemical changes reveals the fibres.",
  },
];

const steps = [
  {
    number: "01",
    label: "Mash the fruit",
    title: "Mash one hulled strawberry gently.",
    instructions: [
      "Place one hulled strawberry in a clean, sealable bag and close the seal.",
      "Mash gently for two minutes, until the fruit is thoroughly crushed.",
      "Use steady pressure rather than whipping air into the mixture; foam and very fine pulp make filtering harder.",
    ],
    reason: "Mashing breaks up the fruit tissue. The plant cell wall is a barrier; the detergent used later disrupts membranes, not the wall.",
    check: "The fruit is crushed and no longer whole, but the mixture is not frothy.",
    lookFor: "The fruit should look evenly crushed with no large pieces. You should not see DNA fibres yet—the tissue is only being broken up.",
    image: "pdf-stage1-crushing.jpg",
    source: "pdf" as const,
    alt: "Sealable bag of crushed strawberries beside a bowl of fruit and a bottle labelled extraction buffer.",
  },
  {
    number: "02",
    label: "Prepare the buffer",
    title: "Mix the buffer, then measure out 10 cm³.",
    instructions: [
      "Measure 90 cm³ water and 10 cm³ detergent into a clean container.",
      "Add 3 g salt and stir gently until the salt dissolves; avoid making foam.",
      "Measure 10 cm³ of the prepared buffer and add it to the mashed strawberry.",
    ],
    reason: "Detergent disrupts the cell membrane and nuclear envelope. Salt ions shield some of DNA’s negative charge so strands repel each other less.",
    check: "The salt has dissolved, and exactly 10 cm³ of buffer is added to the fruit.",
    lookFor: "The buffer should look mixed, with no visible salt crystals. After it is added, the fruit mixture will be wet and red; no pale fibres are expected yet.",
    image: "image-9-1.png",
    source: "ppt" as const,
    alt: "Illustration of water, detergent and salt being combined into a lysis buffer.",
  },
  {
    number: "03",
    label: "Filter the mixture",
    title: "Separate pulp from the liquid filtrate.",
    instructions: [
      "Place gauze in a funnel and position it over a clean tube.",
      "Pour the strawberry-and-buffer mixture slowly onto the gauze.",
      "Collect the liquid that passes through. The larger fruit pulp remains on the gauze.",
    ],
    reason: "The gauze retains much of the fruit pulp while the liquid filtrate—and dissolved cell contents—passes through.",
    check: "The tube holds liquid filtrate; most visible pulp is still in the gauze.",
    lookFor: "Red or pink liquid passes into the tube while larger pieces of pulp remain in the gauze. DNA fibres are not expected to be visible yet.",
    image: "pdf-stage2-filtration.jpg",
    source: "pdf" as const,
    alt: "Gauze-lined funnel drains red strawberry mixture into a clear beaker while retaining pulp.",
  },
  {
    number: "04",
    label: "Layer cold ethanol",
    title: "Add an equal volume without mixing the layers.",
    instructions: [
      "Measure 5 cm³ of filtrate into a clean tube.",
      "Measure 5 cm³ of ice-cold ethanol—the same volume as the filtrate.",
      "Slowly run the ethanol down the inside wall of the tube. It should sit above the filtrate; do not shake or stir.",
      "Look along the boundary between the two liquids for pale, stringy fibres.",
    ],
    reason: "DNA dissolves poorly in cold ethanol. With salt present, it gathers into pale fibres at the boundary between the layers.",
    check: "The layers remain distinct. Keep ethanol cold, capped and away from flames; follow your teacher’s instructions.",
    lookFor: "Look at the line where the upper ethanol layer meets the lower red filtrate. Pale, cloudy wisps or stringy fibres may collect there; do not stir the layers.",
    image: "pdf-stage3-ethanol.jpg",
    source: "pdf" as const,
    alt: "Test tube with red strawberry filtrate below a separate pale layer of cold ethanol.",
  },
  {
    number: "05",
    label: "Collect the fibres",
    title: "Spool the fibres from the liquid boundary.",
    instructions: [
      "Use a clean glass rod and gently touch its tip to the boundary between the two layers.",
      "Turn the rod slowly in one direction to wind the pale, stringy material around it.",
      "Describe the colour, texture and location of what you collected.",
    ],
    reason: "The fibres are precipitated material from a crude extract; they are not proof of pure DNA by sight alone.",
    check: "The glass rod is intact, and your notes describe what you observed without claiming the sample is pure.",
    lookFor: "Pale, slippery or stringy material should wind around the rod where it touches the liquid boundary. Record its colour, texture and location; appearance alone does not prove purity.",
    image: "pdf-stage4-spooling.jpg",
    source: "pdf" as const,
    alt: "A clean rod reaches into the tube at the liquid boundary to spool pale precipitated strands.",
  },
];

const whoAmI = [
  {
    clue: "I am the strawberry’s chromosome condition. I mean eight sets, written 8n.",
    answer: "Octoploid — the cultivated strawberry has eight sets of chromosomes.",
  },
  {
    clue: "I disrupt the cell membrane and nuclear envelope, but I do not dissolve the cell wall.",
    answer: "Detergent — it disrupts membranes and helps release cell contents.",
  },
  {
    clue: "I help shield DNA’s negative charges so the strands repel one another less.",
    answer: "Salt ions — they shield the negative charges along the DNA backbone.",
  },
  {
    clue: "I am added cold and carefully. DNA is poorly soluble in me, so pale fibres appear.",
    answer: "Ethanol — cold ethanol helps DNA precipitate from the filtrate.",
  },
];

const anatomyLayers = [
  { name: "Cell wall", detail: "A sturdy outer boundary around the plant cell. Detergent does not dissolve it; mashing helps break up the tissue and cell walls." },
  { name: "Cell membrane", detail: "A membrane around the cell contents. Detergent disrupts it, allowing contents to mix into the liquid." },
  { name: "Nuclear envelope", detail: "A membrane around the nucleus, where the DNA is packaged. Detergent disrupts this membrane too." },
];

const methodQuestions = [
  {
    id: "mashing",
    prompt: "Why mash the strawberry gently for two minutes?",
    options: ["To break up the fruit tissue while limiting foam and very fine pulp.", "To dissolve the cell wall using detergent.", "To precipitate the DNA before filtering."],
    correctIndex: 0,
    explanation: "Mashing breaks up the tissue. Vigorous blending can add foam and create very fine pulp that makes separation harder.",
  },
  {
    id: "detergent",
    prompt: "What does detergent do in this practical?",
    options: ["It dissolves the plant cell wall.", "It disrupts the cell membrane and nuclear envelope.", "It makes DNA positively charged."],
    correctIndex: 1,
    explanation: "Detergent disrupts membranes around the cell and nucleus. It does not dissolve the cell wall; mashing helps break up the tissue.",
  },
  {
    id: "buffer-volume",
    prompt: "How much prepared buffer is added to the mashed fruit?",
    options: ["5 cm³", "10 cm³", "100 cm³"],
    correctIndex: 1,
    explanation: "Prepare the buffer from 90 cm³ water, 10 cm³ detergent and 3 g salt, then measure out 10 cm³ for the mashed fruit.",
  },
  {
    id: "ethanol-layer",
    prompt: "How should the cold ethanol be added?",
    options: ["Pour an equal volume quickly, then shake the tube.", "Slowly add an equal volume down the tube wall and keep the layers separate.", "Add a few drops while stirring the filtrate."],
    correctIndex: 1,
    explanation: "Use 5 cm³ ethanol for 5 cm³ filtrate. Add it slowly so the ethanol remains as a separate upper layer above the filtrate.",
  },
  {
    id: "visible-fibres",
    prompt: "What can you conclude when pale fibres appear?",
    options: ["The fibres prove the sample is pure DNA.", "A crude extract has precipitated; appearance alone cannot prove purity.", "The cell wall has turned into DNA."],
    correctIndex: 1,
    explanation: "The visible material can include DNA alongside RNA, proteins and cell-wall material. Describe what you saw, but do not claim it is pure DNA by sight alone.",
  },
];

function useScrollReveal() {
  useEffect(() => {
    const blocks = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      blocks.forEach((block) => block.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" },
    );
    blocks.forEach((block) => observer.observe(block));
    return () => observer.disconnect();
  }, []);
}

function Figure({
  image,
  alt,
  caption,
  className = "",
  source = "ppt",
}: {
  image: string;
  alt: string;
  caption: string;
  className?: string;
  source?: "ppt" | "pdf";
}) {
  const imageBase = source === "pdf" ? pdfMedia : media;
  return (
    <figure className={`image-plate ${className}`}>
      <img src={`${imageBase}${image}`} alt={alt} loading="lazy" />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

export default function Home() {
  useScrollReveal();
  const [activeTab, setActiveTab] = useState<ScienceTab>("what");
  const [starterOpen, setStarterOpen] = useState(false);
  const [starterLayer, setStarterLayer] = useState("");
  const [starterRevealed, setStarterRevealed] = useState(false);
  const [revealedLayers, setRevealedLayers] = useState<number[]>([]);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const [quizChoice, setQuizChoice] = useState("");
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [troubleshootingOpen, setTroubleshootingOpen] = useState(false);
  const [methodSelections, setMethodSelections] = useState<Record<string, number>>({});
  const [checkedMethodQuestions, setCheckedMethodQuestions] = useState<string[]>([]);

  const selectedScience = scienceTabs.find((tab) => tab.id === activeTab)!;
  const checkedMethodCount = checkedMethodQuestions.length;
  const correctMethodCount = methodQuestions.filter((question) =>
    checkedMethodQuestions.includes(question.id) && methodSelections[question.id] === question.correctIndex,
  ).length;
  const revealWhoAmI = (index: number) => {
    setRevealedCards((current) => current.includes(index) ? current : [...current, index]);
  };
  const toggleAnatomyLayer = (index: number) => {
    setRevealedLayers((current) =>
      current.includes(index) ? current.filter((item) => item !== index) : [...current, index],
    );
  };
  const selectMethodAnswer = (questionId: string, optionIndex: number) => {
    setMethodSelections((current) => ({ ...current, [questionId]: optionIndex }));
    setCheckedMethodQuestions((current) => current.filter((id) => id !== questionId));
  };
  const checkMethodAnswer = (questionId: string) => {
    if (methodSelections[questionId] === undefined) return;
    setCheckedMethodQuestions((current) => current.includes(questionId) ? current : [...current, questionId]);
  };
  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? scienceTabs.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : scienceTabs.length - 1)) % scienceTabs.length;
    const next = scienceTabs[nextIndex];
    setActiveTab(next.id);
    document.getElementById(`science-tab-${next.id}`)?.focus();
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to the practical guide</a>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Strawberry DNA field guide home">
          <span className="brand-mark"><Leaf size={18} strokeWidth={2.2} /></span>
          <span className="brand-name">FIELD / NOTES <small>SCIENCE PRACTICAL 01</small></span>
        </a>
        <nav className="top-nav" aria-label="Page sections">
          <a href="#science">The science</a>
          <a href="#method">The method</a>
          <a href="#plenary">Quick check</a>
        </nav>
        <a className="header-cta" href="#method">Go to the method <ArrowUpRight size={15} /></a>
      </header>

      <main id="main-content">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <figure className="hero-photo-banner">
            <img src={`${pdfMedia}pdf-header-lab.jpg`} alt="Wide laboratory bench with strawberries, a beaker of crushed fruit, a test tube and glassware." fetchPriority="high" />
            <div className="hero-copy hero-overlay-copy">
              <p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> FIELD GUIDE 01 <span className="eyebrow-divider">/</span> DNA EXTRACTION</p>
              <h1 id="hero-title">A berry full<br />of <em>instructions.</em></h1>
              <p className="hero-deck">Unlock the code inside a strawberry. Follow the science from crushed fruit to visible, pale DNA fibres.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="#science">Explore the science <ArrowRight size={16} /></a>
                <a className="button button-ghost" href="#method">Jump to the method <ArrowDown size={15} /></a>
              </div>
              <div className="hero-meta">
                <span><Timer size={16} /> About 20–30 min</span>
                <span><ShieldCheck size={16} /> Teacher-supervised</span>
              </div>
            </div>
            <figcaption><span>LAB NOTE 001 / STRAWBERRY DNA EXTRACTION</span><span>OCTOPLOID / 8n</span></figcaption>
          </figure>
        </section>

        <section className="objectives section-wrap" aria-labelledby="objectives-title">
          <div className="section-heading section-heading-row reveal">
            <div><p className="eyebrow"><span>01</span> / YOUR FIELD BRIEF</p><h2 id="objectives-title">Three goals.<br /><em>One tiny cell.</em></h2></div>
            <p className="section-intro">By the end, you’ll be able to explain what each step does—not just follow a recipe.</p>
          </div>
          <div className="objective-grid">
            <article className="objective-card reveal"><span className="objective-number">01</span><span className="objective-icon"><Dna size={20} /></span><h3>Make DNA visible</h3><p>Extract pale, stringy material from strawberry cells and describe what you observe.</p><span className="objective-tag">OBSERVE</span></article>
            <article className="objective-card reveal"><span className="objective-number">02</span><span className="objective-icon"><FlaskConical size={20} /></span><h3>Explain the reagents</h3><p>Connect detergent, salt and cold ethanol to the job each does in the extraction.</p><span className="objective-tag">EXPLAIN</span></article>
            <article className="objective-card reveal"><span className="objective-number">03</span><span className="objective-icon"><ShieldCheck size={20} /></span><h3>Work safely</h3><p>Follow the method carefully, identify hazards and assess what the result can—and cannot—show.</p><span className="objective-tag">EVALUATE</span></article>
          </div>
          <div className="vocabulary-strip reveal"><span className="vocab-label">WORDS TO KNOW</span><span><b>Lysis</b> breaking open cells</span><span><b>Filtration</b> separating pulp from liquid</span><span><b>Precipitation</b> DNA leaving solution as a solid</span><span><b>Spooling</b> winding fibres around a rod</span></div>
        </section>

        <section className="science-section" id="science" aria-labelledby="science-title">
          <div className="section-wrap science-wrap">
            <div className="section-heading section-heading-row reveal">
              <div><p className="eyebrow"><span>02</span> / THE SCIENCE</p><h2 id="science-title">Know the <em>why.</em></h2></div>
              <p className="section-intro">Tap through the story of the extraction. Every stage has a job.</p>
            </div>
            <div className="science-tabs" role="tablist" aria-label="Explore the science">
              {scienceTabs.map((tab, index) => (
                <button
                  className={`science-tab ${activeTab === tab.id ? "is-active" : ""}`}
                  id={`science-tab-${tab.id}`}
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls="science-panel"
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  onClick={() => setActiveTab(tab.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                >
                  <span>0{index + 1}</span>{tab.label}<ArrowUpRight size={16} />
                </button>
              ))}
            </div>
            <div className="science-panel reveal" id="science-panel" role="tabpanel" aria-labelledby={`science-tab-${activeTab}`} tabIndex={0}>
              <div className="science-panel-copy">
                <p className="eyebrow">{selectedScience.kicker}</p>
                <h3>{selectedScience.title}</h3>
                <p>{selectedScience.copy}</p>
                {activeTab === "why" && <div className="octoploid-callout"><strong>8<span>n</span></strong><span><b>OCTOPLOID</b><small>8 sets of chromosomes<br />in each cell</small></span><p>More chromosome sets can mean more DNA per cell—one reason strawberry DNA is easier to see in this classroom extraction.</p></div>}
                {activeTab === "how" && <div className="science-mini-note"><Sparkles size={16} /><span><b>Key idea</b> The white material is a crude extract, not pure DNA.</span></div>}
              </div>
              <Figure image={selectedScience.image} source={selectedScience.source} alt={selectedScience.alt} caption={selectedScience.caption} className="science-figure" />
            </div>
          </div>
        </section>

        <section className="mechanisms section-wrap" aria-labelledby="mechanism-title">
          <div className="section-heading section-heading-row reveal">
            <div className="mechanisms-heading-copy"><p className="eyebrow"><span>03</span> / REAGENT LOGIC</p><h2 id="mechanism-title">The chemistry<br />behind the <em>fibres.</em></h2><p className="section-intro">Three mechanisms help move DNA from a cell into a visible, collectable form.</p></div>
          </div>
          <div className="mechanism-table-wrap reveal" role="region" aria-label="Biochemical mechanism matrix" tabIndex={0}>
            <table className="mechanism-table">
              <caption className="sr-only">How lysis, charge shielding and precipitation help reveal strawberry DNA</caption>
              <thead><tr><th scope="col">MECHANISM</th><th scope="col">WHAT DOES IT?</th><th scope="col">WHAT HAPPENS?</th><th scope="col">WHAT YOU NOTICE</th></tr></thead>
              <tbody>
                <tr><th scope="row"><span className="table-index">01</span><span className="mechanism-name">Lysis</span></th><td>Detergent</td><td>Disrupts the cell membrane and nuclear envelope. Mashing breaks up the tissue and cell walls.</td><td>DNA and other cell contents enter the liquid.</td></tr>
                <tr><th scope="row"><span className="table-index">02</span><span className="mechanism-name">Charge shielding</span></th><td>Salt ions</td><td>Shield some of DNA’s negative charges, reducing repulsion between strands. The charge is not erased.</td><td>DNA strands can gather more readily.</td></tr>
                <tr><th scope="row"><span className="table-index">03</span><span className="mechanism-name">Precipitation</span></th><td>Ice-cold ethanol</td><td>DNA is poorly soluble in cold ethanol; with salt present, it leaves the liquid as a precipitate.</td><td>Pale fibres form at the boundary between liquid layers.</td></tr>
              </tbody>
            </table>
          </div>
          <div className="mechanism-footnote reveal"><span className="footnote-mark">i</span><p><b>One important distinction.</b> Detergent disrupts membranes; it does not dissolve the plant cell wall. In this method, mashing helps break up the tissue.</p></div>
          <div className="mechanism-art-row reveal">
            <Figure image="image-10-1.png" alt="Illustration of detergent disrupting a cell membrane and releasing cell contents." caption="01 / Membrane disruption" />
            <Figure image="image-11-1.png" alt="Diagram showing salt ions shielding negative charges near DNA." caption="02 / Charge shielding" />
            <Figure image="image-14-1.png" alt="Comparison of separated DNA strands with DNA gathered into a precipitate." caption="03 / DNA gathers" />
          </div>
          <div className="applications-block reveal">
            <div className="applications-intro"><p className="eyebrow"><span>04</span> / BEYOND THE BEAKER</p><h3>DNA extraction opens up bigger questions.</h3><p>Once DNA is available for analysis, it can support crop research, species identification, diagnosis and forensic work.</p></div>
            <div className="applications-grid">
              <article className="application-card"><div className="application-copy"><span>FIELD APPLICATION 01</span><h4>Research &amp; farming</h4><p>DNA analysis supports sequencing, crop breeding and identifying species.</p></div><Figure image="image-19-1.jpg" alt="Laboratory analysis instrument shown in the PowerPoint’s DNA applications slide." caption="SOURCE DIAGRAM / DNA analysis in research" /></article>
              <article className="application-card"><div className="application-copy"><span>FIELD APPLICATION 02</span><h4>Health &amp; forensics</h4><p>DNA analysis can support diagnosis and forensic identification.</p></div><Figure image="image-19-2.png" alt="Illustration of a DNA analysis readout from the PowerPoint’s applications slide." caption="SOURCE DIAGRAM / Analysis readout" /></article>
            </div>
          </div>
        </section>

        <section className="starter-section" id="starter" aria-labelledby="starter-title">
          <div className="starter-inner section-wrap">
            <div className="starter-topline"><p className="eyebrow eyebrow-light"><span>04</span> / STARTER</p><span className="starter-chip"><CircleHelp size={14} /> PREDICT BEFORE YOU REVEAL</span></div>
            <div className="starter-headline"><h2 id="starter-title">What gets <em>in the way?</em></h2><p>Before the practical, trace a route from the fruit tissue to the DNA inside the nucleus.</p></div>
            <button className="accordion-trigger starter-trigger" type="button" aria-expanded={starterOpen} aria-controls="starter-panel" onClick={() => setStarterOpen((open) => !open)}>
              <span><b>{starterOpen ? "Close the starter" : "Open the starter"}</b><small>Cell anatomy · 2-minute prediction</small></span><span className="trigger-icon"><ChevronDown size={20} /></span>
            </button>
            <div className="starter-panel" id="starter-panel" hidden={!starterOpen}>
              <div className="starter-question"><span className="question-number">Q1</span><div><h3>Which layer does detergent <em>not</em> break?</h3><p>Tap your prediction. Then reveal the explanation.</p></div></div>
              <div className="layer-options" role="group" aria-label="Choose the cell layer detergent does not break">
                {["Cell wall", "Cell membrane", "Nuclear envelope"].map((layer) => <button className={`layer-option ${starterLayer === layer ? "selected" : ""}`} key={layer} type="button" aria-pressed={starterLayer === layer} onClick={() => { setStarterLayer(layer); setStarterRevealed(false); }}>{layer}<span>{starterLayer === layer && <Check size={15} />}</span></button>)}
              </div>
              <div className="answer-row"><button className="answer-button" type="button" aria-expanded={starterRevealed} onClick={() => setStarterRevealed((visible) => !visible)}>{starterRevealed ? "Hide answer" : "Reveal answer"}<ChevronDown size={15} /></button>{starterRevealed && <p className="answer-text" role="status"><b>The cell wall.</b> Detergent disrupts the cell membrane and nuclear envelope. Mashing helps break up the strawberry tissue and cell walls.</p>}</div>
              <Figure image="image-5-1.png" alt="Large labelled plant cell diagram showing the cell wall, plasma membrane and nuclear envelope." caption="CELL ANATOMY / Follow the boundaries from the outside of the cell to the nucleus." className="starter-figure" />
              <div className="anatomy-reveal">
                <p className="anatomy-reveal-intro">Tap each layer to reveal what it does.</p>
                <div className="anatomy-layer-grid" role="group" aria-label="Reveal the role of each plant cell layer">
                  {anatomyLayers.map((layer, index) => {
                    const isRevealed = revealedLayers.includes(index);
                    return <article className={`anatomy-layer-card ${isRevealed ? "is-revealed" : ""}`} key={layer.name}>
                      <button className="anatomy-layer-toggle" type="button" aria-expanded={isRevealed} aria-controls={`anatomy-layer-${index}`} onClick={() => toggleAnatomyLayer(index)}>
                        <span>{layer.name}</span><span>{isRevealed ? "Hide layer" : "Reveal layer"}<ChevronDown size={14} /></span>
                      </button>
                      <p id={`anatomy-layer-${index}`} hidden={!isRevealed} role="status">{layer.detail}</p>
                    </article>;
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="safety-section section-wrap" id="safety" aria-labelledby="safety-title">
          <div className="section-heading section-heading-row reveal">
            <div className="safety-heading-copy"><p className="eyebrow"><span>05</span> / SAFETY CHECK</p><h2 id="safety-title">Good science starts <em>carefully.</em></h2><p className="section-intro">Read the control before handling each material. Follow your teacher’s local instructions.</p></div>
          </div>
          <div className="risk-table-wrap reveal" role="region" aria-label="Risk assessment and controls" tabIndex={0}>
            <table className="risk-table">
              <caption className="sr-only">Hazards and control measures for the strawberry DNA extraction practical</caption>
              <thead><tr><th scope="col">MATERIAL / HAZARD</th><th scope="col">RISK</th><th scope="col">CONTROL MEASURE</th><th scope="col">CHECK</th></tr></thead>
              <tbody>
                <tr><th scope="row"><span className="risk-icon risk-icon-amber"><FlaskConical size={18} /></span><span className="risk-material">Cold ethanol<small>Flammable liquid / vapour</small></span></th><td><span className="risk-pill amber">Flammable</span><p>Vapour may irritate.</p></td><td>Keep capped, cold and away from flames. Use only as directed by the teacher.</td><td><span className="control-check"><Check size={15} /> No ignition sources</span></td></tr>
                <tr><th scope="row"><span className="risk-icon risk-icon-blue"><Sparkles size={18} /></span><span className="risk-material">Detergent<small>Eye / skin irritant</small></span></th><td><span className="risk-pill blue">Irritant</span><p>Splash contact can irritate.</p></td><td>Wear eye protection. Rinse splashes promptly with plenty of water and tell the teacher.</td><td><span className="control-check"><Check size={15} /> Goggles on</span></td></tr>
                <tr><th scope="row"><span className="risk-icon risk-icon-red"><ShieldCheck size={18} /></span><span className="risk-material">Glass and spills<small>Breakage / wet surfaces</small></span></th><td><span className="risk-pill red">Cuts / slips</span><p>Broken glass can cut; liquid can make floors slippery.</p></td><td>Check glassware before use. Report breakages; clean spills promptly using your class procedure.</td><td><span className="control-check"><Check size={15} /> Clear bench</span></td></tr>
              </tbody>
            </table>
          </div>
          <p className="safety-note reveal"><ShieldCheck size={17} /> Wear eye protection as instructed and keep the work area clear. Your teacher’s risk assessment takes priority.</p>
        </section>

        <section className="method-section" id="method" aria-labelledby="method-title">
          <div className="section-wrap">
            <div className="section-heading section-heading-row reveal">
              <div className="method-heading-copy"><p className="eyebrow"><span>06</span> / THE PRACTICAL</p><h2 id="method-title">Five moves to <em>visible DNA.</em></h2><p className="section-intro">Start with the kit checklist, then follow each numbered mini-step in order. Keep the filtrate and ethanol layers separate. Look for pale, stringy fibres only after cold ethanol meets the filtrate.</p></div>
            </div>
            <section className="materials-prep reveal" aria-labelledby="prep-title">
              <div className="materials-prep-heading"><p className="eyebrow"><span>BEFORE STEP 01</span> / SET UP</p><h3 id="prep-title">Get every material ready first.</h3><p>Prepare the buffer before it touches the fruit. Measure slowly and keep the work area clear.</p></div>
              <div className="prep-inventory">
                <article><h4>Reagents</h4><ul><li>One hulled strawberry</li><li>90 cm³ water</li><li>10 cm³ detergent</li><li>3 g salt</li><li>Ice-cold ethanol: 5 cm³ for each 5 cm³ filtrate</li></ul></article>
                <article><h4>Equipment &amp; safety</h4><ul><li>Sealable bag</li><li>Gauze-lined funnel and clean tube</li><li>Clean glass rod</li><li>Wear goggles; keep ethanol capped, cold and away from flames.</li></ul></article>
              </div>
            </section>
            <figure className="process-ribbon reveal"><img src={`${media}image-16-1.png`} alt="Five-stage summary: mash strawberry, add detergent and salt, filter pulp, layer ice-cold ethanol and spool DNA fibres." loading="lazy" /><figcaption>THE EXTRACTION / From fruit to fibres, at a glance</figcaption></figure>
            <section className="demonstration reveal" aria-labelledby="video-title">
              <div className="demonstration-heading"><div><p className="eyebrow"><span>VIDEO</span> / PRACTICAL DEMONSTRATION</p><h3 id="video-title">Watch the layering<br />and spooling technique.</h3></div><p>Use the clip to observe how to pour the cold ethanol gently and collect fibres at the liquid boundary.</p></div>
              <div className="video-frame"><iframe src="https://www.youtube.com/embed/W1DVEtzrl9g?feature=oembed" title="Strawberry DNA extraction demonstration: layering ethanol and spooling DNA fibres" loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
              <div className="video-foot"><span>POWERPOINT VIDEO LINK / YOUTUBE</span><a href="https://www.youtube.com/watch?v=W1DVEtzrl9g" target="_blank" rel="noreferrer">Open the video on YouTube <ArrowUpRight size={16} /></a></div>
            </section>
            <ol className="timeline-list">
            {steps.map((step) => (
                <li className="timeline-step reveal" key={step.number}>
                  <div className="timeline-rail"><span>{step.number}</span><i /></div>
                  <article className="step-card">
                    <div className="step-topline"><span className="step-label">{step.label}</span><span className="step-time">STEP {step.number}</span></div>
                    <h3>{step.title}</h3>
                    <ol className="step-instructions" aria-label={`Detailed instructions: ${step.label}`}>
                      {step.instructions.map((instruction, index) => <li key={instruction}><span>{String(index + 1).padStart(2, "0")}</span><p>{instruction}</p></li>)}
                    </ol>
                    <div className="step-reason"><span>WHY IT MATTERS</span><p>{step.reason}</p></div>
                    <div className="step-observe"><span>WHAT TO LOOK FOR</span><p>{step.lookFor}</p></div>
                    <Figure image={step.image} source={step.source} alt={step.alt} caption={`STEP ${step.number} / ${step.label.toUpperCase()}`} className="step-figure" />
                    <div className="step-check"><Check size={16} /><span><b>Bench check</b> {step.check}</span></div>
                  </article>
                </li>
              ))}
            </ol>
            <section className="method-checks reveal" aria-labelledby="method-check-title">
              <div className="method-checks-heading">
                <div><p className="eyebrow eyebrow-light"><span>PAUSE &amp; PREDICT</span> / RETRIEVAL CHECK</p><h3 id="method-check-title">Think it through.<br /><em>Then check.</em></h3><p>Choose one answer for each question. The answer and explanation stay hidden until you select “Check answer”.</p></div>
                <p className="method-check-score" aria-live="polite">{checkedMethodCount} / {methodQuestions.length} checked<br /><strong>{correctMethodCount} correct</strong></p>
              </div>
              <div className="method-question-grid">
                {methodQuestions.map((question, questionIndex) => {
                  const selected = methodSelections[question.id];
                  const isChecked = checkedMethodQuestions.includes(question.id);
                  const isCorrect = selected === question.correctIndex;
                  const feedbackId = `method-answer-${question.id}`;
                  return <article className={`method-question-card ${isChecked ? (isCorrect ? "is-correct" : "needs-review") : ""}`} key={question.id}>
                    <div className="method-question-kicker"><span>QUESTION 0{questionIndex + 1}</span><span>{isChecked ? (isCorrect ? "CORRECT" : "REVIEW") : "NOT YET CHECKED"}</span></div>
                    <h4>{question.prompt}</h4>
                    <div className="method-options" role="group" aria-label={`Answer choices for question ${questionIndex + 1}`}>
                      {question.options.map((option, optionIndex) => {
                        const isSelected = selected === optionIndex;
                        const isRightAnswer = isChecked && optionIndex === question.correctIndex;
                        const isWrongChoice = isChecked && isSelected && !isCorrect;
                        return <button className={`method-option ${isSelected ? "is-selected" : ""} ${isRightAnswer ? "is-right-answer" : ""} ${isWrongChoice ? "is-wrong-choice" : ""}`} key={option} type="button" aria-pressed={isSelected} onClick={() => selectMethodAnswer(question.id, optionIndex)}>
                          <span>{String.fromCharCode(65 + optionIndex)}</span>{option}
                        </button>;
                      })}
                    </div>
                    <button className="method-check-button" type="button" disabled={selected === undefined} aria-expanded={isChecked} aria-controls={feedbackId} onClick={() => checkMethodAnswer(question.id)}>{isChecked ? "Answer checked · choose again to retry" : "Check answer"}<ArrowRight size={17} /></button>
                    <div className={`method-feedback ${isCorrect ? "is-correct" : "needs-review"}`} id={feedbackId} hidden={!isChecked} role="status" aria-live="polite">
                      {isChecked && <><strong>{isCorrect ? "That’s right." : "Not quite—here is the answer."}</strong><p><b>Best answer:</b> {question.options[question.correctIndex]}</p><p>{question.explanation}</p></>}
                    </div>
                  </article>;
                })}
              </div>
            </section>
            <div className="method-endnote reveal"><span className="endnote-mark">OBSERVE</span><p>Write down where the fibres formed and what they looked like. A visible precipitate is a useful observation—not a purity test.</p><ArrowRight size={18} /></div>
          </div>
        </section>

        <section className="plenary-section" id="plenary" aria-labelledby="plenary-title">
          <div className="section-wrap plenary-wrap">
            <div className="section-heading section-heading-row reveal">
              <div><p className="eyebrow eyebrow-light"><span>07</span> / PLENARY</p><h2 id="plenary-title">Who <em>am I?</em></h2></div>
              <p className="section-intro">Four clues. Tap “Reveal answer” when you’re ready to check your recall.</p>
            </div>
            <div className="who-grid">
              {whoAmI.map((card, index) => {
                const isRevealed = revealedCards.includes(index);
                return <article className={`who-card reveal ${isRevealed ? "is-visible is-revealed" : ""}`} key={card.answer}>
                  <div className="who-card-top"><span>CLUE 0{index + 1}</span><span className="who-orbit"><Dna size={18} /></span></div>
                  <p className="who-question">“{card.clue}”</p>
                  <button className="answer-button answer-button-light" type="button" aria-expanded={isRevealed} disabled={isRevealed} onClick={() => revealWhoAmI(index)}>{isRevealed ? "Answer revealed" : "Reveal answer"}{!isRevealed && <ChevronDown size={15} />}</button>
                  {isRevealed && <p className="who-answer" role="status"><Check size={16} /> {card.answer}</p>}
                </article>;
              })}
            </div>
            <div className="final-quiz reveal">
              <div className="final-quiz-heading"><span className="quiz-symbol"><CircleHelp size={21} /></span><div><p className="eyebrow eyebrow-light">LAST CHECK / 01</p><h3>Why does cold ethanol make DNA visible?</h3></div></div>
              <div className="quiz-options" role="group" aria-label="Choose why cold ethanol makes DNA visible">
                {["DNA stays dissolved in cold ethanol.", "Ethanol digests the cell wall.", "Ethanol turns histones into crystals.", "Cold ethanol makes DNA precipitate."].map((answer, index) => <button className={`quiz-option ${quizChoice === answer ? "selected" : ""} ${quizSubmitted && answer === "Cold ethanol makes DNA precipitate." ? "correct" : ""}`} key={answer} type="button" aria-pressed={quizChoice === answer} onClick={() => { setQuizChoice(answer); setQuizSubmitted(false); }}><span>{String(index + 1).padStart(2, "0")}</span>{answer}{quizSubmitted && answer === "Cold ethanol makes DNA precipitate." && <Check size={16} />}</button>)}
              </div>
              <div className="quiz-submit-row"><button className="button button-primary" type="button" disabled={!quizChoice} onClick={() => setQuizSubmitted(true)}>Check my answer <ArrowRight size={16} /></button>{quizSubmitted && <p className={`quiz-feedback ${quizChoice === "Cold ethanol makes DNA precipitate." ? "is-correct" : "is-incorrect"}`} role="status" aria-live="polite">{quizChoice === "Cold ethanol makes DNA precipitate." ? "Correct. DNA is poorly soluble in cold ethanol and forms a precipitate." : "Not quite. Think about what happens to DNA’s solubility in cold ethanol."}</p>}</div>
            </div>
            <div className="troubleshoot reveal">
              <div><span className="troubleshoot-label">TROUBLESHOOTING</span><h3>No white fibres appeared. What might have gone wrong?</h3></div>
              <button className="answer-button answer-button-light" type="button" aria-expanded={troubleshootingOpen} aria-controls="troubleshooting-answer" onClick={() => setTroubleshootingOpen((open) => !open)}>{troubleshootingOpen ? "Hide checks" : "Reveal checks"}<ChevronDown size={15} /></button>
              <div className="troubleshooting-answer" id="troubleshooting-answer" hidden={!troubleshootingOpen}><p>Check the method rather than guessing: was the ethanol properly chilled and poured gently? Did the buffer contain salt? Was the fruit mashed and the pulp filtered out? Ask your teacher before repeating a step.</p></div>
            </div>
            <div className="limits-note reveal"><span className="limits-icon"><Sparkles size={18} /></span><p><b>Keep the claim careful.</b> The white material is a crude extract and may contain RNA, proteins and cell-wall material. Enzymes can break DNA down; cold slows this process. Seeing fibres does not show that the sample is pure DNA.</p></div>
            <Figure image="image-18-1.png" alt="Tube illustration labelling DNA, RNA, proteins and cell-wall debris in a crude strawberry extract." caption="LIMITS / A visible extract can contain DNA alongside other cell material." className="limits-figure reveal" />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-inner"><a className="brand brand-footer" href="#top"><span className="brand-mark"><Leaf size={17} /></span><span className="brand-name">FIELD / NOTES <small>STRAWBERRY DNA EXTRACTION</small></span></a><p>Look closely. Explain each step. Keep the science honest.</p><a className="back-top" href="#top">BACK TO TOP <ArrowUpRight size={14} /></a></div>
        <div className="footer-bottom"><span>CLASSROOM PRACTICAL / 01</span><span>BUILT FROM YOUR STRAWBERRY DNA SLIDES</span><span>8N · OCTOPLOID</span></div>
      </footer>
    </div>
  );
}
