#!/usr/bin/env python3
"""Generate printable English and English/Traditional Chinese worksheet PDFs."""

from pathlib import Path
import re

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Flowable,
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "client" / "public"
ENGLISH_OUTPUT = PUBLIC / "strawberry-dna-student-worksheet.pdf"
BILINGUAL_OUTPUT = PUBLIC / "strawberry-dna-student-worksheet-bilingual.pdf"
CJK_FONT_PATH = Path("/usr/share/fonts/truetype/wqy/wqy-microhei.ttc")
CJK_FONT_NAME = "WQYMicroHei"
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

METHOD_IMAGES = {
    "mash": PUBLIC / "images" / "pdf" / "pdf-stage1-crushing.jpg",
    "filter": PUBLIC / "images" / "pdf" / "pdf-stage2-filtration.jpg",
    "ethanol": PUBLIC / "images" / "pdf" / "pdf-stage3-ethanol.jpg",
    "spool": PUBLIC / "images" / "pdf" / "pdf-stage4-spooling.jpg",
}

# These are inline word/phrase supports, not a sentence-by-sentence translation.
# The English text stays intact; translations appear beside classroom vocabulary.
KEYWORD_TRANSLATIONS = [
    ("method in pictures", "圖解方法"),
    ("phospholipid bilayer", "磷脂雙分子層"),
    ("nuclear envelope", "核膜"),
    ("cell membrane", "細胞膜"),
    ("cell-wall fragments", "細胞壁碎片"),
    ("cell-wall", "細胞壁"),
    ("cell wall", "細胞壁"),
    ("risk assessments", "風險評估"),
    ("risk assessment", "風險評估"),
    ("observation record", "觀察紀錄"),
    ("control measure", "控制措施"),
    ("learning objectives", "學習目標"),
    ("chromosome sets", "染色體組"),
    ("chromosome set", "染色體組"),
    ("ignition sources", "火源"),
    ("ignition source", "火源"),
    ("ice-cold ethanol", "冰冷乙醇"),
    ("cold ethanol", "冷乙醇"),
    ("cell wall fragments", "細胞壁碎片"),
    ("DNA-rich fibres", "富含 DNA 的纖維"),
    ("glass rod", "玻璃棒"),
    ("word bank", "詞彙表"),
    ("practical", "實驗"),
    ("method", "方法"),
    ("water", "水"),
    ("salt", "鹽"),
    ("mashing", "搗碎"),
    ("filtration", "過濾"),
    ("filtrate", "濾液"),
    ("precipitation", "沉澱"),
    ("spooling", "纏繞收集"),
    ("octoploid", "八倍體"),
    ("phospholipid", "磷脂"),
    ("detergent", "清潔劑"),
    ("buffer", "緩衝液"),
    ("ethanol", "乙醇"),
    ("mash", "搗碎"),
    ("gauze", "紗布"),
    ("retained", "被截留"),
    ("retentate", "截留物"),
    ("pulp", "果肉"),
    ("ploidy", "倍性"),
    ("boundary", "交界面"),
    ("spool", "纏繞收集"),
    ("solubility", "溶解度"),
    ("flammable", "易燃"),
    ("irritant", "刺激物"),
    ("goggles", "護目鏡"),
    ("soluble", "可溶的"),
    ("fibres", "纖維"),
    ("hazard", "危害"),
    ("risk", "風險"),
    ("filter", "過濾"),
    ("observation", "觀察"),
]


class WritingLines(Flowable):
    """Light, print-friendly answer lines with a generous writing rhythm."""

    def __init__(self, count: int = 4, spacing: float = 17):
        super().__init__()
        self.count = count
        self.spacing = spacing
        self.height = count * spacing + 4

    def wrap(self, aW: float, aH: float) -> tuple[float, float]:
        self.width = aW
        return self.width, self.height

    def draw(self):
        canvas = self.canv
        canvas.saveState()
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.55)
        for index in range(self.count):
            y = self.height - ((index + 1) * self.spacing)
            canvas.line(0, y, self.width, y)
        canvas.restoreState()


