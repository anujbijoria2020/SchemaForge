import React from 'react';
import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { useTheme } from '../../../../app/providers/ThemeProvider';

export const RelationshipEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  markerStart,
  selected,
}) => {
  const { theme } = useTheme();
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  const strokeColor = selected 
    ? '#2563EB' 
    : (theme === 'light' ? '#94A3B8' : '#475569');
  const strokeWidth = selected ? 2.5 : 1.5;

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      markerEnd={markerEnd}
      markerStart={markerStart}
      style={{
        ...style,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
      }}
    />
  );
};
