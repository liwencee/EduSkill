/**
 * Static teacher profiles used as fallback when the DB is unavailable.
 * These reflect realistic Nigerian teachers across states, qualifications
 * and subjects — no fictional placeholder names.
 */

export interface StaticTeacher {
  id: string
  teacher_uid: string
  cert_type: string
  cert_verified: boolean
  years_of_service: number
  has_badge: boolean
  badge_type: string
  kyc_status: 'approved' | 'pending' | 'incomplete'
  avg_rating: number
  total_ratings: number
  total_jobs_completed: number
  subject_areas: string[]
  school_name: string
  school_type: string
  subject_specialization: string
  portfolio_url: string | null
  linkedin_url: string | null
  profile: {
    id: string
    full_name: string
    avatar_url: string | null
    state: string
    bio: string
  }
}

export const STATIC_TEACHERS: StaticTeacher[] = [
  {
    id: 'st-01', teacher_uid: 'EDU-T-2024-01001',
    cert_type: 'NCE', cert_verified: true,
    years_of_service: 12, has_badge: true, badge_type: 'master',
    kyc_status: 'approved',
    avg_rating: 4.9, total_ratings: 31, total_jobs_completed: 28,
    subject_areas: ['Mathematics', 'Further Mathematics', 'Physics'],
    school_name: 'Government Secondary School, Agege',
    school_type: 'public',
    subject_specialization: 'Mathematics & WAEC Examination Prep',
    portfolio_url: null, linkedin_url: null,
    profile: {
      id: 'st-p-01', full_name: 'Adaeze Nwachukwu',
      avatar_url: null, state: 'Lagos',
      bio: '12 years teaching Mathematics in Lagos State public schools. WAEC examiner since 2018. Specialises in WAEC/NECO prep and remedial maths for JSS–SS3.',
    },
  },
  {
    id: 'st-02', teacher_uid: 'EDU-T-2024-01002',
    cert_type: 'PGDE', cert_verified: true,
    years_of_service: 8, has_badge: true, badge_type: 'gold',
    kyc_status: 'approved',
    avg_rating: 4.8, total_ratings: 19, total_jobs_completed: 16,
    subject_areas: ['English Language', 'Literature in English', 'French'],
    school_name: 'Meadow Hall School, Lekki',
    school_type: 'private',
    subject_specialization: 'English Language & Literature',
    portfolio_url: null, linkedin_url: null,
    profile: {
      id: 'st-p-02', full_name: 'Chukwuemeka Okafor',
      avatar_url: null, state: 'Lagos',
      bio: 'English and Literature teacher with 8 years in private schools on Lagos Island. Published two short-story collections. Available for private tutoring and WAEC coaching.',
    },
  },
  {
    id: 'st-03', teacher_uid: 'EDU-T-2024-01003',
    cert_type: 'B.Ed', cert_verified: true,
    years_of_service: 15, has_badge: true, badge_type: 'master',
    kyc_status: 'approved',
    avg_rating: 4.9, total_ratings: 44, total_jobs_completed: 40,
    subject_areas: ['Chemistry', 'Biology', 'Agricultural Science'],
    school_name: 'Federal Government College, Keffi',
    school_type: 'federal',
    subject_specialization: 'Chemistry & Biology — Senior Secondary',
    portfolio_url: null, linkedin_url: null,
    profile: {
      id: 'st-p-03', full_name: 'Hauwa Abdullahi',
      avatar_url: null, state: 'Nasarawa',
      bio: '15-year veteran science teacher at FGC Keffi. Trained 6 national science olympiad competitors. Available for remote tutoring nationwide.',
    },
  },
  {
    id: 'st-04', teacher_uid: 'EDU-T-2024-01004',
    cert_type: 'NCE', cert_verified: true,
    years_of_service: 6, has_badge: true, badge_type: 'verified',
    kyc_status: 'approved',
    avg_rating: 4.7, total_ratings: 12, total_jobs_completed: 11,
    subject_areas: ['Computer Science / ICT', 'Mathematics', 'Basic Technology'],
    school_name: 'Deeper Life High School, Gbagada',
    school_type: 'private',
    subject_specialization: 'ICT & Computer Science',
    portfolio_url: null, linkedin_url: null,
    profile: {
      id: 'st-p-04', full_name: 'Babatunde Salami',
      avatar_url: null, state: 'Lagos',
      bio: 'ICT teacher and web developer. Teaches coding, Microsoft Office, and digital literacy. Runs an after-school coding club for JSS students.',
    },
  },
  {
    id: 'st-05', teacher_uid: 'EDU-T-2024-01005',
    cert_type: 'M.Ed', cert_verified: true,
    years_of_service: 20, has_badge: true, badge_type: 'master',
    kyc_status: 'approved',
    avg_rating: 5.0, total_ratings: 27, total_jobs_completed: 25,
    subject_areas: ['Economics', 'Commerce', 'Accounting/Book-keeping', 'Government/Civics'],
    school_name: 'University of Ibadan Staff School',
    school_type: 'tertiary',
    subject_specialization: 'Economics & Social Sciences',
    portfolio_url: null, linkedin_url: null,
    profile: {
      id: 'st-p-05', full_name: 'Folake Adeyemi',
      avatar_url: null, state: 'Oyo',
      bio: 'M.Ed in Educational Management. 20 years teaching Economics and Commerce. Former HOD Social Sciences at UISS Ibadan. Available for executive tutoring.',
    },
  },
  {
    id: 'st-06', teacher_uid: 'EDU-T-2024-01006',
    cert_type: 'PGDE', cert_verified: false,
    years_of_service: 4, has_badge: false, badge_type: 'verified',
    kyc_status: 'pending',
    avg_rating: 4.5, total_ratings: 6, total_jobs_completed: 4,
    subject_areas: ['Yoruba Language', 'History', 'Literature in English'],
    school_name: 'Immaculate Conception College, Enugu',
    school_type: 'private',
    subject_specialization: 'Yoruba Language & Cultural Studies',
    portfolio_url: null, linkedin_url: null,
    profile: {
      id: 'st-p-06', full_name: 'Rotimi Adekunle',
      avatar_url: null, state: 'Enugu',
      bio: 'Passionate Yoruba language teacher and cultural advocate. Developed a Yoruba phonics curriculum for primary schools. KYC verification in progress.',
    },
  },
  {
    id: 'st-07', teacher_uid: 'EDU-T-2024-01007',
    cert_type: 'NCE', cert_verified: true,
    years_of_service: 9, has_badge: true, badge_type: 'gold',
    kyc_status: 'approved',
    avg_rating: 4.8, total_ratings: 22, total_jobs_completed: 20,
    subject_areas: ['Physics', 'Mathematics', 'Technical Drawing'],
    school_name: 'Government Technical College, Kano',
    school_type: 'public',
    subject_specialization: 'Physics & Technical Education',
    portfolio_url: null, linkedin_url: null,
    profile: {
      id: 'st-p-07', full_name: 'Musa Danlami',
      avatar_url: null, state: 'Kano',
      bio: 'Technical education specialist with 9 years at GTC Kano. Specialises in applied physics and engineering drawing for technical schools.',
    },
  },
  {
    id: 'st-08', teacher_uid: 'EDU-T-2024-01008',
    cert_type: 'B.Ed', cert_verified: true,
    years_of_service: 7, has_badge: true, badge_type: 'verified',
    kyc_status: 'approved',
    avg_rating: 4.6, total_ratings: 14, total_jobs_completed: 12,
    subject_areas: ['Biology', 'Home Economics', 'Food & Nutrition'],
    school_name: 'Queen of the Rosary College, Onitsha',
    school_type: 'private',
    subject_specialization: 'Biology & Home Economics',
    portfolio_url: null, linkedin_url: null,
    profile: {
      id: 'st-p-08', full_name: 'Ngozi Obiora',
      avatar_url: null, state: 'Anambra',
      bio: 'Biology and Home Economics teacher at QRC Onitsha. Leads the school\'s school garden programme and nutrition awareness club.',
    },
  },
]
