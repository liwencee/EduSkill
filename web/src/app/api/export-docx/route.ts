import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const { plan, subject, topic, grade } = await req.json()
    if (!plan) return NextResponse.json({ error: 'plan is required' }, { status: 400 })

    const {
      Document, Packer, Paragraph, TextRun, HeadingLevel,
      AlignmentType, BorderStyle, Table, TableRow, TableCell,
      WidthType, ShadingType,
    } = await import('docx')

    const BLUE  = '1e40af'
    const AMBER = 'b45309'
    const DARK  = '1e293b'
    const GRAY  = '64748b'
    const LIGHT_BLUE = 'dbeafe'
    const LIGHT_AMBER = 'fef3c7'

    function heading1(text: string) {
      return new Paragraph({
        text,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 320, after: 120 },
        shading: { type: ShadingType.CLEAR, fill: LIGHT_BLUE },
        run: { bold: true, color: BLUE },
      })
    }

    function heading2(text: string) {
      return new Paragraph({
        text,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 80 },
        run: { color: DARK },
      })
    }

    function bullet(text: string, level = 0) {
      return new Paragraph({
        text,
        bullet: { level },
        spacing: { before: 40, after: 40 },
        run: { size: 22, color: DARK },
      })
    }

    function body(text: string) {
      return new Paragraph({
        children: [new TextRun({ text, size: 22, color: DARK })],
        spacing: { before: 60, after: 60 },
      })
    }

    function label(text: string) {
      return new Paragraph({
        children: [new TextRun({ text, bold: true, size: 22, color: BLUE })],
        spacing: { before: 80, after: 20 },
      })
    }

    function divider() {
      return new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cbd5e1' } },
        spacing: { before: 80, after: 80 },
        children: [],
      })
    }

    const children: any[] = []

    // ── Title ──
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
        children: [
          new TextRun({ text: 'NERDC Lesson Plan', bold: true, size: 36, color: BLUE }),
          new TextRun({ text: '\n', break: 1 }),
          new TextRun({ text: `${subject}  ·  ${topic}  ·  ${grade}`, size: 24, color: GRAY }),
        ],
      })
    )
    children.push(divider())

    // ── Sub-topics ──
    if (plan.sub_topics?.length) {
      children.push(heading1('📚 Sub-Topics'))
      plan.sub_topics.forEach((s: string) => children.push(bullet(s)))
    }

    // ── Key Words ──
    if (plan.key_words?.length) {
      children.push(heading1('🔑 Key Words'))
      children.push(body(plan.key_words.join('   |   ')))
    }

    // ── Learning Objectives ──
    if (plan.learning_objectives?.length) {
      children.push(heading1('🎯 Learning Objectives'))
      plan.learning_objectives.forEach((o: string) => children.push(bullet(o)))
    }

    // ── Success Criteria ──
    if (plan.success_criteria?.length) {
      children.push(heading1('✅ Success Criteria'))
      plan.success_criteria.forEach((s: string) => children.push(bullet(s)))
    }

    // ── Prior Learning ──
    if (plan.prior_learning) {
      children.push(heading1('🔗 Prior Learning'))
      children.push(body(plan.prior_learning))
    }

    // ── LESSON NOTES ──
    if (plan.lesson_notes) {
      const ln = plan.lesson_notes
      children.push(heading1('📖 Lesson Notes'))

      if (ln.definition) {
        children.push(heading2('Definition'))
        children.push(body(ln.definition))
      }

      if (ln.detailed_explanation?.length) {
        children.push(heading2('Detailed Explanation'))
        ln.detailed_explanation.forEach((p: string) => children.push(body(p)))
      }

      if (ln.examples?.length) {
        children.push(heading2('Examples'))
        ln.examples.forEach((ex: { title: string; description: string }) => {
          children.push(label(ex.title))
          children.push(body(ex.description))
        })
      }

      if (ln.daily_life_application?.length) {
        children.push(heading2('Daily Life Application in Nigeria'))
        ln.daily_life_application.forEach((a: string) => children.push(bullet(a)))
      }
    }

    // ── Lesson Flow ──
    children.push(heading1('⏱ Lesson Flow'))

    if (plan.starter_activity) {
      children.push(heading2('Starter Activity'))
      children.push(body(plan.starter_activity))
    }

    if (plan.main_activities?.length) {
      plan.main_activities.forEach((act: { title: string; description: string }) => {
        children.push(heading2(act.title))
        children.push(body(act.description))
      })
    }

    if (plan.plenary) {
      children.push(heading2('Plenary'))
      children.push(body(plan.plenary))
    }

    if (plan.extension) {
      children.push(heading2('Extension / Enrichment'))
      children.push(body(plan.extension))
    }

    // ── Class Work ──
    if (plan.class_work?.length) {
      children.push(heading1('✍️ Class Work'))
      plan.class_work.forEach((cw: { question: string; marks: number; model_answer: string }, i: number) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Q${i + 1}. `, bold: true, size: 22, color: BLUE }),
              new TextRun({ text: cw.question.replace(/^\d+\.\s*/, ''), size: 22, color: DARK }),
              new TextRun({ text: `  (${cw.marks} marks)`, bold: true, size: 22, color: AMBER }),
            ],
            spacing: { before: 100, after: 40 },
          })
        )
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: 'Model Answer: ', bold: true, size: 20, color: GRAY }),
              new TextRun({ text: cw.model_answer, size: 20, italics: true, color: GRAY }),
            ],
            spacing: { before: 0, after: 80 },
          })
        )
      })
    }

    // ── Teacher's Notes ──
    if (plan.note) {
      children.push(heading1("📝 Teacher's Content Notes"))
      children.push(body(plan.note))
    }

    // ── Differentiation ──
    if (plan.differentiation) {
      children.push(heading1('🎨 Differentiation (VAK)'))
      const d = plan.differentiation
      if (d.visual)      { children.push(label('👁 Visual'));     children.push(body(d.visual)) }
      if (d.auditory)    { children.push(label('👂 Auditory'));   children.push(body(d.auditory)) }
      if (d.kinesthetic) { children.push(label('🤸 Kinesthetic'));children.push(body(d.kinesthetic)) }
    }

    // ── Resources ──
    if (plan.resources?.length) {
      children.push(heading1('🛠 Resources'))
      plan.resources.forEach((r: string) => children.push(bullet(r)))
    }

    // ── Cross-curricular Links ──
    if (plan.links) {
      children.push(heading1('🔗 Cross-Curricular Links'))
      Object.entries(plan.links).forEach(([k, v]) => {
        children.push(label(k))
        children.push(body(v as string))
      })
    }

    // ── Home Task ──
    if (plan.home_task?.length) {
      children.push(heading1('🏠 Home Task'))
      plan.home_task.forEach((h: string) => children.push(bullet(h)))
    }

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: { font: 'Calibri', size: 22 },
          },
        },
      },
      sections: [{
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 900, right: 900 },
          },
        },
        children,
      }],
    })

    const buffer = await Packer.toBuffer(doc)
    // Convert Node Buffer → Uint8Array so NextResponse accepts it
    const uint8 = new Uint8Array(buffer)

    const filename = `Lesson-Plan-${subject}-${topic}-${grade}.docx`
      .replace(/[^a-zA-Z0-9.\-_]/g, '-')

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (err) {
    console.error('DOCX export error:', err)
    return NextResponse.json({ error: 'Failed to generate DOCX' }, { status: 500 })
  }
}
