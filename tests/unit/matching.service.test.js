const matchingService = require('../../src/services/matching.service');
const database = require('../../src/config/database');

jest.mock('../../src/config/database');

// Creates a fully chainable Supabase-style mock.
// terminal() is the final awaitable result (used by .single() or .limit()).
function makeChainableDb({ profileResult, jobsResult }) {
  let currentTable = '';

  const chain = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    overlaps: jest.fn().mockReturnThis(),
    single: jest.fn().mockImplementation(() => Promise.resolve(profileResult)),
    limit: jest.fn().mockImplementation(() => Promise.resolve(jobsResult)),
  };

  return {
    from: jest.fn().mockImplementation((table) => {
      currentTable = table;
      return chain;
    }),
    _chain: chain,
    _getTable: () => currentTable,
  };
}

afterEach(() => jest.clearAllMocks());

describe('matching.service', () => {
  it('returns empty array when db is not configured', async () => {
    database.getSupabaseClient.mockReturnValue(null);
    const matches = await matchingService.getJobMatchesForUser('user-1');
    expect(matches).toEqual([]);
  });

  it('returns empty array when profile has no skills', async () => {
    const db = makeChainableDb({
      profileResult: { data: { skills: [], location: 'Lagos' } },
      jobsResult: { data: [], error: null },
    });
    database.getSupabaseClient.mockReturnValue(db);

    const matches = await matchingService.getJobMatchesForUser('user-1');
    expect(matches).toEqual([]);
  });

  it('returns empty array when profile is null', async () => {
    const db = makeChainableDb({
      profileResult: { data: null },
      jobsResult: { data: [], error: null },
    });
    database.getSupabaseClient.mockReturnValue(db);

    const matches = await matchingService.getJobMatchesForUser('user-1');
    expect(matches).toEqual([]);
  });

  it('returns matched jobs sorted by score when profile has skills', async () => {
    const profile = { skills: ['digital_marketing', 'coding'], location: 'Lagos' };
    const jobs = [
      {
        id: 'j1', title: 'Marketing Role', type: 'job', location: 'Lagos',
        required_skills: ['digital_marketing', 'coding'],
        employer: { id: 'e1', name: 'Acme' },
      },
      {
        id: 'j2', title: 'Coder', type: 'job', location: 'Abuja',
        required_skills: ['coding', 'python'],
        employer: { id: 'e2', name: 'TechCo' },
      },
    ];

    const db = makeChainableDb({
      profileResult: { data: profile },
      jobsResult: { data: jobs, error: null },
    });
    database.getSupabaseClient.mockReturnValue(db);

    const matches = await matchingService.getJobMatchesForUser('user-1');

    // j1: 2/2 skills match = 100%; j2: 1/2 skills match = 50%
    expect(matches).toHaveLength(2);
    expect(matches[0].matchScore).toBe(100);
    expect(matches[0].id).toBe('j1');
    expect(matches[1].matchScore).toBe(50);
    expect(matches[1].id).toBe('j2');
  });

  it('scores are between 0 and 100', async () => {
    const profile = { skills: ['agribusiness'], location: 'Kano' };
    const jobs = [
      {
        id: 'j3', title: 'Farm Manager', type: 'job', location: 'Kano',
        required_skills: ['agribusiness', 'financial_literacy', 'coding'],
        employer: { id: 'e3', name: 'FarmCo' },
      },
    ];

    const db = makeChainableDb({
      profileResult: { data: profile },
      jobsResult: { data: jobs, error: null },
    });
    database.getSupabaseClient.mockReturnValue(db);

    const matches = await matchingService.getJobMatchesForUser('user-1');
    expect(matches[0].matchScore).toBeGreaterThanOrEqual(0);
    expect(matches[0].matchScore).toBeLessThanOrEqual(100);
    expect(matches[0].matchScore).toBe(33); // 1 of 3 required skills
  });
});
