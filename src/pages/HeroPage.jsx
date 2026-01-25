/**
 * HeroPage - Exciting Landing Page for 75Guard
 * 
 * Neo-brutalist design with:
 * - Animated shield
 * - Counting animation (0% → 75%)
 * - Floating elements
 * - Bold typography
 */

import { useState, useEffect } from 'react'

function HeroPage({ onGetStarted }) {
    const [count, setCount] = useState(0)
    const [showContent, setShowContent] = useState(false)

    // Animated counter from 0 to 75
    useEffect(() => {
        setShowContent(true)
        const duration = 2000
        const steps = 75
        const stepTime = duration / steps
        let current = 0

        const timer = setInterval(() => {
            current += 1
            setCount(current)
            if (current >= 75) {
                clearInterval(timer)
            }
        }, stepTime)

        return () => clearInterval(timer)
    }, [])

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#1C1C1C',
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Floating Background Elements */}
            <FloatingElements />

            {/* Decorative Grid Pattern */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
                `,
                backgroundSize: '50px 50px',
                pointerEvents: 'none',
            }} />

            {/* Main Content */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '40px 20px',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}>
                {/* Header/Nav */}
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '60px',
                }}>
                    <div style={{
                        fontSize: '28px',
                        fontWeight: '900',
                        color: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        🛡️ 75Guard
                    </div>
                    <button
                        onClick={onGetStarted}
                        style={{
                            padding: '12px 28px',
                            backgroundColor: '#7ED957',
                            border: '3px solid #1C1C1C',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: '700',
                            color: '#1C1C1C',
                            cursor: 'pointer',
                            boxShadow: '4px 4px 0px #1C1C1C',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        Login →
                    </button>
                </header>

                {/* Hero Content */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '60px',
                    flexWrap: 'wrap',
                }}>
                    {/* Left: Text Content */}
                    <div style={{
                        flex: '1 1 400px',
                        opacity: showContent ? 1 : 0,
                        transform: showContent ? 'translateY(0)' : 'translateY(30px)',
                        transition: 'all 0.8s ease',
                    }}>
                        {/* Badge */}
                        <div style={{
                            display: 'inline-block',
                            padding: '8px 16px',
                            backgroundColor: '#FFB5C5',
                            border: '2px solid #1C1C1C',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '700',
                            color: '#1C1C1C',
                            marginBottom: '24px',
                            boxShadow: '3px 3px 0px #1C1C1C',
                        }}>
                            🎓 For TE DS Students
                        </div>

                        {/* Main Headline */}
                        <h1 style={{
                            fontSize: 'clamp(36px, 6vw, 64px)',
                            fontWeight: '900',
                            color: '#FFFFFF',
                            lineHeight: '1.1',
                            marginBottom: '24px',
                        }}>
                            Never Drop Below{' '}
                            <span style={{
                                color: '#7ED957',
                                position: 'relative',
                            }}>
                                75%
                                <svg style={{
                                    position: 'absolute',
                                    bottom: '-8px',
                                    left: '0',
                                    width: '100%',
                                    height: '12px',
                                }} viewBox="0 0 100 12">
                                    <path
                                        d="M0 8 Q 25 0, 50 8 T 100 8"
                                        fill="none"
                                        stroke="#FFB347"
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </span>{' '}
                            Again
                        </h1>

                        {/* Subheadline */}
                        <p style={{
                            fontSize: '18px',
                            color: '#A0A0A0',
                            lineHeight: '1.6',
                            marginBottom: '32px',
                            maxWidth: '500px',
                        }}>
                            The ultimate attendance planning & decision support system.
                            Know exactly how many classes you can skip, when recovery becomes impossible,
                            and never get detained again.
                        </p>

                        {/* CTA Buttons */}
                        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                            <button
                                onClick={onGetStarted}
                                style={{
                                    padding: '16px 32px',
                                    backgroundColor: '#7ED957',
                                    border: '3px solid #1C1C1C',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '800',
                                    color: '#1C1C1C',
                                    cursor: 'pointer',
                                    boxShadow: '5px 5px 0px #1C1C1C',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                🚀 Start Tracking Free
                            </button>
                            <button
                                onClick={() => {
                                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                                }}
                                style={{
                                    padding: '16px 32px',
                                    backgroundColor: 'transparent',
                                    border: '3px solid #FFFFFF',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: '700',
                                    color: '#FFFFFF',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                }}
                            >
                                See Features ↓
                            </button>
                        </div>
                    </div>

                    {/* Right: Animated Shield + Counter */}
                    <div style={{
                        flex: '1 1 400px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <AnimatedShield percentage={count} />
                    </div>
                </div>

                {/* Stats Bar */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '16px',
                    marginTop: '60px',
                    opacity: showContent ? 1 : 0,
                    transform: showContent ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'all 0.8s ease 0.3s',
                }}>
                    <StatCard icon="🎓" value="10,000+" label="Students Protected" color="#FFB5C5" />
                    <StatCard icon="📅" value="50,000+" label="Classes Tracked" color="#87CEEB" />
                    <StatCard icon="🛡️" value="25,000+" label="Skips Prevented" color="#98D8AA" />
                    <StatCard icon="⚡" value="99.9%" label="Uptime" color="#FFB347" />
                </div>
            </div>

            {/* Features Section */}
            <FeaturesSection id="features" />

            {/* How It Works */}
            <HowItWorks />

            {/* Final CTA */}
            <div style={{
                padding: '80px 20px',
                backgroundColor: '#F5E6C8',
                borderTop: '4px solid #1C1C1C',
            }}>
                <div style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    textAlign: 'center',
                }}>
                    <h2 style={{
                        fontSize: '36px',
                        fontWeight: '900',
                        color: '#1C1C1C',
                        marginBottom: '16px',
                    }}>
                        Ready to Protect Your Attendance?
                    </h2>
                    <p style={{
                        fontSize: '16px',
                        color: '#4A4A4A',
                        marginBottom: '32px',
                    }}>
                        Join thousands of students who never worry about attendance again.
                    </p>
                    <button
                        onClick={onGetStarted}
                        style={{
                            padding: '18px 48px',
                            backgroundColor: '#1C1C1C',
                            border: '3px solid #1C1C1C',
                            borderRadius: '12px',
                            fontSize: '18px',
                            fontWeight: '800',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            boxShadow: '6px 6px 0px #7ED957',
                            transition: 'all 0.15s ease',
                        }}
                    >
                        Get Started Now →
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer style={{
                padding: '40px 20px',
                backgroundColor: '#1C1C1C',
                borderTop: '2px solid #333',
                textAlign: 'center',
                color: '#7A7A7A',
                fontSize: '14px',
            }}>
                Made with 💚 for TE DS | © 2026 75Guard
            </footer>
        </div>
    )
}

/**
 * Animated Shield Component
 */
function AnimatedShield({ percentage }) {
    const size = 300
    const strokeWidth = 20
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    return (
        <div style={{
            position: 'relative',
            animation: 'float 3s ease-in-out infinite',
        }}>
            {/* Glow effect */}
            <div style={{
                position: 'absolute',
                inset: '-40px',
                background: `radial-gradient(circle, ${percentage >= 75 ? 'rgba(126,217,87,0.3)' : 'rgba(255,183,71,0.3)'} 0%, transparent 70%)`,
                filter: 'blur(40px)',
                animation: 'pulse 2s ease-in-out infinite',
            }} />

            {/* Shield card */}
            <div style={{
                position: 'relative',
                padding: '30px',
                backgroundColor: '#FFFFFF',
                border: '4px solid #1C1C1C',
                borderRadius: '24px',
                boxShadow: '8px 8px 0px #1C1C1C',
            }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#FAF3E3"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={percentage >= 75 ? '#7ED957' : percentage >= 50 ? '#FFB347' : '#FF6B6B'}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
                    />
                </svg>

                {/* Center content */}
                <div style={{
                    position: 'absolute',
                    inset: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <span style={{
                        fontSize: '72px',
                        fontWeight: '900',
                        fontFamily: "'JetBrains Mono', monospace",
                        color: '#1C1C1C',
                    }}>
                        {percentage}%
                    </span>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        marginTop: '8px',
                        backgroundColor: percentage >= 75 ? '#7ED957' : '#FFB347',
                        color: '#1C1C1C',
                        border: '2px solid #1C1C1C',
                    }}>
                        {percentage >= 75 ? '✓ SAFE' : '⚠️ AT RISK'}
                    </span>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 1; }
                }
            `}</style>
        </div>
    )
}

