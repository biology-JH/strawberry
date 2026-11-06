#!/usr/bin/env python3
"""Generate the static, student-facing strawberry DNA extraction worksheet PDF."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Flowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "client" / "public" / "strawberry-dna-student-worksheet.pdf"
PAGE_W, PAGE_H = A4
MARGIN_X = 17 * mm
CONTENT_W = PAGE_W - 2 * MARGIN_X

INK = colors.HexColor("#2f3e34")
GREEN = colors.HexColor("#526a59")
BERRY = colors.HexColor("#8d394c")
MUTED = colors.HexColor("#657368")
LINE = colors.HexColor("#d8ddd4")
PAPER = colors.HexColor("#fffaf4")
PALE_GREEN = colors.HexColor("#f0f4ec")
PALE_AMBER = colors.HexColor("#fff5e6")
WHITE = colors.white

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="SheetKicker", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=8, leading=10, textColor=GREEN, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="SheetTitle", parent=styles["Title"], fontName="Helvetica-Bold",
    fontSize=23, leading=26, textColor=INK, alignment=TA_LEFT, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="SheetDeck", parent=styles["Normal"], fontName="Helvetica",
    fontSize=10.5, leading=14, textColor=MUTED, spaceAfter=9,
))
styles.add(ParagraphStyle(
    name="SectionTitle", parent=styles["Heading2"], fontName="Helvetica-Bold",
    fontSize=16, leading=19, textColor=INK, spaceBefore=2, spaceAfter=4,
))
styles.add(ParagraphStyle(
    name="SectionDeck", parent=styles["Normal"], fontName="Helvetica",
    fontSize=9.5, leading=13, textColor=MUTED, spaceAfter=8,
))
styles.add(ParagraphStyle(
    name="Question", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=10.2, leading=13.5, textColor=INK, spaceBefore=4, spaceAfter=2,
))
styles.add(ParagraphStyle(
    name="BodySheet", parent=styles["Normal"], fontName="Helvetica",
    fontSize=9.2, leading=12.2, textColor=INK,
))
styles.add(ParagraphStyle(
    name="SmallSheet", parent=styles["Normal"], fontName="Helvetica",
    fontSize=8.2, leading=10.5, textColor=MUTED,
))
styles.add(ParagraphStyle(
    name="TableHeadSheet", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=8.1, leading=10, textColor=GREEN,
))
styles.add(ParagraphStyle(
    name="TableCellSheet", parent=styles["Normal"], fontName="Helvetica",
    fontSize=8.7, leading=11, textColor=INK,
))
styles.add(ParagraphStyle(
    name="FieldLabel", parent=styles["Normal"], fontName="Helvetica-Bold",
    fontSize=7.3, leading=9, textColor=GREEN,
))


def p(text: str, style: str = "BodySheet") -> Paragraph:
    return Paragraph(text, styles[style])


class WritingLines(Flowable):
    """Light, print-friendly answer lines that keep the response space visible."""

    def __init__(self, count: int = 2, spacing: float = 15):
        super().__init__()
        self.count = count
        self.spacing = spacing
        self.height = count * spacing + 3

    def wrap(self, aW: float, aH: float) -> tuple[float, float]:
        self.width = aW
        return self.width, self.height

    def draw(self):
        canvas = self.canv
        canvas.saveState()
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.55)
        for i in range(self.count):
            y = self.height - ((i + 1) * self.spacing)
            canvas.line(0, y, self.width, y)
        canvas.restoreState()


class CellLayersDiagram(Flowable):
    """A simple, unlabelled plant-cell sketch for students to annotate."""

    def __init__(self, height: float = 126):
        super().__init__()
        self.height = height

    def wrap(self, aW: float, aH: float) -> tuple[float, float]:
        self.width = aW
        return self.width, self.height

    def draw(self):
        c = self.canv
        c.saveState()
        x, y = 8, 15
        cell_w, cell_h = min(218, self.width * 0.47), 88

        # Two nested outlines and a nucleus are deliberately left unlabeled.
        c.setLineWidth(1.5)
        c.setStrokeColor(GREEN)
        c.roundRect(x, y, cell_w, cell_h, 9, stroke=1, fill=0)
        c.setLineWidth(1.25)
        c.setStrokeColor(BERRY)
        c.roundRect(x + 9, y + 9, cell_w - 18, cell_h - 18, 7, stroke=1, fill=0)

        cx, cy = x + cell_w * 0.55, y + cell_h * 0.5
        c.setStrokeColor(GREEN)
        c.circle(cx, cy, 24, stroke=1, fill=0)
        c.setStrokeColor(BERRY)
        c.circle(cx, cy, 20, stroke=1, fill=0)

        markers = [
            (1, x + 5, y + cell_h - 9),
            (2, x + cell_w - 17, y + cell_h * 0.3),
            (3, cx + 19, cy + 4),
        ]
        label_x = x + cell_w + 45
        row_y = [y + cell_h - 14, y + cell_h - 43, y + cell_h - 72]
        for (number, mx, my), line_y in zip(markers, row_y):
            c.setFillColor(BERRY)
            c.setStrokeColor(BERRY)
            c.circle(mx, my, 7, stroke=1, fill=1)
            c.setFillColor(WHITE)
            c.setFont("Helvetica-Bold", 7)
            c.drawCentredString(mx, my - 2.5, str(number))
            c.setStrokeColor(LINE)
            c.setLineWidth(0.65)
            c.setDash(1.5, 2)
            c.line(mx + 8, my, label_x - 10, line_y + 2)
            c.setDash()
            c.setFillColor(INK)
            c.setFont("Helvetica-Bold", 9)
            c.drawString(label_x, line_y + 3, f"{number}.")
            c.setStrokeColor(LINE)
            c.line(label_x + 18, line_y, min(self.width - 5, label_x + 185), line_y)

        c.setFillColor(MUTED)
        c.setFont("Helvetica-Oblique", 7.2)
        c.drawString(x, 2, "SIMPLIFIED CELL SKETCH - NOT TO SCALE")
        c.restoreState()


def section_label(number: str, title: str, deck: str):
    return [
        p(f"{number} / {title.upper()}", "SheetKicker"),
        p(title, "SectionTitle"),
        p(deck, "SectionDeck"),
    ]


def prompt_block(number: str, question: str, lines: int = 2):
    return [
        p(f"<b>{number}</b> {question}", "Question"),
        WritingLines(lines),
        Spacer(1, 4),
    ]


def grid_table(data, widths, *, header=True, row_bgs=None, padd=6, repeat=0):
    table = Table(data, colWidths=widths, repeatRows=repeat, hAlign="LEFT")
    commands = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.5, LINE),
        ("LEFTPADDING", (0, 0), (-1, -1), padd),
        ("RIGHTPADDING", (0, 0), (-1, -1), padd),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]
    if header:
        commands.extend([
            ("BACKGROUND", (0, 0), (-1, 0), PALE_GREEN),
            ("LINEBELOW", (0, 0), (-1, 0), 0.8, GREEN),
        ])
    if row_bgs:
        for row_index, bg in row_bgs.items():
            commands.append(("BACKGROUND", (0, row_index), (-1, row_index), bg))
    table.setStyle(TableStyle(commands))
    return table


def draw_page_decor(canvas, doc):
    canvas.saveState()
    canvas.setTitle("Strawberry DNA Extraction - Student Worksheet")
    canvas.setAuthor("Strawberry DNA Field Guide")
    canvas.setSubject("Printable offline student worksheet for a teacher-supervised strawberry DNA extraction practical")

    canvas.setFillColor(BERRY)
    canvas.roundRect(doc.leftMargin, PAGE_H - 12.5 * mm, 4 * mm, 4 * mm, 1.2 * mm, stroke=0, fill=1)
    canvas.setFillColor(GREEN)
    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.drawString(doc.leftMargin + 7 * mm, PAGE_H - 11.6 * mm, "FIELD / NOTES    SCIENCE PRACTICAL 01")
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.55)
    canvas.line(doc.leftMargin, PAGE_H - 15 * mm, PAGE_W - doc.rightMargin, PAGE_H - 15 * mm)

    canvas.line(doc.leftMargin, 14 * mm, PAGE_W - doc.rightMargin, 14 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(doc.leftMargin, 9.5 * mm, "STRAWBERRY DNA EXTRACTION  -  STUDENT COPY")
    canvas.drawRightString(PAGE_W - doc.rightMargin, 9.5 * mm, f"PAGE {doc.page}")
    canvas.restoreState()


def worksheet_story():
    story = []

    # PAGE 1 - preparation, prediction and cell barriers.
    story.extend([
        p("PRINTABLE STUDENT WORKSHEET  /  BLANK RESPONSE COPY", "SheetKicker"),
        p("Strawberry DNA extraction", "SheetTitle"),
        p("From fruit tissue to pale, visible fibres. Record what you predict, do and observe.", "SheetDeck"),
    ])

    fields = Table(
        [[
            p("NAME<br/><b>________________________________</b>", "FieldLabel"),
            p("CLASS<br/><b>_____________________</b>", "FieldLabel"),
            p("DATE<br/><b>_____________________</b>", "FieldLabel"),
        ]],
        colWidths=[CONTENT_W * 0.42, CONTENT_W * 0.29, CONTENT_W * 0.29],
        hAlign="LEFT",
    )
    fields.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PAPER),
        ("BOX", (0, 0), (-1, -1), 0.6, LINE),
        ("INNERGRID", (0, 0), (-1, -1), 0.45, LINE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.extend([fields, Spacer(1, 8)])

    safety = Table([[p(
        "<b>TEACHER-SUPERVISED PRACTICAL.</b> Wear eye protection. Keep ethanol capped, cold and away from flames. "
        "Follow your teacher's instructions for spills, glassware and chemical handling.", "BodySheet"
    )]], colWidths=[CONTENT_W])
    safety.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), PALE_AMBER),
        ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#e7d3b6")),
        ("LINEBEFORE", (0, 0), (0, -1), 3, BERRY),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story.extend([safety, Spacer(1, 11)])
    story.extend(section_label("01", "Before the practical", "Think first; return to your predictions after the experiment."))
    story.extend(prompt_block("1.1", "Cultivated garden strawberries are octoploid (8n). In your own words, what does 8n tell you about chromosome sets? Does chromosome-set count alone tell you the total DNA mass in a cell? Explain.", 3))
    story.append(p("1.2  Use the word bank to label the numbered barriers in the simplified cell sketch.", "Question"))
    story.append(p("WORD BANK: cell wall  /  cell membrane  /  nuclear envelope", "SmallSheet"))
    story.extend([CellLayersDiagram(), Spacer(1, 4)])
    story.extend(prompt_block("1.3", "Before adding the cold liquid, where do you predict the pale fibres will appear? Describe what you expect to see.", 2))

    story.append(PageBreak())

    # PAGE 2 - practical sequence and observation log.
    story.extend(section_label("02", "Method and observation record", "Use the lesson's five moves. Keep the liquid layers separate and write only what you observe."))

    kit_data = [
        [p("BUFFER MIX", "TableHeadSheet"), p("EQUIPMENT AND MATERIALS", "TableHeadSheet")],
        [
            p("90 cm3 water<br/>10 cm3 detergent<br/>3 g salt<br/><br/><b>Use 10 cm3 of prepared buffer on the mashed fruit.</b>", "TableCellSheet"),
            p("One hulled strawberry; sealable bag; gauze-lined funnel; clean tube; clean glass rod; goggles; ice-cold ethanol.", "TableCellSheet"),
        ],
    ]
    story.extend([grid_table(kit_data, [CONTENT_W * 0.42, CONTENT_W * 0.58]), Spacer(1, 8)])

    story.append(p("FIVE MOVES", "SheetKicker"))
    move_rows = [[p("MOVE", "TableHeadSheet"), p("ACTION", "TableHeadSheet"), p("DONE", "TableHeadSheet")]]
    move_text = [
        "Place one hulled strawberry in a sealed bag. Mash gently for 2 minutes; avoid whipping in air or making foam.",
        "Measure 90 cm3 water and 10 cm3 detergent. Stir in 3 g salt until dissolved. Add 10 cm3 of this buffer to the mashed fruit.",
        "Pour slowly through gauze in a funnel into a clean tube. Collect the liquid; leave most visible pulp on the gauze.",
        "Measure 5 cm3 filtrate and an equal 5 cm3 volume of ice-cold ethanol. Run ethanol slowly down the tube wall; do not shake or stir.",
        "Touch a clean glass rod to the boundary between the liquids. Turn slowly in one direction to spool any pale, stringy material.",
    ]
    for number, action in enumerate(move_text, start=1):
        move_rows.append([
            p(f"{number:02d}", "TableHeadSheet"),
            p(action, "TableCellSheet"),
            p("[   ]", "TableCellSheet"),
        ])
    moves_table = grid_table(move_rows, [15 * mm, CONTENT_W - 33 * mm, 18 * mm], repeat=1, padd=5)
    story.extend([moves_table, Spacer(1, 8)])

    story.append(p("OBSERVATION LOG", "SheetKicker"))
    observation_rows: list[list[Flowable]] = [[p("STAGE", "TableHeadSheet"), p("WHAT I SEE", "TableHeadSheet")]]
    for label in [
        "After mashing and adding buffer",
        "After filtration: liquid and retained pulp",
        "At the ethanol-filtrate boundary",
        "After spooling: colour, texture and location",
    ]:
        observation_rows.append([p(label, "TableCellSheet"), WritingLines(2, 13)])
    story.append(grid_table(observation_rows, [57 * mm, CONTENT_W - 57 * mm], repeat=1, padd=5))
    story.append(Spacer(1, 6))
    story.append(p("Look for pale, stringy fibres at the boundary only after cold ethanol meets the filtrate. Keep ethanol capped and away from ignition sources.", "SmallSheet"))

    safety_rows = [[p("SAFETY CHECK", "TableHeadSheet"), p("BEFORE YOU PACK UP", "TableHeadSheet")], [
        p("[   ] Eye protection on<br/>[   ] Ethanol capped and away from flames<br/>[   ] Glassware intact; spills or breakage reported using class procedure", "TableCellSheet"),
        p("One observation I trust: _________________________________________________<br/><br/>One question I still have: ______________________________________________", "TableCellSheet"),
    ]]
    story.append(grid_table(safety_rows, [CONTENT_W * 0.55, CONTENT_W * 0.45], header=True, padd=6))

    story.append(PageBreak())

    # PAGE 3 - explanations, filtration and conclusion.
    story.extend(section_label("03", "Explain and evaluate", "Use evidence from your own sample. A visible result is an observation, not proof of purity."))

    story.append(p("WHAT DOES EACH STEP DO? Write an explanation in your own words.", "SheetKicker"))
    mechanism_rows: list[list[Flowable]] = [[p("STEP OR MATERIAL", "TableHeadSheet"), p("MY EXPLANATION", "TableHeadSheet")]]
    for item in ["Mashing", "Detergent", "Salt", "Filtration", "Ice-cold ethanol", "Spooling with a glass rod"]:
        mechanism_rows.append([p(item, "TableCellSheet"), WritingLines(2, 12)])
    story.extend([grid_table(mechanism_rows, [49 * mm, CONTENT_W - 49 * mm], repeat=1, padd=5), Spacer(1, 8)])

    story.append(p("FILTRATION CHECK  /  Tick one destination for each item.", "SheetKicker"))
    sort_rows = [[p("MATERIAL", "TableHeadSheet"), p("RETAINED BY GAUZE", "TableHeadSheet"), p("IN THE FILTRATE", "TableHeadSheet")]]
    for item in [
        "Coarse pulp and large cell-wall fragments",
        "Unmashed strawberry tissue",
        "Soluble DNA",
        "Water",
        "Salt ions and detergent molecules",
    ]:
        sort_rows.append([p(item, "TableCellSheet"), p("[   ]", "TableCellSheet"), p("[   ]", "TableCellSheet")])
    story.extend([grid_table(sort_rows, [CONTENT_W * 0.60, CONTENT_W * 0.20, CONTENT_W * 0.20], repeat=1, padd=5), Spacer(1, 7)])

    story.extend(prompt_block("3.1", "Why is salt added to the buffer? Include DNA's charge in your explanation.", 2))
    story.extend(prompt_block("3.2", "Why use ice-cold ethanol and add it gently without mixing the layers?", 2))
    story.extend(prompt_block("3.3", "What can you conclude from the fibres you observed? What can appearance alone not prove?", 2))

    return story


def main():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=MARGIN_X,
        rightMargin=MARGIN_X,
        topMargin=20 * mm,
        bottomMargin=19 * mm,
        title="Strawberry DNA Extraction - Student Worksheet",
        author="Strawberry DNA Field Guide",
        subject="Printable offline student worksheet for a teacher-supervised strawberry DNA extraction practical",
        pageCompression=1,
    )
    document.build(worksheet_story(), onFirstPage=draw_page_decor, onLaterPages=draw_page_decor)
    print(f"Created {OUTPUT} ({OUTPUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
