import React, { useState, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import Split from 'react-split';
import './App.css';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');
  const [code, setCode] = useState(`// Welcome to JavaScript Playground!
// Write your JavaScript code here and see the output on the right

console.log("Hello, World!");

// Try some examples:
const greeting = "Welcome to the playground!";
console.log(greeting);

// Math operations
const result = 5 + 3 * 2;
console.log("5 + 3 * 2 =", result);

// Array operations
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log("Original:", numbers);
console.log("Doubled:", doubled);
`);
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Execute code on load
  useEffect(() => {
    executeCode();
  }, []);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // PUBLIC_INTERFACE
  const executeCode = useCallback(() => {
    setIsRunning(true);
    setOutput([]);
    
    // Create a sandbox environment for code execution
    const originalConsole = window.console;
    const logs = [];
    
    // Mock console methods to capture output
    const mockConsole = {
      log: (...args) => {
        logs.push({ type: 'log', content: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') });
      },
      error: (...args) => {
        logs.push({ type: 'error', content: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') });
      },
      warn: (...args) => {
        logs.push({ type: 'warn', content: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') });
      },
      info: (...args) => {
        logs.push({ type: 'info', content: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ') });
      }
    };

    try {
      // Replace console temporarily
      window.console = mockConsole;
      
      // Execute the code
      // eslint-disable-next-line no-eval
      eval(code);
      
      // Add execution success message if no output
      if (logs.length === 0) {
        logs.push({ type: 'info', content: 'Code executed successfully (no output)' });
      }
    } catch (error) {
      logs.push({ type: 'error', content: `Error: ${error.message}` });
    } finally {
      // Restore original console
      window.console = originalConsole;
      setOutput(logs);
      setIsRunning(false);
    }
  }, [code]);

  // PUBLIC_INTERFACE
  const generateShareableLink = () => {
    const encodedCode = encodeURIComponent(code);
    const shareUrl = `${window.location.origin}${window.location.pathname}?code=${encodedCode}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        alert('Shareable link copied to clipboard!');
      }).catch(() => {
        prompt('Copy this shareable link:', shareUrl);
      });
    } else {
      prompt('Copy this shareable link:', shareUrl);
    }
  };

  // Load code from URL parameter on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedCode = urlParams.get('code');
    if (sharedCode) {
      try {
        const decodedCode = decodeURIComponent(sharedCode);
        setCode(decodedCode);
      } catch (error) {
        console.error('Failed to decode shared code:', error);
      }
    }
  }, []);

  // Handle editor change
  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  // Handle key press for Ctrl+Enter to run code
  const handleEditorKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      executeCode();
    }
  };

  return (
    <div className="App">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-left">
          <h1 className="nav-title">JavaScript Playground</h1>
        </div>
        <div className="nav-right">
          <button 
            className="nav-button" 
            onClick={executeCode}
            disabled={isRunning}
            title="Run Code (Ctrl+Enter)"
          >
            {isRunning ? 'Running...' : '▶ Run'}
          </button>
          <button 
            className="nav-button" 
            onClick={generateShareableLink}
            title="Generate shareable link"
          >
            🔗 Share
          </button>
          <button 
            className="nav-button theme-toggle" 
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="main-content">
        <Split
          sizes={[50, 50]}
          minSize={200}
          expandToMin={false}
          gutterSize={10}
          gutterAlign="center"
          snapOffset={30}
          dragInterval={1}
          direction="horizontal"
          cursor="col-resize"
          className="split-container"
        >
          {/* Left Panel - Code Editor */}
          <div className="editor-panel">
            <div className="panel-header">
              <h3>Code Editor</h3>
              <span className="shortcut-hint">Press Ctrl+Enter to run</span>
            </div>
            <div className="editor-container">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={code}
                onChange={handleEditorChange}
                onMount={(editor) => {
                  editor.onKeyDown(handleEditorKeyDown);
                }}
                theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  wordWrap: 'on',
                  folding: true,
                  lineHeight: 22,
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: 'on',
                  acceptSuggestionOnCommitCharacter: true
                }}
              />
            </div>
          </div>

          {/* Right Panel - Output Console */}
          <div className="output-panel">
            <div className="panel-header">
              <h3>Output Console</h3>
              <button 
                className="clear-button" 
                onClick={() => setOutput([])}
                title="Clear output"
              >
                🗑 Clear
              </button>
            </div>
            <div className="console-container">
              {output.length === 0 ? (
                <div className="console-placeholder">
                  {isRunning ? 'Running code...' : 'Run your code to see output here'}
                </div>
              ) : (
                <div className="console-output">
                  {output.map((log, index) => (
                    <div key={index} className={`console-line console-${log.type}`}>
                      <span className="console-icon">
                        {log.type === 'error' && '❌'}
                        {log.type === 'warn' && '⚠️'}
                        {log.type === 'info' && 'ℹ️'}
                        {log.type === 'log' && '▶'}
                      </span>
                      <pre className="console-content">{log.content}</pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Split>
      </div>
    </div>
  );
}

export default App;
