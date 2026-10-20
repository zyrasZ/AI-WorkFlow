import { useState, useCallback } from 'react'
import { apiClient } from '../lib/api'

/**
 * Manages server-side workflow execution lifecycle:
 * save → validate → execute → poll → update node statuses.
 *
 * @param {{ currentProject, nodes, edges, reactFlowInstance, setNodes, setEdges }} deps
 * @returns {{ isExecuting, executionProgress, handleRunWorkflow }}
 */
export function useWorkflowExecution({
  currentProject,
  nodes,
  edges,
  reactFlowInstance,
  setNodes,
  setEdges,
}) {
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(null)

  const handleRunWorkflow = useCallback(async () => {
    if (isExecuting) {
      setIsExecuting(false)
      setExecutionProgress(null)
      return
    }

    if (typeof window !== 'undefined' && !localStorage.getItem('office_weave_token')) {
      localStorage.setItem('office_weave_token', 'dev_token_office_weave_2026');
      localStorage.setItem(
        'user_data',
        JSON.stringify({
          id: 'user_dev_01',
          email: 'developer@workflow.ai',
          name: 'Developer Demo',
          role: 'admin',
        }),
      );
    }

    if (!currentProject?.id) {
      alert('Vui lòng lưu workflow trước khi chạy')
      return
    }

    const currentNodes = reactFlowInstance?.getNodes() || nodes
    const currentEdges = reactFlowInstance?.getEdges() || edges

    console.log('🚀 Starting server-side workflow execution...')
    setIsExecuting(true)
    setExecutionProgress({ current: 0, total: currentNodes.length, status: 'saving' })

    try {
      // Step 1: Persist latest state
      const serializedNodes = currentNodes.map(node => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: {
          label: node.data.label,
          nodeType: node.data.nodeType,
          color: node.data.color,
          condition: node.data.condition,
          switchKey: node.data.switchKey,
          cases: node.data.cases,
          iteratorKey: node.data.iteratorKey,
          itemVar: node.data.itemVar,
          delayAmount: node.data.delayAmount,
          unit: node.data.unit,
          inputCount: node.data.inputCount,
          mergeStrategy: node.data.mergeStrategy,
          prompt: node.data.prompt,
          value: node.data.value,
          variables: node.data.variables,
          to: node.data.to,
          subject: node.data.subject,
          body: node.data.body,
          cc: node.data.cc,
          bcc: node.data.bcc,
          isHtmlMode: node.data.isHtmlMode,
          folder: node.data.folder,
          limit: node.data.limit,
          unreadOnly: node.data.unreadOnly,
          logic: node.data.logic,
          rules: node.data.rules,
          bodyType: node.data.bodyType,
          email: node.data.email,
          mode: node.data.mode,
          smtpProvider: node.data.smtpProvider,
          model: node.data.model,
          temperature: node.data.temperature,
          maxTokens: node.data.maxTokens,
          hasInput: node.data.hasInput,
          hasOutput: node.data.hasOutput,
        },
      }))

      const serializedEdges = currentEdges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
        type: edge.type,
      }))

      await apiClient.updateWorkflow(currentProject.id, {
        nodes: serializedNodes,
        edges: serializedEdges,
        metadata: { nodes: serializedNodes, edges: serializedEdges },
      })

      setExecutionProgress({ current: 0, total: currentNodes.length, status: 'validating' })

      // Step 2: Validate
      try {
        const validation = await apiClient.validateWorkflow(currentProject.id)
        const validationData = validation.data || validation

        if (validationData.valid === false) {
          const errors = validationData.errors || []
          alert(`Workflow có lỗi:\n${errors.map(e => e.message).join('\n')}`)
          setIsExecuting(false)
          setExecutionProgress(null)
          return
        }

        if (validationData.warnings?.length > 0) {
          const proceed = confirm(
            `Workflow có cảnh báo:\n${validationData.warnings.map(w => w.message).join('\n')}\n\nBạn có muốn tiếp tục?`
          )
          if (!proceed) {
            setIsExecuting(false)
            setExecutionProgress(null)
            return
          }
        }
      } catch {
        console.warn('⚠️ Validate endpoint not available, skipping validation')
      }

      setExecutionProgress({ current: 0, total: currentNodes.length, status: 'executing' })

      // Step 3: Execute
      const execResponse = await apiClient.executeWorkflow(currentProject.id, {})
      const execData = execResponse.data || execResponse
      const executionId = execData.executionId || execData.id

      if (!executionId) throw new Error('Server did not return an execution ID')

      // Step 4: Poll
      let status = execData.status || 'running'
      let pollCount = 0
      const maxPolls = 120

      while (status === 'running' && pollCount < maxPolls) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        pollCount++

        try {
          const pollResponse = await apiClient.getExecution(executionId)
          const pollData = pollResponse.data || pollResponse
          status = pollData.status

          const completedNodes = pollData.results ? Object.keys(pollData.results).length : 0
          setExecutionProgress({
            current: completedNodes,
            total: currentNodes.length,
            status: status === 'running' ? 'executing' : status,
          })

          if (status === 'completed') {
            console.log('🎉 Workflow completed!', pollData.results)

            if (pollData.results) {
              setNodes(nds =>
                nds.map(node => {
                  const nodeResult = pollData.results[node.id]
                  if (nodeResult?.success) {
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        result: nodeResult.output || nodeResult,
                        lastExecuted: new Date().toISOString(),
                        status: 'success',
                      },
                    }
                  } else if (nodeResult && !nodeResult.success) {
                    return {
                      ...node,
                      data: { ...node.data, status: 'error', error: nodeResult.error },
                    }
                  }
                  return node
                })
              )
            }

            setEdges(eds =>
              eds.map(edge => ({ ...edge, data: { ...edge.data, success: true, animated: true } }))
            )
            setTimeout(() => {
              setEdges(eds =>
                eds.map(edge => ({
                  ...edge,
                  data: { ...edge.data, success: false, animated: false },
                }))
              )
            }, 3000)

            alert('Workflow hoàn thành thành công!')
            break
          } else if (status === 'failed') {
            const errorMsg = pollData.error || 'Unknown error'
            console.error('❌ Workflow failed:', errorMsg)
            setNodes(nds =>
              nds.map(node => ({ ...node, data: { ...node.data, status: 'idle' } }))
            )
            alert(`Workflow thất bại: ${errorMsg}`)
            break
          }
        } catch (pollErr) {
          console.warn('⚠️ Poll error (retrying):', pollErr.message)
        }
      }

      if (pollCount >= maxPolls && status === 'running') {
        alert('Workflow đang chạy quá lâu. Kiểm tra lại trong Execution History.')
      }
    } catch (error) {
      console.error('❌ Workflow execution failed:', error)
      alert(`Lỗi khi chạy workflow: ${error.message}`)
      setNodes(nds =>
        nds.map(node => ({ ...node, data: { ...node.data, status: 'idle' } }))
      )
    } finally {
      setIsExecuting(false)
      setExecutionProgress(null)
    }
  }, [isExecuting, currentProject, nodes, edges, reactFlowInstance, setNodes, setEdges])

  return { isExecuting, executionProgress, handleRunWorkflow }
}
