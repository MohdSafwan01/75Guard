/**
 * EmptyStates - Neo-Brutalist Style
 */

import PropTypes from 'prop-types';

export function EmptyState({ icon, title, description, action }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            textAlign: 'center',
        }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>{icon}</div>
            <h3 style={{
                fontSize: '22px',
                fontWeight: '800',
                marginBottom: '8px',
                color: '#1C1C1C',
            }}>
                {title}
            </h3>
            <p style={{
                color: '#7A7A7A',
                maxWidth: '320px',
                marginBottom: '24px',
                fontSize: '14px',
                lineHeight: '1.5',
            }}>
                {description}
            </p>
            {action}
        </div>
    );
}

EmptyState.propTypes = {
    icon: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    action: PropTypes.node,
};

export function NoDataState({ onAddData }) {
    const buttonStyle = {
        padding: '14px 28px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        border: '2px solid #1C1C1C',
        boxShadow: '3px 3px 0px #1C1C1C',
        transition: 'all 0.15s ease',
    };

    return (
        <EmptyState
            icon="📊"
            title="No attendance data yet"
            description="Add your attendance data to start tracking. You can upload a PDF or enter data manually."
            action={
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '280px' }}>
                    <button
                        onClick={() => onAddData?.('pdf')}
                        style={{
                            ...buttonStyle,
                            backgroundColor: '#7ED957',
                            color: '#1C1C1C',
                        }}
                    >
                        📤 Upload PDF
                    </button>
                    <button
                        onClick={() => onAddData?.('manual')}
                        style={{
                            ...buttonStyle,
                            backgroundColor: '#FFB5C5',
                            color: '#1C1C1C',
                        }}
                    >
                        ✏️ Enter Manually
                    </button>
                </div>
            }
        />
    );
}

NoDataState.propTypes = {
    onAddData: PropTypes.func,
};

export function AllSafeState({ subjects }) {
    const totalBuffer = subjects?.reduce((sum, s) => sum + (s.buffer || 0), 0) || 0;

    return (
        <EmptyState
            icon="🎉"
            title="All subjects are safe!"
            description={`You have a total buffer of ${totalBuffer} classes across all subjects. Keep it up!`}
            action={
                <div style={{
                    padding: '16px 24px',
                    backgroundColor: '#E8F5E0',
                    borderRadius: '10px',
                    border: '2px solid #7ED957',
                    fontSize: '13px',
                    color: '#4A4A4A',
                }}>
                    ✓ Check back after more classes to keep status updated.
                </div>
            }
        />
    );
}

AllSafeState.propTypes = {
    subjects: PropTypes.array,
};

export function LoadingState({ message = 'Loading...' }) {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px',
        }}>
            <div style={{
                width: '50px',
                height: '50px',
                border: '4px solid #FAF3E3',
                borderTop: '4px solid #7ED957',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginBottom: '16px',
            }} />
            <p style={{ color: '#7A7A7A', fontWeight: '600' }}>{message}</p>
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

LoadingState.propTypes = {
    message: PropTypes.string,
};

export function DataStaleState({ lastUpdated, onRefresh }) {
    const daysSinceUpdate = lastUpdated
        ? Math.floor((new Date() - new Date(lastUpdated)) / (1000 * 60 * 60 * 24))
        : null;

    if (daysSinceUpdate === null || daysSinceUpdate < 7) return null;

    return (
        <div style={{
            padding: '16px 20px',
            backgroundColor: '#FFF4E5',
            border: '2px solid #FFB347',
            borderRadius: '12px',
            margin: '16px',
            boxShadow: '3px 3px 0px #FFB347',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>⏰</span>
                    <div>
                        <p style={{ fontWeight: '700', color: '#1C1C1C' }}>
                            Data might be outdated
                        </p>
                        <p style={{ fontSize: '13px', color: '#7A7A7A' }}>
                            Last updated {daysSinceUpdate} days ago
                        </p>
                    </div>
                </div>

                <button
                    onClick={onRefresh}
                    style={{
                        padding: '10px 20px',
                        backgroundColor: '#FFB347',
                        color: '#1C1C1C',
                        border: '2px solid #1C1C1C',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        boxShadow: '2px 2px 0px #1C1C1C',
                    }}
                >
                    🔄 Update Now
                </button>
            </div>
        </div>
    );
}

DataStaleState.propTypes = {
    lastUpdated: PropTypes.string,
    onRefresh: PropTypes.func,
};

export default EmptyState;
