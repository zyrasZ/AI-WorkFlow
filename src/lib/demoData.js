/**
 * Demo Data & Fallbacks for Frictionless Demo / Testing
 * Ensures visitors can test the canvas and all workflows without requiring backend setup or auth.
 */

export const DEMO_USER = {
  id: "user_dev_01",
  email: "developer@workflow.ai",
  name: "Developer",
  role: "admin",
};

export const DEMO_TOKEN = "dev_token_office_weave_2026";

export const DEFAULT_DEMO_WORKFLOWS = [
  {
    id: "wf_1792327275293_hcj8x",
    name: "AI Email Summary Pipeline",
    description: "Workflow tự động tóm tắt email và gửi thông báo",
    thumbnail: null,
    lastEdited: Date.now() - 3600000,
    nodeCount: 3,
    nodes: [
      {
        id: "node-1792377318631",
        type: "promptNode",
        position: { x: 360, y: 270 },
        data: {
          label: "Prompt",
          color: "#8b5cf6",
          prompt: "cho tôi 10 từ tiếng anh ngẫu nhiên",
          variables: [],
          hasOutput: true,
          nodeType: "prompt-input",
          value: "cho tôi 10 từ tiếng anh ngẫu nhiên",
        },
      },
      {
        id: "node-1792377323699",
        type: "ghostNode",
        position: { x: 750, y: 360 },
        data: {
          label: "Groq Llama 3.3 70B",
          subtitle: "Fast inference with Llama 3.3",
          pillar: "code",
          nodeType: "groq-llama-3.3-70b",
          color: "#10b981",
          status: "success",
          fields: [
            {
              label: "Temperature",
              type: "select",
              value: "0.7",
              options: ["0.1", "0.3", "0.5", "0.7", "0.9", "1.0"],
            },
            {
              label: "Max Tokens",
              type: "text",
              value: "1000",
              placeholder: "1000",
            },
          ],
          hasInput: true,
          hasOutput: true,
          inputPrompt: "cho tôi 10 từ tiếng anh ngẫu nhiên",
          hasUpdatedInput: false,
          result: {
            type: "text",
            model: "llama-3.1-8b-instant",
            response:
              "Here are 10 random English words:\n\n1. **Zephyr**  \n2. **Cobbler**  \n3. **Luminous**  \n4. **Glimpse**  \n5. **Harbor**  \n6. **Quibble**  \n7. **Nimbus**  \n8. **Tremor**  \n9. **Verdant**  \n10. **Saffron**  ",
          },
          lastExecuted: "2026-10-19T02:46:33.883Z",
        },
      },
      {
        id: "node-1792377326210",
        type: "outputNode",
        position: { x: 1140, y: 300 },
        data: {
          label: "Kết quả AI",
          color: "#f59e0b",
          status: "success",
          nodeType: "output",
          result: {
            type: "text",
            model: "llama-3.1-8b-instant",
            response:
              "Here are 10 random English words:\n\n1. **Zephyr**  \n2. **Cobbler**  \n3. **Luminous**  \n4. **Glimpse**  \n5. **Harbor**  \n6. **Quibble**  \n7. **Nimbus**  \n8. **Tremor**  \n9. **Verdant**  \n10. **Saffron**  ",
          },
          lastExecuted: "2026-10-19T02:46:33.883Z",
        },
      },
    ],
    edges: [
      {
        type: "neonEdge",
        source: "node-1792377318631",
        sourceHandle: null,
        target: "node-1792377323699",
        targetHandle: null,
        data: {
          color: "#8b5cf6",
          animated: false,
          dataFlow: true,
        },
        id: "reactflow__edge-node-1792377318631-node-1792377323699",
      },
      {
        type: "neonEdge",
        source: "node-1792377323699",
        sourceHandle: null,
        target: "node-1792377326210",
        targetHandle: null,
        data: {
          color: "#3b82f6",
          animated: false,
          dataFlow: true,
          success: false,
        },
        id: "reactflow__edge-node-1792377323699-node-1792377326210",
      },
    ],
  },
  {
    id: "wf_1792381644175_q8118",
    name: "Customer Support AI Router",
    description: "Phân loại câu hỏi của khách hàng và sinh phản hồi tự động",
    thumbnail: null,
    lastEdited: Date.now() - 7200000,
    nodeCount: 1,
    nodes: [
      {
        id: "node-1792491324150",
        type: "emailAccountNode",
        position: { x: 300, y: 330 },
        data: {
          label: "Email Account",
          color: "#8b5cf6",
          email: "support@workflow.ai",
          password: "",
          hasOutput: true,
          nodeType: "email-account",
          mode: "oauth",
          smtpProvider: "gmail",
        },
      },
    ],
    edges: [],
  },
];
