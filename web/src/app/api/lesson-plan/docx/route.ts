import { NextRequest, NextResponse } from 'next/server'
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, LevelFormat,
  Header,
} from 'docx'
import { rateLimit, getClientIp, rateLimitHeaders, LIMITS } from '@/lib/rate-limit'
import { logger, logRequest, logResponse } from '@/lib/logger'

export const dynamic = 'force-dynamic'

// ── Brand colours (hex, no #) ────────────────────────────────────────────────
const C_BLUE       = '378ADD'
const C_BLUE_DARK  = '1E4F8A'
const C_BLUE_LIGHT = 'EBF4FF'
const C_AMBER      = 'F37321'
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

/** Empty spacer line */
const spacer = () => new Paragraph({ children: [new TextRun('')], spacing: { after: 60 } })

// ── Main handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const ctx = logRequest('/api/lesson-plan/docx', req)

  // ── Rate limiting: 15 DOCX exports / minute per IP ──────────────
  const ip = getClientIp(req)
  const rl  = rateLimit(ip, 'docxExport', LIMITS.docxExport.max, LIMITS.docxExport.windowMs)
  if (!rl.success) {
    logger.warn('DOCX export rate limit exceeded', { ip, route: '/api/lesson-plan/docx' })
    logResponse('/api/lesson-plan/docx', ctx, 429)
    return NextResponse.json(
      { error: 'Too many export requests. Please wait before downloading again.' },
      { status: 429, headers: rateLimitHeaders(rl) }
    )
  }

  const { plan, subject, topic, subTopic, grade, duration } = await req.json()

  if (!plan) {
    logResponse('/api/lesson-plan/docx', ctx, 400)
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

    // ── Lesson Notes Breakdown ──────────────────────────────────────────────
    if (plan.lesson_notes) {
      const ln = plan.lesson_notes

      // Definition
      if (ln.definition) {
        children.push(sectionBar('Lesson Note — Definition'))
        children.push(
          new Paragraph({
            spacing: { after: 160 },
            shading: { type: ShadingType.CLEAR, fill: C_BLUE_LIGHT },
            indent: { left: 100, right: 100 },
            children: [
              new TextRun({ text: ln.definition, size: 22, font: 'Arial', color: C_INK, bold: true }),
            ],
          }),
        )
        children.push(spacer())
      }

      // Detailed Explanation
      if (Array.isArray(ln.detailed_explanation) && ln.detailed_explanation.length) {
        children.push(sectionBar('Lesson Note — Detailed Explanation'))
        ln.detailed_explanation.forEach((para: string, i: number) =>
          children.push(
            new Paragraph({
              spacing: { after: 140 },
              indent: { left: 60 },
              children: [
                new TextRun({ text: `${i + 1}.  `, bold: true, size: 22, font: 'Arial', color: C_BLUE }),
                new TextRun({ text: para, size: 22, font: 'Arial', color: C_INK_MID }),
              ],
            }),
          ),
        )
        children.push(spacer())
      }

      // Worked Examples
      if (Array.isArray(ln.examples) && ln.examples.length) {
        children.push(sectionBar('Lesson Note — Worked Examples'))
        ln.examples.forEach((ex: { title: string; description: string }, i: number) => {
          children.push(
            new Paragraph({
              spacing: { before: 80, after: 40 },
              shading: { type: ShadingType.CLEAR, fill: 'FFFBEB' },
              indent: { left: 100, right: 100 },
              children: [
                new TextRun({ text: `Example ${i + 1}: `, bold: true, size: 22, font: 'Arial', color: C_AMBER }),
                new TextRun({ text: ex.title ?? '', bold: true, size: 22, font: 'Arial', color: C_INK }),
              ],
            }),
          )
          children.push(
            new Paragraph({
              spacing: { after: 120 },
              shading: { type: ShadingType.CLEAR, fill: 'FFFBEB' },
              indent: { left: 100, right: 100 },
              children: [
                new TextRun({ text: ex.description ?? '', size: 22, font: 'Arial', color: C_INK_MID }),
              ],
            }),
          )
        })
        children.push(spacer())
      }

      // Daily Life Application
      if (Array.isArray(ln.daily_life_application) && ln.daily_life_application.length) {
        children.push(sectionBar('Lesson Note — Application in Daily Life'))
        ln.daily_life_application.forEach((app: string) =>
          children.push(
            new Paragraph({
              spacing: { after: 100 },
              shading: { type: ShadingType.CLEAR, fill: 'F0FFF4' },
              indent: { left: 100, right: 100 },
              children: [
                new TextRun({ text: '→  ', bold: true, size: 22, font: 'Arial', color: '16A34A' }),
                new TextRun({ text: app, size: 22, font: 'Arial', color: C_INK_MID }),
              ],
            }),
          ),
        )
        children.push(spacer())
      }
    }

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

    // ── Class Work (rich format with marks + model answers) ────────────────
    if (Array.isArray(plan.class_work) && plan.class_work.length) {
      children.push(sectionBar('Class Work  (with Model Answers)'))
      plan.class_work.forEach(
        (q: { question: string; marks: number; model_answer: string }, i: number) => {
          // Question header
          children.push(
            new Paragraph({
              spacing: { before: 100, after: 40 },
              shading: { type: ShadingType.CLEAR, fill: C_BLUE_LIGHT },
              indent: { left: 100, right: 100 },
              children: [
                new TextRun({ text: `Q${i + 1}.  `, bold: true, size: 22, font: 'Arial', color: C_BLUE_DARK }),
                new TextRun({ text: q.question ?? '', size: 22, font: 'Arial', color: C_INK }),
                new TextRun({ text: `   [${q.marks ?? 0} marks]`, bold: true, size: 20, font: 'Arial', color: C_AMBER }),
              ],
            }),
          )
          // Model answer
          children.push(
            new Paragraph({
              spacing: { after: 140 },
              indent: { left: 240, right: 100 },
              children: [
                new TextRun({ text: '✓ Model Answer: ', bold: true, size: 20, font: 'Arial', color: '16A34A' }),
                new TextRun({ text: q.model_answer ?? '', size: 20, font: 'Arial', color: C_INK_MID, italics: true }),
              ],
            }),
          )
        },
      )
      children.push(spacer())
    } else if (plan.class_task?.length) {
      // Legacy class_task fallback
      children.push(sectionBar('Class Task'))
      plan.class_task.forEach((t: string) =>
        children.push(
          new Paragraph({
            numbering: { reference: 'bullets', level: 0 },
            spacing: { after: 80 },
            children: [new TextRun({ text: t, size: 22, font: 'Arial', color: C_INK_MID })],
          }),
        ),
      )
      children.push(spacer())
    }

    // ── Home Task ───────────────────────────────────────────────────────────
    if (plan.home_task?.length) {
      children.push(sectionBar('Home Task'))
      plan.home_task.forEach((t: string) =>
        children.push(
          new Paragraph({
            numbering: { reference: 'bullets', level: 0 },
            spacing: { after: 80 },
            children: [new TextRun({ text: t, size: 22, font: 'Arial', color: C_INK_MID })],
          }),
        ),
      )
      children.push(spacer())
    }

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
            text: 'Generated by Skillora AI Lesson Planner · Aligned to NERDC Curriculum',
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
                    text: `Skillora  ·  ${subject}  ·  ${subTopic || topic}  ·  ${grade}`,
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

    // Wrap Node Buffer in Uint8Array — Buffer extends Uint8Array but the
    // NextResponse type signature only accepts BodyInit (Uint8Array, Blob,
    // ArrayBuffer, etc.) so we convert explicitly.
    logResponse('/api/lesson-plan/docx', ctx, 200)
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${safeName}"`,
        ...rateLimitHeaders(rl),
      },
    })
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    logger.error('DOCX generation failed', {
      route: '/api/lesson-plan/docx',
      error: { message: error.message, name: error.name },
    })
    logResponse('/api/lesson-plan/docx', ctx, 500, { error: { message: error.message } })
    return NextResponse.json({ error: 'Failed to generate DOCX' }, { status: 500 })
  }
}
