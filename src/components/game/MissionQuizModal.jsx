import React, { useState, useEffect } from 'react';

function MissionQuizModal({ mission, onComplete, onClose }) {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [score, setScore] = useState(0);
    const [isClosing, setIsClosing] = useState(false);

    // Select 3 random questions when modal opens
    useEffect(() => {
        if (mission && mission.questions) {
            const shuffled = [...mission.questions].sort(() => Math.random() - 0.5);
            const selected = shuffled.slice(0, 3);
            setSelectedQuestions(selected);
            setSelectedAnswers(new Array(3).fill(null));
        }
    }, [mission]);

    const handleAnswerSelect = (answerIndex) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestion] = answerIndex;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestion < selectedQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            // Calculate score
            let correctCount = 0;
            selectedQuestions.forEach((question, index) => {
                if (selectedAnswers[index] === question.correctAnswer) {
                    correctCount++;
                }
            });
            setScore(correctCount);
            setShowResults(true);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    const handleSubmit = () => {
        const passed = score >= 2; // Need at least 2 correct answers
        setIsClosing(true);
        setTimeout(() => onComplete(passed), 300);
    };

    const canProceed = selectedAnswers[currentQuestion] !== null;

    if (!mission || selectedQuestions.length === 0) return null;

    return (
        <div className={`mission-modal-overlay ${isClosing ? 'closing' : ''}`}>
            <div className="mission-modal-content mission-quiz-modal">
                {!showResults ? (
                    <>
                        {/* Quiz Header */}
                        <div className="mission-modal-header">
                            <div>
                                <h2>Mission Quiz - {mission.title}</h2>
                                <div className="quiz-progress">
                                    Question {currentQuestion + 1} of {selectedQuestions.length}
                                </div>
                            </div>
                            <button className="mission-modal-close" onClick={handleClose}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Question */}
                        <div className="mission-modal-body">
                            <div className="quiz-question">
                                <p>{selectedQuestions[currentQuestion].question}</p>
                            </div>

                            {/* Options */}
                            <div className="quiz-options">
                                {selectedQuestions[currentQuestion].options.map((option, index) => (
                                    <button
                                        key={index}
                                        className={`quiz-option ${selectedAnswers[currentQuestion] === index ? 'selected' : ''}`}
                                        onClick={() => handleAnswerSelect(index)}
                                    >
                                        <span className="quiz-option-letter">{String.fromCharCode(65 + index)}</span>
                                        <span className="quiz-option-text">{option}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mission-modal-footer">
                            <button
                                className="mission-modal-continue"
                                onClick={handleNext}
                                disabled={!canProceed}
                            >
                                {currentQuestion < selectedQuestions.length - 1 ? 'Next Question' : 'Submit Quiz'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Results Header */}
                        <div className="mission-modal-header">
                            <h2>Quiz Results</h2>
                            <button className="mission-modal-close" onClick={handleClose}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        {/* Results Body */}
                        <div className="mission-modal-body">
                            <div className="quiz-results">
                                <div className="quiz-score">
                                    <div className="quiz-score-circle">
                                        <span className="quiz-score-number">{score}</span>
                                        <span className="quiz-score-total">/ 3</span>
                                    </div>
                                    <p className="quiz-score-text">
                                        {score >= 2 ? '🎉 Congratulations! Mission Completed!' : '❌ Mission Failed - You need at least 2 correct answers'}
                                    </p>
                                </div>

                                {/* Show correct answers */}
                                <div className="quiz-review">
                                    <h3>Review:</h3>
                                    {selectedQuestions.map((question, index) => {
                                        const isCorrect = selectedAnswers[index] === question.correctAnswer;
                                        return (
                                            <div key={index} className={`quiz-review-item ${isCorrect ? 'correct' : 'incorrect'}`}>
                                                <p className="quiz-review-question">
                                                    {index + 1}. {question.question}
                                                </p>
                                                <p className="quiz-review-answer">
                                                    Your answer: {question.options[selectedAnswers[index]]} {isCorrect ? '✓' : '✗'}
                                                </p>
                                                {!isCorrect && (
                                                    <p className="quiz-review-correct">
                                                        Correct answer: {question.options[question.correctAnswer]}
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Results Footer */}
                        <div className="mission-modal-footer">
                            <button
                                className={`mission-modal-continue ${score < 2 ? 'retry' : ''}`}
                                onClick={handleSubmit}
                            >
                                {score >= 2 ? 'Complete Mission' : 'Try Again'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default MissionQuizModal;
