import React, { useEffect, useId } from 'react';
import { animate, motion, useMotionValue, useReducedMotionConfig, useTransform, type MotionValue } from 'framer-motion';
import logo from '../../assets/logo.png';

/*
 * Il logo di Titan dentro un'orbita in prospettiva, per la schermata d'ingresso.
 *
 * L'orbita si disegna, un satellite la percorre per un giro e un quarto lasciando una
 * scia, poi si ferma accanto al logo e un riflesso attraversa la piastrella. È tutto
 * finito in meno di quattro secondi e da lì in poi niente si muove più: un'animazione
 * infinita accanto ai controlli sarebbe contro WCAG 2.2.2 (pausa, stop, nascondi).
 *
 * La profondità è un trucco da due strati: l'orbita è disegnata due volte, una tagliata
 * sul semipiano «dietro» e bucata dove c'è la piastrella del logo, una tagliata sul
 * semipiano «davanti». Il satellite segue la stessa regola, quindi passa dietro al logo
 * da solo, senza calcolare in quale metà si trovi.
 */

// Geometria nel sistema di coordinate dell'SVG (1 unità = 1 px a zoom 100%)
const W = 260;
const H = 140;
const CX = W / 2;
const CY = H / 2;
const LOGO = 96;
const LOGO_X = CX - LOGO / 2;
const LOGO_Y = CY - LOGO / 2;
/** Raggio degli angoli della piastrella di logo.png: 22% del lato */
const LOGO_RADIUS = LOGO * 0.22;
const RX = 118;
const RY = 31;
/** Inclinazione dell'orbita, che sale verso destra come l'anello del logo */
const TILT_DEG = -21;

const TILT = (TILT_DEG * Math.PI) / 180;
const COS = Math.cos(TILT);
const SIN = Math.sin(TILT);

/** Punto dell'ellisse inclinata all'angolo `t`. Con sin(t) > 0 il punto è nella metà davanti. */
function orbitPoint(t: number, rx = RX, ry = RY): [number, number] {
    const x = rx * Math.cos(t);
    const y = ry * Math.sin(t);
    return [CX + x * COS - y * SIN, CY + x * SIN + y * COS];
}

/** Semipiano oltre l'asse maggiore dell'orbita: `side` 1 = davanti (in basso), -1 = dietro. */
function halfPlane(side: 1 | -1): string {
    const L = 1000;
    const ux = COS * L, uy = SIN * L;
    const nx = -SIN * L * side, ny = COS * L * side;
    return `M${CX + ux},${CY + uy} L${CX + ux + nx},${CY + uy + ny} L${CX - ux + nx},${CY - uy + ny} L${CX - ux},${CY - uy} Z`;
}

// Il satellite fa un giro e un quarto e si ferma davanti, a destra del logo.
const T_END = 0.27 * Math.PI;
const T_START = T_END - 2.5 * Math.PI;
const TRAIL = 9;

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_DRAW: [number, number, number, number] = [0.65, 0, 0.35, 1];

const T = {
    logo: 0.1,
    ring: 0.25,
    ringDuration: 1.5,
    outer: 0.7,
    satellite: 0.95,
    satelliteDuration: 2.3,
    sheen: 3.05,
};

function TrailDot({ progress, index }: { progress: MotionValue<number>; index: number }) {
    // La scia si accorcia mentre il satellite rallenta, e a fine corsa sparisce.
    const angle = (p: number) => T_START + (T_END - T_START) * p - index * 0.075 * Math.pow(1 - p, 1.1);
    const cx = useTransform(progress, p => orbitPoint(angle(p))[0]);
    const cy = useTransform(progress, p => orbitPoint(angle(p))[1]);
    const opacity = useTransform(progress, p => (1 - index / (TRAIL + 1)) * 0.75 * Math.min(1, p * 8) * Math.pow(1 - p, 0.6));
    return <motion.circle cx={cx} cy={cy} r={2.4 - index * 0.17} style={{ opacity }} className="fill-accent" />;
}

function Comet({ progress, glowId }: { progress: MotionValue<number>; glowId: string }) {
    const cx = useTransform(progress, p => orbitPoint(T_START + (T_END - T_START) * p)[0]);
    const cy = useTransform(progress, p => orbitPoint(T_START + (T_END - T_START) * p)[1]);
    const opacity = useTransform(progress, p => Math.min(1, p * 10));
    return (
        <motion.g style={{ opacity }}>
            {Array.from({ length: TRAIL }, (_, i) => <TrailDot key={i} progress={progress} index={i + 1} />)}
            <motion.circle cx={cx} cy={cy} r={7.5} className="fill-accent" opacity={0.55} filter={`url(#${glowId})`} />
            <motion.circle cx={cx} cy={cy} r={2.9} className="fill-accent-strong" />
        </motion.g>
    );
}

