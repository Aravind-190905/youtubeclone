import React, { useState, useEffect, useRef } from 'react';
import './VideoPlayer.css';
import { useSelector } from 'react-redux';

const API_URL = process.env.REACT_APP_API_URL;

const PLAN_LIMITS = {
    free: 5 * 60,      // 5 minutes in seconds
    bronze: 7 * 60,   // 7 minutes
    silver: 10 * 60,  // 10 minutes
    gold: Infinity    // unlimited
};
const PLAN_PRICES = {
    free: 0,
    bronze: 10,
    silver: 50,
    gold: 100
};
const PLAN_LABELS = {
    free: 'Free',
    bronze: 'Bronze',
    silver: 'Silver',
    gold: 'Gold'
};

const plans = ['free', 'bronze', 'silver', 'gold'];

const VideoPlayer = ({ video, videoId }) => {
    const [currentQuality, setCurrentQuality] = useState('720p');
    const [qualities, setQualities] = useState([]);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [timeWatched, setTimeWatched] = useState(0);
    const [upgradeLoading, setUpgradeLoading] = useState(false);
    const [upgradeSuccess, setUpgradeSuccess] = useState("");
    const [upgradeError, setUpgradeError] = useState("");
    const videoRef = useRef(null);
    const qualityMenuRef = useRef(null);

    // Get user plan from Redux
    const currentUser = useSelector(state => state.currentuserreducer?.result);
    const userPlan = currentUser?.plan || 'free';
    const userId = currentUser?._id;
    const timeLimit = PLAN_LIMITS[userPlan] || PLAN_LIMITS['free'];

    useEffect(() => {
        // Fetch available qualities for this video
        const fetchQualities = async () => {
            try {
                const response = await fetch(`${API_URL}/api/video/${videoId}/qualities`);
                const data = await response.json();
                if (data.qualities && data.qualities.length > 0) {
                    setQualities(data.qualities);
                    setCurrentQuality(data.defaultQuality || '720p');
                } else {
                    setQualities([{
                        quality: 'Original',
                        filepath: video?.filepath,
                        filesize: video?.filesize
                    }]);
                    setCurrentQuality('Original');
                }
            } catch (error) {
                setQualities([{
                    quality: 'Original',
                    filepath: video?.filepath,
                    filesize: video?.filesize
                }]);
                setCurrentQuality('Original');
            }
        };
        if (videoId) fetchQualities();
    }, [videoId, video]);

    useEffect(() => {
        // Close quality menu when clicking outside
        const handleClickOutside = (event) => {
            if (qualityMenuRef.current && !qualityMenuRef.current.contains(event.target)) {
                setShowQualityMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Time limit enforcement
    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;
        const onTimeUpdate = () => {
            setTimeWatched(videoEl.currentTime);
            if (videoEl.currentTime >= timeLimit) {
                videoEl.pause();
                setShowUpgradeModal(true);
            }
        };
        videoEl.addEventListener('timeupdate', onTimeUpdate);
        return () => {
            videoEl.removeEventListener('timeupdate', onTimeUpdate);
        };
    }, [timeLimit]);

    const handleQualityChange = (quality) => {
        setIsLoading(true);
        setCurrentQuality(quality);
        setShowQualityMenu(false);
        const currentTime = videoRef.current?.currentTime || 0;
        const selectedQuality = qualities.find(q => q.quality === quality);
        if (selectedQuality) {
            videoRef.current.src = `${API_URL}/${selectedQuality.filepath}`;
            videoRef.current.onloadedmetadata = () => {
                videoRef.current.currentTime = currentTime;
                setIsLoading(false);
            };
        }
    };

    const getCurrentQualityFilepath = () => {
        const selectedQuality = qualities.find(q => q.quality === currentQuality);
        return selectedQuality ? selectedQuality.filepath : video?.filepath;
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return '';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    // Handle plan upgrade
    const handleUpgrade = async (plan) => {
        setUpgradeLoading(true);
        setUpgradeError("");
        setUpgradeSuccess("");
        try {
            const res = await fetch(`${API_URL}/user/upgrade`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, plan })
            });
            const data = await res.json();
            if (res.ok) {
                setUpgradeSuccess(`Successfully upgraded to ${PLAN_LABELS[plan]}! Please refresh the page.`);
            } else {
                setUpgradeError(data.message || 'Upgrade failed.');
            }
        } catch (err) {
            setUpgradeError('Upgrade failed.');
        }
        setUpgradeLoading(false);
    };

    // Modal for upgrade
    const UpgradeModal = () => (
        <div className="upgrade-modal-overlay">
            <div className="upgrade-modal">
                <h2>Upgrade Required</h2>
                <p>Your current plan (<b>{PLAN_LABELS[userPlan]}</b>) allows only {timeLimit === Infinity ? 'unlimited' : timeLimit/60 + ' minutes'} per video.</p>
                <p>To watch more, please upgrade your plan:</p>
                <div style={{margin: '1rem 0'}}>
                    {plans.map(plan => (
                        <div key={plan} style={{margin: '0.5rem 0', opacity: userPlan === plan ? 0.5 : 1}}>
                            <b>{PLAN_LABELS[plan]}</b> - {plan === 'gold' ? 'Unlimited' : PLAN_LIMITS[plan]/60 + ' min'} - ₹{PLAN_PRICES[plan]}
                            {userPlan === plan ? (
                                <span style={{marginLeft: 8, color: '#1976d2'}}>(Current)</span>
                            ) : (
                                <button className="upgrade-btn" style={{marginLeft: 8}} disabled={upgradeLoading} onClick={() => handleUpgrade(plan)}>
                                    Upgrade
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                {upgradeLoading && <p>Processing...</p>}
                {upgradeSuccess && <p style={{color: 'green'}}>{upgradeSuccess}</p>}
                {upgradeError && <p style={{color: 'red'}}>{upgradeError}</p>}
                <button className="close-btn" onClick={() => setShowUpgradeModal(false)}>Close</button>
            </div>
        </div>
    );

    return (
        <div className="video-player-container">
            <div className="video-wrapper">
                <video
                    ref={videoRef}
                    className="video-player"
                    controls
                    preload="metadata"
                    src={`${API_URL}/${getCurrentQualityFilepath()}`}
                >
                    Your browser does not support the video tag.
                </video>
                {isLoading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                        <p>Changing quality...</p>
                    </div>
                )}
                {showUpgradeModal && <UpgradeModal />}
            </div>
            <div className="video-controls">
                <div className="quality-selector" ref={qualityMenuRef}>
                    <button
                        className="quality-button"
                        onClick={() => setShowQualityMenu(!showQualityMenu)}
                    >
                        <span className="quality-icon">⚙️</span>
                        {currentQuality}
                        <span className="dropdown-arrow">▼</span>
                    </button>
                    {showQualityMenu && (
                        <div className="quality-menu">
                            {qualities.map((quality) => (
                                <button
                                    key={quality.quality}
                                    className={`quality-option ${currentQuality === quality.quality ? 'active' : ''}`}
                                    onClick={() => handleQualityChange(quality.quality)}
                                >
                                    <span className="quality-label">{quality.quality}</span>
                                    {quality.filesize && (
                                        <span className="quality-size">
                                            ({formatFileSize(parseInt(quality.filesize))})
                                        </span>
                                    )}
                                    {currentQuality === quality.quality && (
                                        <span className="current-indicator">✓</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer; 