class CellLayersDiagram(Flowable):
    """A simplified, unlabelled plant-cell sketch for students to annotate."""

    def __init__(self, height: float = 135):
        super().__init__()
        self.height = height

    def wrap(self, aW: float, aH: float) -> tuple[float, float]:
        self.width = aW
        return self.width, self.height

    def draw(self):
        canvas = self.canv
        canvas.saveState()
        x, y = 8, 17
        cell_w, cell_h = min(218, self.width * 0.47), 91

        canvas.setLineWidth(1.5)
        canvas.setStrokeColor(GREEN)
        canvas.roundRect(x, y, cell_w, cell_h, 9, stroke=1, fill=0)
        canvas.setLineWidth(1.25)
        canvas.setStrokeColor(BERRY)
        canvas.roundRect(x + 9, y + 9, cell_w - 18, cell_h - 18, 7, stroke=1, fill=0)

        center_x, center_y = x + cell_w * 0.55, y + cell_h * 0.5
        canvas.setStrokeColor(GREEN)
        canvas.circle(center_x, center_y, 24, stroke=1, fill=0)
        canvas.setStrokeColor(BERRY)
        canvas.circle(center_x, center_y, 20, stroke=1, fill=0)

        markers = [
            (1, x + 5, y + cell_h - 9),
            (2, x + cell_w - 17, y + cell_h * 0.3),
            (3, center_x + 19, center_y + 4),
        ]
        label_x = x + cell_w + 45
        row_y = [y + cell_h - 14, y + cell_h - 44, y + cell_h - 74]
        for (number, marker_x, marker_y), line_y in zip(markers, row_y):
            canvas.setFillColor(BERRY)
            canvas.setStrokeColor(BERRY)
            canvas.circle(marker_x, marker_y, 7, stroke=1, fill=1)
            canvas.setFillColor(WHITE)
            canvas.setFont("Helvetica-Bold", 7)
            canvas.drawCentredString(marker_x, marker_y - 2.5, str(number))
            canvas.setStrokeColor(LINE)
            canvas.setLineWidth(0.65)
            canvas.setDash(1.5, 2)
            canvas.line(marker_x + 8, marker_y, label_x - 10, line_y + 2)
            canvas.setDash()
            canvas.setFillColor(INK)
            canvas.setFont("Helvetica-Bold", 9)
            canvas.drawString(label_x, line_y + 3, f"{number}.")
            canvas.setStrokeColor(LINE)
            canvas.line(label_x + 18, line_y, min(self.width - 5, label_x + 185), line_y)

        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica-Oblique", 7.2)
        canvas.drawString(x, 2, "SIMPLIFIED CELL SKETCH - NOT TO SCALE")
        canvas.restoreState()


def register_cjk_font() -> None:
    if not CJK_FONT_PATH.exists():
        raise FileNotFoundError(
            f"Traditional Chinese font not found at {CJK_FONT_PATH}. "
            "Install WenQuanYi Micro Hei or update CJK_FONT_PATH before rebuilding the bilingual PDF."
        )
    if CJK_FONT_NAME not in pdfmetrics.getRegisteredFontNames():
        pdfmetrics.registerFont(TTFont(CJK_FONT_NAME, str(CJK_FONT_PATH), subfontIndex=0))


def make_styles(bilingual: bool):
    styles = getSampleStyleSheet()
    wrap = "CJK" if bilingual else None
    definitions = [
        ("SheetKicker", "Normal", "Helvetica-Bold", 8.0, 10.0, GREEN, 0, 4),
        ("SheetTitle", "Title", "Helvetica-Bold", 23, 27, INK, 0, 4),
        ("SheetDeck", "Normal", "Helvetica", 10.2, 14, MUTED, 0, 8),
        ("SectionTitle", "Heading2", "Helvetica-Bold", 16, 19, INK, 2, 4),
        ("SectionDeck", "Normal", "Helvetica", 9.6, 13.2, MUTED, 0, 8),
        ("Question", "Normal", "Helvetica-Bold", 10.3, 14, INK, 4, 3),
        ("BodySheet", "Normal", "Helvetica", 9.3, 12.5, INK, 0, 1),
        ("SmallSheet", "Normal", "Helvetica", 8.3, 10.8, MUTED, 0, 2),
        ("TableHeadSheet", "Normal", "Helvetica-Bold", 8.1, 10.2, GREEN, 0, 0),
        ("TableCellSheet", "Normal", "Helvetica", 8.7, 11.4, INK, 0, 0),
        ("FieldLabel", "Normal", "Helvetica-Bold", 7.6, 9.4, GREEN, 0, 0),
        ("CardTitle", "Normal", "Helvetica-Bold", 10.4, 13, INK, 3, 3),
        ("CardBody", "Normal", "Helvetica", 8.7, 11.4, INK, 0, 2),
    ]
    for name, parent_name, font_name, size, leading, text_color, before, after in definitions:
        styles.add(ParagraphStyle(
            name=name,
            parent=styles[parent_name],
            fontName=font_name,
            fontSize=size,
            leading=leading,
            textColor=text_color,
            alignment=TA_LEFT,
            spaceBefore=before,
            spaceAfter=after,
            wordWrap=wrap,
        ))
    return styles


