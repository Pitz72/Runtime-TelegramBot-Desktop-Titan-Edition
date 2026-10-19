import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ToastProvider } from '@/components/ui/Toast'
import { I18nProvider } from '@/locales/I18nContext'
import { UiPreferencesProvider } from '@/hooks/useUiPreferences'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <I18nProvider>
            <UiPreferencesProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </UiPreferencesProvider>
        </I18nProvider>
    </React.StrictMode>
)
