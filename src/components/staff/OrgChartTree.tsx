// OrgChartTree — recursive tree renderer with connecting lines.
// Builds a hierarchical tree from a flat StaffMember[] using the reportsTo field.
// Root nodes = members with no reportsTo or whose reportsTo is not in the filtered list.

import type { StaffMember } from '../../types/staff';
import { OrgChartNode } from './OrgChartNode';

interface TreeNode {
  member:   StaffMember;
  children: TreeNode[];
}

/** Build a tree from a flat list. Returns root-level nodes. */
function buildTree(members: StaffMember[]): TreeNode[] {
  const idSet  = new Set(members.map(m => m.id));
  const nodeMap = new Map<string, TreeNode>(
    members.map(m => [m.id, { member: m, children: [] }])
  );

  const roots: TreeNode[] = [];

  for (const m of members) {
    const node = nodeMap.get(m.id)!;
    if (!m.reportsTo || !idSet.has(m.reportsTo)) {
      // No manager in the filtered set → root
      roots.push(node);
    } else {
      // Attach to parent
      const parent = nodeMap.get(m.reportsTo);
      if (parent) parent.children.push(node);
    }
  }

  return roots;
}

// ── CSS connector sizes ────────────────────────────────────────────────────────
// Gap between node rows
const ROW_GAP    = 48; // px — space for the vertical line
const CHILD_GAP  = 20; // px — gap between sibling nodes

// ── Recursive subtree ─────────────────────────────────────────────────────────

interface SubTreeProps {
  node:      TreeNode;
  isRoot?:   boolean;
  onClick?:  (member: StaffMember) => void;
}

function SubTree({ node, isRoot = false, onClick }: SubTreeProps) {
  const hasChildren = node.children.length > 0;

  return (
    <div className="flex flex-col items-center" style={{ gap: `${ROW_GAP}px` }}>
      {/* Node card */}
      <div className="relative">
        <OrgChartNode member={node.member} isRoot={isRoot} onClick={onClick} />

        {/* Vertical connector DOWN from this node to children row */}
        {hasChildren && (
          <div
            className="absolute left-1/2 -translate-x-px bg-[#e2e8f0] w-px"
            style={{ top: '100%', height: `${ROW_GAP / 2}px` }}
          />
        )}
      </div>

      {/* Children row */}
      {hasChildren && (
        <div className="relative flex flex-col items-center w-full">
          {/* Horizontal bar across all children */}
          {node.children.length > 1 && (
            <HorizontalBar childCount={node.children.length} />
          )}

          {/* Child subtrees */}
          <div
            className="flex items-start"
            style={{ gap: `${CHILD_GAP}px`, marginTop: node.children.length > 1 ? `${ROW_GAP / 2}px` : '0' }}
          >
            {node.children.map(child => (
              <div key={child.member.id} className="relative flex flex-col items-center">
                {/* Vertical connector DOWN from horizontal bar to child */}
                {node.children.length > 1 && (
                  <div
                    className="absolute left-1/2 -translate-x-px bg-[#e2e8f0] w-px"
                    style={{ top: `-${ROW_GAP / 2}px`, height: `${ROW_GAP / 2}px` }}
                  />
                )}
                <SubTree node={child} onClick={onClick} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Horizontal connector bar that spans all siblings. */
function HorizontalBar({ childCount }: { childCount: number }) {
  // Each child is 160px wide + CHILD_GAP; the bar connects their centers.
  // We approximate by using 100% width and rendering as a border-top.
  // Works because the parent flex container already sizes to fit children.
  const nodeWidth  = 160;
  const totalWidth = childCount * nodeWidth + (childCount - 1) * CHILD_GAP;
  const barWidth   = totalWidth - nodeWidth; // bar between first and last center

  return (
    <div
      className="relative"
      style={{ width: `${totalWidth}px`, height: `${ROW_GAP / 2}px` }}
    >
      {/* The horizontal line */}
      <div
        className="absolute top-0 border-t-2 border-[#e2e8f0]"
        style={{
          left:  `${nodeWidth / 2}px`,
          width: `${barWidth}px`,
        }}
      />
    </div>
  );
}

// ── Public component ───────────────────────────────────────────────────────────

interface OrgChartTreeProps {
  members:   StaffMember[];
  onClick?:  (member: StaffMember) => void;
}

export function OrgChartTree({ members, onClick }: OrgChartTreeProps) {
  const roots = buildTree(members);

  if (roots.length === 0) {
    return (
      <p className="text-sm text-[#94a3b8] text-center py-12">
        No staff to display.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {roots.map(root => (
        <SubTree key={root.member.id} node={root} isRoot onClick={onClick} />
      ))}
    </div>
  );
}
