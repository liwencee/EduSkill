// ── CPD Short Courses for Teachers ──────────────────────────────────────────
// NERDC-aligned, job-market relevant, modern pedagogy
// Each course: modules → lessons → content sections + quiz

export interface CPDQuizOption {
  text: string
  correct?: boolean
}

export interface CPDQuiz {
  question: string
  options: CPDQuizOption[]
  explanation: string
}

export interface CPDLesson {
  id: string
  title: string
  duration_mins: number
  content: string[]        // paragraphs of lesson content
  key_takeaways: string[]
  practical_activity: string
  quiz: CPDQuiz[]
}

export interface CPDModule {
  id: string
  title: string
  description: string
  lessons: CPDLesson[]
}

export interface CPDCourse {
  slug: string
  emoji: string
  title: string
  description: string
  long_description: string
  weeks: number
  total_lessons: number
  total_enrolled: number
  avg_rating: number
  category: string
  what_you_learn: string[]
  who_its_for: string[]
  nerdc_alignment: string[]
  modules: CPDModule[]
  pass_mark: number  // percentage needed to pass
}

export const CPD_COURSES: CPDCourse[] = [

  // ════════════════════════════════════════════════════════════════════════════
  // 1. DIGITAL CLASSROOM SKILLS
  // ════════════════════════════════════════════════════════════════════════════
  {
    slug: 'digital-classroom-skills',
    emoji: '🏫',
    title: 'Digital Classroom Skills',
    description: 'Use Google Classroom, WhatsApp, and digital tools to teach effectively in low-bandwidth environments.',
    long_description: 'Nigeria’s classrooms are going digital — but most teacher training hasn’t caught up. This 3-week course equips you with practical digital skills you can use tomorrow, even with limited internet. Learn to set up Google Classroom, deliver lessons via WhatsApp, create engaging multimedia content, and assess students digitally — all aligned to the NERDC curriculum framework and the 2024 National Policy on ICT in Education.',
    weeks: 3,
    total_lessons: 9,
    total_enrolled: 1240,
    avg_rating: 4.8,
    category: 'Digital Teaching',
    what_you_learn: [
      'Set up and manage a Google Classroom for any NERDC subject',
      'Deliver structured lessons via WhatsApp and Telegram in low-bandwidth areas',
      'Create short video lessons using only your smartphone',
      'Build digital quizzes and auto-graded assessments',
      'Use AI tools (ChatGPT, Gemini) to speed up lesson preparation',
      'Manage a blended classroom (online + in-person students)',
    ],
    who_its_for: [
      'Primary and secondary school teachers',
      'TVET instructors moving to blended delivery',
      'School administrators overseeing digital adoption',
      'Private tutors wanting to scale their teaching',
    ],
    nerdc_alignment: [
      'National Policy on ICT in Education (2024 revision)',
      'NERDC Basic Education Curriculum — Digital Literacy strand',
      'Teachers Registration Council of Nigeria (TRCN) CPD framework',
      'Universal Basic Education Commission (UBEC) digital readiness goals',
    ],
    pass_mark: 70,
    modules: [
      {
        id: 'dc-m1',
        title: 'Foundations of Digital Teaching',
        description: 'Understand why digital skills matter for Nigerian teachers and set up your core tools.',
        lessons: [
          {
            id: 'dc-m1-l1',
            title: 'Why Digital Matters: The Nigerian Classroom in 2025',
            duration_mins: 25,
            content: [
              'Nigeria has over 600,000 primary and secondary schools, but fewer than 30% have consistent internet access. Yet 85% of Nigerian teachers own a smartphone. This gap — between infrastructure and personal device ownership — is the key opportunity for digital teaching in Nigeria.',
              'The 2024 National Policy on ICT in Education mandates that every Nigerian teacher should be digitally literate by 2027. State governments in Lagos, Ogun, Edo, and Kaduna have already begun integrating Google Classroom and WhatsApp-based learning into public schools. Teachers who build these skills now will be ahead of the curve.',
              'Digital teaching doesn’t mean replacing chalk and board. It means using technology to extend your reach: a WhatsApp voice note explaining tonight’s homework, a short video demonstrating a science experiment, a Google Form quiz that marks itself. These small additions save hours and boost student engagement.',
              'Research from the Nigerian Educational Research and Development Council shows that students in digitally-enhanced classrooms score 15–23% higher on standardised tests compared to traditional-only classrooms. The effect is strongest in Mathematics and Basic Science.',
            ],
            key_takeaways: [
              'Most Nigerian teachers already have the hardware they need — a smartphone',
              'National policy now requires digital literacy for all teachers',
              'Digital teaching supplements (not replaces) classroom instruction',
              'Evidence shows measurable learning gains from digital tools',
            ],
            practical_activity: 'Audit your current digital tools: list every device and app you already use. Identify one subject where you could add a digital element this week (e.g., send a voice note summary after class via WhatsApp).',
            quiz: [
              {
                question: 'According to the lesson, what percentage of Nigerian teachers own a smartphone?',
                options: [
                  { text: '45%' },
                  { text: '65%' },
                  { text: '85%', correct: true },
                  { text: '95%' },
                ],
                explanation: 'The lesson states that 85% of Nigerian teachers own a smartphone, which represents the key opportunity for digital teaching even in areas with limited school infrastructure.',
              },
              {
                question: 'By what year does the 2024 National Policy on ICT in Education mandate teacher digital literacy?',
                options: [
                  { text: '2025' },
                  { text: '2026' },
                  { text: '2027', correct: true },
                  { text: '2030' },
                ],
                explanation: 'The policy mandates that every Nigerian teacher should be digitally literate by 2027.',
              },
              {
                question: 'Digital teaching is best described as:',
                options: [
                  { text: 'Replacing traditional classroom methods entirely' },
                  { text: 'Using technology to extend teaching reach and effectiveness', correct: true },
                  { text: 'Only teaching via video calls' },
                  { text: 'Requiring every student to have a laptop' },
                ],
                explanation: 'Digital teaching supplements traditional methods — it extends reach through tools like voice notes, videos, and auto-graded quizzes.',
              },
            ],
          },
          {
            id: 'dc-m1-l2',
            title: 'Setting Up Google Classroom Step-by-Step',
            duration_mins: 35,
            content: [
              'Google Classroom is free, works on any smartphone, and is already approved by several state education boards in Nigeria. It lets you create classes, post assignments, share materials, and grade work — all from your phone.',
              'Step 1: Go to classroom.google.com or download the Google Classroom app. Sign in with any Gmail account. If your school has a Google Workspace for Education account, use that instead for extra features like video meetings.',
              'Step 2: Click "+" then "Create class." Name your class clearly: "JSS 2 — Mathematics — Mrs. Adeyemi" is better than "My Class." Add a description with the term and year. Choose a subject area.',
              'Step 3: Share the class code with students. They can join from any device. For students without email, you can print the code and they join via a parent’s phone. Tip: Post the code in your school’s WhatsApp group.',
              'Step 4: Organise your class with Topics. Create one topic per NERDC module or term unit. For example: "Term 1 — Number & Numeration", "Term 1 — Algebraic Processes." This mirrors the NERDC scheme of work and helps students navigate.',
              'Step 5: Post your first material. Click "+" in the Classwork tab, choose "Material," and upload a PDF of your notes or a photo of the board summary from today’s class. Students can access it anytime.',
            ],
            key_takeaways: [
              'Google Classroom is free and works on smartphones',
              'Name classes clearly with subject, level, and teacher name',
              'Organise topics to mirror the NERDC scheme of work',
              'Students without email can join via a parent’s device',
            ],
            practical_activity: 'Create your first Google Classroom right now. Name it properly, add 3 topics matching your current NERDC scheme of work, and post one material (photo of notes or a PDF). Share the class code with at least 5 students.',
            quiz: [
              {
                question: 'What is the recommended way to name a Google Classroom?',
                options: [
                  { text: 'Just the subject name (e.g., "Maths")' },
                  { text: 'Level + Subject + Teacher name (e.g., "JSS 2 — Mathematics — Mrs. Adeyemi")', correct: true },
                  { text: 'The school name only' },
                  { text: 'A fun nickname' },
                ],
                explanation: 'Clear naming with level, subject, and teacher name helps students find and identify the right class easily.',
              },
              {
                question: 'How should you organise content in Google Classroom to align with NERDC?',
                options: [
                  { text: 'Post everything in one stream' },
                  { text: 'Create topics that mirror the NERDC scheme of work modules', correct: true },
                  { text: 'Organise by date only' },
                  { text: 'Let students organise it themselves' },
                ],
                explanation: 'Creating topics that mirror NERDC modules (e.g., "Term 1 — Number & Numeration") helps students navigate and aligns with the curriculum.',
              },
            ],
          },
          {
            id: 'dc-m1-l3',
            title: 'Teaching with WhatsApp: Structured Lesson Delivery',
            duration_mins: 30,
            content: [
              'WhatsApp is Nigeria’s most-used app with over 100 million users. For teachers in areas with limited internet, WhatsApp is often more reliable than web-based platforms. The key is using it with structure, not chaos.',
              'The “5-Message Lesson” format works best: (1) A greeting + today’s topic announcement, (2) A voice note or text explaining the key concept (under 3 minutes), (3) A photo or diagram illustrating the concept, (4) A quick question for students to answer in the group, (5) A summary + homework assignment.',
              'Rules that keep WhatsApp groups productive: Only the teacher posts during lesson time (use the "Only admins can send messages" setting, then open it for Q&A). Number your messages so students can reference them. Use the pin feature for important announcements.',
              'Low-bandwidth tips: Compress images before sending (use the "Document" option instead of "Photo" for higher quality at lower data cost). Record voice notes instead of typing long texts — they use less data than images. Avoid sending videos larger than 5MB.',
              'For assessment: Use WhatsApp Polls (built-in feature) for quick multiple-choice checks. For open-ended answers, ask students to reply privately to avoid copying. Screenshot and save responses for your records.',
            ],
            key_takeaways: [
              'Use the structured 5-Message Lesson format for WhatsApp teaching',
              'Lock the group during lesson delivery, open for Q&A after',
              'Voice notes use less data than images — ideal for low-bandwidth',
              'WhatsApp Polls work as instant formative assessments',
            ],
            practical_activity: 'Create a WhatsApp group for one of your classes. Deliver a 5-Message Lesson on your next topic. Use the admin-only setting during the lesson, then open for discussion. End with a WhatsApp Poll quiz question.',
            quiz: [
              {
                question: 'What is the correct order for the 5-Message Lesson format?',
                options: [
                  { text: 'Quiz, Concept, Summary, Greeting, Homework' },
                  { text: 'Greeting + Topic, Concept explanation, Diagram, Question, Summary + Homework', correct: true },
                  { text: 'Homework, Greeting, Concept, Quiz, Summary' },
                  { text: 'Video, Voice note, Text, Image, Poll' },
                ],
                explanation: 'The structured format starts with a greeting, then concept delivery, visual aid, engagement question, and finally summary with homework.',
              },
              {
                question: 'Which uses the LEAST data on WhatsApp?',
                options: [
                  { text: 'Sending a photo' },
                  { text: 'Sending a video' },
                  { text: 'Sending a voice note', correct: true },
                  { text: 'Sending a document' },
                ],
                explanation: 'Voice notes use less data than images or videos, making them ideal for low-bandwidth areas.',
              },
            ],
          },
        ],
      },
      {
        id: 'dc-m2',
        title: 'Creating Digital Content',
        description: 'Build engaging videos, presentations, and materials using just your smartphone.',
        lessons: [
          {
            id: 'dc-m2-l1',
            title: 'Smartphone Video Lessons: Record, Edit, Share',
            duration_mins: 30,
            content: [
              'You don’t need a studio to create effective video lessons. A smartphone, natural light, and a quiet corner are enough. Research shows that short, focused videos (3–7 minutes) produce better learning outcomes than long recordings.',
              'Recording tips: Hold your phone horizontally (landscape mode). Face a window for natural light on your face. Place the phone on a stack of books at eye level. Speak clearly and slightly slower than normal. Use a simple background — a plain wall or your chalkboard.',
              'The “Board + Voice” technique: Write key points on your chalkboard or a piece of paper, then record yourself explaining them. This combines visual and auditory learning. Point at each item as you explain it. Students can pause and rewatch.',
              'Free editing apps: CapCut (free, no watermark) lets you trim, add text overlays, and merge clips. InShot is another good option. Keep edits simple: trim the start and end, add a title slide, and maybe captions for accessibility.',
              'Sharing: Upload to Google Classroom directly, or share via WhatsApp as a document (not as a video — document preserves quality). For larger classes, upload to YouTube as "Unlisted" and share the link.',
            ],
            key_takeaways: [
              'Short videos (3–7 min) are more effective than long recordings',
              'Natural light + landscape mode + stable surface = professional look',
              'The Board + Voice technique combines visual and auditory learning',
              'CapCut and InShot are free editing apps with no watermarks',
            ],
            practical_activity: 'Record a 5-minute video lesson on your next topic using the Board + Voice technique. Edit it in CapCut (trim start/end, add a title). Share it with your class via Google Classroom or WhatsApp.',
            quiz: [
              {
                question: 'What is the optimal length for a video lesson according to research?',
                options: [
                  { text: '1–2 minutes' },
                  { text: '3–7 minutes', correct: true },
                  { text: '15–20 minutes' },
                  { text: '30+ minutes' },
                ],
                explanation: 'Research shows that short, focused videos of 3–7 minutes produce better learning outcomes than long recordings.',
              },
              {
                question: 'How should you share video lessons via WhatsApp to preserve quality?',
                options: [
                  { text: 'As a regular video' },
                  { text: 'As a document', correct: true },
                  { text: 'As a voice note' },
                  { text: 'As a status update' },
                ],
                explanation: 'Sharing as a document preserves the original video quality, unlike the compressed video sharing option.',
              },
            ],
          },
          {
            id: 'dc-m2-l2',
            title: 'AI-Powered Lesson Preparation',
            duration_mins: 30,
            content: [
              'Artificial Intelligence tools like ChatGPT, Google Gemini, and our own AI Lesson Planner can save Nigerian teachers 3–5 hours of preparation time per week. The key is learning to give AI the right instructions (called "prompts").',
              'Effective prompting for Nigerian teachers: Always specify the NERDC curriculum level, the subject, the specific topic, and the student context. For example: "Create a 40-minute JSS 2 Basic Science lesson plan on Plant Reproduction, aligned to the NERDC curriculum. Students are in a rural school in Oyo State with limited lab equipment."',
              'What AI does well: Generating lesson plan structures, creating quiz questions with answer keys, suggesting differentiated activities for mixed-ability classes, translating content summaries into Yoruba/Igbo/Hausa for multilingual classrooms, and creating word problems with local context (using Naira, Nigerian names, local foods).',
              'What AI does NOT do well: It cannot replace your knowledge of your specific students. Always review AI-generated content for accuracy, cultural appropriateness, and alignment with the exact NERDC scheme of work for your state. Think of AI as a fast first draft, not a final product.',
              'The Skillora AI Lesson Planner (available in the EduPro tab) is specifically trained on the NERDC curriculum. It generates plans with NERDC-aligned objectives, differentiation strategies, and assessment tasks — ready to use or customise.',
            ],
            key_takeaways: [
              'AI can save 3–5 hours of lesson prep per week',
              'Always specify NERDC level, subject, topic, and student context in prompts',
              'AI generates good first drafts — always review for accuracy and cultural fit',
              'The Skillora AI Planner is pre-trained on the NERDC curriculum',
            ],
            practical_activity: 'Use the Skillora AI Lesson Planner to generate a lesson plan for your next class. Compare it to a plan you would write manually. Note what was useful and what you would change. Time how long the AI version takes vs. your usual prep time.',
            quiz: [
              {
                question: 'How much preparation time can AI tools save Nigerian teachers per week?',
                options: [
                  { text: '30 minutes' },
                  { text: '1–2 hours' },
                  { text: '3–5 hours', correct: true },
                  { text: '10+ hours' },
                ],
                explanation: 'AI tools like ChatGPT and the Skillora Lesson Planner can save teachers 3–5 hours of preparation time per week.',
              },
              {
                question: 'What should you always include when prompting AI for a lesson plan?',
                options: [
                  { text: 'Just the topic name' },
                  { text: 'NERDC level, subject, topic, and student context', correct: true },
                  { text: 'Only the grade level' },
                  { text: 'The textbook page number' },
                ],
                explanation: 'Effective prompts include the NERDC curriculum level, subject, specific topic, and student context for relevant, aligned output.',
              },
            ],
          },
          {
            id: 'dc-m2-l3',
            title: 'Building Digital Quizzes and Auto-Graded Assessments',
            duration_mins: 30,
            content: [
              'Manual marking is one of the biggest time drains for Nigerian teachers. A single teacher with 60+ students per class can spend entire weekends marking tests. Digital quizzes can mark themselves instantly and give you data on which topics students are struggling with.',
              'Google Forms is the simplest tool. Create a new form, switch to "Quiz" mode (settings gear → Quizzes → Make this a quiz). Add questions, set correct answers and point values. When students submit, they get instant feedback and you get a spreadsheet of results.',
              'Question types that work best: Multiple choice for recall and comprehension, short answer for calculations (Google Forms can accept multiple correct formats, e.g., "15" and "fifteen"), and checkbox questions for "select all that apply" topics.',
              'Accessibility: For students with limited data, you can create quizzes in WhatsApp using the built-in Polls feature (multiple choice only) or by having students number their answers and send via text. Keep a tally sheet.',
              'Using quiz data: After each quiz, export the Google Forms spreadsheet. Sort by question to see which ones most students got wrong — that tells you what to re-teach. This is data-driven teaching and is a key skill for modern Nigerian educators.',
            ],
            key_takeaways: [
              'Google Forms quizzes auto-mark and save hours of grading time',
              'Use quiz data to identify which topics need re-teaching',
              'WhatsApp Polls work as low-data alternatives for assessment',
              'Data-driven teaching is a core CPD competency in the TRCN framework',
            ],
            practical_activity: 'Create a 10-question Google Forms quiz on a topic you just taught. Set it to quiz mode with correct answers and feedback. Send it to your class. After responses come in, analyse which question had the lowest score and plan a revision session.',
            quiz: [
              {
                question: 'What is the main advantage of digital quizzes for teachers?',
                options: [
                  { text: 'They look more professional' },
                  { text: 'They auto-mark and provide data on student performance', correct: true },
                  { text: 'They are harder for students to cheat on' },
                  { text: 'They replace all other forms of assessment' },
                ],
                explanation: 'The biggest advantage is automatic marking and the data it generates, showing which topics students struggle with.',
              },
              {
                question: 'How should you use quiz data after a test?',
                options: [
                  { text: 'Only record the final scores' },
                  { text: 'Sort by question to find what most students got wrong and re-teach those topics', correct: true },
                  { text: 'Delete the data after recording grades' },
                  { text: 'Share all individual scores publicly' },
                ],
                explanation: 'Sorting by question reveals patterns — topics where most students scored low indicate areas that need re-teaching. This is data-driven teaching.',
              },
            ],
          },
        ],
      },
      {
        id: 'dc-m3',
        title: 'Managing the Blended Classroom',
        description: 'Combine online and in-person teaching effectively, handle challenges, and keep students engaged.',
        lessons: [
          {
            id: 'dc-m3-l1',
            title: 'Blended Learning Models for Nigerian Schools',
            duration_mins: 25,
            content: [
              'Blended learning combines face-to-face classroom time with online/digital activities. It’s not about choosing one or the other — it’s about using each where it works best. In Nigeria’s context, this means using precious classroom time for interaction and practice, while delivering content digitally.',
              'The Flipped Classroom model: Students watch a video or read materials at home (via WhatsApp or Google Classroom), then class time is used for discussion, practice, and problem-solving. This is especially powerful in Nigeria where large class sizes (40–80 students) make individual attention during lectures almost impossible.',
              'The Station Rotation model: Divide students into 3 groups. Group A works with you directly, Group B works on a digital task (tablet, phone, or computer), Group C works on a paper-based activity. Rotate every 15 minutes. This works even with limited devices.',
              'The key challenge in Nigeria is equity: not all students have equal device access. Solutions include shared devices (2–3 students per phone), scheduled computer lab time, printed QR codes that link to resources (students scan when they have access), and offline content bundles.',
            ],
            key_takeaways: [
              'Blended learning uses classroom time for interaction, digital time for content',
              'The Flipped Classroom frees class time for practice in large classes',
              'Station Rotation works even with limited devices (2–3 students per phone)',
              'Equity solutions: shared devices, scheduled access, QR codes, offline bundles',
            ],
            practical_activity: 'Plan a Flipped Classroom lesson: choose a topic, create or find a 5-minute video/voice explanation, send it to students the night before, then plan 30 minutes of practice activities for the next class. Note: did students actually watch/listen?',
            quiz: [
              {
                question: 'In a Flipped Classroom model, what happens during class time?',
                options: [
                  { text: 'The teacher lectures as usual' },
                  { text: 'Students watch videos' },
                  { text: 'Students do practice, discussion, and problem-solving', correct: true },
                  { text: 'There is no class time' },
                ],
                explanation: 'In the Flipped model, content is consumed at home (video/notes), and class time is reserved for active learning: practice, discussion, and problem-solving.',
              },
              {
                question: 'How does Station Rotation address limited device availability?',
                options: [
                  { text: 'It requires every student to have a device' },
                  { text: 'It rotates groups so only one-third need devices at a time', correct: true },
                  { text: 'It eliminates the need for devices entirely' },
                  { text: 'It uses only paper-based activities' },
                ],
                explanation: 'Station Rotation divides students into 3 groups with only one group using devices at any time, reducing the number of devices needed.',
              },
            ],
          },
          {
            id: 'dc-m3-l2',
            title: 'Digital Classroom Management and Student Safety',
            duration_mins: 25,
            content: [
              'Digital classrooms come with new management challenges: students going off-topic in chat groups, inappropriate content sharing, cyberbullying, and data privacy concerns. Nigerian teachers need practical strategies for these.',
              'WhatsApp group rules: Post a clear set of rules on day one (pin the message). Key rules: (1) Respect all members, (2) Only educational content during school hours, (3) No sharing of personal information or photos of other students, (4) Parents are welcome to observe. Enforce consistently.',
              'Google Classroom management: Use the "People" tab to monitor who has joined. Remove anyone who shouldn’t be there. Use the stream settings to control who can post and comment. Review all student submissions — flag anything inappropriate immediately.',
              'Data privacy under Nigerian law: The Nigeria Data Protection Act (NDPA) 2023 applies to student data. Never share student grades publicly in WhatsApp groups. Don’t share student photos without parental consent. Store student data securely — a locked phone with PIN protection at minimum.',
              'Cyberbullying protocol: If you see bullying in a digital group, screenshot the evidence, remove the offending content, address it privately with the student and parents, and report to your school’s guidance counsellor. Never ignore it.',
            ],
            key_takeaways: [
              'Post and pin clear digital classroom rules from day one',
              'The Nigeria Data Protection Act 2023 protects student data',
              'Never share student grades publicly in group chats',
              'Screenshot, remove, and report any cyberbullying immediately',
            ],
            practical_activity: 'Draft a set of 8–10 digital classroom rules for your WhatsApp or Google Classroom group. Share them with colleagues for feedback. Pin them in your class group.',
            quiz: [
              {
                question: 'Under Nigerian law, which legislation protects student data privacy?',
                options: [
                  { text: 'NITDA Act 2007' },
                  { text: 'Nigeria Data Protection Act (NDPA) 2023', correct: true },
                  { text: 'Cybercrime Act 2015' },
                  { text: 'Child Rights Act 2003' },
                ],
                explanation: 'The Nigeria Data Protection Act (NDPA) 2023 is the primary legislation governing data protection, including student data in digital classrooms.',
              },
              {
                question: 'What is the correct response to cyberbullying in a digital classroom?',
                options: [
                  { text: 'Ignore it and hope it stops' },
                  { text: 'Publicly shame the bully in the group' },
                  { text: 'Screenshot, remove content, address privately, and report', correct: true },
                  { text: 'Delete the entire group' },
                ],
                explanation: 'The proper protocol is to document (screenshot), remove the harmful content, address the situation privately with the student and parents, and report to the school’s guidance counsellor.',
              },
            ],
          },
          {
            id: 'dc-m3-l3',
            title: 'Measuring Impact: Are Your Digital Tools Working?',
            duration_mins: 25,
            content: [
              'Adding digital tools only matters if student learning improves. This lesson teaches you to measure whether your digital interventions are actually working.',
              'The Before-After comparison: Give a short pre-test before starting a digital intervention (e.g., before using Google Classroom for a unit). Give the same test after. Compare scores. A 10%+ improvement suggests the tool is helping.',
              'Engagement metrics: Track how many students actually access your digital materials. Google Classroom shows view counts. WhatsApp shows read receipts (blue ticks). If fewer than 50% of students are engaging, the tool or your approach needs adjustment.',
              'Student feedback: Periodically ask students (via anonymous Google Forms survey): "Which learning method helps you most? (a) Classroom only (b) WhatsApp lessons (c) Video lessons (d) Combination." Use their responses to adjust.',
              'Building your CPD evidence portfolio: Document your digital teaching journey with screenshots, student score comparisons, and reflections. This portfolio serves as evidence for TRCN CPD points and can help with career advancement or institutional reviews.',
            ],
            key_takeaways: [
              'Use pre/post testing to measure if digital tools improve learning',
              'Track engagement: aim for 50%+ of students accessing digital content',
              'Collect student feedback regularly to adjust your approach',
              'Document everything for your CPD portfolio and TRCN evidence',
            ],
            practical_activity: 'Design a 10-question pre-test on your next topic. Deliver the topic using a digital method (video, WhatsApp lesson, or Google Classroom). Give the same test after. Calculate the average improvement and reflect on what worked.',
            quiz: [
              {
                question: 'What is the minimum engagement rate that suggests a digital tool is working?',
                options: [
                  { text: '20% of students' },
                  { text: '35% of students' },
                  { text: '50% of students', correct: true },
                  { text: '80% of students' },
                ],
                explanation: 'If fewer than 50% of students are engaging with digital materials, the tool or approach needs adjustment.',
              },
              {
                question: 'Why should teachers document their digital teaching journey?',
                options: [
                  { text: 'To show off on social media' },
                  { text: 'Because it is required by law' },
                  { text: 'For TRCN CPD points and career advancement evidence', correct: true },
                  { text: 'There is no reason to document it' },
                ],
                explanation: 'A documented portfolio with screenshots, score comparisons, and reflections serves as evidence for TRCN CPD points and supports career advancement.',
              },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 2. VOCATIONAL TEACHING METHODS
  // ════════════════════════════════════════════════════════════════════════════
  {
    slug: 'vocational-teaching-methods',
    emoji: '🎓',
    title: 'Vocational Teaching Methods',
    description: 'How to teach practical skills in a TVET or vocational classroom aligned to NBTE and NERDC standards.',
    long_description: 'Nigeria’s Technical and Vocational Education and Training (TVET) sector is critical to solving youth unemployment, yet many vocational instructors lack formal pedagogy training. This 4-week course bridges that gap. Learn competency-based training methods, workshop safety, industry-linked curriculum design, and practical assessment techniques — all aligned to the National Board for Technical Education (NBTE) standards and the NERDC TVET curriculum.',
    weeks: 4,
    total_lessons: 12,
    total_enrolled: 890,
    avg_rating: 4.7,
    category: 'TVET Pedagogy',
    what_you_learn: [
      'Design competency-based training (CBT) sessions aligned to NBTE standards',
      'Set up safe and effective practical workshops',
      'Teach hands-on skills using the Demonstrate-Practice-Assess cycle',
      'Link classroom teaching to real industry requirements and job markets',
      'Assess practical skills fairly using rubrics and skills checklists',
      'Integrate emerging technologies (solar, EV, digital fabrication) into vocational teaching',
    ],
    who_its_for: [
      'TVET centre instructors and workshop supervisors',
      'Technical college lecturers',
      'Vocational skills trainers (government and private)',
      'Master craftspeople transitioning into formal teaching roles',
    ],
    nerdc_alignment: [
      'NBTE Curriculum for Technical Colleges',
      'NERDC Basic Education Curriculum — Vocational strand',
      'National Skills Qualification Framework (NSQF)',
      'National Policy on Education — TVET section (6th edition)',
    ],
    pass_mark: 70,
    modules: [
      {
        id: 'vt-m1',
        title: 'TVET Pedagogy Fundamentals',
        description: 'Understand competency-based training and the Demonstrate-Practice-Assess cycle.',
        lessons: [
          {
            id: 'vt-m1-l1',
            title: 'What is Competency-Based Training (CBT)?',
            duration_mins: 30,
            content: [
              'Traditional education asks: "Did the student attend enough hours?" Competency-Based Training asks: "Can the student actually DO the task?" This shift is fundamental to effective vocational education. The NBTE now requires all technical colleges to adopt CBT approaches.',
              'CBT is built on occupational standards — lists of specific tasks a graduate must be able to perform. For example, a graduate of electrical installation must be able to: wire a standard 3-bedroom house, install a consumer unit, test circuits with a multimeter, and comply with Nigerian Electrical Installation Standards (NIS 525).',
              'The CBT cycle: (1) Identify the competency from the occupational standard, (2) Demonstrate the skill clearly, (3) Let students practice with supervision, (4) Assess using a practical test with clear criteria, (5) Certify when competent or provide remediation.',
              'In Nigeria, many TVET centres still rely heavily on theory exams. The shift to CBT means at least 60% of assessment should be practical. A student who can explain how to wire a plug but cannot actually wire one safely has NOT achieved competency.',
            ],
            key_takeaways: [
              'CBT focuses on what students can DO, not hours attended',
              'NBTE requires technical colleges to adopt CBT approaches',
              'At least 60% of TVET assessment should be practical',
              'Occupational standards define the specific skills graduates must demonstrate',
            ],
            practical_activity: 'Take the NBTE curriculum for your subject area and list 10 practical competencies a graduate should demonstrate. For each, note whether your current assessment is theory-based or practical. Plan to shift one theory assessment to a practical demonstration this term.',
            quiz: [
              {
                question: 'What is the main question Competency-Based Training asks?',
                options: [
                  { text: 'Did the student attend enough classes?' },
                  { text: 'Did the student pass the written exam?' },
                  { text: 'Can the student actually perform the task?', correct: true },
                  { text: 'Does the student understand the theory?' },
                ],
                explanation: 'CBT’s fundamental question is whether the student can actually DO the task, not just understand it in theory.',
              },
              {
                question: 'What percentage of TVET assessment should be practical under CBT?',
                options: [
                  { text: 'At least 30%' },
                  { text: 'At least 40%' },
                  { text: 'At least 60%', correct: true },
                  { text: 'Exactly 100%' },
                ],
                explanation: 'Under CBT, at least 60% of assessment should be practical. Theory exams alone cannot demonstrate competency.',
              },
            ],
          },
          {
            id: 'vt-m1-l2',
            title: 'The Demonstrate-Practice-Assess (DPA) Cycle',
            duration_mins: 30,
            content: [
              'The DPA cycle is the backbone of effective vocational teaching. It ensures students see the skill done correctly, practice it under guidance, and prove they can do it independently.',
              'DEMONSTRATE: Show the complete skill first, then break it into steps. Use the "whole-part-whole" method: demonstrate the full task once at normal speed, then repeat slowly step-by-step with explanations, then demonstrate the full task again. Students should observe, not participate, during this phase.',
              'PRACTICE: Start with guided practice (you walk around helping), move to paired practice (students help each other), then independent practice. The ratio should be approximately 20% demonstration and 80% practice. Common Nigerian TVET mistake: spending too long on demonstration and not leaving enough practice time.',
              'ASSESS: Use a skills checklist (binary: can/cannot do each step) and a quality rubric (how well they do it). Have students self-assess first using the same checklist, then you verify. This builds metacognition — students learn to judge their own work quality.',
              'Timing for a 90-minute workshop session: 15 min demonstrate, 60 min practice (with instructor circulating), 15 min assess and debrief. For a 45-minute session: 8 min demonstrate, 30 min practice, 7 min assess.',
            ],
            key_takeaways: [
              'Use whole-part-whole for demonstrations',
              'The ideal ratio is 20% demonstration and 80% practice',
              'Assess with both a binary skills checklist and a quality rubric',
              'Student self-assessment builds important metacognitive skills',
            ],
            practical_activity: 'Plan your next practical lesson using the DPA cycle. Create a skills checklist with at least 8 steps. Time your demonstration — keep it under 20% of total lesson time. After the lesson, reflect: did students get enough practice time?',
            quiz: [
              {
                question: 'What is the correct demonstration method in the DPA cycle?',
                options: [
                  { text: 'Show each step separately only' },
                  { text: 'Whole-part-whole: full task, then steps, then full task again', correct: true },
                  { text: 'Only verbal explanation without showing' },
                  { text: 'Show a video and leave students to figure it out' },
                ],
                explanation: 'The whole-part-whole method shows the full task at normal speed, then breaks it into explained steps, then shows the full task again.',
              },
              {
                question: 'What is the ideal demonstration-to-practice ratio?',
                options: [
                  { text: '50% demonstration, 50% practice' },
                  { text: '80% demonstration, 20% practice' },
                  { text: '20% demonstration, 80% practice', correct: true },
                  { text: '10% demonstration, 90% practice' },
                ],
                explanation: 'Students learn vocational skills by doing. The ideal ratio is 20% demonstration and 80% practice time.',
              },
            ],
          },
          {
            id: 'vt-m1-l3',
            title: 'Workshop Safety and Risk Management',
            duration_mins: 25,
            content: [
              'Workshop accidents are the number one liability risk for TVET centres in Nigeria. The NBTE requires documented safety procedures, and instructors are personally responsible for enforcing them.',
              'The safety briefing protocol: Every practical session must begin with a 3-minute safety briefing covering: (1) Hazards specific to today’s task, (2) Required PPE (Personal Protective Equipment), (3) Location of fire extinguisher and first aid kit, (4) Emergency exit route. Document that the briefing was given.',
              'PPE requirements by trade: Electrical — insulated gloves, safety shoes, goggles. Welding — welding helmet, leather apron, gloves, safety boots. Woodwork — safety goggles, dust mask, ear protection with power tools. Catering — hairnet, apron, closed shoes, oven gloves.',
              'Machine safety: All power tools and machines must have guards in place. Students must be supervised 1:6 (one instructor per six students) when using power equipment. Never let a student operate a machine they haven’t been specifically trained on. Keep a "Machine Competency Log" showing which students have been signed off on each machine.',
              'Incident documentation: Any accident, near-miss, or equipment damage must be logged in an Accident Report Book. Include: date, time, names involved, description, action taken, and follow-up needed. This protects both students and instructors.',
            ],
            key_takeaways: [
              'Every practical session must start with a documented 3-minute safety briefing',
              'Power equipment requires 1:6 instructor-student supervision ratio',
              'Keep a Machine Competency Log for each student',
              'Document all incidents in an Accident Report Book',
            ],
            practical_activity: 'Create a safety briefing template for your workshop that covers all 4 required elements. Create a Machine Competency Log template. Use both in your next practical session and file the documentation.',
            quiz: [
              {
                question: 'What is the required supervision ratio for students using power equipment?',
                options: [
                  { text: '1 instructor per 3 students' },
                  { text: '1 instructor per 6 students', correct: true },
                  { text: '1 instructor per 10 students' },
                  { text: '1 instructor per 20 students' },
                ],
                explanation: 'Power equipment requires 1:6 supervision — one instructor for every six students using power tools or machines.',
              },
              {
                question: 'What must every practical session begin with?',
                options: [
                  { text: 'A written exam' },
                  { text: 'A prayer and attendance' },
                  { text: 'A documented 3-minute safety briefing', correct: true },
                  { text: 'A tool inventory check only' },
                ],
                explanation: 'Every practical session must begin with a 3-minute safety briefing covering hazards, PPE, emergency equipment location, and exit routes.',
              },
            ],
          },
        ],
      },
      {
        id: 'vt-m2',
        title: 'Industry-Aligned Curriculum',
        description: 'Design training that matches what employers actually need in the Nigerian job market.',
        lessons: [
          {
            id: 'vt-m2-l1',
            title: 'Mapping Skills to the Nigerian Job Market',
            duration_mins: 30,
            content: [
              'The biggest criticism of Nigerian TVET is the gap between what graduates learn and what employers need. A 2024 survey by Jobberman found that 72% of Nigerian employers say vocational graduates lack practical, job-ready skills. Closing this gap starts with understanding the market.',
              'High-demand vocational skills in Nigeria (2025): Solar panel installation and maintenance, electric vehicle (okada) battery repair, digital marketing for small businesses, smartphone and laptop repair, industrial sewing and fashion tech, commercial kitchen management with food safety certification, and building information modelling (BIM) for construction.',
              'How to stay current: Follow industry associations in your field. Talk to employers who hire your graduates — ask them what skills are missing. Invite working professionals as guest speakers. Visit workplaces annually to see what technology and methods they actually use.',
              'Updating your curriculum: You cannot change the NBTE syllabus, but you can add supplementary skills. Use the 80/20 rule: 80% of your teaching covers the official curriculum, 20% addresses current industry trends and emerging technologies. Document this as "Industry Enhancement" in your scheme of work.',
            ],
            key_takeaways: [
              '72% of Nigerian employers say vocational graduates lack practical skills',
              'Solar, EV repair, digital marketing, and smartphone repair are high-demand skills',
              'Use the 80/20 rule: 80% official curriculum, 20% industry enhancement',
              'Regularly engage with employers to stay current on skill needs',
            ],
            practical_activity: 'Contact 3 employers in your field (by phone, WhatsApp, or visit). Ask each: "What skills do you wish our graduates had?" Compile the responses and identify 2–3 skills you can add to your teaching as industry enhancements.',
            quiz: [
              {
                question: 'What percentage of Nigerian employers say vocational graduates lack job-ready skills?',
                options: [
                  { text: '35%' },
                  { text: '52%' },
                  { text: '72%', correct: true },
                  { text: '90%' },
                ],
                explanation: 'A 2024 Jobberman survey found that 72% of Nigerian employers say vocational graduates lack practical, job-ready skills.',
              },
              {
                question: 'What is the 80/20 rule for vocational curriculum?',
                options: [
                  { text: '80% theory, 20% practical' },
                  { text: '80% official NBTE curriculum, 20% industry enhancement', correct: true },
                  { text: '80% assessment, 20% teaching' },
                  { text: '80% group work, 20% individual' },
                ],
                explanation: 'The 80/20 rule means 80% of teaching covers the official curriculum while 20% addresses current industry trends and emerging technologies.',
              },
            ],
          },
          {
            id: 'vt-m2-l2',
            title: 'Integrating Emerging Technologies',
            duration_mins: 30,
            content: [
              'The vocational landscape is changing rapidly. Technologies that barely existed 5 years ago are now mainstream in Nigerian industry. Teachers who integrate these technologies prepare students for the actual jobs they will find.',
              'Solar Technology: Nigeria’s solar market grew 340% between 2020 and 2024. Every electrical installation student should now learn: solar panel mounting and wiring, charge controller and inverter setup, battery bank configuration, and basic system troubleshooting. Even traditional electricians need these skills.',
              'Digital Fabrication: 3D printing and CNC machines are becoming available in Nigerian makerspaces and technical colleges. Students should understand: basic 3D modelling (TinkerCAD is free), reading and interpreting digital design files, and the differences between additive and subtractive manufacturing.',
              'Electric Vehicles: Nigeria now has electric motorcycles (e-okada) and tricycles. Auto-mechanic students need: battery management system (BMS) fundamentals, electric motor maintenance, high-voltage safety protocols, and charging infrastructure basics. This is a blue ocean skill — very few Nigerian mechanics have it.',
              'Teaching new tech on a budget: You don’t need expensive equipment. Use simulation apps (e.g., PVsyst for solar, TinkerCAD for 3D), YouTube demonstrations for procedures, and small-scale models (mini solar kits cost under ₦15,000). Partner with local companies for equipment access.',
            ],
            key_takeaways: [
              'Nigeria’s solar market grew 340% — all electricians need solar skills',
              'Electric vehicle repair is a blue ocean opportunity',
              'Free tools like TinkerCAD and PVsyst enable low-cost tech education',
              'Partner with local companies for access to expensive equipment',
            ],
            practical_activity: 'Identify one emerging technology relevant to your trade. Find a free simulation tool or YouTube tutorial series for it. Plan a 2-hour introductory session for your students. If possible, source a small-scale demonstration kit.',
            quiz: [
              {
                question: 'By how much did Nigeria’s solar market grow between 2020 and 2024?',
                options: [
                  { text: '50%' },
                  { text: '120%' },
                  { text: '340%', correct: true },
                  { text: '500%' },
                ],
                explanation: 'Nigeria’s solar market grew by 340% between 2020 and 2024, making solar skills essential for electrical installation graduates.',
              },
              {
                question: 'Why is electric vehicle repair called a "blue ocean skill"?',
                options: [
                  { text: 'Because the vehicles are blue' },
                  { text: 'Because very few Nigerian mechanics have this skill yet', correct: true },
                  { text: 'Because it requires water-based tools' },
                  { text: 'Because it is only taught overseas' },
                ],
                explanation: 'A "blue ocean" skill has high demand but very low supply of qualified workers, creating opportunity for early adopters.',
              },
            ],
          },
          {
            id: 'vt-m2-l3',
            title: 'Practical Assessment with Rubrics and Skills Checklists',
            duration_mins: 30,
            content: [
              'Fair, consistent assessment is the cornerstone of credible TVET. Without it, certificates become meaningless — and employer trust erodes. Rubrics and skills checklists provide the structure needed for objective practical assessment.',
              'Skills Checklist: A binary (yes/no) list of steps the student must complete correctly. Example for "Wire a 13A plug": (1) Correctly identify live, neutral, earth wires ✔/✘, (2) Strip wire to correct length ✔/✘, (3) Connect wires to correct terminals ✔/✘, (4) Secure cable grip ✔/✘, (5) Test with multimeter ✔/✘.',
              'Quality Rubric: Goes beyond "did they do it?" to "how well did they do it?" Score each element on a 1–4 scale. 1=Below standard (unsafe or non-functional), 2=Approaching standard (functional with significant errors), 3=Meets standard (correct and functional), 4=Exceeds standard (professional quality).',
              'Combined assessment: Use the checklist for summative pass/fail decisions (all critical safety steps must be ✔). Use the rubric for formative feedback and grading. Share both with students BEFORE the assessment so they know exactly what is expected.',
              'Inter-rater reliability: If multiple instructors assess, they should all use the same rubric. Calibrate by having all assessors mark the same student independently, then compare. Discuss any differences and agree on standards. Do this at least once per term.',
            ],
            key_takeaways: [
              'Skills checklists provide binary yes/no assessment of each step',
              'Quality rubrics score HOW WELL on a 1–4 scale',
              'Share assessment criteria with students before the test',
              'Calibrate between multiple assessors at least once per term',
            ],
            practical_activity: 'Create a skills checklist (at least 10 steps) and a quality rubric (4 levels) for one practical task in your subject. Use them to assess 3 students. Compare: did the checklist and rubric give you more useful information than a single grade?',
            quiz: [
              {
                question: 'What is the key difference between a skills checklist and a quality rubric?',
                options: [
                  { text: 'Checklists are for theory, rubrics for practical' },
                  { text: 'Checklists are binary (yes/no), rubrics score quality on a scale', correct: true },
                  { text: 'Rubrics are simpler than checklists' },
                  { text: 'There is no difference' },
                ],
                explanation: 'A skills checklist is binary (can/cannot do each step), while a quality rubric scores how well the student performs on a 1–4 scale.',
              },
              {
                question: 'When should assessment criteria be shared with students?',
                options: [
                  { text: 'After the assessment' },
                  { text: 'During the assessment' },
                  { text: 'Before the assessment', correct: true },
                  { text: 'Never — it should be a surprise' },
                ],
                explanation: 'Sharing criteria before assessment lets students know exactly what is expected and focus their practice accordingly.',
              },
            ],
          },
        ],
      },
      {
        id: 'vt-m3',
        title: 'Student Engagement in Vocational Settings',
        description: 'Keep vocational students motivated and connected to real career outcomes.',
        lessons: [
          {
            id: 'vt-m3-l1',
            title: 'Motivating Vocational Learners',
            duration_mins: 25,
            content: [
              'Vocational students often face a stigma — the perception that TVET is for those who "failed" academically. This affects motivation. Your job as an instructor is to counter this narrative and connect skills to real earning potential.',
              'Show the money: Share real salary data. A qualified solar installer earns ₦150,000–300,000/month in Lagos. A skilled fashion designer can earn ₦200,000+ with their own brand. A certified welder working in oil & gas earns ₦250,000–500,000/month. These numbers motivate.',
              'Bring in role models: Invite successful graduates back to talk to current students. A 25-year-old running their own workshop is more inspiring than any lecture. If in-person visits aren’t possible, record a 3-minute video call and share it.',
              'Project-based learning: Instead of isolated exercises, give students a real project. "Wire the school’s new computer lab" is more motivating than "practice wiring exercises." "Make uniforms for the primary school" is more motivating than "sew practice pieces." Real projects build portfolios students can show employers.',
            ],
            key_takeaways: [
              'Counter TVET stigma with real salary data and success stories',
              'Invite successful graduates as role models regularly',
              'Use real projects instead of isolated practice exercises',
              'Student projects double as portfolio pieces for employment',
            ],
            practical_activity: 'Identify one real project your students could complete this term that serves a genuine need (school, community, or paying client). Plan it as a multi-week project with clear milestones. Invite one successful graduate to speak (in person or via video call).',
            quiz: [
              {
                question: 'What is the most effective way to counter TVET stigma with students?',
                options: [
                  { text: 'Tell them not to worry about it' },
                  { text: 'Show real salary data and bring in successful graduate role models', correct: true },
                  { text: 'Compare them favorably to university students' },
                  { text: 'Focus only on theory to make it seem academic' },
                ],
                explanation: 'Concrete evidence of earning potential and real success stories from graduates are the most effective motivators for vocational students.',
              },
            ],
          },
          {
            id: 'vt-m3-l2',
            title: 'Industry Attachments and Employer Partnerships',
            duration_mins: 25,
            content: [
              'The gap between classroom and workplace is bridged by industry attachments (SIWES — Students Industrial Work Experience Scheme). But many Nigerian TVET centres treat SIWES as a formality rather than a structured learning experience.',
              'Making SIWES effective: (1) Pre-placement briefing: discuss what students should learn, set 5 specific learning goals. (2) Weekly check-ins: call or visit students during attachment. (3) Workplace mentor: ensure the employer assigns a specific person to supervise learning. (4) Post-placement debrief: students present what they learned to the class.',
              'Building employer partnerships beyond SIWES: Offer your students for small free projects (e.g., "Our welding students will fabricate your gate at cost of materials only"). This gets employers to see student quality. Successful projects become referrals and job offers.',
              'Advisory boards: Invite 3–5 local employers to form an informal advisory board. Meet once per term. Ask them: what skills do you need? What equipment should we prioritise? Would you host students? This keeps your programme relevant and builds a placement pipeline.',
            ],
            key_takeaways: [
              'Structure SIWES with specific learning goals, weekly check-ins, and debriefs',
              'Offer student projects to employers as relationship builders',
              'Form an employer advisory board meeting once per term',
              'Strong employer relationships create job placement pipelines',
            ],
            practical_activity: 'Contact 3 local employers in your trade. Propose a student project or offer to set up an advisory board meeting. Document the conversation and outcomes.',
            quiz: [
              {
                question: 'What makes SIWES (industrial attachment) effective?',
                options: [
                  { text: 'Just sending students to any company' },
                  { text: 'Specific learning goals, weekly check-ins, assigned mentor, and post-placement debrief', correct: true },
                  { text: 'Making it last as long as possible' },
                  { text: 'Only allowing top students to participate' },
                ],
                explanation: 'Effective SIWES requires structure: pre-placement goals, weekly supervision, an assigned workplace mentor, and a post-placement presentation.',
              },
            ],
          },
          {
            id: 'vt-m3-l3',
            title: 'Portfolio Building and Job-Readiness',
            duration_mins: 25,
            content: [
              'A vocational graduate’s portfolio is more powerful than any certificate. Employers want to see what you can DO, not just what you studied. Every vocational student should graduate with a documented portfolio of completed work.',
              'What goes in a portfolio: Photos/videos of completed projects (before and after), technical drawings or designs, client testimonials (if applicable), skills checklist showing competencies achieved, any industry certifications, and a brief description of each project including challenges overcome.',
              'Digital portfolio tools: A simple Google Drive folder works. For more professional presentation, use Canva (free) to create a portfolio document. For trades where visual work matters (fashion, woodwork, welding), an Instagram portfolio account is powerful.',
              'CV writing for vocational graduates: Lead with skills and projects, not education. Example: "Installed 5kW solar system for 3-bedroom house (supervised)" is more impressive than "Studied electrical installation at XYZ technical college." Include measurable outcomes wherever possible.',
              'Job interview preparation: Practice the STAR method (Situation, Task, Action, Result) for discussing projects. "The school needed a computer lab wired (Situation). I was responsible for the cable runs (Task). I planned the route, installed 24 network points, and tested each one (Action). All 24 points passed testing first time (Result)."',
            ],
            key_takeaways: [
              'Every vocational graduate should have a documented portfolio',
              'Lead CVs with skills and projects, not education credentials',
              'Digital portfolios (Google Drive, Canva, Instagram) are free and effective',
              'Practice the STAR method for job interviews',
            ],
            practical_activity: 'Start a portfolio for each of your students. Have them photograph their next completed project from multiple angles, write a brief description, and save it in a Google Drive folder. Help 3 students write a skills-first CV.',
            quiz: [
              {
                question: 'What should lead a vocational graduate’s CV?',
                options: [
                  { text: 'Educational qualifications' },
                  { text: 'Personal statement' },
                  { text: 'Skills and completed projects', correct: true },
                  { text: 'Hobbies and interests' },
                ],
                explanation: 'Vocational CVs should lead with skills and projects because employers want to see what you can DO, not just what you studied.',
              },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 3. INCLUSIVE EDUCATION
  // ════════════════════════════════════════════════════════════════════════════
  {
    slug: 'inclusive-education',
    emoji: '🤝',
    title: 'Inclusive Education',
    description: 'Teaching students with disabilities, diverse learning needs, and multilingual backgrounds in Nigerian classrooms.',
    long_description: 'Nigeria has an estimated 13 million children with disabilities, yet fewer than 10% are enrolled in school. The Discrimination Against Persons with Disabilities (Prohibition) Act 2018 mandates inclusive education, but most Nigerian teachers receive no training in it. This 3-week course gives you practical, immediate strategies for making your classroom accessible to all learners — including those with visual, hearing, physical, intellectual, and learning disabilities, as well as multilingual learners.',
    weeks: 3,
    total_lessons: 9,
    total_enrolled: 2100,
    avg_rating: 4.9,
    category: 'Pedagogy',
    what_you_learn: [
      'Identify common learning needs and disabilities in your classroom',
      'Adapt lesson plans for visual, hearing, physical, and intellectual disabilities',
      'Use Universal Design for Learning (UDL) to benefit ALL students',
      'Create multilingual teaching resources for Yoruba, Igbo, Hausa, and Pidgin speakers',
      'Comply with Nigeria’s disability inclusion laws',
      'Collaborate with parents and support workers effectively',
    ],
    who_its_for: [
      'All primary and secondary school teachers',
      'School administrators developing inclusion policies',
      'Special education teachers expanding their skills',
      'Parents advocating for inclusive education',
    ],
    nerdc_alignment: [
      'Discrimination Against Persons with Disabilities (Prohibition) Act 2018',
      'National Policy on Special Needs Education in Nigeria',
      'NERDC Basic Education Curriculum — Inclusive Education guidelines',
      'TRCN Professional Standards for Teachers of Learners with Special Needs',
    ],
    pass_mark: 70,
    modules: [
      {
        id: 'ie-m1',
        title: 'Understanding Diverse Learners',
        description: 'Recognise different learning needs and disabilities common in Nigerian classrooms.',
        lessons: [
          {
            id: 'ie-m1-l1',
            title: 'The Inclusion Landscape in Nigeria',
            duration_mins: 25,
            content: [
              'Nigeria has an estimated 13 million children with disabilities. Of these, fewer than 10% attend school. The reasons are complex: physical barriers (no ramps, no accessible toilets), attitudinal barriers (stigma, the belief that disabled children "cannot learn"), and systemic barriers (no trained teachers, no adapted materials).',
              'The Discrimination Against Persons with Disabilities (Prohibition) Act 2018 makes it illegal to deny anyone access to education based on disability. Schools that refuse to enrol children with disabilities face penalties. Yet implementation remains weak because teachers feel unprepared.',
              'Inclusive education does NOT mean: lowering standards, giving disabled students less work, or putting all students with disabilities in one classroom. It MEANS: providing the support and adaptations needed for every student to access the same curriculum and demonstrate learning in ways that work for them.',
              'Common disabilities and learning needs in Nigerian classrooms: Visual impairment (partial sight, blindness), hearing impairment (partial hearing, deafness), physical disabilities (cerebral palsy, limb differences), intellectual disabilities (Down syndrome, slow processing), specific learning disabilities (dyslexia, dyscalculia), autism spectrum, and speech/language difficulties.',
            ],
            key_takeaways: [
              '13 million Nigerian children have disabilities; fewer than 10% attend school',
              'The 2018 Disability Act makes educational exclusion illegal',
              'Inclusion means adapting HOW students learn, not lowering standards',
              'Teachers are the key to successful implementation',
            ],
            practical_activity: 'Conduct a quiet, respectful observation of your class over one week. Note any students who might be struggling to: see the board, hear instructions, write at the expected pace, understand instructions the first time, or sit comfortably. Discuss observations (privately) with the school’s guidance counsellor.',
            quiz: [
              {
                question: 'How many Nigerian children with disabilities are estimated to exist?',
                options: [
                  { text: '3 million' },
                  { text: '8 million' },
                  { text: '13 million', correct: true },
                  { text: '20 million' },
                ],
                explanation: 'Nigeria has an estimated 13 million children with disabilities, with fewer than 10% currently enrolled in school.',
              },
              {
                question: 'Inclusive education means:',
                options: [
                  { text: 'Lowering academic standards for disabled students' },
                  { text: 'Putting all disabled students in a separate class' },
                  { text: 'Adapting support so every student can access the same curriculum', correct: true },
                  { text: 'Only accepting students with mild disabilities' },
                ],
                explanation: 'Inclusion means providing adaptations and support so every student can access the same curriculum and demonstrate learning in appropriate ways.',
              },
            ],
          },
          {
            id: 'ie-m1-l2',
            title: 'Identifying Learning Needs: A Teacher’s Guide',
            duration_mins: 30,
            content: [
              'Many Nigerian students with learning needs are undiagnosed. A student who "refuses to read aloud" may have dyslexia. A student who "never pays attention" may have a hearing impairment. Teachers are often the first to notice these signs.',
              'Red flags for visual impairment: squinting, holding books very close or far away, frequent headaches, copying from the board slowly or inaccurately, difficulty with small print. Action: recommend an eye test. Many vision problems are correctable with glasses.',
              'Red flags for hearing impairment: frequently asking "what?", watching the teacher’s lips intently, turning one ear toward the speaker, not responding when called from behind, difficulty following multi-step oral instructions. Action: recommend an audiological assessment.',
              'Red flags for specific learning disabilities: Dyslexia — struggles with reading despite average intelligence, reverses letters (b/d, p/q), slow reading but good oral comprehension. Dyscalculia — struggles with number sense, counting, basic arithmetic despite understanding other subjects. ADHD — extreme difficulty sitting still, impulsive behaviour, cannot sustain attention on tasks.',
              'Important: Teachers are NOT diagnosticians. Your role is to notice, document, and refer. Approach parents sensitively — many Nigerian parents fear the stigma of a "label." Frame it as: "Your child is intelligent but may need some extra support in [specific area]. Let’s get an assessment so we can help them succeed."',
            ],
            key_takeaways: [
              'Many learning needs in Nigerian students are undiagnosed',
              'Learn the red flags for visual, hearing, and specific learning disabilities',
              'Teachers’ role is to notice, document, and refer — not diagnose',
              'Approach parents sensitively, focusing on supporting the child’s success',
            ],
            practical_activity: 'Create a simple observation checklist with 5 columns: Student name, Observed behaviour, Possible need, Date, Action taken. Use it for one week. If you identify a student who may need support, speak to your school’s guidance counsellor about a referral.',
            quiz: [
              {
                question: 'A student who squints, holds books very close, and copies slowly from the board may have:',
                options: [
                  { text: 'A hearing impairment' },
                  { text: 'A visual impairment', correct: true },
                  { text: 'ADHD' },
                  { text: 'Dyslexia' },
                ],
                explanation: 'Squinting, holding books close, and difficulty copying from the board are red flags for visual impairment. An eye test should be recommended.',
              },
              {
                question: 'What is a teacher’s role when they suspect a student has a learning disability?',
                options: [
                  { text: 'Diagnose the condition themselves' },
                  { text: 'Ignore it and treat the student normally' },
                  { text: 'Notice, document, and refer for professional assessment', correct: true },
                  { text: 'Inform the whole class' },
                ],
                explanation: 'Teachers are not diagnosticians. Their role is to notice the signs, document observations, and refer the student for professional assessment.',
              },
            ],
          },
          {
            id: 'ie-m1-l3',
            title: 'Universal Design for Learning (UDL)',
            duration_mins: 30,
            content: [
              'Universal Design for Learning (UDL) is a framework that designs lessons to be accessible to everyone from the start, reducing the need for individual adaptations later. Think of it like a building ramp: it’s essential for wheelchair users but also helps parents with prams, delivery workers, and anyone with heavy bags.',
              'UDL Principle 1 — Multiple Means of Representation: Present information in more than one way. Don’t just lecture — also show a diagram, demonstrate physically, and provide a written summary. A lesson on "Types of Angles" could include: verbal explanation, drawings on the board, physical angle-makers (two rulers joined with a pin), and a labelled handout.',
              'UDL Principle 2 — Multiple Means of Engagement: Offer different ways to participate. Not all students thrive in the same activity format. Provide options: work alone or in pairs, answer verbally or in writing, solve the teacher’s problem or create their own. Choice increases motivation for ALL learners.',
              'UDL Principle 3 — Multiple Means of Action & Expression: Let students show learning in different ways. Instead of only written tests, also accept: verbal explanations, drawings/diagrams, physical demonstrations, peer teaching, or audio recordings. A student with dyslexia might struggle with a written essay but excel at an oral presentation.',
              'UDL in the Nigerian context: Multilingual teaching is a form of UDL. Explaining a concept in English and then summarising in Yoruba, Igbo, or Hausa makes the lesson accessible to students still developing English proficiency. This is good teaching for everyone, not just special needs.',
            ],
            key_takeaways: [
              'UDL designs lessons to be accessible to everyone from the start',
              'Present information in multiple formats (visual, auditory, physical)',
              'Offer choice in how students participate and demonstrate learning',
              'Multilingual teaching is a powerful form of UDL in Nigeria',
            ],
            practical_activity: 'Redesign one upcoming lesson using all 3 UDL principles. Add at least 2 ways of presenting information, 2 ways students can participate, and 2 ways they can show learning. Teach it and note which options students choose.',
            quiz: [
              {
                question: 'What is the core idea of Universal Design for Learning?',
                options: [
                  { text: 'Design lessons for the average student' },
                  { text: 'Design lessons that are accessible to everyone from the start', correct: true },
                  { text: 'Create separate lessons for each disability type' },
                  { text: 'Only use technology for teaching' },
                ],
                explanation: 'UDL designs lessons to be accessible to all learners from the outset, reducing the need for individual adaptations.',
              },
              {
                question: 'How is multilingual teaching an example of UDL?',
                options: [
                  { text: 'It makes lessons longer' },
                  { text: 'It provides multiple means of representation, making content accessible to more learners', correct: true },
                  { text: 'It replaces English instruction' },
                  { text: 'It only helps foreign students' },
                ],
                explanation: 'Teaching in English plus summarising in local languages (Yoruba, Igbo, Hausa) provides multiple representations of the same content, a core UDL principle.',
              },
            ],
          },
        ],
      },
      {
        id: 'ie-m2',
        title: 'Adaptive Teaching Strategies',
        description: 'Practical adaptations for specific disabilities and learning differences.',
        lessons: [
          {
            id: 'ie-m2-l1',
            title: 'Adapting for Visual and Hearing Impairments',
            duration_mins: 30,
            content: [
              'Visual impairment adaptations: Seat the student in the front row. Use large, clear handwriting on the board (minimum 3-inch letters). Provide printed notes in large font (16pt minimum). Describe visual content verbally ("The diagram shows a triangle with the longest side at the bottom"). Allow extra time for reading and writing tasks.',
              'For students with severe visual impairment: Learn to say the student’s name before speaking to them. Provide materials in Braille if possible (contact the National Library for the Blind). Use tactile materials: raised-line drawings, 3D models, physical objects to represent concepts. Audio recordings of lessons are valuable.',
              'Hearing impairment adaptations: Always face the student when speaking (many use lip-reading). Speak clearly at a normal pace — don’t shout or over-enunciate. Use visual aids for every lesson: diagrams, written instructions, demonstrations. Write key terms and instructions on the board.',
              'For students with severe hearing impairment: Learn 20 basic Nigerian Sign Language (NSL) signs: hello, good, well done, sit down, stand up, open your book, look at the board, write, listen, question, answer, correct, wrong, yes, no, again, slowly, come, stop, thank you. This transforms the relationship.',
              'Technology helps: Speech-to-text apps (Google Live Transcribe, free on Android) can display what you’re saying as text on a phone placed on the student’s desk. This is a game-changer for partially hearing students.',
            ],
            key_takeaways: [
              'Seat visually impaired students at the front; use large, clear writing',
              'Always face hearing-impaired students when speaking',
              'Learn 20 basic Nigerian Sign Language signs',
              'Google Live Transcribe (free) converts speech to text in real time',
            ],
            practical_activity: 'Learn 10 Nigerian Sign Language signs this week (search "Nigerian Sign Language basics" on YouTube). Use them in class — even if no student currently has a hearing impairment, it normalises sign language and prepares you. Set up Google Live Transcribe on your phone and test it.',
            quiz: [
              {
                question: 'What is the minimum recommended font size for students with visual impairment?',
                options: [
                  { text: '10pt' },
                  { text: '12pt' },
                  { text: '16pt', correct: true },
                  { text: '24pt' },
                ],
                explanation: 'Printed materials for students with visual impairment should be at least 16-point font.',
              },
              {
                question: 'What free app converts speech to text for hearing-impaired students?',
                options: [
                  { text: 'WhatsApp' },
                  { text: 'Google Live Transcribe', correct: true },
                  { text: 'Calculator' },
                  { text: 'Google Maps' },
                ],
                explanation: 'Google Live Transcribe is a free Android app that displays spoken words as text in real time, helping partially hearing students follow lessons.',
              },
            ],
          },
          {
            id: 'ie-m2-l2',
            title: 'Supporting Students with Learning Disabilities',
            duration_mins: 30,
            content: [
              'Dyslexia affects an estimated 5–10% of all students. In a class of 50, that’s potentially 3–5 students. Many Nigerian dyslexic students are wrongly labelled as "lazy" or "dull." With the right support, dyslexic students often become high achievers — their brains just process text differently.',
              'Dyslexia support strategies: Use a cream or light yellow background for printed materials (reduces visual stress). Allow audio books and text-to-speech. Break text into short paragraphs with clear headings. Use a structured literacy approach: teach phonics explicitly, don’t assume students will "pick up" reading naturally. Allow verbal answers instead of written ones where possible.',
              'Dyscalculia support: Always provide physical manipulatives (counters, blocks, coins) for maths. Use graph paper to help align digits in calculations. Allow calculators for complex arithmetic so the student can focus on understanding the concept. Use real-life contexts with Nigerian currency and scenarios.',
              'ADHD support: Seat the student away from distractions (windows, doors, chatty friends). Break tasks into small chunks with clear instructions. Use a timer ("You have 5 minutes to complete the first 3 questions"). Allow movement breaks every 20 minutes. Provide a fidget tool (even a rubber band on the wrist). Give instructions one step at a time, not all at once.',
              'The growth mindset approach: Praise effort and strategy, not innate ability. "You worked really hard on that and found a great method" is better than "You’re so smart." This is especially important for students with learning disabilities who may have internalised the message that they "can’t do it."',
            ],
            key_takeaways: [
              'Dyslexia affects 5–10% of all students — 3–5 per class of 50',
              'Cream/yellow paper, audio options, and verbal answers help dyslexic students',
              'Physical manipulatives and calculators support dyscalculic students',
              'ADHD students need short tasks, movement breaks, and one-step instructions',
            ],
            practical_activity: 'Choose one student in your class who struggles with reading, maths, or attention. Apply 3 strategies from this lesson for one week. Document the results: did their participation, accuracy, or confidence change?',
            quiz: [
              {
                question: 'What percentage of students are estimated to have dyslexia?',
                options: [
                  { text: '1–2%' },
                  { text: '5–10%', correct: true },
                  { text: '15–20%' },
                  { text: '25–30%' },
                ],
                explanation: 'Dyslexia affects an estimated 5–10% of all students — potentially 3–5 students in a class of 50.',
              },
              {
                question: 'What kind of paper reduces visual stress for dyslexic students?',
                options: [
                  { text: 'Bright white' },
                  { text: 'Cream or light yellow', correct: true },
                  { text: 'Bright blue' },
                  { text: 'Grid paper' },
                ],
                explanation: 'Cream or light yellow backgrounds reduce visual stress for dyslexic students, making text easier to read.',
              },
            ],
          },
          {
            id: 'ie-m2-l3',
            title: 'Multilingual Classrooms and Mother-Tongue Instruction',
            duration_mins: 25,
            content: [
              'Nigeria has over 500 indigenous languages. Many students enter school with limited English proficiency, especially in rural areas. The NERDC policy supports mother-tongue instruction in the early years (Primary 1–3), but many teachers are unsure how to implement it.',
              'The benefits of mother-tongue instruction are massive: UNESCO research shows children learn 30–40% faster when instruction begins in their first language. Concepts understood in the mother tongue transfer to English. A child who understands "addition" in Yoruba (àròpɔ̀) will transfer that understanding to English naturally.',
              'Practical multilingual strategies: Code-switching — explain the concept in English, then summarise in the local language. Create bilingual word walls: key vocabulary in English on one side, the local language on the other. Use local proverbs and stories to illustrate concepts — they’re culturally relevant and memorable.',
              'For Pidgin English speakers: Nigerian Pidgin is a valid language spoken by 75+ million Nigerians. If your students communicate primarily in Pidgin, using it to explain complex concepts is effective pedagogy, not "lowering standards." Transition to formal English gradually.',
              'Resources: The NERDC has published subject glossaries in Yoruba, Igbo, and Hausa for several subjects. The Skillora AI Lesson Planner can generate lesson content in multiple Nigerian languages. Local language radio programmes (BBC Hausa, Wazobia FM) can supplement lessons.',
            ],
            key_takeaways: [
              'Children learn 30–40% faster with mother-tongue instruction',
              'Code-switching between English and local languages is effective pedagogy',
              'Create bilingual word walls with key vocabulary in both languages',
              'Nigerian Pidgin is a valid instructional bridge for 75+ million speakers',
            ],
            practical_activity: 'Create a bilingual word wall for your next topic: 10 key terms in English and the predominant local language of your students. Use code-switching in your next lesson: explain in English, summarise in the local language. Note student comprehension differences.',
            quiz: [
              {
                question: 'How much faster do children learn when instruction begins in their mother tongue?',
                options: [
                  { text: '5–10% faster' },
                  { text: '15–20% faster' },
                  { text: '30–40% faster', correct: true },
                  { text: '50–60% faster' },
                ],
                explanation: 'UNESCO research shows children learn 30–40% faster when initial instruction is in their first language.',
              },
              {
                question: 'What is code-switching in teaching?',
                options: [
                  { text: 'Teaching only in the local language' },
                  { text: 'Switching between programming languages' },
                  { text: 'Explaining in English then summarising in the local language', correct: true },
                  { text: 'Using technology to translate automatically' },
                ],
                explanation: 'Code-switching means explaining a concept in English and then providing a summary in the local language to aid comprehension.',
              },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 4. ENTREPRENEURSHIP EDUCATION
  // ════════════════════════════════════════════════════════════════════════════
  {
    slug: 'entrepreneurship-education',
    emoji: '🚀',
    title: 'Entrepreneurship Education',
    description: 'Teach entrepreneurship, financial literacy, and business skills aligned to NERDC and the Nigerian job market.',
    long_description: 'Nigeria’s economy runs on entrepreneurship — over 40 million MSMEs employ 80% of the workforce. Yet schools rarely teach the business skills students need to create livelihoods. This 4-week CPD course equips teachers to deliver engaging, practical entrepreneurship education aligned to the NERDC curriculum, SMEDAN standards, and current market realities. Prepare your students not just for jobs, but to create jobs.',
    weeks: 4,
    total_lessons: 12,
    total_enrolled: 3300,
    avg_rating: 4.7,
    category: 'Business Education',
    what_you_learn: [
      'Teach business model development using the Nigerian MSME context',
      'Deliver financial literacy lessons that stick (budgeting, savings, credit, taxes)',
      'Run in-school entrepreneurship projects (mini-businesses) as learning tools',
      'Connect entrepreneurship education to NERDC Social Studies, Commerce, and Business Studies curricula',
      'Prepare students for the gig economy, freelancing, and digital entrepreneurship',
      'Assess entrepreneurial skills using portfolio-based methods',
    ],
    who_its_for: [
      'Business Studies and Commerce teachers',
      'Social Studies teachers covering enterprise topics',
      'Vocational instructors helping students start workshops/businesses',
      'Career counsellors preparing students for self-employment',
    ],
    nerdc_alignment: [
      'NERDC Basic Education Curriculum — Business Studies & Commerce',
      'NERDC Senior Secondary — Entrepreneurship Education subject',
      'SMEDAN National Policy on MSMEs',
      'CBN Financial Literacy Framework for Schools',
    ],
    pass_mark: 70,
    modules: [
      {
        id: 'ee-m1',
        title: 'Teaching Business Fundamentals',
        description: 'Help students understand how businesses work in the Nigerian context.',
        lessons: [
          {
            id: 'ee-m1-l1',
            title: 'The Nigerian Business Landscape: What Students Need to Know',
            duration_mins: 25,
            content: [
              'Nigeria has over 40 million Micro, Small, and Medium Enterprises (MSMEs). They employ approximately 80% of the workforce and contribute nearly 50% of GDP. Your students are more likely to work in or create an MSME than to get a "formal" job. Teaching entrepreneurship is not optional — it’s survival skills.',
              'Business categories students should understand: Micro (1–9 employees, under ₦5M turnover) — market traders, tailors, phone repairers. Small (10–49 employees, ₦5M–50M turnover) — restaurants, boutiques, logistics firms. Medium (50–199 employees, ₦50M–500M turnover) — manufacturing, tech companies.',
              'The entrepreneurship pathway: Most successful Nigerian entrepreneurs started small: selling recharge cards led to a phone accessories shop, which became a phone repair business, which became a tech retail chain. Teach students to see every small business as a potential growth path.',
              'Key business sectors growing in Nigeria (2025): Agriculture value chain (processing, not just farming), renewable energy (solar), technology services, creative economy (fashion, entertainment, content creation), healthcare services, and education/EdTech. Students should understand where opportunities are.',
            ],
            key_takeaways: [
              '40 million MSMEs employ 80% of Nigeria’s workforce',
              'Students are more likely to create or join an MSME than get a formal job',
              'Most big businesses started as micro enterprises — growth is the path',
              'Agriculture, solar, tech, creative economy, and health are key growth sectors',
            ],
            practical_activity: 'Take students on a "Business Walk" around the school neighbourhood. Have each student identify 10 businesses, categorise them (micro/small/medium), and note what product or service they sell. Discuss in class: which businesses are thriving and why?',
            quiz: [
              {
                question: 'How many MSMEs exist in Nigeria?',
                options: [
                  { text: '5 million' },
                  { text: '15 million' },
                  { text: '40 million', correct: true },
                  { text: '80 million' },
                ],
                explanation: 'Nigeria has over 40 million MSMEs that employ approximately 80% of the workforce.',
              },
              {
                question: 'Which sectors are growing fastest in Nigeria in 2025?',
                options: [
                  { text: 'Oil and gas only' },
                  { text: 'Agriculture value chain, solar, tech, creative economy, healthcare', correct: true },
                  { text: 'Mining and heavy industry' },
                  { text: 'Banking only' },
                ],
                explanation: 'Key growth sectors include agriculture value chain, renewable energy (solar), technology services, creative economy, and healthcare services.',
              },
            ],
          },
          {
            id: 'ee-m1-l2',
            title: 'Teaching the Business Model Canvas',
            duration_mins: 30,
            content: [
              'The Business Model Canvas (BMC) is the best tool for teaching students to think about businesses systematically. It fits on a single page and covers everything a business needs to work. It’s used by startups and corporations worldwide — and it’s perfect for the classroom.',
              'The 9 building blocks: (1) Customer Segments — who are you selling to? (2) Value Proposition — what problem do you solve? (3) Channels — how do customers find and buy from you? (4) Customer Relationships — how do you keep customers? (5) Revenue Streams — how do you make money? (6) Key Resources — what do you need? (7) Key Activities — what do you do daily? (8) Key Partners — who helps you? (9) Cost Structure — what are your expenses?',
              'Nigerian context examples: A suya seller — Customer: workers leaving offices at 6pm. Value: hot, fresh, affordable protein. Channel: roadside stall near bus stop. Revenue: ₦500–1,500 per serving. Key Resource: grill, spice recipe. This shows students that even "small" businesses have structure.',
              'Classroom activity: Print large A3 BMC templates (or draw on the board). Have students work in groups of 4 to complete a canvas for a real business they know. Then have them create a canvas for a business they would start. Present to the class for peer feedback.',
            ],
            key_takeaways: [
              'The BMC covers 9 building blocks that any business needs',
              'Use local Nigerian business examples to make it relatable',
              'Group work with peer feedback develops critical thinking',
              'Even "small" businesses like suya sellers have a valid business model',
            ],
            practical_activity: 'Print or draw 5 Business Model Canvas templates. Divide students into groups of 4. Each group completes a canvas for a business they would start in their community. Groups present and class provides feedback on each canvas.',
            quiz: [
              {
                question: 'How many building blocks does the Business Model Canvas have?',
                options: [
                  { text: '5' },
                  { text: '7' },
                  { text: '9', correct: true },
                  { text: '12' },
                ],
                explanation: 'The Business Model Canvas has 9 building blocks: Customer Segments, Value Proposition, Channels, Customer Relationships, Revenue Streams, Key Resources, Key Activities, Key Partners, and Cost Structure.',
              },
              {
                question: 'Why use Nigerian business examples when teaching the BMC?',
                options: [
                  { text: 'International examples are too complex' },
                  { text: 'To make the concept relatable and show that local businesses have structure', correct: true },
                  { text: 'Nigerian businesses are simpler' },
                  { text: 'It is required by NERDC' },
                ],
                explanation: 'Using local examples makes the abstract concept relatable and demonstrates that even everyday Nigerian businesses have valid, analysable business models.',
              },
            ],
          },
          {
            id: 'ee-m1-l3',
            title: 'Financial Literacy: Budgeting, Savings, and Credit',
            duration_mins: 30,
            content: [
              'Financial literacy is perhaps the most important life skill a Nigerian student can learn. The CBN estimates that only 36% of Nigerian adults are financially literate. Teaching financial literacy creates generational impact.',
              'Budgeting: Teach the 50-30-20 rule adapted for Nigerian realities. 50% for needs (rent, food, transport, school fees), 30% for wants (data, entertainment, clothes), 20% for savings and debt repayment. Have students create a budget using realistic Nigerian amounts for a recent graduate earning ₦80,000/month.',
              'Savings: Teach the power of compound interest using a Nigerian example. If you save ₦5,000/month in a PiggyVest or Cowrywise account earning 10% annually, after 5 years you have ₦387,000 (not just ₦300,000). After 10 years: ₦1.03 million. Small, consistent savings create wealth.',
              'Credit and debt: Many Nigerians fall into predatory loan traps (loan apps charging 30–60% monthly interest). Teach students to: (1) Never borrow for consumption (parties, phones, fashion), (2) Only borrow for income-generating activities, (3) Calculate the total cost of a loan before accepting, (4) Understand that missing loan payments destroys your credit score for future legitimate lending.',
              'Digital financial tools: Introduce students to legitimate savings apps (PiggyVest, Cowrywise), mobile banking, and USSD banking (*737#, *919#, *966#). These tools make financial management accessible even without a traditional bank account.',
            ],
            key_takeaways: [
              'Only 36% of Nigerian adults are financially literate',
              'Teach the 50-30-20 budgeting rule with Nigerian-realistic amounts',
              'Demonstrate compound interest with local savings app examples',
              'Warn students about predatory loan apps and teach responsible credit use',
            ],
            practical_activity: 'Run a budgeting exercise: give students a scenario (₦80,000 monthly salary in Lagos) and have them create a monthly budget using the 50-30-20 rule. Then show them the compound interest calculation for saving ₦5,000/month. Discuss: what would they save for?',
            quiz: [
              {
                question: 'What percentage of Nigerian adults are financially literate according to the CBN?',
                options: [
                  { text: '18%' },
                  { text: '36%', correct: true },
                  { text: '55%' },
                  { text: '72%' },
                ],
                explanation: 'The CBN estimates that only 36% of Nigerian adults are financially literate, highlighting the importance of teaching these skills in schools.',
              },
              {
                question: 'When is it acceptable to borrow money according to sound financial literacy?',
                options: [
                  { text: 'For buying the latest phone' },
                  { text: 'For parties and entertainment' },
                  { text: 'For income-generating activities only', correct: true },
                  { text: 'Whenever a loan app offers it' },
                ],
                explanation: 'Sound financial literacy teaches that borrowing should only be for income-generating activities, never for consumption.',
              },
            ],
          },
        ],
      },
      {
        id: 'ee-m2',
        title: 'Project-Based Entrepreneurship',
        description: 'Run real mini-businesses in school as learning tools.',
        lessons: [
          {
            id: 'ee-m2-l1',
            title: 'Setting Up In-School Mini-Businesses',
            duration_mins: 30,
            content: [
              'The most effective entrepreneurship education is experiential. Students who run a real mini-business — even for a few weeks — learn more than a full year of theory. The key is structured learning around the experience.',
              'Proven mini-business ideas for Nigerian schools: School snack shop (buy wholesale, sell at break time), printed T-shirt business (design + order from printshops), event photography/videography for school events, phone charging station (solar-powered — great for STEM integration), tutorial services (older students tutoring younger ones), school newsletter/magazine (sell advertising to local businesses).',
              'Structure: Form teams of 4–6 students. Each team receives a "startup loan" of ₦5,000–10,000 (real or simulated). They must: write a one-page business plan (using the BMC from Lesson 2), execute the business for 2–4 weeks, track all income and expenses, repay the loan, and present results to the class.',
              'Learning checkpoints: Week 1 — Business plan review and approval. Week 2 — First sales report. Week 3 — Profit/loss analysis. Week 4 — Final presentation + reflection. Grade students on the PROCESS (planning, execution, adaptation, teamwork) not just the profit.',
              'Teacher’s role: You are the "investor/mentor," not the manager. Ask questions like "Have you calculated your breakeven point?" and "What will you do if your first idea doesn’t sell?" Guide, don’t direct. Let students make mistakes and learn from them.',
            ],
            key_takeaways: [
              'Real mini-businesses teach more than a year of theory',
              'Provide structured checkpoints and a clear timeline',
              'Grade on process (planning, execution, adaptation) not just profit',
              'The teacher acts as mentor/investor, not manager',
            ],
            practical_activity: 'Plan a mini-business project for your class. Choose an appropriate business model from the suggestions. Set up teams, provide startup capital (real or simulated), create a timeline with weekly checkpoints. Launch the project next week.',
            quiz: [
              {
                question: 'How should teachers grade mini-business projects?',
                options: [
                  { text: 'Only on how much profit was made' },
                  { text: 'On the process: planning, execution, adaptation, and teamwork', correct: true },
                  { text: 'On the written business plan only' },
                  { text: 'On attendance and participation' },
                ],
                explanation: 'Mini-business grades should reflect the process of entrepreneurship — planning, execution, adaptation, and teamwork — not just financial outcomes.',
              },
            ],
          },
          {
            id: 'ee-m2-l2',
            title: 'Digital Entrepreneurship and the Gig Economy',
            duration_mins: 30,
            content: [
              'The future of work in Nigeria is increasingly digital. Platforms like Fiverr, Upwork, Bumpa, and Instagram have created a gig economy where young Nigerians earn from digital skills. Teachers must prepare students for this reality.',
              'Digital skills that pay in Nigeria: Graphic design (Canva, Photoshop) — ₦5K–50K per job. Social media management — ₦20K–100K/month per client. Content writing and copywriting — ₦5K–30K per article. Video editing (CapCut, Premiere) — ₦10K–50K per video. Web development — ₦50K–500K per project. Virtual assistance — ₦30K–80K/month.',
              'Teaching digital entrepreneurship: (1) Portfolio first: students create sample work before seeking clients. (2) Platform profiles: set up professional profiles on freelance platforms. (3) Pricing: research what Nigerian freelancers charge and price competitively. (4) Client communication: professional email and WhatsApp etiquette. (5) Payment: set up Paystack, Flutterwave, or bank transfer for receiving payments.',
              'The Instagram/WhatsApp business model: 60% of Nigerian small businesses now operate primarily on Instagram and WhatsApp. Teach students to: create a professional business page, take product photos that sell, write compelling captions, use WhatsApp Business features (catalogue, quick replies, labels), and track sales in a simple spreadsheet.',
              'Warning: Discuss online scams and "get rich quick" schemes. Teach students to recognise Ponzi schemes, fake investment platforms, and MLM traps. Real digital entrepreneurship requires skill development and consistent work.',
            ],
            key_takeaways: [
              'Digital skills like design, writing, and social media management pay well in Nigeria',
              'Teach the full cycle: skill → portfolio → platform profile → clients',
              'Instagram + WhatsApp Business is the dominant small business model',
              'Always teach students to recognise and avoid online scams',
            ],
            practical_activity: 'Have each student identify one digital skill they could learn (design, writing, video editing). Create a sample portfolio piece this week. Set up a professional profile (LinkedIn, Instagram, or freelance platform). Research pricing for that skill in the Nigerian market.',
            quiz: [
              {
                question: 'What percentage of Nigerian small businesses operate primarily on Instagram and WhatsApp?',
                options: [
                  { text: '20%' },
                  { text: '40%' },
                  { text: '60%', correct: true },
                  { text: '80%' },
                ],
                explanation: '60% of Nigerian small businesses now operate primarily through Instagram and WhatsApp, making these platforms essential for digital entrepreneurship.',
              },
            ],
          },
          {
            id: 'ee-m2-l3',
            title: 'Connecting Students to the Job Market',
            duration_mins: 25,
            content: [
              'Entrepreneurship education isn’t just about starting businesses — it’s about making students employable and adaptable. Nigeria’s youth unemployment rate exceeds 40%. Teachers have a role in preparing students for the reality of the job market.',
              'Skills employers actually want (beyond technical skills): Communication (clear speaking and writing), Teamwork (collaboration and conflict resolution), Problem-solving (analytical thinking and creativity), Digital literacy (basic office tools, email, social media), Time management (meeting deadlines, prioritisation), and Adaptability (willingness to learn new things quickly).',
              'Job search skills to teach: CV writing — one page, no paragraphs, use bullet points and action verbs. Interview preparation — practice the "Tell me about yourself" answer (60 seconds: who you are, what you’ve done, what you want). Professional networking — LinkedIn profile basics, attending industry events, asking for informational interviews.',
              'Alternative career paths: Not every student will follow a traditional career path. Teach them about: Apprenticeships (learn while earning), Freelancing (project-based work), Portfolio careers (multiple income streams), Social entrepreneurship (solving community problems profitably), and Remote work (Nigerian talent serving global clients).',
              'Classroom integration: Add a "Career Connection" segment to every subject you teach. In Mathematics: "Accountants use these skills." In English: "Content writers earn ₦5K–30K per article." In Science: "Lab technicians are in demand." Show students that every subject connects to earning potential.',
            ],
            key_takeaways: [
              'Soft skills (communication, teamwork, problem-solving) are as important as technical skills',
              'Teach practical job search skills: CV writing, interviewing, networking',
              'Present diverse career paths: freelancing, apprenticeships, remote work',
              'Add a "Career Connection" segment to every subject you teach',
            ],
            practical_activity: 'Help 5 students write a one-page CV using bullet points and action verbs. Practice the 60-second "Tell me about yourself" answer with each. Add a "Career Connection" note to your next 3 lesson plans showing what career uses that subject’s skills.',
            quiz: [
              {
                question: 'What is Nigeria’s approximate youth unemployment rate?',
                options: [
                  { text: '15%' },
                  { text: '25%' },
                  { text: 'Over 40%', correct: true },
                  { text: '60%' },
                ],
                explanation: 'Nigeria’s youth unemployment rate exceeds 40%, making job-readiness skills essential in education.',
              },
              {
                question: 'What is a "Career Connection" in teaching?',
                options: [
                  { text: 'A job placement service' },
                  { text: 'A segment in every lesson showing what career uses that subject’s skills', correct: true },
                  { text: 'A field trip to a company' },
                  { text: 'A career aptitude test' },
                ],
                explanation: 'A Career Connection is a brief segment in each lesson that explicitly links the subject being taught to real career opportunities and earning potential.',
              },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 5. VOCATIONAL EDUCATION IN NIGERIA
  // ════════════════════════════════════════════════════════════════════════════
  {
    slug: 'vocational-education-nigeria',
    emoji: '🇳🇬',
    title: 'Vocational Education in Nigeria',
    description: 'Understand why vocational education matters, the real challenges facing it today, and your role in Nigeria\'s national skills strategy.',
    long_description: 'Why does vocational education matter more than ever in Nigeria? This course grounds you in the real numbers behind Nigeria\'s skills gap, the policy framework governing TVET (NBTE, NSQF, TRCN), and the practical reality of teaching skills-based subjects in 2026. You\'ll finish understanding not just the "what" of vocational teaching, but the "why" — and how your work as a certified, technology-enabled teacher on Skillora connects directly to Nigeria\'s national skills strategy and the learners and employers who depend on it.',
    weeks: 3,
    total_lessons: 10,
    total_enrolled: 860,
    avg_rating: 4.9,
    category: 'Vocational Education',
    what_you_learn: [
      'Why vocational education is central to solving Nigeria\'s youth unemployment crisis',
      'The real, current challenges facing TVET delivery in Nigerian schools and centres',
      'How technology bridges gaps that conventional classroom teaching cannot',
      'Nigeria\'s vocational education policy landscape: NBTE, NSQF, UBEC, TETFund, NESRI',
      'TRCN\'s Mandatory Continuing Professional Development requirement and why it matters for your licence',
      'How to build a teacher profile that earns trust from learners and employers alike',
    ],
    who_its_for: [
      'TVET and vocational subject instructors',
      'Secondary school teachers introducing skills-based content',
      'Teachers preparing for TRCN licence renewal',
      'Anyone questioning whether vocational teaching is "real" teaching — this course answers that',
    ],
    nerdc_alignment: [
      'National Board for Technical Education (NBTE) curriculum standards',
      'Nigerian Skills Qualifications Framework (NSQF)',
      'TRCN Mandatory Continuing Professional Development (MCPD) framework',
      'Nigeria Education Sector Renewal Initiative (NESRI)',
    ],
    pass_mark: 75,
    modules: [
      {
        id: 've-m1',
        title: 'Why Vocational Education Matters',
        description: 'Ground yourself in the real numbers and realities driving Nigeria\'s renewed focus on skills-based education.',
        lessons: [
          {
            id: 've-m1-l1',
            title: 'Nigeria\'s Skills Gap: The Case for Vocational Education',
            duration_mins: 25,
            content: [
              'Nigeria is facing a youth employment crisis that a degree alone cannot solve. Recent labour force data shows 23% of young Nigerians are actively looking for work and cannot find it, while another 32% are entirely outside employment, education, or training — a combined crisis affecting more than half of Nigeria\'s youth population. At the same time, employers across construction, agriculture, ICT, and hospitality report persistent shortages of workers with practical, job-ready skills.',
              'This is not primarily a shortage of graduates — Nigeria produces hundreds of thousands of degree holders every year. It is a mismatch between what the education system teaches and what the economy actually needs. A curriculum built around theory and examinations, with little hands-on, industry-linked practice, leaves many graduates unemployable in the very sectors crying out for workers.',
              'The Federal Government has responded with its largest-ever commitment to technical and vocational education: the 2026 national budget allocates roughly ₦2.4 trillion to education, with a specific target of training over five million Nigerians through TVET programmes. This sits inside the Nigeria Education Sector Renewal Initiative (NESRI), a reform programme explicitly designed to align education with industry needs and real employment outcomes. As the Minister of Education put it, "the future of TVET must be industry-led, competency-based and labour-market driven."',
              'This is the environment you are teaching into. Vocational education is not a fallback for "academically weak" students, as it is too often perceived — it is the fastest, most direct route Nigeria has to closing its skills gap, reducing youth unemployment, and giving learners a credible path to income. Every vocational lesson you teach is doing national work, not just classroom work.',
            ],
            key_takeaways: [
              '23% of Nigerian youth are actively job-seeking; another 32% are outside employment, education, or training entirely',
              'The core problem is a skills mismatch, not a shortage of graduates',
              'The 2026 federal budget targets training over 5 million Nigerians through TVET, under the NESRI reform programme',
              'Vocational education is a national economic strategy, not a lesser alternative to academic education',
            ],
            practical_activity: 'Write down three job-ready skills your current subject could teach that it currently does not. Pick one and sketch how you would add it to your next lesson plan.',
            quiz: [
              {
                question: 'According to recent labour force data, what share of young Nigerians are entirely outside employment, education, or training (NEET)?',
                options: [
                  { text: '12%' },
                  { text: '23%' },
                  { text: '32%', correct: true },
                  { text: '50%' },
                ],
                explanation: 'About 32% of young Nigerians are classified as NEET — not in employment, education, or training — on top of the 23% actively job-seeking.',
              },
              {
                question: 'What is the core problem behind Nigeria\'s youth unemployment crisis, according to this lesson?',
                options: [
                  { text: 'Too few university graduates' },
                  { text: 'A mismatch between what education teaches and what employers need', correct: true },
                  { text: 'Too many vocational schools' },
                  { text: 'Lack of interest in working' },
                ],
                explanation: 'Nigeria produces large numbers of graduates, but the skills mismatch between curricula and industry needs leaves many unemployable — this is what vocational, competency-based education is designed to fix.',
              },
              {
                question: 'What reform programme is the 2026 TVET budget commitment part of?',
                options: [
                  { text: 'Universal Basic Education Act' },
                  { text: 'Nigeria Education Sector Renewal Initiative (NESRI)', correct: true },
                  { text: 'National Digital Economy Policy' },
                  { text: 'ETF Skills Fund' },
                ],
                explanation: 'NESRI is the government\'s reform programme aimed at aligning education with industry needs and employment outcomes, and the 2026 TVET budget commitment sits within it.',
              },
            ],
          },
          {
            id: 've-m1-l2',
            title: 'The Real Challenges Facing Vocational Education Today',
            duration_mins: 30,
            content: [
              'Understanding vocational education\'s importance means little without an honest look at what makes it hard to deliver well in Nigeria today. Underfunding is chronic: many TVET centres and vocational departments operate with outdated tools, insufficient workshop materials, and equipment that no longer matches what industry actually uses — so students train on machines or processes they will never encounter on the job.',
              'Curricula in many institutions are still misaligned with real labour-market demand, and industry linkages — the partnerships that should connect training centres to employers for internships, equipment donations, and job placement — remain weak in most states. This is precisely the gap the Nigerian Skills Qualifications Framework (NSQF) was built to close: a system for recognising and standardising skills regardless of where or how they were learned, so that training actually maps to what employers are hiring for.',
              'Vocational education also carries a stigma problem. It is too often seen as the pathway for students who "couldn\'t make it" academically, rather than a deliberate, respected career choice — a perception that discourages capable students and, in turn, weakens the pipeline of skilled talent Nigeria needs. Gender disparity compounds this: female enrolment in TVET programmes sits at only around 14%, meaning half the population is significantly underrepresented in fields with strong earning potential.',
              'Finally, there is a people problem: brain drain among skilled vocational educators, driven by poor pay and limited career progression, means some of the most capable instructors leave the classroom — or the country — for better-paying work. Recognising these challenges honestly is not pessimism. It is the starting point for knowing exactly where your effort as a teacher — and where platforms like Skillora — can make the most difference.',
            ],
            key_takeaways: [
              'Underfunding leaves many TVET centres training students on outdated equipment that doesn\'t match real industry tools',
              'The NSQF exists specifically to standardise and recognise skills across formal and informal training, closing the curriculum-industry gap',
              'Vocational education carries an unfair stigma as a "fallback" path, discouraging capable students from choosing it',
              'Female enrolment in TVET is only around 14% — a major, addressable gap',
            ],
            practical_activity: 'List one piece of equipment, tool, or process your students train on that is now outdated in real industry use. Research what the current industry-standard version looks like.',
            quiz: [
              {
                question: 'What was the Nigerian Skills Qualifications Framework (NSQF) specifically designed to fix?',
                options: [
                  { text: 'Teacher salaries' },
                  { text: 'The mismatch between training curricula and real industry skill needs', correct: true },
                  { text: 'School building infrastructure' },
                  { text: 'University admission quotas' },
                ],
                explanation: 'The NSQF standardises and recognises skills training — whether formal or informal — specifically to close the gap between what is taught and what employers actually need.',
              },
              {
                question: 'Approximately what share of TVET enrolment in Nigeria is female?',
                options: [
                  { text: '~14%', correct: true },
                  { text: '~30%' },
                  { text: '~45%' },
                  { text: '~60%' },
                ],
                explanation: 'Female enrolment in TVET programmes sits at roughly 14%, a significant and addressable gender gap in vocational education.',
              },
              {
                question: 'What effect does the "stigma" around vocational education have, according to the lesson?',
                options: [
                  { text: 'It increases funding for TVET centres' },
                  { text: 'It discourages capable students from choosing vocational paths', correct: true },
                  { text: 'It has no measurable effect' },
                  { text: 'It improves industry linkages' },
                ],
                explanation: 'When vocational education is perceived as a fallback for weaker students rather than a deliberate career choice, it discourages capable students and weakens the overall talent pipeline.',
              },
            ],
          },
          {
            id: 've-m1-l3',
            title: 'From Classroom to Career: Why Conventional Teaching Falls Short',
            duration_mins: 25,
            content: [
              'Nigeria does not have enough teachers, full stop. As of recent estimates, there is a shortage of roughly 278,000 teachers in basic education, with public primary schools alone short by nearly 195,000. The 915,593 teachers currently serving Nigeria\'s 31.8 million primary school pupils are stretched across enormous class sizes — and of the roughly 4 million teachers in service nationwide, only about 60% (roughly 2.4 million) are actually TRCN-qualified.',
              'These numbers explain why conventional, one-size-fits-all, lecture-and-chalkboard teaching struggles to deliver real competency, especially in skills-based subjects. Large class sizes make individual, hands-on practice — the core of learning any practical skill — nearly impossible to deliver consistently. A single instructor cannot personally supervise dozens of students practising a hands-on task at once.',
              'Rote learning, still common across much of the system, rewards memorisation over demonstrated ability — a serious mismatch for vocational subjects where the actual measure of learning is whether a student can competently perform a task, not recite a definition. This is why competency-based training (CBT), which measures what a learner can actually do rather than what they can recall, is now the direction NBTE and NSQF are pushing the whole system toward.',
              'None of this is a reason for discouragement — it is the exact argument for the tools this course, and this platform, exist to give you. Where a Nigerian classroom cannot provide one instructor per student, structured digital content, video demonstration, and asynchronous practice tracking can extend a single teacher\'s reach dramatically further than a chalkboard ever could.',
            ],
            key_takeaways: [
              'Nigeria has a shortage of roughly 278,000 teachers in basic education',
              'Only about 60% of Nigeria\'s ~4 million in-service teachers are TRCN-qualified',
              'Large class sizes and rote learning make hands-on, competency-based skills teaching especially difficult through conventional methods alone',
              'Competency-based training (CBT) — measuring what a learner can do, not just recall — is the direction national policy is pushing vocational education',
            ],
            practical_activity: 'Estimate your average class size this term. Write down one hands-on task in your subject that is genuinely difficult to individually supervise at that class size — and one way technology could help you check each student\'s competency anyway.',
            quiz: [
              {
                question: 'Approximately how many teachers are currently short in Nigeria\'s basic education system?',
                options: [
                  { text: '50,000' },
                  { text: '120,000' },
                  { text: '278,000', correct: true },
                  { text: '500,000' },
                ],
                explanation: 'Recent TRCN and UBEC estimates put the basic education teacher shortage at roughly 278,000.',
              },
              {
                question: 'What proportion of Nigeria\'s in-service teachers are actually TRCN-qualified?',
                options: [
                  { text: 'About 30%' },
                  { text: 'About 60%', correct: true },
                  { text: 'About 85%' },
                  { text: 'Nearly 100%' },
                ],
                explanation: 'Of the roughly 4 million teachers in service, only about 60% (2.4 million) are TRCN-qualified — a major quality gap in the system.',
              },
              {
                question: 'What does competency-based training (CBT) measure, in contrast to rote learning?',
                options: [
                  { text: 'How well a student memorises definitions' },
                  { text: 'Whether a learner can actually perform a task', correct: true },
                  { text: 'How fast a student completes an exam' },
                  { text: 'A student\'s attendance record' },
                ],
                explanation: 'CBT measures demonstrated ability — can the learner actually do the task — rather than rewarding memorisation, which is a poor fit for vocational subjects.',
              },
            ],
          },
        ],
      },
      {
        id: 've-m2',
        title: 'Technology as the Bridge',
        description: 'See how technology solves problems conventional teaching alone cannot — and where Nigeria\'s national skills strategy is already headed.',
        lessons: [
          {
            id: 've-m2-l1',
            title: 'Why EdTech Adoption Lags — and How to Change That',
            duration_mins: 25,
            content: [
              'If technology can extend a single teacher\'s reach so effectively, why hasn\'t it happened already? The honest answer is a set of specific, well-documented barriers. Most Nigerian teachers were never trained to use technology as part of their teaching practice — many have basic personal digital literacy (WhatsApp, social media) but little experience integrating tools purposefully into a lesson. This gap creates real hesitation, not laziness.',
              'Infrastructure remains a genuine constraint in many areas: unreliable electricity and inconsistent internet access make tools that assume constant connectivity impractical for daily use. Add to this low teacher remuneration and limited career progression, which reduce the incentive for teachers to invest personal time in learning new skills that aren\'t formally recognised or rewarded — and school budgets that often treat EdTech as a discretionary expense rather than core infrastructure.',
              'None of these barriers is really about technology itself — they are about training, incentive, and design. Tools built for the Nigerian context, not adapted from assumptions about constant high-speed internet, change the equation. A well-designed platform works offline-first, on low-end Android devices, over 2G connections, and rewards teachers with visible, career-relevant outcomes — certification, dashboard scores, employer visibility — for the time they invest in learning it.',
              'This is the design philosophy behind Skillora itself: content that survives a patchy connection, lessons built for the phones teachers already own, and a direct, visible link between completing training and professional recognition. Understanding why past EdTech efforts struggled is what lets you evaluate — and use — the tools that are actually built to succeed in your classroom.',
            ],
            key_takeaways: [
              'Most Nigerian teachers were never formally trained to integrate technology into teaching, not just to use devices personally',
              'Infrastructure gaps (electricity, internet) and low incentive for skills investment are real, documented adoption barriers',
              'The fix is tools designed for the Nigerian context — offline-first, low-bandwidth, smartphone-based — not assumptions borrowed from other countries',
              'Career-relevant rewards (certification, visibility) are what make investing time in EdTech worthwhile for teachers',
            ],
            practical_activity: 'Identify the single biggest barrier (training, infrastructure, incentive, or budget) to using more technology in your own teaching. Write one small step you could take this month to reduce it.',
            quiz: [
              {
                question: 'What is the main documented reason Nigerian teachers hesitate to integrate technology into teaching, according to the lesson?',
                options: [
                  { text: 'They dislike technology personally' },
                  { text: 'They were never formally trained to integrate it purposefully into lessons', correct: true },
                  { text: 'It is banned by government policy' },
                  { text: 'Students refuse to use it' },
                ],
                explanation: 'The gap is training, not attitude — many teachers have basic personal digital literacy but little experience integrating technology purposefully into their teaching practice.',
              },
              {
                question: 'What design approach helps EdTech tools succeed despite Nigeria\'s infrastructure constraints?',
                options: [
                  { text: 'Requiring constant high-speed internet' },
                  { text: 'Offline-first, low-bandwidth design built for the phones teachers already own', correct: true },
                  { text: 'Desktop-only software' },
                  { text: 'Ignoring electricity and connectivity issues' },
                ],
                explanation: 'Tools designed for the Nigerian context — working on low-end Android devices, over 2G, offline where needed — succeed where tools built on different assumptions fail.',
              },
              {
                question: 'What makes investing time in learning EdTech worthwhile for teachers, per this lesson?',
                options: [
                  { text: 'Nothing — it rarely pays off' },
                  { text: 'Career-relevant, visible rewards like certification and professional recognition', correct: true },
                  { text: 'Mandatory unpaid overtime' },
                  { text: 'Social media popularity' },
                ],
                explanation: 'When completing training leads to visible outcomes — certification, dashboard scores, employer visibility — teachers have a real, career-relevant reason to invest the time.',
              },
            ],
          },
          {
            id: 've-m2-l2',
            title: 'Blended Learning for Skills-Based Subjects',
            duration_mins: 25,
            content: [
              'Vocational subjects have a unique advantage in blended learning: the hands-on component cannot — and should not — be replaced by a screen, but everything around it can be made dramatically more effective with digital tools. Theory, demonstration, and assessment tracking are exactly where technology adds the most value without displacing practical workshop time.',
              'Video demonstration is the single most powerful digital tool for vocational teaching. A well-recorded, three-minute smartphone video of a correct technique — wiring a socket, cutting a pattern, mixing a formulation — can be watched by every student before hands-on practice, reviewed as many times as needed, and referenced again months later. This directly addresses the large-class-size problem: every student gets a perfect, repeatable demonstration, not just the students standing closest during a live demo.',
              'Asynchronous theory delivery — via structured WhatsApp lessons, short readings, or recorded voice notes — frees up scarce in-person workshop time for what actually requires physical presence: supervised practice. Students absorb the "what" and "why" on their own schedule; class time is reserved entirely for the "how," under direct supervision.',
              'Digital competency tracking closes the loop. Instead of a single end-of-term exam, a teacher can record pass/fail or skill-level checkpoints for each student as they demonstrate competency throughout the term — building exactly the kind of verifiable, standardised skill record the NSQF is designed to recognise, and giving both the teacher and the learner a clear, evidence-based picture of readiness.',
            ],
            key_takeaways: [
              'Hands-on practice time should never be replaced — but everything around it (theory, demonstration, tracking) can be enhanced digitally',
              'Video demonstration solves the large-class-size problem: every student gets a perfect, repeatable demonstration',
              'Asynchronous theory delivery frees scarce workshop time for supervised hands-on practice',
              'Digital competency tracking builds a verifiable skill record aligned with the NSQF\'s standardisation goals',
            ],
            practical_activity: 'Record a 2–3 minute smartphone video demonstrating one technique from your subject. Share it with students before their next hands-on session and note whether it changes how prepared they are.',
            quiz: [
              {
                question: 'What should never be replaced by digital tools in vocational teaching?',
                options: [
                  { text: 'Theory delivery' },
                  { text: 'Supervised hands-on practice time', correct: true },
                  { text: 'Assessment tracking' },
                  { text: 'Video demonstrations' },
                ],
                explanation: 'Hands-on practice is the core of skills learning and cannot be replaced by a screen — but the theory, demonstration, and tracking around it can be significantly enhanced.',
              },
              {
                question: 'How does video demonstration help solve the large-class-size problem?',
                options: [
                  { text: 'It reduces the number of students in a class' },
                  { text: 'Every student gets a perfect, repeatable demonstration, not just those closest to a live demo', correct: true },
                  { text: 'It eliminates the need for hands-on practice entirely' },
                  { text: 'It automatically grades students' },
                ],
                explanation: 'A recorded demonstration can be watched by every student, as many times as needed — solving the problem of only some students getting a clear view during a live, in-person demo.',
              },
              {
                question: 'What is the benefit of digital competency tracking, according to this lesson?',
                options: [
                  { text: 'It replaces the need for a teacher' },
                  { text: 'It builds a verifiable skill record aligned with national standardisation goals like the NSQF', correct: true },
                  { text: 'It only matters for digital subjects' },
                  { text: 'It removes the need for hands-on assessment' },
                ],
                explanation: 'Recording competency checkpoints throughout the term — not just a final exam — builds exactly the kind of standardised, evidence-based skill record the NSQF is designed to recognise.',
              },
            ],
          },
          {
            id: 've-m2-l3',
            title: 'Technology in TVET: The Skills-to-Jobs Model',
            duration_mins: 20,
            content: [
              'Nigeria\'s national direction on vocational education is already digital, and it is happening now. The 2026 Skills-to-Jobs Framework — a partnership between Co-Creation Hub, the Lagos Chamber of Commerce and Industry, and the Mastercard Foundation — is designed specifically to close digital skills gaps and build direct, trackable pathways from training to employment for young Nigerians.',
              'The programme\'s first-year design gives a clear picture of what "technology-enabled vocational education" looks like in practice at national scale: 2,850 participants supported through 85,500 learning vouchers, delivered through partner hubs equipped with computer workstations, stable connectivity, and reliable electricity — infrastructure specifically built to solve the barriers covered in the previous lesson.',
              'This was showcased at the 2026 National TVET Conference in Lagos, themed "Harnessing TVET as a Pathway to Employment: Building a System for Employability, Inclusion and Green Growth in Nigeria" — a theme that captures exactly the shift this course has been describing: from vocational education as an afterthought to vocational education as infrastructure for the national economy.',
              'This is the model Skillora operates on at a platform level: structured, trackable skills training, connected directly to certification and employer-facing job matching through OpportunityHub. When you teach a CPD course, publish a SkillUp lesson, or verify your KYC on this platform, you are participating in exactly the "training-to-jobs pipeline" that national policy is now actively building infrastructure to support. You are not separate from this national effort — you are part of its delivery mechanism.',
            ],
            key_takeaways: [
              'The 2026 Skills-to-Jobs Framework (CcHub, LCCI, Mastercard Foundation) is a live, national-scale example of technology-enabled vocational education',
              'Its design — learning vouchers, connected hubs, reliable infrastructure — directly targets the adoption barriers covered earlier in this module',
              'The 2026 National TVET Conference theme frames TVET explicitly as a pathway to employment, not a lesser educational track',
              'Platforms connecting training directly to certification and job-matching are now the national policy direction, not an experiment',
            ],
            practical_activity: 'Look up whether a Skills-to-Jobs, NBTE TVET Initiative, or similar training-to-employment programme has reached your state or local area. Note one way your students could benefit from it.',
            quiz: [
              {
                question: 'What is the Skills-to-Jobs Framework designed to do?',
                options: [
                  { text: 'Replace all vocational teachers with software' },
                  { text: 'Close digital skills gaps and build trackable pathways from training to employment', correct: true },
                  { text: 'Fund university scholarships only' },
                  { text: 'Provide free laptops with no training component' },
                ],
                explanation: 'The Skills-to-Jobs Framework is a partnership specifically built to close digital skills gaps and create direct, trackable pathways from training to real employment for young Nigerians.',
              },
              {
                question: 'What was the theme of the 2026 National TVET Conference in Lagos?',
                options: [
                  { text: '"Vocational Education as a Last Resort"' },
                  { text: '"Harnessing TVET as a Pathway to Employment: Building a System for Employability, Inclusion and Green Growth"', correct: true },
                  { text: '"Digital Literacy for All"' },
                  { text: '"University Reform 2030"' },
                ],
                explanation: 'The 2026 conference theme explicitly framed TVET as a pathway to employment and a system for inclusion and growth — reflecting the national shift in how vocational education is positioned.',
              },
              {
                question: 'How does this lesson describe a teacher\'s role when using Skillora\'s CPD, SkillUp, and KYC systems?',
                options: [
                  { text: 'As unrelated to national policy' },
                  { text: 'As part of the same training-to-jobs pipeline national policy is now building', correct: true },
                  { text: 'As a temporary workaround until better options exist' },
                  { text: 'As purely optional extra work' },
                ],
                explanation: 'The lesson frames platform activity — CPD completion, content creation, KYC verification — as direct participation in the national training-to-employment pipeline, not a separate or lesser activity.',
              },
            ],
          },
        ],
      },
      {
        id: 've-m3',
        title: 'Government Policy & National Frameworks',
        description: 'Know the institutions and policies that govern vocational education and your professional standing as a teacher.',
        lessons: [
          {
            id: 've-m3-l1',
            title: 'Understanding Nigeria\'s TVET Policy Landscape',
            duration_mins: 30,
            content: [
              'Four institutions define the policy environment you teach within. The National Board for Technical Education (NBTE) is the primary regulator for technical and vocational education and training — its mission is "the production of skilled technical and professional manpower for the development and sustenance of the national economy," and it is directly responsible for developing, updating, and maintaining the quality of TVET curricula nationwide.',
              'The Nigerian Skills Qualifications Framework (NSQF), developed and maintained by NBTE, is the system that recognises, classifies, and standardises skills regardless of where or how they were acquired — whether in a formal polytechnic programme or an informal apprenticeship. Its explicit purpose is closing the skills gap created by mismatched curricula and industry needs, and improving quality, productivity, and competitiveness across both formal and informal sectors.',
              'The Universal Basic Education Commission (UBEC) oversees basic education delivery and funding at the federal level, while the Tertiary Education Trust Fund (TETFund/ETF) channels dedicated tax-derived funding into infrastructure, training, and equipment for tertiary and technical institutions — one of the direct funding mechanisms behind efforts to modernise outdated TVET facilities.',
              'Sitting above all of this is the Nigeria Education Sector Renewal Initiative (NESRI), the reform programme driving the current push toward industry-led, competency-based, labour-market-driven vocational education — the same initiative behind the 2026 budget\'s five-million-trainee TVET target. Knowing these names is not bureaucratic trivia: NBTE curriculum standards, NSQF skill recognition, and NESRI\'s employment-outcome focus are the actual framework your teaching is measured against, and the standard Skillora\'s CPD courses are built to align with.',
            ],
            key_takeaways: [
              'NBTE is the primary regulator of TVET curriculum quality and standards in Nigeria',
              'The NSQF standardises and recognises skills across both formal and informal training routes',
              'UBEC funds basic education; TETFund/ETF channels dedicated funding into technical institution infrastructure and training',
              'NESRI is the overarching reform initiative currently driving Nigeria\'s shift toward industry-aligned, competency-based education',
            ],
            practical_activity: 'Search for your subject area within NBTE\'s published curriculum standards or the NSQF. Note one skill or competency listed there that you are not currently explicitly teaching.',
            quiz: [
              {
                question: 'Which body is the primary regulator responsible for TVET curriculum standards in Nigeria?',
                options: [
                  { text: 'UBEC' },
                  { text: 'NBTE', correct: true },
                  { text: 'TRCN' },
                  { text: 'NERDC only' },
                ],
                explanation: 'The National Board for Technical Education (NBTE) is the primary regulatory body responsible for developing and maintaining TVET curriculum quality and standards.',
              },
              {
                question: 'What is the core purpose of the Nigerian Skills Qualifications Framework (NSQF)?',
                options: [
                  { text: 'Setting teacher salaries' },
                  { text: 'Standardising and recognising skills regardless of where or how they were learned', correct: true },
                  { text: 'Approving new school buildings' },
                  { text: 'Managing university admissions' },
                ],
                explanation: 'The NSQF recognises, classifies, and standardises skills and competencies acquired through formal or informal training, closing the gap between curricula and industry needs.',
              },
              {
                question: 'What is NESRI?',
                options: [
                  { text: 'A teacher licensing exam' },
                  { text: 'The reform initiative driving Nigeria\'s shift toward industry-led, competency-based education', correct: true },
                  { text: 'A private EdTech company' },
                  { text: 'A state-level scholarship programme' },
                ],
                explanation: 'The Nigeria Education Sector Renewal Initiative (NESRI) is the government\'s overarching reform programme aligning education — including the 2026 TVET budget commitment — with real industry and employment needs.',
              },
            ],
          },
          {
            id: 've-m3-l2',
            title: 'TRCN, Licensing & Why CPD Isn\'t Optional',
            duration_mins: 25,
            content: [
              'The Teachers Registration Council of Nigeria (TRCN) is the statutory body responsible for regulating and licensing the teaching profession in Nigeria — and its numbers explain exactly why courses like this one exist. Of the roughly 4 million teachers currently in service nationwide, only about 60% are TRCN-qualified. Being unqualified is not just a technicality; it directly limits career progression, professional recognition, and in many cases, formal employment eligibility.',
              'TRCN\'s Mandatory Continuing Professional Development (MCPD) framework requires practising teachers to earn defined credit units on an ongoing basis to keep their theory and practice current — and completing MCPD requirements is a stated condition for licence renewal. This is not a suggestion. It is the formal mechanism by which Nigeria maintains teaching quality across a profession serving nearly 32 million basic education pupils.',
              'This is precisely the gap CPD courses on Skillora are designed to help close. A structured, NERDC- and NBTE-aligned course — with real content, a genuine knowledge check, and a verifiable certificate — is exactly the kind of credentialed professional development TRCN\'s MCPD framework is built around. Completing courses here is not just self-improvement; it is direct, documentable progress toward your professional licensing obligations.',
              'This is also why this course — and every CPD course on the platform — requires a genuine passing score before issuing a certificate. A credential that anyone can claim without demonstrating real knowledge is worthless to TRCN, worthless to an employer evaluating your profile, and ultimately worthless to you. A verified 75%+ score means your certificate actually represents something.',
            ],
            key_takeaways: [
              'TRCN is the statutory regulator and licensing body for the teaching profession in Nigeria',
              'Only about 60% of Nigeria\'s ~4 million in-service teachers are currently TRCN-qualified',
              'TRCN\'s Mandatory Continuing Professional Development (MCPD) framework requires ongoing credit units as a condition of licence renewal',
              'Genuine, score-verified CPD certificates directly support your professional licensing standing — which is why this platform enforces a real passing threshold',
            ],
            practical_activity: 'Check your current TRCN registration and CPD/MCPD status. If you are not yet registered, note the next concrete step you need to take.',
            quiz: [
              {
                question: 'What is TRCN\'s role in the Nigerian education system?',
                options: [
                  { text: 'Funding school infrastructure' },
                  { text: 'Regulating and licensing the teaching profession', correct: true },
                  { text: 'Writing the national curriculum' },
                  { text: 'Managing university admissions' },
                ],
                explanation: 'The Teachers Registration Council of Nigeria (TRCN) is the statutory body responsible for regulating and licensing teachers nationwide.',
              },
              {
                question: 'What does TRCN\'s Mandatory Continuing Professional Development (MCPD) framework require?',
                options: [
                  { text: 'Nothing — it is entirely optional' },
                  { text: 'Ongoing credit units as a condition of licence renewal', correct: true },
                  { text: 'A one-time exam taken before graduation' },
                  { text: 'Annual salary deductions' },
                ],
                explanation: 'MCPD requires teachers to earn defined credit units on an ongoing basis, and completing these requirements is a stated condition for licence renewal.',
              },
              {
                question: 'Why does Skillora enforce a genuine passing score before issuing a CPD certificate?',
                options: [
                  { text: 'To make the platform harder to use' },
                  { text: 'Because an unverified credential has no real value to TRCN, employers, or the teacher', correct: true },
                  { text: 'It is a random technical limitation' },
                  { text: 'Only premium users need to pass' },
                ],
                explanation: 'A certificate that does not verify real knowledge is meaningless as professional development evidence — enforcing a genuine passing score is what makes the certificate credible and useful.',
              },
            ],
          },
        ],
      },
      {
        id: 've-m4',
        title: 'Your Role on Skillora',
        description: 'Understand why your work as a teacher matters to the platform — and how to build a profile that succeeds.',
        lessons: [
          {
            id: 've-m4-l1',
            title: 'Why Teachers Are the Heart of the Platform',
            duration_mins: 20,
            content: [
              'Skillora exists to connect three groups: youth learners who need practical, job-ready skills; employers who need to find candidates they can trust; and teachers, who are the actual source of the training, verification, and credibility that make the entire connection possible. Without teachers, there is no CPD content, no verified skill instruction, and no credible bridge between "someone claims they can do this" and "an employer can trust this person can do this."',
              'This is the same core role this entire course has described: vocational and skills teachers exist to close Nigeria\'s skills gap. Skillora is simply a platform-level version of that same mission — with the added ability to make your work visible, measurable, and connected to employment outcomes at scale, in a way a single physical classroom cannot achieve on its own.',
              'Every KYC-verified teacher, every completed CPD course, and every SkillUp lesson published on the platform strengthens the trust signal employers rely on through OpportunityHub. When an employer sees a teacher-verified certificate or a badge on a candidate\'s profile, they are trusting the credibility your work as an instructor established. Your professional standing directly shapes the opportunities available to the learners you teach and certify.',
              'This is why the platform treats teacher verification, CPD certification, and profile completeness as core infrastructure, not optional extras. Your role is not peripheral to Skillora\'s mission — you are the mechanism by which the mission is actually delivered.',
            ],
            key_takeaways: [
              'Teachers are the source of the training, verification, and credibility that make Skillora\'s learner-to-employer connection possible',
              'Skillora\'s mission is the same skills-gap mission this course has described, delivered at platform scale',
              'Employer trust in OpportunityHub candidates is built directly on teacher verification and certification work',
              'Teacher verification and CPD are core platform infrastructure, not optional extras',
            ],
            practical_activity: 'Review your teacher profile. Identify one thing (KYC status, a course you haven\'t finished, a missing detail) that, if completed, would strengthen the trust signal your profile sends to employers.',
            quiz: [
              {
                question: 'According to this lesson, what makes the connection between learners and employers on Skillora possible?',
                options: [
                  { text: 'Automated matching software alone' },
                  { text: 'Teacher-provided training, verification, and credibility', correct: true },
                  { text: 'Government subsidies' },
                  { text: 'Social media marketing' },
                ],
                explanation: 'Teachers are described as the actual source of the training and verification that build the trust bridge between learners and employers — without them, the connection has no credibility.',
              },
              {
                question: 'How does the lesson describe Skillora\'s relationship to the national skills-gap mission covered earlier in this course?',
                options: [
                  { text: 'As unrelated to it' },
                  { text: 'As a platform-scale version of the same mission', correct: true },
                  { text: 'As a replacement for government policy' },
                  { text: 'As purely a business venture with no social purpose' },
                ],
                explanation: 'The lesson frames Skillora as delivering the same skills-gap-closing mission described throughout the course, just enabled at platform scale rather than a single classroom.',
              },
              {
                question: 'Why does Skillora treat teacher verification and CPD certification as "core infrastructure"?',
                options: [
                  { text: 'Because they are legally required by law' },
                  { text: 'Because employer trust in candidates is built directly on this teacher-driven credibility', correct: true },
                  { text: 'Because they generate the most revenue' },
                  { text: 'They are actually optional extras' },
                ],
                explanation: 'Employer trust in OpportunityHub candidates depends on the verification and certification work teachers provide — which is why the platform treats it as essential, not optional.',
              },
            ],
          },
          {
            id: 've-m4-l2',
            title: 'Building a Profile That Succeeds — KYC, Certification & Visibility',
            duration_mins: 20,
            content: [
              'Success on Skillora as a teacher is not accidental — it follows a clear, practical pattern. It starts with KYC verification: completing your identity and credential checks is the foundation every other trust signal on your profile builds on. An unverified profile, no matter how good your content is, sends a weaker signal to employers than a verified one.',
              'From there, CPD certification is your visible, evidence-based track record. Each course you complete — including this one — requires a genuine 75% pass mark across its knowledge checks before a certificate is issued. If you don\'t reach that score on your first attempt, you can retake the relevant quizzes; there is no penalty for retaking, only for claiming a credential you haven\'t actually earned. Your best verified score becomes part of your permanent teacher record.',
              'That record now appears directly on your teacher dashboard, showing your CPD courses completed and your certified scores at a glance — and, importantly, this same information is visible to employers browsing verified candidates on OpportunityHub. A strong, verified CPD record is no longer just a personal credential sitting in a drawer; it is an active, visible part of how employers evaluate you.',
              'The practical advice is simple: keep your profile current, complete your KYC early, take CPD courses seriously enough to actually pass them rather than rush them, and treat every course completion as a real addition to your professional standing — because on this platform, it genuinely is one.',
            ],
            key_takeaways: [
              'KYC verification is the foundation every other trust signal on your teacher profile depends on',
              'CPD courses require a genuine 75% pass mark; failing simply means retaking the relevant knowledge checks — there is no penalty for retaking',
              'Your CPD scores now appear on your teacher dashboard and are visible to employers evaluating candidates on OpportunityHub',
              'Treating CPD courses seriously — rather than rushing them — directly strengthens your professional standing on the platform',
            ],
            practical_activity: 'Check your KYC verification status today. If incomplete, list the exact documents or steps needed to finish it this week.',
            quiz: [
              {
                question: 'What is described as the foundation every other trust signal on a teacher\'s Skillora profile depends on?',
                options: [
                  { text: 'Number of courses browsed' },
                  { text: 'KYC verification', correct: true },
                  { text: 'Profile picture quality' },
                  { text: 'Account age' },
                ],
                explanation: 'KYC verification is described as the foundation every other trust signal builds on — an unverified profile sends a weaker signal regardless of content quality.',
              },
              {
                question: 'What happens if a teacher does not reach the 75% pass mark on a CPD course\'s knowledge checks?',
                options: [
                  { text: 'Their account is suspended' },
                  { text: 'They can retake the relevant quizzes with no penalty', correct: true },
                  { text: 'They are permanently blocked from that course' },
                  { text: 'The certificate is issued anyway' },
                ],
                explanation: 'Falling short of the pass mark simply means retaking the relevant quizzes — there is no penalty for retaking, only for claiming a credential that wasn\'t genuinely earned.',
              },
              {
                question: 'Where do a teacher\'s CPD scores appear, according to this lesson?',
                options: [
                  { text: 'Nowhere — they are private and unused' },
                  { text: 'On the teacher dashboard, and visible to employers on OpportunityHub', correct: true },
                  { text: 'Only in an emailed PDF' },
                  { text: 'Only visible to the platform admin' },
                ],
                explanation: 'CPD scores now appear on the teacher\'s own dashboard and are visible to employers browsing verified candidates — making them an active part of how the teacher is evaluated professionally.',
              },
            ],
          },
        ],
      },
    ],
  },
]
