// Archivo src/components/FeedbackProvider.tsx: los mensajes, confirmaciones y opciones visuales compartidas de la app. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

// Contrato de datos Tone: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
type Tone = 'success' | 'error' | 'info';
// Contrato de datos Choice: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
type Choice = { label: string; value: string };
// Contrato de datos Dialog: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
type Dialog =
  | { kind: 'confirm'; title: string; message: string; confirmText: string; cancelText: string; destructive: boolean }
  | { kind: 'choose'; title: string; message: string; choices: Choice[] };

// Contrato de datos FeedbackApi: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
interface FeedbackApi {
  showMessage: (title: string, message: string, tone?: Tone) => void;
  confirm: (title: string, message: string, confirmText?: string, destructive?: boolean) => Promise<boolean>;
  choose: (title: string, message: string, choices: Choice[]) => Promise<string | null>;
}

const FeedbackContext = createContext<FeedbackApi | null>(null);
let toastId = 0;
// Esta función renderiza el componente reutilizable FeedbackProvider, usando sus props para mostrar estado y comunicar acciones al componente padre. Recibe children como entrada.
export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ id: number; title: string; message: string; tone: Tone } | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const resolverRef = useRef<((value: boolean | string | null) => void) | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast((current) => current?.id === toast.id ? null : current), 4600);
    return () => clearTimeout(timer);
  }, [toast]);

  const showMessage = useCallback((title: string, message: string, tone: Tone = 'info') => {
    setToast({ id: ++toastId, title, message, tone });
  }, []);

  const confirm = useCallback((title: string, message: string, confirmText = 'Confirmar', destructive = false) =>
    new Promise<boolean>((resolve) => {
      resolverRef.current = (value) => resolve(value === true);
      setDialog({ kind: 'confirm', title, message, confirmText, cancelText: 'Cancelar', destructive });
    }), []);

  const choose = useCallback((title: string, message: string, choices: Choice[]) =>
    new Promise<string | null>((resolve) => {
      resolverRef.current = (value) => resolve(typeof value === 'string' ? value : null);
      setDialog({ kind: 'choose', title, message, choices });
    }), []);
  // Esta función cierra el diálogo propio de la aplicación y resuelve la promesa pendiente con la opción elegida. Recibe value como entrada.
  const closeDialog = (value: boolean | string | null) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setDialog(null);
  };

  return <FeedbackContext.Provider value={{ showMessage, confirm, choose }}>
    <View style={styles.root}>
      {children}
      {toast ? <View pointerEvents="box-none" style={styles.toastLayer}>
        <View accessibilityLiveRegion="polite" style={[styles.toast, styles[`toast_${toast.tone}`]]}>
          <View style={styles.toastMark} />
          <View style={styles.toastCopy}><Text style={styles.toastTitle}>{toast.title}</Text><Text style={styles.toastMessage}>{toast.message}</Text></View>
          <Pressable onPress={() => setToast(null)} accessibilityRole="button" accessibilityLabel="Cerrar mensaje" style={styles.toastClose}><Text style={styles.toastCloseText}>×</Text></Pressable>
        </View>
      </View> : null}
      <Modal transparent visible={!!dialog} animationType="fade" onRequestClose={() => closeDialog(null)}>
        <View style={styles.scrim}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => closeDialog(null)} accessibilityLabel="Cerrar diálogo" />
          <View accessibilityViewIsModal style={styles.dialog}>
            <View style={styles.dialogAccent} />
            <Text style={styles.dialogEyebrow}>ESTANCIA APP</Text>
            <Text style={styles.dialogTitle}>{dialog?.title}</Text>
            <Text style={styles.dialogMessage}>{dialog?.message}</Text>
            {dialog?.kind === 'choose' ? <View style={styles.choices}>
              {dialog.choices.map((choice) => <Pressable key={choice.value} style={styles.choiceButton} onPress={() => closeDialog(choice.value)}><Text style={styles.choiceText}>{choice.label}</Text><Text style={styles.choiceArrow}>›</Text></Pressable>)}
              <Pressable style={styles.cancelButton} onPress={() => closeDialog(null)}><Text style={styles.cancelText}>Cancelar</Text></Pressable>
            </View> : <View style={styles.dialogActions}>
              <Pressable style={styles.cancelButton} onPress={() => closeDialog(false)}><Text style={styles.cancelText}>{dialog?.kind === 'confirm' ? dialog.cancelText : 'Cerrar'}</Text></Pressable>
              {dialog?.kind === 'confirm' ? <Pressable style={[styles.confirmButton, dialog.destructive && styles.destructiveButton]} onPress={() => closeDialog(true)}><Text style={styles.confirmText}>{dialog.confirmText}</Text></Pressable> : null}
            </View>}
          </View>
        </View>
      </Modal>
    </View>
  </FeedbackContext.Provider>;
}
// Esta función maneja la operación «use feedback» del componente feedback provider y actualiza o resuelve el estado de interacción correspondiente.
export function useFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error('useFeedback debe usarse dentro de FeedbackProvider');
  return context;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f3f5ef' },
  toastLayer: { position: 'absolute', zIndex: 50, top: Platform.OS === 'web' ? 18 : 52, left: 0, right: 0, alignItems: 'center', paddingHorizontal: 16 },
  toast: { flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 520, minHeight: 68, padding: 14, gap: 12, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3e8df', shadowColor: '#142418', shadowOpacity: 0.15, shadowRadius: 24, shadowOffset: { width: 0, height: 10 }, elevation: 9 },
  toast_success: { borderLeftWidth: 4, borderLeftColor: '#477b4d' }, toast_error: { borderLeftWidth: 4, borderLeftColor: '#b54d3d' }, toast_info: { borderLeftWidth: 4, borderLeftColor: '#82996c' },
  toastMark: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#477b4d' }, toastCopy: { flex: 1 }, toastTitle: { color: '#203327', fontSize: 14, fontWeight: '800' }, toastMessage: { color: '#647067', fontSize: 13, lineHeight: 18, marginTop: 2 }, toastClose: { padding: 4 }, toastCloseText: { color: '#788379', fontSize: 24, lineHeight: 24 },
  scrim: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(16,32,22,0.48)', padding: 20 },
  dialog: { width: '100%', maxWidth: 460, overflow: 'hidden', borderRadius: 22, padding: 26, backgroundColor: '#fff', shadowColor: '#0e2114', shadowOpacity: 0.22, shadowRadius: 32, shadowOffset: { width: 0, height: 18 }, elevation: 16 },
  dialogAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: '#315d3d' }, dialogEyebrow: { color: '#66806a', fontSize: 10, fontWeight: '800', letterSpacing: 2 }, dialogTitle: { color: '#1d2d22', fontSize: 22, fontWeight: '800', marginTop: 10 }, dialogMessage: { color: '#667168', fontSize: 15, lineHeight: 22, marginTop: 9 },
  dialogActions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 10, marginTop: 25 }, choices: { gap: 8, marginTop: 20 }, choiceButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8df', borderRadius: 13, paddingHorizontal: 15, paddingVertical: 13 }, choiceText: { color: '#263b2c', fontWeight: '700' }, choiceArrow: { color: '#63806a', fontSize: 22 },
  cancelButton: { minHeight: 44, borderRadius: 12, paddingHorizontal: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f3ee' }, cancelText: { color: '#435347', fontWeight: '700' }, confirmButton: { minHeight: 44, borderRadius: 12, paddingHorizontal: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#315d3d' }, destructiveButton: { backgroundColor: '#a64236' }, confirmText: { color: '#fff', fontWeight: '800' },
});
