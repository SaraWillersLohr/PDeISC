import express, { type Request, type Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from './database.js';
import { requireAdmin } from './middlewares/auth.js';

const app = express();
const port = Number(process.env.PORT || 3001);
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use('/uploads', express.static(path.resolve('uploads')));

const upload = multer({
  storage: multer.diskStorage({ destination: 'uploads', filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`) }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype))
});
const allowed = ['projects', 'photography', 'education', 'skills', 'timeline_events', 'learning_items', 'objectives', 'social_links', 'site_settings'] as const;
type Collection = typeof allowed[number];
const collection = (value: string | string[]): Collection | null => typeof value === 'string' && allowed.includes(value as Collection) ? value as Collection : null;

// Lectura pública: una respuesta única evita cascadas de peticiones en la landing.
app.get('/api/portfolio', async (_req, res) => {
  try {
    const [settings, photos, projects, education, skills, timeline, learning, objectives, links] = await Promise.all([
      db.query('SELECT setting_key, setting_value FROM site_settings'), db.query('SELECT * FROM photography WHERE active=1 ORDER BY sort_order'),
      db.query('SELECT * FROM projects WHERE active=1 ORDER BY sort_order'), db.query('SELECT * FROM education WHERE active=1 ORDER BY sort_order'),
      db.query('SELECT s.*, c.name category FROM skills s JOIN skill_categories c ON c.id=s.category_id WHERE s.active=1 ORDER BY c.sort_order,s.sort_order'),
      db.query('SELECT * FROM timeline_events WHERE active=1 ORDER BY sort_order'), db.query('SELECT * FROM learning_items WHERE active=1 ORDER BY sort_order'),
      db.query('SELECT * FROM objectives WHERE active=1 ORDER BY sort_order'), db.query('SELECT * FROM social_links WHERE active=1 ORDER BY sort_order')
    ]);
    res.json({ settings: Object.fromEntries((settings[0] as Array<{setting_key:string;setting_value:string}>).map(x => [x.setting_key, x.setting_value])), photos: photos[0], projects: projects[0], education: education[0], skills: skills[0], timeline: timeline[0], learning: learning[0], objectives: objectives[0], links: links[0] });
  } catch { res.status(503).json({ message: 'No se pudo conectar con la base de datos.' }); }
});
app.get('/api/:collection', async (req, res) => { const name=collection(req.params.collection); if (!name) return res.sendStatus(404); try { const [rows]=await db.query(`SELECT * FROM ${name} WHERE active=1 ORDER BY sort_order`); res.json(rows); } catch { res.sendStatus(503); } });

app.post('/api/admin/login', async (req: Request, res: Response) => {
  const parsed=z.object({ email:z.string().email(), password:z.string().min(8) }).safeParse(req.body); if (!parsed.success) return res.status(400).json({message:'Completá un email y contraseña válidos.'});
  const [rows]=await db.query('SELECT id, password_hash, first_login FROM users WHERE email=? AND active=1',[parsed.data.email]); const user=(rows as Array<{id:number;password_hash:string;first_login:number}>)[0];
  if (!user || !await bcrypt.compare(parsed.data.password,user.password_hash)) return res.status(401).json({message:'Email o contraseña incorrectos.'});
  const token=jwt.sign({sub:user.id},process.env.JWT_SECRET || process.env.ADMIN_SECRET || 'development-only-secret',{expiresIn:'8h'}); res.json({token,firstLogin:Boolean(user.first_login)});
});
app.post('/api/admin/change-password', requireAdmin, async (req, res) => { const parsed=z.object({ password:z.string().min(10) }).safeParse(req.body); if(!parsed.success) return res.status(400).json({message:'La contraseña debe tener al menos 10 caracteres.'}); const hash=await bcrypt.hash(parsed.data.password,12); await db.query('UPDATE users SET password_hash=?,first_login=0 WHERE id=?',[hash,(req as import('./middlewares/auth.js').AuthRequest).adminId]); res.json({message:'Contraseña actualizada.'}); });
app.get('/api/admin/:collection', requireAdmin, async (req,res) => { const name=collection(req.params.collection); if(!name)return res.sendStatus(404); const order=name==='site_settings'?'setting_key':'sort_order'; const [rows]=await db.query(`SELECT * FROM ${name} ORDER BY ${order}`); res.json(rows); });
app.post('/api/admin/upload', requireAdmin, upload.single('image'), (req,res) => { if(!req.file)return res.status(400).json({message:'Elegí una imagen JPG, PNG o WebP de hasta 5 MB.'}); res.status(201).json({path:`/uploads/${req.file.filename}`}); });
app.post('/api/admin/:collection', requireAdmin, async (req,res) => { const name=collection(req.params.collection); if(!name)return res.sendStatus(404); const data=z.record(z.string(),z.unknown()).safeParse(req.body); if(!data.success)return res.status(400).json({message:'Datos inválidos.'}); const keys=Object.keys(data.data).filter(k=>!['id','created_at','updated_at'].includes(k)); if(!keys.length)return res.status(400).json({message:'Completá los campos requeridos.'}); const [result]=await db.query(`INSERT INTO ${name} (${keys.map(k=>`\`${k}\``).join(',')}) VALUES (${keys.map(()=>'?').join(',')})`,keys.map(k=>data.data[k])); res.status(201).json({id:(result as {insertId:number}).insertId,message:'Elemento creado.'}); });
app.put('/api/admin/:collection/:id', requireAdmin, async (req,res) => { const name=collection(req.params.collection); if(!name)return res.sendStatus(404); const data=z.record(z.string(),z.unknown()).safeParse(req.body); if(!data.success)return res.status(400).json({message:'Datos inválidos.'}); const keys=Object.keys(data.data).filter(k=>!['id','created_at','updated_at'].includes(k)); if(!keys.length)return res.status(400).json({message:'No hay cambios para guardar.'}); await db.query(`UPDATE ${name} SET ${keys.map(k=>`\`${k}\`=?`).join(',')} WHERE id=?`,[...keys.map(k=>data.data[k]),req.params.id]); res.json({message:'Cambios guardados.'}); });
app.delete('/api/admin/:collection/:id', requireAdmin, async (req,res) => { const name=collection(req.params.collection); if(!name)return res.sendStatus(404); await db.query(`DELETE FROM ${name} WHERE id=?`,[req.params.id]); res.status(204).end(); });
app.use((_req,res) => res.status(404).json({message:'Ruta no encontrada.'}));
app.listen(port,()=>console.log(`API en http://localhost:${port}`));
