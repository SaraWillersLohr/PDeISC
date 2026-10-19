import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { API_URL, api } from '../../src/services/api';
import { Category } from '../../src/types';
import { ThemeMode, useTheme } from '../../src/theme/ThemeContext';
import { CustomModal } from '../../src/components/CustomModal';

// Permite cambiar el tema y administrar las categorías del inventario.
export default function Settings() {
  const { colors, mode, setMode } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const load = useCallback(() => { api<Category[]>('/categorias').then(setCategories).catch((error: Error) => setMessage(error.message)); }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Guarda la categoría nueva o modifica el nombre seleccionado.
  async function saveCategory() { if (!name.trim()) { setMessage('Escribí un nombre para la categoría.'); return; } try { await api(selected ? `/categorias/${selected}` : '/categorias', { method: selected ? 'PUT' : 'POST', body: JSON.stringify({ nombre: name }) }); setName(''); setSelected(null); load(); } catch (error) { setMessage((error as Error).message); } }

  // Elimina una categoría y sus asociaciones, conservando los productos.
  async function deleteCategory() { if (!selected) return; try { await api(`/categorias/${selected}`, { method: 'DELETE' }); setConfirmDelete(false); setSelected(null); setName(''); load(); } catch (error) { setMessage((error as Error).message); setConfirmDelete(false); } }

  const modes: ThemeMode[] = ['auto', 'claro', 'oscuro'];
  return <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.page}><Text style={[styles.title, { color: colors.text }]}>Apariencia</Text>{modes.map((item) => <Pressable key={item} onPress={() => setMode(item)} style={[styles.option, { backgroundColor: colors.card, borderColor: colors.border }]}><Text style={{ color: colors.text }}>{item === 'auto' ? 'Automático' : item === 'claro' ? 'Modo claro' : 'Modo oscuro'}</Text><Text style={{ color: colors.primary }}>{mode === item ? '✓' : ''}</Text></Pressable>)}<Text style={[styles.title, { color: colors.text, marginTop: 24 }]}>Categorías</Text><TextInput value={name} onChangeText={setName} placeholder="Nombre de categoría" placeholderTextColor={colors.muted} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]} /><View style={styles.row}><Pressable onPress={() => void saveCategory()} style={[styles.button, { backgroundColor: colors.primary }]}><Text style={styles.buttonText}>{selected ? 'Guardar nombre' : 'Crear categoría'}</Text></Pressable>{selected && <Pressable onPress={() => setConfirmDelete(true)} style={[styles.button, { backgroundColor: colors.danger }]}><Text style={styles.buttonText}>Eliminar</Text></Pressable>}</View>{categories.map((category) => <Pressable key={category.id} onPress={() => { setSelected(category.id); setName(category.nombre); }} style={[styles.option, { backgroundColor: selected === category.id ? colors.border : colors.card, borderColor: colors.border }]}><Text style={{ color: colors.text }}>{category.nombre}</Text><Text style={{ color: colors.muted }}>Editar</Text></Pressable>)}<Text style={[styles.title, { color: colors.text, marginTop: 24 }]}>Conexión</Text><Text style={{ color: colors.muted, lineHeight: 22 }}>API: {API_URL}{'\n'}Configurá EXPO_PUBLIC_API_URL en frontend/.env con la dirección de la computadora en la red local. localhost no funciona desde un teléfono.</Text><CustomModal visible={!!message} title="Información" message={message} onClose={() => setMessage('')} /><CustomModal visible={confirmDelete} title="¿Eliminar categoría?" message="Se quitarán sus asociaciones. Los productos permanecerán en el inventario." onClose={() => setConfirmDelete(false)} onConfirm={() => void deleteCategory()} confirmText="Eliminar" /></ScrollView>;
}

const styles = StyleSheet.create({ page: { padding: 20, paddingBottom: 35 }, title: { fontSize: 23, fontWeight: '800', marginBottom: 14 }, option: { minHeight: 50, borderWidth: 1, borderRadius: 13, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, input: { minHeight: 46, borderWidth: 1, borderRadius: 11, paddingHorizontal: 12, marginBottom: 10 }, row: { flexDirection: 'row', gap: 10, marginBottom: 12 }, button: { minHeight: 44, borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center' }, buttonText: { color: 'white', fontWeight: '700' } });
