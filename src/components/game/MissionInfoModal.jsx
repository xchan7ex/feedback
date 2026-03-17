import React from 'react';

function MissionInfoModal({ mission, onContinue, onClose }) {
    const [isClosing, setIsClosing] = React.useState(false);

    if (!mission) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    const handleContinue = () => {
        setIsClosing(true);
        setTimeout(() => onContinue(), 300);
    };

    return (
        <div className={`mission-modal-overlay ${isClosing ? 'closing' : ''}`} onClick={handleClose}>
            <div className="mission-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="mission-modal-header">
                    <h2>{mission.info.title}</h2>
                    <button className="mission-modal-close" onClick={handleClose}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="mission-modal-body">
                    <p className="mission-modal-description">{mission.info.description}</p>

                    <div className="mission-modal-details">
                        {mission.info.details.map((detail, index) => (
                            <div key={index} className="mission-modal-detail-item">
                                {detail}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="mission-modal-footer">
                    {mission.isMiniGame ? (
                        <button className="mission-modal-continue" onClick={handleClose}>
                            Start Challenge
                        </button>
                    ) : (
                        <button className="mission-modal-continue" onClick={handleContinue}>
                            Continue to Quiz
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MissionInfoModal;
