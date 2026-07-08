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
]
