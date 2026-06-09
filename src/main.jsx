import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App_may28.jsx'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:40,fontFamily:'monospace',background:'#fff',color:'#dc2626'}}>
          <h2>Erreur de rendu</h2>
          <pre style={{whiteSpace:'pre-wrap',fontSize:13}}>{this.state.error?.message}</pre>
          <pre style={{whiteSpace:'pre-wrap',fontSize:11,color:'#6B7280'}}>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
