import { NextRequest, NextResponse } from 'next/server'
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat,
  Header, PageNumber, UnderlineType,
} from 'docx'

export const dynamic = 'force-dynamic'

// ── Brand colours (hex, no #) ────────────────────────────────────────────────
const C_BLUE       = '378ADD'
const C_BLUE_DARK  = '1E4F8A'
const C_BLUE_LIGHT = 'EBF4FF'
const C_AMBER      = 'EF9F27'
const C_INK        = '2C2C2A'
const C_INK_MID    = '5A5A58'
const C_WHITE      = 'FFFFFF'
const C_GREY_LINE  = 'D5D2C8'

// ── Helpers ──────────────────────────────────────────────────────────────────
const singleBorder = (color = C_GREY_LINE) =>
  ({ style: BorderStyle.SINGLE, size: 1, color })

const allBorders = (color = C_GREY_LINE) => ({
  top: singleBorder(color), bottom: singleBorder(color),
  left: singleBorder(color), right: singleBorder(color),
})

const noBorders = () => ({
  top:    { style: BorderStyle.NONE },
  bottom: { style: BorderStyle.NONE },
  left:   { style: BorderStyle.NONE },
  right:  { style: BorderStyle.NONE },
})

const cellMargins = { top: 80, bottom: 80, left: 140, right: 140 }

/** A bold blue section heading bar */
function sectionBar(text: string): Paragraph {
  return new Paragraph({
    spacing: { before: 260, after: 80 },
    shading: { type: ShadingType.CLEAR, fill: C_BLUE },
    indent: { left: 0 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        color: C_WHITE,
        size: 22,   // 11 pt
        font: 'Arial',
      }),
    ],
  })
}

/** Standard body paragraph */
function body(text: string, opts: { bold?: boolean; colour?: string; indent?: number } = {}): Paragraph {
  return new Paragraph({
    spacing: { after: 100 },
    indent: opts.indent ? { left: opts.indent } : undefined,
    children: [
      new TextRun({
        text,
        size: 22,
        font: 'Arial',
        color: opts.colour ?? C_INK_MID,
        bold: opts.bold ?? false,
      }),
    ],
  })
}

/** Amber-accented label + value on one line */
function labelValue(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, color: C_BLUE, size: 22, font: 'Arial' }),
      new TextRun({ text: value || '_______________', size: 22, font: 'Arial', color: C_INK }),
    ],
  })
}

/** Empty spacer line */
const spacer = () => new Paragraph({ children: [new TextRun('')], spacing: { after: 60 } })

// ── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const { plan, subject, topic, subTopic, grade, duration } = await req.json()

  if (!plan) {
    return NextResponse.json({ error: 'No plan data provided' }, { status: 400 })
  }

  try {
    const children: (Paragraph | Table)[] = []

    // ── Title block ────────────────────────────────────────────────────────
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [
          new TextRun({ text: 'LESSON PLAN', bold: true, size: 52, color: C_BLUE, font: 'Arial' }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: 'Nigerian NERDC Curriculum — AI Generated',
            size: 20, font: 'Arial', color: C_INK_MID, italics: true,
          }),
        ],
      }),
    )

    // ── Info table (NAME / CLASS / WEEK / DATE / SUBJECT / TOPIC …) ───────
    const infoCell = (label: string, value: string, width = 2340) =>
      new TableCell({
        width: { size: width, type: WidthType.DXA },
        borders: allBorders(C_BLUE + '55'),
        margins: cellMargins,
        shading: { type: ShadingType.CLEAR, fill: C_BLUE_LIGHT },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: `${label}: `, bold: true, size: 20, font: 'Arial', color: C_BLUE_DARK }),
              new TextRun({ text: value || '_______________', size: 20, font: 'Arial', color: C_INK }),
            ],
          }),
        ],
      })

    children.push(
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2340, 2340, 2340, 2340],
        rows: [
          new TableRow({
            children: [
              infoCell('NAME', ''),
              infoCell('CLASS', grade),
              infoCell('WEEK', ''),
              infoCell('DATE', ''),
            ],
          }),
          new TableRow({
            children: [
              infoCell('SUBJECT', subject),
              infoCell('TOPIC', topic),
              infoCell('SUB-TOPIC', subTopic || topic),
              infoCell('DURATION', duration || '45 minutes'),
            ],
          }),
        ],
      }),
      spacer(),
    )

    // ── Sub-topics covered ──────────────────────────────────────────────────
    if (plan.sub_topics?.length) {
      children.push(sectionBar('Sub-Topics Covered'))
      children.push(body(plan.sub_topics.join('   •   '), { bold: true, colour: C_INK }))
      children.push(spacer())
    }

    // ── Learning Objectives ─────────────────────────────────────────────────
    children.push(sectionBar('Learning Objectives'))
    children.push(body('At the end of the lesson, pupils should be able to:'))
    ;(plan.learning_objectives ?? []).forEach((obj: string) =>
      children.push(
        new Paragraph({
          numbering: { reference: 'bullets', level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: obj, size: 22, font: 'Arial', color: C_INK_MID })],
        }),
      ),
    )
    children.push(spacer())

    // ── Success Criteria ────────────────────────────────────────────────────
    children.push(sectionBar('Success Criteria'))
    ;(plan.success_criteria ?? []).forEach((sc: string) =>
      children.push(
        new Paragraph({
          numbering: { reference: 'checks', level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: sc, size: 22, font: 'Arial', color: C_INK_MID })],
        }),
      ),
    )
    children.push(spacer())

    // ── Prior Learning ──────────────────────────────────────────────────────
    children.push(sectionBar('Prior Learning'))
    children.push(body(plan.prior_learning ?? ''))
    children.push(spacer())

    // ── Starter Activity ────────────────────────────────────────────────────
    children.push(sectionBar('Starter Activity  (5–8 minutes)'))
    children.push(body(plan.starter_activity ?? ''))
    children.push(spacer())

    // ── Main Activities ─────────────────────────────────────────────────────
    ;(plan.main_activities ?? []).forEach(
      (act: { title: string; description: string }, i: number) => {
        children.push(sectionBar(`Main Activity ${i + 1} — ${act.title}  (10 min)`))
        children.push(body(act.description ?? ''))
        children.push(spacer())
      },
    )

    // ── Extension ───────────────────────────────────────────────────────────
    if (plan.extension) {
      children.push(sectionBar('Extension / Project'))
      children.push(body(plan.extension))
      children.push(spacer())
    }

    // ── Teacher's Content Notes ─────────────────────────────────────────────
    children.push(sectionBar("Teacher's Content Notes"))
    children.push(
      new Paragraph({
        spacing: { after: 120 },
        shading: { type: ShadingType.CLEAR, fill: 'F5FAFF' },
        indent: { left: 100, right: 100 },
        children: [
          new TextRun({ text: plan.note ?? '', size: 22, font: 'Arial', color: C_INK_MID }),
        ],
      }),
    )
    children.push(spacer())

    // ── Plenary ─────────────────────────────────────────────────────────────
    children.push(sectionBar('Plenary  (5 minutes)'))
    children.push(body(plan.plenary ?? ''))
    children.push(spacer())

    // ── Resources ───────────────────────────────────────────────────────────
    children.push(sectionBar('Resources'))
    ;(plan.resources ?? []).forEach((r: string) =>
      children.push(
        new Paragraph({
          numbering: { reference: 'bullets', level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: r, size: 22, font: 'Arial', color: C_INK_MID })],
        }),
      ),
    )
    children.push(spacer())

    // ── Tasks ────────────────────────────────────────────────────────────────
    children.push(sectionBar('Tasks'))
    if (plan.class_task?.length) {
      children.push(body('Class Task:', { bold: true, colour: C_INK }))
      plan.class_task.forEach((t: string) =>
        children.push(
          new Paragraph({
            numbering: { reference: 'bullets', level: 0 },
            spacing: { after: 80 },
            children: [new TextRun({ text: t, size: 22, font: 'Arial', color: C_INK_MID })],
          }),
        ),
      )
    }
    if (plan.home_task?.length) {
      children.push(body('Home Task:', { bold: true, colour: C_INK }))
      plan.home_task.forEach((t: string) =>
        children.push(
          new Paragraph({
            numbering: { reference: 'bullets', level: 0 },
            spacing: { after: 80 },
            children: [new TextRun({ text: t, size: 22, font: 'Arial', color: C_INK_MID })],
          }),
        ),
      )
    }
    children.push(spacer())

    // ── Cross-curricular Links ───────────────────────────────────────────────
    if (plan.links && Object.keys(plan.links).length) {
      children.push(sectionBar('Cross-Curricular Links'))
      Object.entries(plan.links).forEach(([subj, desc]) =>
        children.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: `${subj}: `, bold: true, size: 22, font: 'Arial', color: C_BLUE }),
              new TextRun({ text: desc as string, size: 22, font: 'Arial', color: C_INK_MID }),
            ],
          }),
        ),
      )
      children.push(spacer())
    }

    // ── Key Words ────────────────────────────────────────────────────────────
    if (plan.key_words?.length) {
      children.push(sectionBar('Key Words'))
      children.push(
        new Paragraph({
          spacing: { after: 160 },
          children: (plan.key_words as string[]).map((w, i) =>
            new TextRun({
              text: (i === 0 ? '' : '     ') + w.toUpperCase(),
              bold: true, size: 24, font: 'Arial', color: C_AMBER,
            }),
          ),
        }),
      )
      children.push(spacer())
    }

    // ── Evaluation table ────────────────────────────────────────────────────
    children.push(sectionBar('Evaluation'))
    const evalHeaders = ['NAMES', 'ABILITY', 'INTENDED ACTIVITY']
    const evalWidths  = [3000, 2200, 4160]
    children.push(
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: evalWidths,
        rows: [
          // Header row
          new TableRow({
            tableHeader: true,
            children: evalHeaders.map((h, i) =>
              new TableCell({
                width: { size: evalWidths[i], type: WidthType.DXA },
                shading: { type: ShadingType.CLEAR, fill: C_BLUE_DARK },
                borders: allBorders(C_WHITE),
                margins: cellMargins,
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: h, bold: true, color: C_WHITE, size: 20, font: 'Arial' }),
                    ],
                  }),
                ],
              }),
            ),
          }),
          // HA / MA / LA rows
          ...['HA — High Ability', 'MA — Middle Ability', 'LA — Low Ability'].map((ability, i) =>
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 3000, type: WidthType.DXA },
                  borders: allBorders(),
                  margins: cellMargins,
                  children: [new Paragraph({ children: [new TextRun({ text: ' ', size: 22 })] })],
                }),
                new TableCell({
                  width: { size: 2200, type: WidthType.DXA },
                  shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? C_BLUE_LIGHT : C_WHITE },
                  borders: allBorders(),
                  margins: cellMargins,
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: ability, bold: true, size: 20, font: 'Arial', color: C_BLUE_DARK }),
                      ],
                    }),
                  ],
                }),
                new TableCell({
                  width: { size: 4160, type: WidthType.DXA },
                  borders: allBorders(),
                  margins: cellMargins,
                  children: [new Paragraph({ children: [new TextRun({ text: ' ', size: 22 })] })],
                }),
              ],
            }),
          ),
        ],
      }),
      spacer(),
    )

    // ── Differentiation (VAK) ────────────────────────────────────────────────
    children.push(sectionBar('Differentiation (VAK)'))
    const diff = plan.differentiation ?? {}
    const vakRows: [string, string, string][] = [
      ['VISUAL',       'EBF4FF', diff.visual       ?? ''],
      ['AUDITORY',     'F0FFF4', diff.auditory      ?? ''],
      ['KINESTHETIC',  'FFFBEB', diff.kinesthetic   ?? ''],
    ]
    vakRows.forEach(([label, fill, text]) =>
      children.push(
        new Paragraph({
          spacing: { after: 140 },
          shading: { type: ShadingType.CLEAR, fill },
          indent: { left: 60, right: 60 },
          children: [
            new TextRun({ text: `${label}: `, bold: true, size: 22, font: 'Arial', color: C_BLUE }),
            new TextRun({ text, size: 22, font: 'Arial', color: C_INK_MID }),
          ],
        }),
      ),
    )

    // ── Footer note ─────────────────────────────────────────────────────────
    children.push(spacer(), spacer())
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: 'Generated by SkillBridge Nigeria AI Lesson Planner · Aligned to NERDC Curriculum',
            size: 18, font: 'Arial', color: 'AAAAAA', italics: true,
          }),
        ],
      }),
    )

    // ── Assemble document ────────────────────────────────────────────────────
    const doc = new Document({
      numbering: {
        config: [
          {
            reference: 'bullets',
            levels: [{
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 540, hanging: 360 } } },
            }],
          },
          {
            reference: 'checks',
            levels: [{
              level: 0,
              format: LevelFormat.BULLET,
              text: '✓',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 540, hanging: 360 } } },
            }],
          },
        ],
      },
      sections: [{
        properties: {
          page: {
            size: { width: 11906, height: 16838 },   // A4
            margin: { top: 900, right: 900, bottom: 900, left: 900 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: C_BLUE, space: 4 } },
                children: [
                  new TextRun({
                    text: `SkillBridge Nigeria  ·  ${subject}  ·  ${subTopic || topic}  ·  ${grade}`,
                    size: 18, font: 'Arial', color: C_INK_MID,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      }],
    })

    const buffer = await Packer.toBuffer(doc)
    const safeName = `NERDC-Lesson-Plan-${(subTopic || topic).replace(/[^a-z0-9]/gi, '-')}.docx`

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeName}"`,
      },
    })
  } catch (err) {
    console.error('DOCX generation error:', err)
    return NextResponse.json({ error: 'Failed to generate DOCX' }, { status: 500 })
  }
}
