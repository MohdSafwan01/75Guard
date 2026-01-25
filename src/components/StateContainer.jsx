import PropTypes from 'prop-types'

/**
 * StateContainer - Global State-Driven UI Wrapper
 * 
 * Per Design Document:
 * - The UI has NO neutral home screen
 * - The entire interface adapts based on SAFE / TENSION / CRITICAL state
 * - Controls: layout density, animation speed, interaction requirements, visual tension
 * 
 * CSS Variables Applied:
 * - --bg: Background color
 * - --surface: Surface/card color
 * - --text: Text color
 * - --accent: Accent color (state-specific)
 * - --border: Border color
 * - --animation-speed: Transition duration (600ms/300ms/150ms)
 * - --spacing-gap: Gap between elements (24px/16px/12px)
 */
function StateContainer({ globalState = 'SAFE', children }) {
    // Derive CSS class from global state
    const stateClass = `state-${globalState.toLowerCase()}`

    return (
        <div
            className={`${stateClass} min-h-screen transition-colors`}
            style={{
                backgroundColor: 'var(--bg)',
                color: 'var(--text)',
                transitionDuration: 'var(--animation-speed)',
            }}
            role="main"
            aria-live="polite"
            aria-label={`Application in ${globalState} state`}
        >
            {children}
        </div>
    )
}

StateContainer.propTypes = {
    globalState: PropTypes.oneOf(['SAFE', 'TENSION', 'CRITICAL']),
    children: PropTypes.node.isRequired,
}

export default StateContainer