function Rings({ reduce }: { reduce: boolean }) {
    const draw = (delay: number, duration: number) => reduce
        ? {}
        : { initial: { pathLength: 0, opacity: 0 }, animate: { pathLength: 1, opacity: 1 }, transition: { delay, duration, ease: EASE_DRAW } };
    return (
        <>
            <motion.ellipse
                cx={CX} cy={CY} rx={RX + 14} ry={RY + 11}
                transform={`rotate(${TILT_DEG} ${CX} ${CY})`}
                fill="none" className="stroke-accent" strokeWidth={0.8} strokeOpacity={0.22}
                {...draw(T.outer, T.ringDuration + 0.3)}
            />
            <motion.ellipse
                cx={CX} cy={CY} rx={RX} ry={RY}
                transform={`rotate(${TILT_DEG} ${CX} ${CY})`}
                fill="none" className="stroke-accent" strokeWidth={1.3} strokeOpacity={0.6} strokeLinecap="round"
                {...draw(T.ring, T.ringDuration)}
            />
        </>
    );
}

export function TitanOrbit() {
    const reduce = useReducedMotionConfig() ?? false;
    const uid = useId().replace(/:/g, '');
    const progress = useMotionValue(reduce ? 1 : 0);

    useEffect(() => {
        if (reduce) {
            progress.set(1);
            return;
        }
        const controls = animate(progress, 1, { delay: T.satellite, duration: T.satelliteDuration, ease: EASE_OUT });
        return () => controls.stop();
    }, [reduce, progress]);

    const ids = { front: `${uid}-front`, back: `${uid}-back`, hole: `${uid}-hole`, glow: `${uid}-glow` };

    return (
        <div className="relative mx-auto" style={{ width: W, height: H }} aria-hidden="true">
            {/* Alone dietro la piastrella */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    left: CX - 90, top: CY - 70, width: 180, height: 140,
                    background: 'radial-gradient(closest-side, rgba(59, 130, 246, 0.30), rgba(59, 130, 246, 0.08) 60%, transparent)',
                }}
                {...(reduce ? {} : { initial: { opacity: 0, scale: 0.7 }, animate: { opacity: 1, scale: 1 }, transition: { delay: T.logo, duration: 1.4, ease: EASE_OUT } })}
            />

            <motion.img
                src={logo}
                alt=""
                draggable={false}
                className="absolute select-none"
                style={{ left: LOGO_X, top: LOGO_Y, width: LOGO, height: LOGO }}
                {...(reduce ? {} : {
                    initial: { opacity: 0, scale: 0.88, filter: 'blur(10px)' },
                    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
                    transition: { delay: T.logo, duration: 1.0, ease: EASE_OUT },
                })}
            />

            {/* Riflesso che attraversa la piastrella una volta sola, a satellite fermo */}
            {!reduce && (
                <div
                    className="pointer-events-none absolute overflow-hidden"
                    style={{ left: LOGO_X, top: LOGO_Y, width: LOGO, height: LOGO, borderRadius: LOGO_RADIUS }}
                >
                    <motion.div
                        className="absolute inset-y-[-20%] w-1/2"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(220, 232, 255, 0.22), transparent)' }}
                        initial={{ x: '-160%', skewX: -18 }}
                        animate={{ x: '260%', skewX: -18 }}
                        transition={{ delay: T.sheen, duration: 1.1, ease: [0.45, 0, 0.2, 1] }}
                    />
                </div>
            )}

            <svg className="absolute inset-0 overflow-visible" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
                <defs>
                    <clipPath id={ids.front}><path d={halfPlane(1)} /></clipPath>
                    <clipPath id={ids.back}><path d={halfPlane(-1)} /></clipPath>
                    <mask id={ids.hole} maskUnits="userSpaceOnUse" x={-W} y={-H} width={W * 3} height={H * 3}>
                        <rect x={-W} y={-H} width={W * 3} height={H * 3} fill="white" />
                        <rect x={LOGO_X} y={LOGO_Y} width={LOGO} height={LOGO} rx={LOGO_RADIUS} fill="black" />
                    </mask>
                    <filter id={ids.glow} x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="3" />
                    </filter>
                </defs>

                {/* Dietro: tagliato sulla metà lontana e bucato dove c'è il logo */}
                <g clipPath={`url(#${ids.back})`} mask={`url(#${ids.hole})`}>
                    <Rings reduce={reduce} />
                    <Comet progress={progress} glowId={ids.glow} />
                </g>
                {/* Davanti: la metà vicina, sopra al logo */}
                <g clipPath={`url(#${ids.front})`}>
                    <Rings reduce={reduce} />
                    <Comet progress={progress} glowId={ids.glow} />
                </g>
            </svg>
        </div>
    );
}
