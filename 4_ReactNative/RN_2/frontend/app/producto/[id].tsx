import { Link, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { CustomModal } from '../../src/components/CustomModal';
import { api } from '../../src/services/api';
import { Product } from '../../src/types';
import { useTheme } from '../../src/theme/ThemeContext';

// Presenta información del producto y habilita movimientos de stock.
export default function ProductDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('1');
  const [modal, setModal] = useState(false);
  const [kind, setKind] = useState<'entrada' | 'salida'>('entrada');
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState('');

  // Recarga los datos cuando se abre el detalle.
  const load = useCallback(() => { api<Product>(`/productos/${id}`).then(setProduct).catch((failure: Error) => setError(failure.message)); }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Confirma una entrada o salida y obtiene el saldo actualizado.
  async function movement() {
    if (busy || !/^\d+$/.test(amount) || Number(amount) < 1) { setInfo('Ingresá una cantidad entera mayor que cero.'); return; }
    setBusy(true);
    try { await api('/movimientos', { method: 'POST', body: JSON.stringify({ producto_id: Number(id), tipo: kind, cantidad: Number(amount) }) }); setModal(false); setInfo('Movimiento registrado. El saldo se actualizó.'); load(); }
    catch (failure) { setInfo((failure as Error).message); }
    finally { setBusy(false); }
  }

  // Reactiva el producto luego de informar que está desactivado.
  async function reactivate() { try { await api(`/productos/${id}/reactivar`, { method: 'PATCH' }); setInfo('Producto reactivado.'); load(); } catch (failure) { setInfo((failure as Error).message); } }

  if (!product) return <View style={styles.center}>{error ? <Text style={{ color: colors.danger }}>{error}</Text> : <ActivityIndicator color={colors.primary} />}</View>;
  return <><ScrollView contentContainerStyle={styles.page}><Text style={[styles.title, { color: colors.text }]}>{product.nombre}</Text>{!product.activo && <View style={[styles.inactive, { borderColor: colors.warning }]}><Text style={{ color: colors.warning }}>Este producto está desactivado y no admite movimientos.</Text><Pressable onPress={() => void reactivate()}><Text style={{ color: colors.primary, fontWeight: '700', marginTop: 8 }}>Reactivar producto</Text></Pressable></View>}<Info label="Código" value={product.codigo} colors={colors} /><Info label="Descripción" value={product.descripcion || 'Sin descripción'} colors={colors} /><Info label="Precio" value={product.precio == null ? 'Sin precio' : String(product.precio)} colors={colors} /><Info label="Existencias" value={String(product.stock_actual)} colors={colors} /><Info label="Stock mínimo" value={String(product.stock_minimo)} colors={colors} /><Info label="Vencimiento" value={product.fecha_vencimiento ? String(product.fecha_vencimiento).slice(0, 10) : 'Sin vencimiento'} colors={colors} />{Boolean(product.activo) && <View style={styles.row}><Pressable onPress={() => { setKind('entrada'); setModal(true); }} style={[styles.button, { backgroundColor: colors.primary }]}><Text style={styles.buttonText}>Entrada</Text></Pressable><Pressable onPress={() => { setKind('salida'); setModal(true); }} style={[styles.button, { backgroundColor: colors.danger }]}><Text style={styles.buttonText}>Salida</Text></Pressable></View>}<Link href={{ pathname: '/producto-form', params: { id: String(product.id) } }} style={[styles.edit, { color: colors.primary }]}>Editar datos del producto</Link></ScrollView><CustomModal visible={modal} title={`Registrar ${kind}`} message={`Stock actual: ${product.stock_actual}. Ingresá una cantidad.`} onClose={() => setModal(false)} onConfirm={() => void movement()} confirmText={busy ? 'Guardando…' : 'Confirmar'}><TextInput keyboardType="number-pad" value={amount} onChangeText={setAmount} placeholder="Cantidad" style={[styles.quantity, { borderColor: colors.border, color: colors.text }]} /></CustomModal><CustomModal visible={!!info} title="Información" message={info} onClose={() => setInfo('')} /></>;
}

// Presenta una característica del producto en una tarjeta compacta.
function Info({ label, value, colors }: { label: string; value: string; colors: { muted: string; text: string; border: string; card: string } }) { return <View style={[styles.info, { borderColor: colors.border, backgroundColor: colors.card }]}><Text style={{ color: colors.muted }}>{label}</Text><Text style={{ color: colors.text, fontWeight: '600' }}>{value}</Text></View>; }

const styles = StyleSheet.create({ page: { padding: 20 }, center: { flex: 1, justifyContent: 'center', alignItems: 'center' }, title: { fontSize: 26, fontWeight: '800', marginBottom: 14 }, info: { padding: 15, borderWidth: 1, borderRadius: 12, marginBottom: 10, gap: 5 }, inactive: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 12 }, row: { flexDirection: 'row', gap: 12, marginTop: 16 }, button: { flex: 1, minHeight: 50, borderRadius: 13, justifyContent: 'center', alignItems: 'center' }, buttonText: { color: 'white' }, edit: { fontWeight: '700', marginTop: 22 }, quantity: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 14 } });
