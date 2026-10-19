import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge conosce solo le taglie di testo standard. Una taglia nostra (`text-md`)
 * verrebbe scambiata per un colore e, accanto a `text-fg`, una delle due sparirebbe in
 * silenzio — la stessa trappola che nella Fase 7 cancellava `text-micro` e `text-nano`.
 * Qui gli si dice qual è la scala tipografica di tailwind.config.js.
 */
const twMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            'font-size': [{ text: ['xs', 'sm', 'base', 'md', 'lg', 'xl', '2xl', '3xl', '4xl'] }],
        },
    },
})

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
