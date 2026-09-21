import { useCallback, useEffect, useState } from 'react';
import type { Portfolio } from './types';
import { apiUrl } from './api';

export function useTheme(){ const [theme,setTheme]=useState<'light'|'dark'>(()=>(localStorage.getItem('theme') as 'light'|'dark') || (matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')); useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('theme',theme)},[theme]); return {theme,toggle:()=>setTheme(t=>t==='light'?'dark':'light')}; }
export function usePortfolio(){ const [data,setData]=useState<Portfolio|null>(null),[error,setError]=useState(''); const load=useCallback(async()=>{try{const response=await fetch(apiUrl('/api/portfolio'));if(!response.ok)throw new Error();setData(await response.json())}catch{setError('No pudimos cargar el contenido. Verificá que la API y MariaDB estén iniciadas.')}},[]);useEffect(()=>{load()},[load]); return {data,error,reload:load}; }
