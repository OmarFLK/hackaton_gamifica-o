import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Home, RotateCcw } from 'lucide-react'

/** 404: rota inexistente, com o Pandi pensativo e caminhos de volta. */
export function NotFoundPage() {
  const navigate = useNavigate()
  return <main className="status-page" id="main-content">
    <div className="status-card">
      <img className="mascot-img" src="/mascote/pandi-pensativo.png" alt="Pandi pensativo" width={190} height={170}/>
      <span className="status-code" aria-hidden="true">404</span>
      <h1>Página não encontrada</h1>
      <p>O endereço pode ter mudado ou não existir. Vamos voltar para um lugar conhecido?</p>
      <div className="status-actions">
        <button className="button ghost" onClick={() => navigate(-1)}><ArrowLeft size={18}/>Voltar</button>
        <Link className="button primary" to="/"><Home size={18}/>Ir para o início</Link>
      </div>
    </div>
  </main>
}

/** Falha inesperada de renderização: mostra tela amigável em vez de página em branco. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Falha de interface', error, info.componentStack) }
  render() {
    if (!this.state.error) return this.props.children
    return <main className="status-page" id="main-content">
      <div className="status-card" role="alert">
        <img className="mascot-img" src="/mascote/humor-2-muito-mal.png" alt="Pandi preocupado" width={190} height={170}/>
        <h1>Algo não saiu como esperado</h1>
        <p>Esta tela encontrou um problema. Nenhum dado foi perdido no servidor. Tente recarregar ou voltar ao início.</p>
        <div className="status-actions">
          <button className="button ghost" onClick={() => window.location.reload()}><RotateCcw size={18}/>Recarregar</button>
          <a className="button primary" href="/"><Home size={18}/>Ir para o início</a>
        </div>
        <details><summary>Detalhes técnicos</summary><pre>{this.state.error.message}</pre></details>
      </div>
    </main>
  }
}
