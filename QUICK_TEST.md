# 🧪 Quick Test Guide

## Test Data Flow: Prompt → AI Model

### Step 1: Hard Refresh
```
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Step 2: Open Console
Press `F12` to open DevTools Console

### Step 3: Verify Versions
You should see:
```
📦 NodeRegistry v2.0.0 loaded
⚙️ ExecutionEngine v2.0.0 loaded
✅ Engine initialized with default processors
✅ All processors registered
📋 Available processors: [...]
```

### Step 4: Enter Prompt
1. Click on **Prompt Node** (purple node on left)
2. Type some text, for example:
   ```
   Write a hello world function in JavaScript
   ```
3. The text should auto-save as you type

### Step 5: Verify Prompt is Saved
Open Console and run:
```javascript
// Check if prompt is saved in node data
const promptNode = nodes.find(n => n.type === 'promptNode');
console.log('Prompt Node data:', promptNode.data);
console.log('Prompt value:', promptNode.data.value);
console.log('Prompt text:', promptNode.data.prompt);
```

You should see your text in both `value` and `prompt` fields.

### Step 6: Run Workflow
1. Click **"Run Workflow"** button (green button at bottom)
2. Watch Console logs

### Expected Console Output

```javascript
🚀 Starting workflow execution...
📋 Execution order: 1: Prompt, 3: Llama 3.3 70B

📍 Executing node 1/2: Prompt (1)
🔍 Finding processor for node: Prompt
   Node ID: 1
   Node type (React Flow): promptNode
   Node data.nodeType: prompt-input
   Node data.pillar: undefined
   🔎 Trying processor keys: ['promptNode', 'prompt-input']
   ✅ Found processor with key: promptNode
   🚀 Executing processor for: Prompt
   📥 Input data: {}
📝 PromptNode (React Flow type) Processing: Prompt
   Node data: { label: 'Prompt', color: '#8b5cf6', prompt: 'Write a hello world...', value: 'Write a hello world...', ... }
   📤 Outputting prompt: Write a hello world function in JavaScript
   ✅ Processor result: { type: 'prompt', prompt: 'Write a hello world...', value: 'Write a hello world...', ... }
   ✅ Result: { nodeId: '1', success: true, data: {...} }

📍 Executing node 2/2: Llama 3.3 70B (3)
   📥 Input sources: 1
   ✅ Merging data from 1: { type: 'prompt', prompt: 'Write a hello world...', value: 'Write a hello world...', ... }
   📦 Input data for Llama 3.3 70B: { type: 'prompt', prompt: 'Write a hello world...', value: 'Write a hello world...', ... }
🔍 Finding processor for node: Llama 3.3 70B
   Node ID: 3
   Node type (React Flow): ghostNode
   Node data.nodeType: ai-model
   Node data.pillar: code
   🔎 Trying processor keys: ['ghostNode', 'ai-model', 'code']
   ✅ Found processor with key: ai-model
   🚀 Executing processor for: Llama 3.3 70B
   📥 Input data: { type: 'prompt', prompt: 'Write a hello world...', value: 'Write a hello world...', ... }
🤖 AI Model Processing: Llama 3.3 70B
   ✅ Processor result: { type: 'ai-response', response: 'function helloWorld() { ... }', model: 'llama-3.3-70b-versatile', ... }

🎉 Workflow execution completed successfully!
```

### Step 7: Check Result
1. Click on **Llama 3.3 70B** node
2. Expand the node (click arrow or settings icon)
3. You should see the AI response in the result section

---

## 🐛 Troubleshooting

### Issue: "No prompt provided"

**Check 1: Prompt Node has text**
```javascript
const promptNode = nodes.find(n => n.type === 'promptNode');
console.log('Has prompt?', !!promptNode.data.value);
console.log('Prompt text:', promptNode.data.value);
```

**Check 2: Nodes are connected**
```javascript
console.log('Edges:', edges);
// Should show connection from Prompt (id: 1) to AI Model (id: 3)
```

**Check 3: Data is flowing**
Look for this in console:
```
✅ Merging data from 1: { prompt: "your text", value: "your text" }
```

If you see `📦 Input data: {}` (empty), the data is not flowing.

### Issue: Processor not found

**Check available processors:**
```javascript
console.log('Available processors:', Array.from(engine.nodeRegistry.keys()));
```

Should include:
- `promptNode`
- `prompt-input`
- `ai-model`
- `code`
- `research`
- etc.

### Issue: Still getting old error

**Clear cache again:**
1. Press `Ctrl + Shift + D` to open Debug panel
2. Click "🗑️ Clear All Cache"
3. Or use Incognito mode

---

## ✅ Success Criteria

You know it's working when:

1. ✅ Console shows version 2.0.0
2. ✅ Prompt Node outputs: `{ prompt: "your text", value: "your text" }`
3. ✅ AI Model receives: `{ prompt: "your text", value: "your text" }`
4. ✅ AI Model outputs: `{ response: "AI generated text", model: "llama-3.3-70b-versatile" }`
5. ✅ No errors in console
6. ✅ Result displays in AI Model node

---

## 🎯 Quick Debug Commands

Copy-paste these into Console:

```javascript
// 1. Check versions
console.log('Checking versions...');

// 2. Check nodes
console.log('Nodes:', nodes.map(n => ({ id: n.id, type: n.type, label: n.data.label })));

// 3. Check edges
console.log('Edges:', edges.map(e => ({ from: e.source, to: e.target })));

// 4. Check prompt
const promptNode = nodes.find(n => n.type === 'promptNode');
console.log('Prompt Node:', {
  id: promptNode?.id,
  value: promptNode?.data?.value,
  prompt: promptNode?.data?.prompt
});

// 5. Check processors
console.log('Available processors:', Array.from(engine.nodeRegistry.keys()));

// 6. Check auth
console.log('Has auth token:', !!localStorage.getItem('office_weave_token'));
```

---

**TL;DR**:
1. Hard refresh (`Ctrl + Shift + R`)
2. Type text in Prompt Node
3. Click "Run Workflow"
4. Check Console for detailed logs
5. Verify data flows from Prompt → AI Model