class WorksheetBuilder:
    def __init__(self, bilingual: bool = False):
        self.bilingual = bilingual
        self.styles = make_styles(bilingual)

    def localize(self, text: str) -> str:
        if not self.bilingual:
            return text
        replacements = {}
        for term, chinese in sorted(KEYWORD_TRANSLATIONS, key=lambda entry: len(entry[0]), reverse=True):
            pattern = re.compile(rf"(?<![A-Za-z])({re.escape(term)})(?![A-Za-z])(?!（)", re.IGNORECASE)
            def hold_keyword(match, translation=chinese):
                token = f"\uE000{len(replacements)}\uE001"
                replacements[token] = f'{match.group(1)}<font name="{CJK_FONT_NAME}">（{translation}）</font>'
                return token
            text = pattern.sub(hold_keyword, text)
        for token, replacement in replacements.items():
            text = text.replace(token, replacement)
        return text

    def p(self, text: str, style: str = "BodySheet") -> Paragraph:
        return Paragraph(self.localize(text), self.styles[style])

    def section_label(self, number: str, title: str, deck: str):
        number_text = f"{number} / " if number else ""
        return [
            self.p(f"{number_text}{title.upper()}", "SheetKicker"),
            self.p(title, "SectionTitle"),
            self.p(deck, "SectionDeck"),
        ]

    def prompt_block(self, number: str, question: str, lines: int = 4, spacing: float = 17):
        return [
            self.p(f"<b>{number}</b> {question}", "Question"),
            WritingLines(lines, spacing),
            Spacer(1, 6),
        ]

    def grid_table(self, data, widths, *, header=True, row_bgs=None, padd=6, repeat=0):
        table = Table(data, colWidths=widths, repeatRows=repeat, hAlign="LEFT")
        commands = [
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("GRID", (0, 0), (-1, -1), 0.5, LINE),
            ("LEFTPADDING", (0, 0), (-1, -1), padd),
            ("RIGHTPADDING", (0, 0), (-1, -1), padd),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]
        if header:
            commands.extend([
                ("BACKGROUND", (0, 0), (-1, 0), PALE_GREEN),
                ("LINEBELOW", (0, 0), (-1, 0), 0.8, GREEN),
            ])
        if row_bgs:
            for row_index, background in row_bgs.items():
                commands.append(("BACKGROUND", (0, row_index), (-1, row_index), background))
        table.setStyle(TableStyle(commands))
        return table

    def student_fields(self):
        fields = Table(
            [[
                self.p("NAME<br/><b>____________________________</b>", "FieldLabel"),
                self.p("CLASS<br/><b>___________________</b>", "FieldLabel"),
                self.p("DATE<br/><b>___________________</b>", "FieldLabel"),
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
        return fields

    def method_card(self, step: str, title: str, description: str, image_path: Path):
        image = Image(str(image_path), width=112, height=112, kind="proportional")
        image.hAlign = "CENTER"
        card = Table(
            [[image], [self.p(f"{step} / {title}", "CardTitle")], [self.p(description, "CardBody")], [self.p("[   ] DONE", "SmallSheet")]],
            colWidths=[(CONTENT_W / 2) - 7 * mm],
            hAlign="LEFT",
        )
        card.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), PAPER),
            ("BOX", (0, 0), (-1, -1), 0.6, LINE),
            ("LINEBEFORE", (0, 0), (0, -1), 2.2, BERRY),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        return card

    def method_cards(self):
        cards = [
            self.method_card(
                "01-02", "MASH FRUIT + BUFFER",
                "Put one hulled strawberry in a sealable bag and mash gently for 2 minutes. Stir the buffer until the salt dissolves, then add 10 cm³ to the fruit.",
                METHOD_IMAGES["mash"],
            ),
            self.method_card(
                "03", "FILTER THE MIXTURE",
                "Pour slowly through gauze in a funnel into a clean tube. Collect the filtrate; leave most visible pulp on the gauze.",
                METHOD_IMAGES["filter"],
            ),
            self.method_card(
                "04", "LAYER COLD ETHANOL",
                "Measure 5 cm³ filtrate and an equal 5 cm³ volume of ice-cold ethanol. Run ethanol slowly down the tube wall; do not shake or stir.",
                METHOD_IMAGES["ethanol"],
            ),
            self.method_card(
                "05", "SPOOL THE FIBRES",
                "Touch a clean glass rod to the boundary between liquid layers. Turn slowly in one direction to collect any pale, stringy material.",
                METHOD_IMAGES["spool"],
            ),
        ]
        cards_table = Table(
            [[cards[0], cards[1]], [cards[2], cards[3]]],
            colWidths=[CONTENT_W / 2, CONTENT_W / 2],
            hAlign="LEFT",
        )
        cards_table.setStyle(TableStyle([
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 3),
            ("RIGHTPADDING", (0, 0), (-1, -1), 3),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ]))
        return cards_table

    def story(self):
        story: list[Flowable] = []

        # PAGE 1 — learning objectives and risk assessment come before the method and observations.
        edition_label = "ENGLISH WORKSHEET / BLANK RESPONSE COPY"
        if self.bilingual:
            edition_label = "BILINGUAL EDITION / ENGLISH WITH TRADITIONAL CHINESE KEYWORDS"
        story.extend([
            self.p(edition_label, "SheetKicker"),
            self.p("Strawberry DNA extraction", "SheetTitle"),
            self.p("Student worksheet · Teacher-supervised practical · Record your own evidence.", "SheetDeck"),
            self.student_fields(),
            Spacer(1, 9),
            self.p("Learning objectives", "SectionTitle"),
            self.p("By the end of the practical, I can…", "SectionDeck"),
        ])
        objective_rows = [
            [self.p("01", "TableHeadSheet"), self.p("Explain how membrane disruption and precipitation help make DNA-rich fibres visible.", "BodySheet")],
            [self.p("02", "TableHeadSheet"), self.p("Describe what mashing, detergent, salt, filtration and cold ethanol do.", "BodySheet")],
            [self.p("03", "TableHeadSheet"), self.p("Follow the method safely and record observations without claiming the crude extract is pure DNA.", "BodySheet")],
        ]
        story.extend([
            self.grid_table(objective_rows, [15 * mm, CONTENT_W - 15 * mm], header=False, row_bgs={0: PALE_GREEN, 2: PALE_GREEN}, padd=7),
            Spacer(1, 9),
            self.p("Risk assessments & controls — read before the method and observation record", "SectionTitle"),
            self.p("Check the control measures with your teacher before handling any material.", "SectionDeck"),
        ])
        risk_rows = [
            [self.p("MATERIAL / HAZARD", "TableHeadSheet"), self.p("RISK", "TableHeadSheet"), self.p("CONTROL MEASURE", "TableHeadSheet")],
            [self.p("Cold ethanol — flammable liquid / vapour", "TableCellSheet"), self.p("Vapour may irritate; flames can ignite vapour.", "TableCellSheet"), self.p("Teacher-directed use only. Keep capped, cold and away from flames or other ignition sources.", "TableCellSheet")],
            [self.p("Detergent — eye / skin irritant", "TableCellSheet"), self.p("A splash can irritate eyes or skin.", "TableCellSheet"), self.p("Wear goggles. Avoid contact; rinse splashes with plenty of water and tell the teacher.", "TableCellSheet")],
            [self.p("Glass and spills", "TableCellSheet"), self.p("Breakage can cut; liquid can make floors slippery.", "TableCellSheet"), self.p("Check glassware. Report breakage and clean spills promptly using the class procedure.", "TableCellSheet")],
        ]
        story.extend([
            self.grid_table(risk_rows, [47 * mm, 47 * mm, CONTENT_W - 94 * mm], repeat=1, padd=6),
            Spacer(1, 8),
        ])
        safety_checks = Table([[
            self.p("[   ] Goggles on", "TableCellSheet"),
            self.p("[   ] Bench clear", "TableCellSheet"),
            self.p("[   ] Teacher's instructions checked", "TableCellSheet"),
        ]], colWidths=[CONTENT_W / 3] * 3, hAlign="LEFT")
        safety_checks.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), PALE_AMBER),
            ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#e7d3b6")),
            ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("LEFTPADDING", (0, 0), (-1, -1), 7),
            ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ]))
        story.append(safety_checks)
        story.extend([
            self.p("Before you begin: Which control measure will you check first, and why?", "Question"),
            WritingLines(3, 17),
        ])

        story.append(PageBreak())

        # PAGE 2 — pre-lab thinking and an unlabelled cell-barrier diagram.
        story.extend(self.section_label("01", "Before the practical", "Think first; return to your predictions after the experiment."))
        story.extend(self.prompt_block(
            "1.1",
            "Cultivated garden strawberries are octoploid (8n). In your own words, what does 8n tell you about chromosome sets? Does ploidy alone tell you the total DNA mass in a cell? Explain.",
            5,
            18,
        ))
        story.append(self.p("1.2  Use the word bank to label the numbered barriers in the simplified cell sketch.", "Question"))
        story.append(self.p("WORD BANK: cell wall  /  cell membrane  /  nuclear envelope", "SmallSheet"))
        story.extend([CellLayersDiagram(), Spacer(1, 7)])
        story.extend(self.prompt_block(
            "1.3",
            "Before adding the cold liquid, predict where the pale fibres might appear and describe what you expect to see.",
            5,
            18,
        ))

        story.append(PageBreak())

        # PAGE 3 — picture-led method, using the supplied PDF's original practical images.
        story.extend(self.section_label("02", "Method in pictures", "Follow the steps in order. Keep the filtrate and ethanol layers separate."))
        kit_rows = [
            [self.p("PREPARE THE BUFFER", "TableHeadSheet"), self.p("GET THE EQUIPMENT READY", "TableHeadSheet")],
            [
                self.p("Mix 90 cm³ water + 10 cm³ detergent + 3 g salt. Stir until the salt dissolves. Add 10 cm³ of prepared buffer to the mashed fruit.", "TableCellSheet"),
                self.p("One hulled strawberry; sealable bag; gauze-lined funnel; clean tube; clean glass rod; goggles; ice-cold ethanol.", "TableCellSheet"),
            ],
        ]
        story.extend([self.grid_table(kit_rows, [CONTENT_W * 0.52, CONTENT_W * 0.48]), Spacer(1, 7)])
        story.append(self.method_cards())
        story.extend([
            Spacer(1, 6),
            self.p("WHAT TO LOOK FOR  /  Pale, stringy DNA-rich material may appear at the boundary after ice-cold ethanol meets the filtrate. The extract is crude, not pure DNA.", "SmallSheet"),
        ])

        story.append(PageBreak())

        # PAGE 4 — dedicated observation page with expanded writing areas.
        story.extend(self.section_label("03", "Observation record", "Describe what you see before explaining why it happened. Sketch or write; use the full space."))
        observation_rows: list[list[Flowable]] = [[self.p("STAGE", "TableHeadSheet"), self.p("WHAT I SEE  /  SKETCH OR DESCRIBE", "TableHeadSheet")]]
        for label in [
            "After mashing and adding buffer",
            "After filtration: liquid and pulp retained on the gauze",
            "Where ethanol meets the filtrate",
            "After spooling: colour, texture and location",
        ]:
            observation_rows.append([self.p(label, "TableCellSheet"), WritingLines(5, 17)])
        story.extend([
            self.grid_table(observation_rows, [57 * mm, CONTENT_W - 57 * mm], repeat=1, padd=7),
            Spacer(1, 12),
        ])
        story.extend(self.prompt_block("3.1", "Which observation is clearest or most useful as evidence? Describe it without explaining it yet.", 4, 18))
        story.extend(self.prompt_block("3.2", "What can the appearance of fibres show—and what cannot it prove about the crude extract?", 3, 18))

        story.append(PageBreak())

        # PAGE 5 — explanations, filtration check and conclusion.
        story.extend(self.section_label("04", "Explain and evaluate", "Use evidence from your sample. A visible result is an observation, not proof of purity."))
        story.append(self.p("WHAT DOES EACH STEP OR MATERIAL DO?  Write an explanation in your own words.", "SheetKicker"))
        mechanism_rows: list[list[Flowable]] = [[self.p("STEP / MATERIAL", "TableHeadSheet"), self.p("MY EXPLANATION", "TableHeadSheet")]]
        for item in ["Mashing", "Detergent", "Salt", "Filtration", "Ice-cold ethanol", "Spooling with a glass rod"]:
            mechanism_rows.append([self.p(item, "TableCellSheet"), WritingLines(2, 17)])
        story.extend([self.grid_table(mechanism_rows, [48 * mm, CONTENT_W - 48 * mm], repeat=1, padd=6), Spacer(1, 9)])

        story.append(self.p("FILTRATION CHECK  /  Tick one destination for each item.", "SheetKicker"))
        sort_rows = [[self.p("MATERIAL", "TableHeadSheet"), self.p("RETAINED BY GAUZE", "TableHeadSheet"), self.p("IN THE FILTRATE", "TableHeadSheet")]]
        for item in [
            "Coarse pulp and large cell-wall fragments",
            "Unmashed strawberry tissue",
            "Soluble DNA",
            "Water, salt ions and detergent molecules",
        ]:
            sort_rows.append([self.p(item, "TableCellSheet"), self.p("[   ]", "TableCellSheet"), self.p("[   ]", "TableCellSheet")])
        story.extend([self.grid_table(sort_rows, [CONTENT_W * 0.60, CONTENT_W * 0.20, CONTENT_W * 0.20], repeat=1, padd=5), Spacer(1, 6)])
        story.extend(self.prompt_block("4.1", "Why is salt added to the buffer? Include DNA's charge in your explanation.", 3, 16))
        story.extend(self.prompt_block("4.2", "Why use ice-cold ethanol and add it gently without mixing the layers?", 3, 16))
        return story