/**
 * Floating Background Elements
 */
function FloatingElements() {
    const elements = [
        { emoji: '📚', top: '10%', left: '5%', delay: '0s', size: '40px' },
        { emoji: '✓', top: '20%', left: '90%', delay: '0.5s', size: '36px' },
        { emoji: '📊', top: '70%', left: '8%', delay: '1s', size: '48px' },
        { emoji: '⚡', top: '80%', left: '85%', delay: '1.5s', size: '32px' },
        { emoji: '🎯', top: '40%', left: '95%', delay: '2s', size: '44px' },
        { emoji: '📅', top: '60%', left: '3%', delay: '2.5s', size: '38px' },
        { emoji: '🚀', top: '15%', left: '80%', delay: '3s', size: '42px' },
        { emoji: '💯', top: '85%', left: '15%', delay: '0.8s', size: '36px' },
    ]

    return (
        <>
            {elements.map((el, i) => (
                <div
                    key={i}
                    style={{
                        position: 'absolute',
                        top: el.top,
                        left: el.left,
                        fontSize: el.size,
                        opacity: 0.6,
                        animation: `floatRandom 4s ease-in-out infinite`,
                        animationDelay: el.delay,
                        zIndex: 1,
                    }}
                >
                    {el.emoji}
                </div>
            ))}
            <style>{`
                @keyframes floatRandom {
                    0%, 100% { transform: translate(0, 0) rotate(0deg); }
                    25% { transform: translate(10px, -15px) rotate(5deg); }
                    50% { transform: translate(-5px, 10px) rotate(-5deg); }
                    75% { transform: translate(-15px, -5px) rotate(3deg); }
                }
            `}</style>
        </>
    )
}

