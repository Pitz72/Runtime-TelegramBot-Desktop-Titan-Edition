import React from 'react';

export const FlagIT = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className={className}>
        <rect width="1" height="2" fill="#009246" />
        <rect width="1" height="2" x="1" fill="#FFF" />
        <rect width="1" height="2" x="2" fill="#CE2B37" />
    </svg>
);

export const FlagFR = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" className={className}>
        <rect width="1" height="2" fill="#0055A4" />
        <rect width="1" height="2" x="1" fill="#FFF" />
        <rect width="1" height="2" x="2" fill="#EF4135" />
    </svg>
);

export const FlagDE = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className={className}>
        <rect width="5" height="3" fill="#000" />
        <rect width="5" height="2" y="1" fill="#D00" />
        <rect width="5" height="1" y="2" fill="#FFCE00" />
    </svg>
);

export const FlagES = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 500" className={className}>
        <rect width="750" height="500" fill="#c60b1e" />
        <rect width="750" height="250" y="125" fill="#ffc400" />
    </svg>
);

export const FlagPT = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" className={className}>
        <rect width="600" height="400" fill="#f00" />
        <rect width="240" height="400" fill="#060" />
    </svg>
);

export const FlagRU = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6" className={className}>
        <rect width="9" height="6" fill="#FFF" />
        <rect width="9" height="4" y="2" fill="#0039A6" />
        <rect width="9" height="2" y="4" fill="#D52B1E" />
    </svg>
);

export const FlagCN = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" className={className}>
        <rect width="30" height="20" fill="#DE2910" />
        <polygon fill="#FFDE00" points="5,2 6,4 8,4 6.5,5.5 7,7.5 5,6.5 3,7.5 3.5,5.5 2,4 4,4" />
    </svg>
);

export const FlagGB = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className={className}>
        <clipPath id="s">
            <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <clipPath id="t">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
        <g clipPath="url(#s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </g>
    </svg>
);
