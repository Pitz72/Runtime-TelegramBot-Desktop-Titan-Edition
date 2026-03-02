import React, { useState, useEffect } from 'react';
import { Dashboard } from '@/components/Dashboard';
import { SetupWizard } from '@/components/SetupWizard';
import { IntroScreen } from '@/components/IntroScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App(): JSX.Element {
    const [hasBots, setHasBots] = useState<boolean | null>(null);
    const [introDone, setIntroDone] = useState<boolean>(false);

    useEffect(() => {
        window.api.getBots().then((bots) => {
            setHasBots(bots.length > 0);
        });
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
                <IntroScreen onComplete={() => setIntroDone(true)} />
            ) : hasBots ? (
                <Dashboard />
            ) : (
                <SetupWizard
                    onComplete={(name, token, channel, startDate) => handleSetupComplete(name, token, channel, startDate)}
                    onSkip={() => setHasBots(true)}
                />
            )}
        </ErrorBoundary>
    );
}

export default App