def draw_page_decor(canvas, document, bilingual: bool = False):
    canvas.saveState()
    edition = "BILINGUAL / TRADITIONAL CHINESE KEYWORDS" if bilingual else "ENGLISH EDITION"
    canvas.setTitle(
        "Strawberry DNA Extraction - Student Worksheet - Bilingual"
        if bilingual else "Strawberry DNA Extraction - Student Worksheet"
    )
    canvas.setAuthor("Strawberry DNA Field Guide")
    canvas.setSubject("Printable offline worksheet for a teacher-supervised strawberry DNA extraction practical")
    canvas.setFillColor(BERRY)
    canvas.roundRect(document.leftMargin, PAGE_H - 12.5 * mm, 4 * mm, 4 * mm, 1.2 * mm, stroke=0, fill=1)
    canvas.setFillColor(GREEN)
    canvas.setFont("Helvetica-Bold", 7.5)
    canvas.drawString(document.leftMargin + 7 * mm, PAGE_H - 11.6 * mm, f"FIELD / NOTES    SCIENCE PRACTICAL 01    {edition}")
    canvas.setStrokeColor(LINE)
    canvas.setLineWidth(0.55)
    canvas.line(document.leftMargin, PAGE_H - 15 * mm, PAGE_W - document.rightMargin, PAGE_H - 15 * mm)
    canvas.line(document.leftMargin, 14 * mm, PAGE_W - document.rightMargin, 14 * mm)
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 7.5)
    canvas.drawString(document.leftMargin, 9.5 * mm, "STRAWBERRY DNA EXTRACTION  -  STUDENT COPY")
    canvas.drawRightString(PAGE_W - document.rightMargin, 9.5 * mm, f"PAGE {document.page}")
    canvas.restoreState()


