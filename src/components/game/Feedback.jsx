import React, { useState } from 'react';
import '../../styles/game-ui.css';

const Feedback = ({ onComplete, onClose, playerNickname }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const finalReview = comment.trim() === '' ? 'No review added' : comment;
            const response = await fetch('https://feedback-production-6600.up.railway.app/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rating, review: finalReview, nickname: playerNickname}),
            });

            if (response.ok) {
                console.log('Feedback sent successfully');
                setSubmitted(true);
            } else {
                console.error('Failed to submit feedback');
                setSubmitted(true);
            }
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setSubmitted(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        if (onComplete) onComplete();
        else if (onClose) onClose();
    };

    if (submitted) {
        return (
            <div className="feedback-overlay">
                <div className="feedback-modal success">
                    <div className="feedback-success-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <h2>Feedback Submitted!</h2>
                    <p>Thank you for helping us improve.</p>
                    <button 
                        className="submit-btn" 
                        style={{marginTop: '1.5rem', width: '100%'}} 
                        onClick={() => {
                            if (onComplete) onComplete();
                            else if (onClose) onClose();
                        }}
                    >
                        Back to Webpage
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="feedback-overlay">
            <div className="feedback-modal">
                <button className="feedback-close-btn" onClick={onClose} title="Cancel">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                </button>

                <h2>We value your feedback</h2>
                <p className="feedback-subtitle">Please rate your experience</p>

                <form onSubmit={handleSubmit}>
                    {/* Star Rating */}
                    <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                            >
                                <svg viewBox="0 0 24 24" fill={star <= (hoverRating || rating) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                </svg>
                            </button>
                        ))}
                    </div>

                    <textarea
                        className="feedback-textarea"
                        placeholder="Tell us what you think..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                    />

                    <div className="button-group">
                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={rating === 0 || isSubmitting}
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </button>
                        <button
                            type="button"
                            className="skip-btn"
                            onClick={handleSkip}
                            disabled={isSubmitting}
                        >
                            Skip
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Feedback;
