import React, { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { SetupWizard } from '@/components/SetupWizard';
import { IntroScreen } from '@/components/IntroScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { UpdateModal } from '@/components/UpdateModal';
import { WhatsNewModal } from '@/components/WhatsNewModal';
import { useUpdater } from '@/hooks/useUpdater';

function App(): JSX.Element {
    const [hasBots, setHasBots] = useState<boolean | null>(null);
    const [introDone, setIntroDone] = useState<boolean>(false);
    // Schermata "Novità": mostrata al primo avvio dopo un aggiornamento automatico.
    const [whatsNew, setWhatsNew] = useState<{ show: boolean; version: string } | null>(null);
    // Controllo aggiornamenti centralizzato: parte già dall'intro e la schermata di avviso
    // (UpdateModal) compare sopra qualunque vista.
    const updater = useUpdater();

    useEffect(() => {
        window.api.getBots().then((bots) => {
            setHasBots(bots.length > 0);
        });
        window.api.getPerformanceMode().then((enabled) => {
            document.body.classList.toggle('performance-mode', enabled);
        });
        window.api.consumeWhatsNew().then((res) => {
            if (res?.show) setWhatsNew(res);
        }).catch(() => {});
    }, []);

    const handleSetupComplete = async (name: string, token: string, channelId: string, startDate: string) => {
        await window.api.createBot({
            name,
            token,
            channelId,
            startDate
        });
        setHasBots(true);
    };

    if (hasBots === null) return <div className="h-screen bg-dark-900" />;

    return (
        <ErrorBoundary>
            {!introDone ? (
                <IntroScreen
                    onComplete={() => setIntroDone(true)}
                    updateStatus={updater.status}
                    newVersion={updater.newVersion}
                    currentVersion={updater.currentVersion}
                />
            ) : hasBots ? (
                <Dashboard updater={updater} />
            ) : (
                <SetupWizard
                    onComplete={(name, token, channel, startDate) => handleSetupComplete(name, token, channel, startDate)}
                    onSkip={() => setHasBots(true)}
                />
            )}

            {/* Schermata di aggiornamento — sopra ogni vista */}
            <UpdateModal updater={updater} />

            {/* Novità della versione — primo avvio dopo un aggiornamento, sopra tutto */}
            {whatsNew?.show && (
                <WhatsNewModal version={whatsNew.version} onClose={() => setWhatsNew(null)} />
            )}
        </ErrorBoundary>
    );
}

export default App
