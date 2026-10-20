import { memo } from 'react';

/**
 * FigmaWeaveBackground - Custom dot grid background component
 * Replicates the exact Figma Weave dot pattern with proper spacing and opacity
 */
const FigmaWeaveBackground = memo(({ 
  gap = 24, 
  size = 1.2, 
  color = 'rgba(255,255,255,0.12)',
  backgroundColor = '#0B0B0E',
  variant = 'dots',
  className = '',
  style = {}
}) => {
  
  // Generate the dot pattern based on variant
  const getBackgroundPattern = () => {
    switch (variant) {
      case 'dots':
        return {
          backgroundColor,
          backgroundImage: `radial-gradient(circle, ${color} ${size}px, transparent ${size}px)`,
          backgroundSize: `${gap}px ${gap}px`,
          backgroundPosition: '0 0'
        };
      
      case 'cross':
        return {
          backgroundColor,
          backgroundImage: `
            radial-gradient(circle, ${color} ${size}px, transparent ${size}px),
            radial-gradient(circle, ${color.replace('0.12', '0.06')} ${size * 0.5}px, transparent ${size * 0.5}px)
          `,
          backgroundSize: `${gap}px ${gap}px, ${gap * 2}px ${gap * 2}px`,
          backgroundPosition: '0 0, 0 0'
        };
      
      case 'infinite':
        return {
          backgroundColor: '#0a0a0c',
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)`,
          backgroundSize: `24px 24px`,
          backgroundPosition: '0 0'
        };
      
      default:
        return { backgroundColor };
    }
  };

  const backgroundStyle = {
    ...getBackgroundPattern(),
    ...style
  };

  return (
    <div 
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={backgroundStyle}
    >
      {/* Optional overlay for depth effect */}
      {variant === 'infinite' && (
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 25% 25%, rgba(59,130,246,0.01) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(139,92,246,0.01) 0%, transparent 50%)
            `
          }}
        />
      )}
      
      {/* Subtle vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, transparent 0%, ${backgroundColor}10 100%)`
        }}
      />
    </div>
  );
});

FigmaWeaveBackground.displayName = 'FigmaWeaveBackground';

export default FigmaWeaveBackground;