/**
 * Stat Card Component
 */
function StatCard({ icon, value, label, color }) {
    return (
        <div style={{
            padding: '20px',
            backgroundColor: color,
            border: '3px solid #1C1C1C',
            borderRadius: '12px',
            boxShadow: '4px 4px 0px #1C1C1C',
            textAlign: 'center',
        }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{icon}</div>
            <div style={{
                fontSize: '24px',
                fontWeight: '800',
                fontFamily: "'JetBrains Mono', monospace",
                color: '#1C1C1C',
            }}>
                {value}
            </div>
            <div style={{ fontSize: '12px', color: '#4A4A4A', fontWeight: '600' }}>
                {label}
            </div>
        </div>
    )
}

/**
 * Features Section
 */
function FeaturesSection({ id }) {
    const features = [
        {
            icon: '🚦',
            title: 'Traffic Light Dashboard',
            description: 'Red, Yellow, Green status for each subject at a glance. Know instantly which subjects need attention.',
            color: '#FFB5C5',
        },
        {
            icon: '🎮',
            title: 'Skip Impact Simulator',
            description: '"What if I skip?" See exactly what happens to your percentage before making the decision.',
            color: '#87CEEB',
        },
        {
            icon: '⏰',
            title: 'Point of No Return',
            description: 'Know exactly when recovery becomes mathematically impossible. Never cross that line.',
            color: '#98D8AA',
        },
        {
            icon: '📈',
            title: 'Recovery Path Generator',
            description: 'Week-by-week rescue plan to get back to 75%. We tell you exactly how many classes to attend.',
            color: '#FFB347',
        },
        {
            icon: '🏦',
            title: 'Skip Bank',
            description: 'See how many "free skips" you\'ve accumulated. Spend them wisely!',
            color: '#C5A3FF',
        },
        {
            icon: '📊',
            title: 'Weekly Report Card',
            description: 'Get graded A+ through F based on your attendance performance each week.',
            color: '#FFB5C5',
        },
    ]

    return (
        <div id={id} style={{
            padding: '80px 20px',
            backgroundColor: '#FAF3E3',
            borderTop: '4px solid #1C1C1C',
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h2 style={{
                    fontSize: '42px',
                    fontWeight: '900',
                    color: '#1C1C1C',
                    textAlign: 'center',
                    marginBottom: '16px',
                }}>
                    Features That Save Your Semester
                </h2>
                <p style={{
                    fontSize: '16px',
                    color: '#7A7A7A',
                    textAlign: 'center',
                    marginBottom: '48px',
                }}>
                    Everything you need to never worry about attendance again.
                </p>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '24px',
                }}>
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            style={{
                                padding: '28px',
                                backgroundColor: feature.color,
                                border: '3px solid #1C1C1C',
                                borderRadius: '16px',
                                boxShadow: '6px 6px 0px #1C1C1C',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                                {feature.icon}
                            </div>
                            <h3 style={{
                                fontSize: '20px',
                                fontWeight: '800',
                                color: '#1C1C1C',
                                marginBottom: '8px',
                            }}>
                                {feature.title}
                            </h3>
                            <p style={{
                                fontSize: '14px',
                                color: '#4A4A4A',
                                lineHeight: '1.5',
                            }}>
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/**
 * How It Works Section
 */
function HowItWorks() {
    const steps = [
        { step: '1', title: 'Enter Your Data', description: 'Upload PDF or manually enter your current attendance for each subject.', icon: '📝' },
        { step: '2', title: 'Get Your Status', description: 'Instantly see which subjects are safe, at risk, or critical.', icon: '🚦' },
        { step: '3', title: 'Plan Your Skips', description: 'Use the simulator to decide which classes you can safely skip.', icon: '🎮' },
        { step: '4', title: 'Stay Above 75%', description: 'Follow recovery plans and never get detained again!', icon: '🎉' },
    ]

    return (
        <div style={{
            padding: '80px 20px',
            backgroundColor: '#1C1C1C',
            borderTop: '4px solid #1C1C1C',
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h2 style={{
                    fontSize: '42px',
                    fontWeight: '900',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    marginBottom: '48px',
                }}>
                    How It Works
                </h2>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '24px',
                }}>
                    {steps.map((step, i) => (
                        <div
                            key={i}
                            style={{
                                textAlign: 'center',
                                position: 'relative',
                            }}
                        >
                            <div style={{
                                width: '80px',
                                height: '80px',
                                margin: '0 auto 16px',
                                backgroundColor: '#7ED957',
                                border: '3px solid #1C1C1C',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '36px',
                                boxShadow: '4px 4px 0px #1C1C1C',
                            }}>
                                {step.icon}
                            </div>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '800',
                                color: '#7ED957',
                                marginBottom: '8px',
                            }}>
                                STEP {step.step}
                            </div>
                            <h3 style={{
                                fontSize: '18px',
                                fontWeight: '700',
                                color: '#FFFFFF',
                                marginBottom: '8px',
                            }}>
                                {step.title}
                            </h3>
                            <p style={{
                                fontSize: '13px',
                                color: '#A0A0A0',
                                lineHeight: '1.5',
                            }}>
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default HeroPage
