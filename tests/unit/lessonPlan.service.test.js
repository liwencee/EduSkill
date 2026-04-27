const lessonPlanService = require('../../src/services/lessonPlan.service');

// No OpenAI key in test env → uses mock path
describe('lessonPlan.service (mock mode)', () => {
  const input = {
    topic: 'Photosynthesis',
    gradeLevel: 'JSS2',
    subject: 'Biology',
    duration: 60,
    learningObjectives: ['Understand the process', 'Draw a diagram'],
    userId: 'user-test-1',
  };

  it('returns a lesson plan object', async () => {
    const plan = await lessonPlanService.generate(input);
    expect(plan).toBeDefined();
    expect(plan.title).toBeDefined();
    expect(plan.subject).toBe('Biology');
    expect(plan.gradeLevel).toBe('JSS2');
    expect(plan.duration).toBe(60);
  });

  it('plan contains required sections', async () => {
    const plan = await lessonPlanService.generate(input);
    expect(plan.learningObjectives).toBeInstanceOf(Array);
    expect(plan.materials).toBeInstanceOf(Array);
    expect(plan.introduction).toHaveProperty('duration');
    expect(plan.mainActivity).toHaveProperty('steps');
    expect(plan.assessment).toHaveProperty('method');
    expect(plan.conclusion).toHaveProperty('summary');
    expect(typeof plan.homework).toBe('string');
    expect(typeof plan.nercAlignment).toBe('string');
  });

  it('durations are positive numbers', async () => {
    const plan = await lessonPlanService.generate(input);
    expect(plan.introduction.duration).toBeGreaterThan(0);
    expect(plan.mainActivity.duration).toBeGreaterThan(0);
  });
});