def build_pdf(output_path: Path, bilingual: bool = False) -> None:
    for image_path in METHOD_IMAGES.values():
        if not image_path.is_file():
            raise FileNotFoundError(f"Required method image is missing: {image_path}")
    if bilingual:
        register_cjk_font()

    output_path.parent.mkdir(parents=True, exist_ok=True)
    document = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=MARGIN_X,
        rightMargin=MARGIN_X,
        topMargin=20 * mm,
        bottomMargin=19 * mm,
        title=(
            "Strawberry DNA Extraction - Student Worksheet - Bilingual"
            if bilingual else "Strawberry DNA Extraction - Student Worksheet"
        ),
        author="Strawberry DNA Field Guide",
        subject="Printable offline student worksheet for a teacher-supervised practical",
        pageCompression=1,
    )
    document.build(
        WorksheetBuilder(bilingual=bilingual).story(),
        onFirstPage=lambda canvas, doc: draw_page_decor(canvas, doc, bilingual),
        onLaterPages=lambda canvas, doc: draw_page_decor(canvas, doc, bilingual),
    )
    print(f"Created {output_path} ({output_path.stat().st_size:,} bytes)")


def main() -> None:
    build_pdf(ENGLISH_OUTPUT, bilingual=False)
    build_pdf(BILINGUAL_OUTPUT, bilingual=True)


if __name__ == "__main__":
    main()
