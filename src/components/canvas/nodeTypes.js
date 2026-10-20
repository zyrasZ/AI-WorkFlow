import GhostNode from '../nodes/GhostNode'
import PromptNode from '../nodes/PromptNode'
import OutputNode from '../nodes/OutputNode'
import FileInputNode from '../nodes/FileInputNode'
import EmailAccountNode from '../nodes/EmailAccountNode'
import SendEmailNode from '../nodes/SendEmailNode'
import ReadEmailNode from '../nodes/ReadEmailNode'
import FilterEmailNode from '../nodes/FilterEmailNode'
import EmailTemplateNode from '../nodes/EmailTemplateNode'
import IfElseNode from '../nodes/IfElseNode'
import SwitchNode from '../nodes/SwitchNode'
import LoopNode from '../nodes/LoopNode'
import DelayNode from '../nodes/DelayNode'
import MergeNode from '../nodes/MergeNode'
import NeonEdge from '../edges/NeonEdge'

/**
 * React Flow node type map.
 * Defined outside any component to prevent re-registration on render.
 */
export const nodeTypes = {
  ghostNode: GhostNode,
  promptNode: PromptNode,
  outputNode: OutputNode,
  fileInputNode: FileInputNode,
  emailAccountNode: EmailAccountNode,
  sendEmailNode: SendEmailNode,
  readEmailNode: ReadEmailNode,
  filterEmailNode: FilterEmailNode,
  emailTemplateNode: EmailTemplateNode,
  ifElseNode: IfElseNode,
  switchNode: SwitchNode,
  loopNode: LoopNode,
  delayNode: DelayNode,
  mergeNode: MergeNode,
}

/**
 * React Flow edge type map.
 */
export const edgeTypes = {
  neonEdge: NeonEdge,
}

/**
 * Framer Motion page transition variants shared across all page-level views.
 */
export const pageVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
    filter: 'blur(10px)',
  },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 1.02,
    filter: 'blur(10px)',
    transition: {
      duration: 0.3,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}
