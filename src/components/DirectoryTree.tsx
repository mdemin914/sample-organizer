import React, { useState } from 'react';
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon,
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
} from '@mui/icons-material';
import { DirectoryStructure } from '../types';

interface DirectoryTreeProps {
  structure: DirectoryStructure;
  maxDepth?: number;
  currentDepth?: number;
}

interface DirectoryNodeProps {
  node: DirectoryStructure;
  depth: number;
  maxDepth: number;
}

const DirectoryNode: React.FC<DirectoryNodeProps> = ({ node, depth, maxDepth }) => {
  const [expanded, setExpanded] = useState(depth < 2); // Auto-expand first 2 levels
  const hasChildren = node.children.length > 0;
  const shouldShowChildren = hasChildren && depth < maxDepth;

  const handleToggle = () => {
    if (shouldShowChildren) {
      setExpanded(!expanded);
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 0.5,
          pl: depth * 2,
          cursor: shouldShowChildren ? 'pointer' : 'default',
          '&:hover': shouldShowChildren ? {
            backgroundColor: 'action.hover',
            borderRadius: 1,
          } : {},
        }}
        onClick={handleToggle}
      >
        {shouldShowChildren ? (
          <IconButton size="small" sx={{ mr: 0.5, p: 0.25 }}>
            {expanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
          </IconButton>
        ) : (
          <Box sx={{ width: 24, mr: 0.5 }} />
        )}
        
        {expanded && hasChildren ? (
          <FolderOpenIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'primary.main' }} />
        ) : (
          <FolderIcon sx={{ mr: 1, fontSize: '1.1rem', color: 'text.secondary' }} />
        )}
        
        <Typography
          variant="body2"
          sx={{
            flexGrow: 1,
            fontWeight: depth === 0 ? 'bold' : 'normal',
          }}
        >
          {node.name}
        </Typography>
        
        {hasChildren && (
          <Chip
            label={node.children.length}
            size="small"
            variant="outlined"
            sx={{ ml: 1, fontSize: '0.7rem', height: 20 }}
          />
        )}
      </Box>
      
      {shouldShowChildren && (
        <Collapse in={expanded}>
          <Box>
            {node.children.map((child, index) => (
              <DirectoryNode
                key={`${child.path}-${index}`}
                node={child}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            ))}
            {depth >= maxDepth - 1 && node.children.length > 0 && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ pl: (depth + 1) * 2 + 3, display: 'block', fontStyle: 'italic' }}
              >
                ...and more subdirectories
              </Typography>
            )}
          </Box>
        </Collapse>
      )}
    </Box>
  );
};

const DirectoryTree: React.FC<DirectoryTreeProps> = ({
  structure,
  maxDepth = 4,
  currentDepth = 0,
}) => {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        p: 1,
        maxHeight: 300,
        overflowY: 'auto',
        backgroundColor: 'background.paper',
      }}
    >
      <DirectoryNode node={structure} depth={currentDepth} maxDepth={maxDepth} />
    </Box>
  );
};

export default DirectoryTree;