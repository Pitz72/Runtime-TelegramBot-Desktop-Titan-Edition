import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ToastProvider } from '@/components/ui/Toast'
import { I18nProvider } from '@/locales/I18nContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <I18nProvider>
            <ToastProvider>
                <App />
            </ToastProvider>
        </I18nProvider>
    </React.StrictMode>
)
