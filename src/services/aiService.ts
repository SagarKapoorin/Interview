import { Question, Answer } from '../types';

// Mock AI service - in production, this would connect to actual AI APIs
export class AIService {
  private questionBank: Omit<Question, 'id'>[] = [
    // Easy Questions (20s each)
    {
      question: "What is the difference between let, const, and var in JavaScript?",
      difficulty: 'Easy',
      timeLimit: 20,
      expectedAnswer: "var is function-scoped, let and const are block-scoped. const cannot be reassigned."
    },
    {
      question: "What is a React component and how do you create one?",
      difficulty: 'Easy',
      timeLimit: 20,
      expectedAnswer: "A React component is a reusable piece of UI. You can create functional or class components."
    },
    {
      question: "What is the purpose of package.json in Node.js?",
      difficulty: 'Easy',
      timeLimit: 20,
      expectedAnswer: "package.json contains project metadata, dependencies, and scripts for the project."
    },
    
    // Medium Questions (60s each)
    {
      question: "Explain the concept of React Hooks and give examples of built-in hooks.",
      difficulty: 'Medium',
      timeLimit: 60,
      expectedAnswer: "Hooks allow functional components to use state and lifecycle methods. Examples: useState, useEffect, useContext."
    },
    {
      question: "What is middleware in Express.js and how do you implement custom middleware?",
      difficulty: 'Medium',
      timeLimit: 60,
      expectedAnswer: "Middleware functions execute during request-response cycle. Custom middleware: (req, res, next) => { /* logic */ next(); }"
    },
    {
      question: "Explain the difference between SQL and NoSQL databases with examples.",
      difficulty: 'Medium',
      timeLimit: 60,
      expectedAnswer: "SQL databases are relational (PostgreSQL, MySQL). NoSQL are non-relational (MongoDB, Redis). Different use cases."
    },
    
    // Hard Questions (120s each)
    {
      question: "Explain React's reconciliation algorithm and how virtual DOM works.",
      difficulty: 'Hard',
      timeLimit: 120,
      expectedAnswer: "React uses diffing algorithm to compare virtual DOM trees. Reconciliation efficiently updates only changed parts of real DOM."
    },
    {
      question: "Design a scalable Node.js application architecture for handling high concurrent requests.",
      difficulty: 'Hard',
      timeLimit: 120,
      expectedAnswer: "Use clustering, load balancing, caching strategies, database optimization, and microservices architecture."
    },
    {
      question: "Implement a debounce function and explain when you would use it in a React application.",
      difficulty: 'Hard',
      timeLimit: 120,
      expectedAnswer: "Debounce delays function execution until after delay period. Useful for search inputs, API calls, resize events."
    }
  ];

  generateQuestions(): Question[] {
    const easyQuestions = this.questionBank.filter(q => q.difficulty === 'Easy').slice(0, 2);
    const mediumQuestions = this.questionBank.filter(q => q.difficulty === 'Medium').slice(0, 2);
    const hardQuestions = this.questionBank.filter(q => q.difficulty === 'Hard').slice(0, 2);
    
    const allQuestions = [...easyQuestions, ...mediumQuestions, ...hardQuestions];
    
    return allQuestions.map((q, index) => ({
      ...q,
      id: `question-${index + 1}`
    }));
  }

  scoreAnswer(question: Question, answer: string, timeSpent: number): { score: number; feedback: string } {
    // Mock AI scoring logic
    const answerLength = answer.trim().length;
    const timeEfficiency = Math.min(timeSpent / question.timeLimit, 1);
    
    let baseScore = 0;
    let feedback = '';
    
    if (answerLength < 10) {
      baseScore = 2;
      feedback = "Answer is too brief. Consider providing more detail.";
    } else if (answerLength < 50) {
      baseScore = 5;
      feedback = "Good attempt, but could be more comprehensive.";
    } else if (answerLength < 150) {
      baseScore = 7;
      feedback = "Well-structured answer with good details.";
    } else {
      baseScore = 9;
      feedback = "Excellent comprehensive answer!";
    }
    
    // Adjust score based on time efficiency
    const timeBonus = timeEfficiency < 0.5 ? 1 : 0;
    const finalScore = Math.min(baseScore + timeBonus, 10);
    
    return { score: finalScore, feedback };
  }

  generateSummary(answers: Answer[]): { score: number; summary: string } {
    const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
    const averageScore = totalScore / answers.length;
    const percentage = (averageScore / 10) * 100;
    
    let performanceLevel = '';
    if (percentage >= 80) performanceLevel = 'Excellent';
    else if (percentage >= 60) performanceLevel = 'Good';
    else if (percentage >= 40) performanceLevel = 'Average';
    else performanceLevel = 'Needs Improvement';
    
    const easyScore = answers.filter(a => a.difficulty === 'Easy').reduce((sum, a) => sum + a.score, 0) / 2;
    const mediumScore = answers.filter(a => a.difficulty === 'Medium').reduce((sum, a) => sum + a.score, 0) / 2;
    const hardScore = answers.filter(a => a.difficulty === 'Hard').reduce((sum, a) => sum + a.score, 0) / 2;
    
    const summary = `
      Overall Performance: ${performanceLevel} (${percentage.toFixed(1)}%)
      
      Strengths:
      • ${easyScore >= 7 ? 'Strong foundation in basic concepts' : 'Basic concepts need reinforcement'}
      • ${mediumScore >= 7 ? 'Good understanding of intermediate topics' : 'Intermediate concepts require more practice'}
      • ${hardScore >= 7 ? 'Excellent grasp of advanced concepts' : 'Advanced topics need more study'}
      
      Areas for Improvement:
      • ${easyScore < 7 ? 'Review fundamental JavaScript and React concepts' : ''}
      • ${mediumScore < 7 ? 'Practice more with frameworks and backend concepts' : ''}
      • ${hardScore < 7 ? 'Study advanced architecture and optimization techniques' : ''}
      
      Recommendation: ${performanceLevel === 'Excellent' ? 'Strong candidate for the role' : 
                        performanceLevel === 'Good' ? 'Promising candidate with some areas to develop' :
                        'Consider additional training or a junior role'}
    `.trim();
    
    return { score: Math.round(percentage), summary };
  }
}

export const aiService = new AIService();