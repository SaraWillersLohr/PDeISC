import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, KeyboardTypeOptions } from 'react-native';
import { api } from '../src/services/api';
import { Category, Product } from '../src/types';
import { useTheme } from '../src/theme/ThemeContext';
import { CustomModal } from '../src/components/CustomModal';

type ProductFields = { nombre: string; codigo: string; descripcion: string; precio: string; stock_inicial: string; stock_minimo: string; fecha_vencimiento: string };

// Permite crear productos o editar sus datos generales y categorías.
export default function ProductForm() {
  const { id, codigo } = useLocalSearchParams<{ id?: string; codigo?: string }>();
  const { colors } = useTheme();
  const [form, setForm] = useState<ProductFields>({ nombre: '', codigo: codigo || '', descripcion: '', precio: '', stock_inicial: '0', stock_minimo: '0', fecha_vencimiento: '' });
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  // Carga categorías y datos existentes antes de permitir guardar.
  useEffect(() => {
    api<Category[]>('/categorias').then(setCategories).catch((error: Error) => setMessage(error.message));
    if (id) api<Product>(`/productos/${id}`).then((product) => {
      setForm({ nombre: product.nombre, codigo: product.codigo, descripcion: product.descripcion || '', precio: String(product.precio ?? ''), stock_inicial: String(product.stock_actual), stock_minimo: String(product.stock_minimo), fecha_vencimiento: product.fecha_vencimiento ? String(product.fecha_vencimiento).slice(0, 10) : '' });
      setSelected(String(product.categoria_ids || '').split(',').filter(Boolean).map(Number));
    }).catch((error: Error) => setMessage(error.message));
  }, [id]);

  // Actualiza un campo sin perder el resto de los datos ingresados.
  function update(key: keyof ProductFields, value: string) { setForm((current) => ({ ...current, [key]: value })); }

  // Comprueba los campos requeridos y guarda evitando solicitudes repetidas.
  async function save() {
    if (busy) return;
    if (!form.nombre.trim() || !form.codigo.trim()) { setMessage('El nombre y el código son obligatorios.'); return; }
    if ([form.precio, form.stock_inicial, form.stock_minimo].some((value) => value !== '' && !/^\d+(\.\d{1,2})?$/.test(value))) { setMessage('Revisá los campos numéricos. Deben ser cero o positivos.'); return; }
    if (form.fecha_vencimiento && !/^\d{4}-\d{2}-\d{2}$/.test(form.fecha_vencimiento)) { setMessage('Ingresá el vencimiento con formato AAAA-MM-DD.'); return; }
    setBusy(true);
    try { await api(id ? `/productos/${id}` : '/productos', { method: id ? 'PUT' : 'POST', body: JSON.stringify({ ...form, categorias: selected }) }); router.back(); }
    catch (error) { setMessage((error as Error).message); }
    finally { setBusy(false); }
  }

  // Construye un campo de texto adaptable al tipo de dato.
  function field(key: keyof ProductFields, label: string, keyboardType: KeyboardTypeOptions = 'default') {
    return <View style={styles.field} key={key}><Text style={{ color: colors.text }}>{label}</Text><TextInput value={form[key]} onChangeText={(value) => update(key, value)} keyboardType={keyboardType} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]} /></View>;
  }

  return <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled"><Text style={[styles.title, { color: colors.text }]}>{id ? 'Editar producto' : 'Registrar producto'}</Text>{field('nombre', 'Nombre')}{field('codigo', 'Código de barras o QR')}{field('descripcion', 'Descripción')}{field('precio', 'Precio', 'decimal-pad')}{!id && field('stock_inicial', 'Stock inicial', 'number-pad')}{field('stock_minimo', 'Stock mínimo', 'number-pad')}{field('fecha_vencimiento', 'Vencimiento (AAAA-MM-DD)')}<Text style={{ color: colors.text, fontWeight: '700', marginTop: 10 }}>Categorías</Text><View style={styles.tags}>{categories.map((category) => <Pressable key={category.id} onPress={() => setSelected((current) => current.includes(category.id) ? current.filter((value) => value !== category.id) : [...current, category.id])} style={[styles.tag, { backgroundColor: selected.includes(category.id) ? colors.primary : colors.card, borderColor: colors.border }]}><Text style={{ color: selected.includes(category.id) ? 'white' : colors.text }}>{category.nombre}</Text></Pressable>)}</View><Pressable disabled={busy} onPress={() => void save()} style={[styles.save, { backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }]}>{busy ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: '700' }}>Guardar producto</Text>}</Pressable></ScrollView><CustomModal visible={!!message} title="Revisá los datos" message={message} onClose={() => setMessage('')} /></KeyboardAvoidingView>;
}

const styles = StyleSheet.create({ page: { padding: 20, paddingBottom: 40 }, title: { fontSize: 24, fontWeight: '800', marginBottom: 16 }, field: { marginBottom: 12, gap: 6 }, input: { borderWidth: 1, borderRadius: 11, minHeight: 46, paddingHorizontal: 12 }, tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 }, tag: { borderWidth: 1, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 9 }, save: { minHeight: 50, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 16 } });
