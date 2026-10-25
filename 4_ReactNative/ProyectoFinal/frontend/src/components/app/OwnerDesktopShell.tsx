// navegación y estructura responsiva optimizada para escritorio y dispositivos móviles.
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../ThemeToggle';

const logo = require('../../../assets/branding/dark/logo.png');

type SectionItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  category: 'operaciones' | 'gestion' | 'cuenta';
  roles: string[];
};

const sections: SectionItem[] = [
  // Operaciones de campo
  { key: 'inicio', label: 'Inicio', icon: 'home-outline', activeIcon: 'home', category: 'operaciones', roles: ['administrador', 'dueno', 'peon', 'veterinario'] },
  { key: 'animales', label: 'Animales', icon: 'paw-outline', activeIcon: 'paw', category: 'operaciones', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'corrales', label: 'Corrales', icon: 'grid-outline', activeIcon: 'grid', category: 'operaciones', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'tareas', label: 'Tareas', icon: 'checkbox-outline', activeIcon: 'checkbox', category: 'operaciones', roles: ['administrador', 'peon'] },
  { key: 'sanidad', label: 'Sanidad y Enfermería', icon: 'medkit-outline', activeIcon: 'medkit', category: 'operaciones', roles: ['administrador', 'peon', 'veterinario'] },
  { key: 'reproduccion', label: 'Reproducción', icon: 'git-branch-outline', activeIcon: 'git-branch', category: 'operaciones', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'mapa', label: 'Mi campo (Potreros)', icon: 'map-outline', activeIcon: 'map', category: 'operaciones', roles: ['administrador', 'dueno', 'peon'] },

  // Gestión de estancia
  { key: 'eventos', label: 'Eventos y Remates', icon: 'calendar-outline', activeIcon: 'calendar', category: 'gestion', roles: ['administrador', 'dueno'] },
  { key: 'avisos', label: 'Avisos y Alertas', icon: 'notifications-outline', activeIcon: 'notifications', category: 'gestion', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'equipo', label: 'Equipo y Accesos', icon: 'people-outline', activeIcon: 'people', category: 'gestion', roles: ['administrador', 'dueno'] },
  { key: 'catalogo', label: 'Especies y Razas', icon: 'list-outline', activeIcon: 'list', category: 'gestion', roles: ['administrador', 'dueno', 'peon'] },

  // Cuenta
  { key: 'perfil', label: 'Mi perfil', icon: 'person-circle-outline', activeIcon: 'person-circle', category: 'cuenta', roles: ['administrador', 'dueno', 'peon', 'veterinario'] },
];

const roleLabels: Record<string, { label: string; color: string; bg: string }> = {
  administrador: { label: 'Administrador', color: '#86efac', bg: 'rgba(134, 239, 172, 0.16)' },
  copropietario: { label: 'Administrador', color: '#86efac', bg: 'rgba(134, 239, 172, 0.16)' },
  dueno: { label: 'Dueño', color: '#fde047', bg: 'rgba(253, 224, 71, 0.16)' },
  peon: { label: 'Peón de Campo', color: '#93c5fd', bg: 'rgba(147, 197, 253, 0.16)' },
  veterinario: { label: 'Veterinario', color: '#a7f3d0', bg: 'rgba(167, 243, 208, 0.16)' },
};

export function OwnerDesktopShell({ children }: React.PropsWithChildren) {
  const { width } = useWindowDimensions();
  const { session } = useSession();
  const { isDark, colors } = useTheme();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const rawRole = session?.usuario.rol.toLowerCase() ?? '';
  const role = rawRole === 'copropietario' ? 'administrador' : rawRole;
  const isDesktop = Platform.OS === 'web' && width >= 860;
  const visibleSections = sections.filter((item) => item.roles.includes(role));

  const roleMeta = roleLabels[role] ?? { label: 'Usuario', color: '#d1dfd4', bg: 'rgba(255,255,255,0.1)' };
  const initials = useMemo(
    () => `${session?.usuario.nombre?.[0] ?? ''}${session?.usuario.apellido?.[0] ?? ''}`.toUpperCase(),
    [session]
  );

  function isSectionActive(item: SectionItem): boolean {
    const routeKey =
      item.key === 'animales'
        ? 'animals'
        : item.key === 'corrales'
        ? 'corrals'
        : item.key === 'eventos'
        ? 'events'
        : item.key === 'equipo'
        ? 'team'
        : item.key === 'perfil'
        ? 'more'
        : item.key;
    if (item.key === 'inicio') {
      return pathname === '/home' || pathname === '/(app)/home' || pathname === '/';
    }
    return pathname.includes(routeKey);
  }

  function navigate(key: string): void {
    setMenuOpen(false);
    if (key === 'inicio') router.navigate('/(app)/home');
    else if (key === 'animales') router.navigate('/(app)/animals');
    else if (key === 'corrales') router.navigate('/(app)/corrals');
    else if (key === 'eventos') router.navigate('/(app)/events');
    else if (key === 'equipo') router.navigate('/(app)/team');
    else if (key === 'perfil') router.navigate('/(app)/more');
    else if (key === 'tareas') router.navigate('/(app)/tasks');
    else if (key === 'sanidad') router.navigate('/(app)/health');
    else router.navigate({ pathname: '/(app)/[module]', params: { module: key } });
  }

  // Active section for breadcrumbs
  const currentSection = visibleSections.find((item) => isSectionActive(item)) ?? visibleSections[0];

  // Mobile layout
  if (!isDesktop) {
    return (
      <SafeAreaView edges={['top']} style={[styles.mobileRoot, { backgroundColor: colors.bgCanvas }]}>
        <View style={[styles.mobileHeader, isDark && styles.mobileHeaderDark]}>
          <Pressable
            accessibilityLabel="Abrir menú de navegación"
            accessibilityRole="button"
            onPress={() => setMenuOpen(true)}
            style={styles.menuButton}
          >
            <Ionicons color="#f0fdf4" name="menu" size={24} />
          </Pressable>

          <View style={styles.mobileBrandWrap}>
            <Image resizeMode="contain" source={logo} style={styles.mobileBrandLogo} />
            <Text style={styles.mobileBrand}>
              Estancia<Text style={styles.brandAccent}>App</Text>
            </Text>
          </View>

          <View style={styles.mobileHeaderRight}>
            <ThemeToggle variant="compact" />
          </View>
        </View>

        <View style={styles.mobileContent}>{children}</View>

        {/* Mobile Navigation Drawer */}
        <Modal animationType="fade" onRequestClose={() => setMenuOpen(false)} transparent visible={menuOpen}>
          <View style={styles.overlay}>
            <SafeAreaView edges={['top', 'bottom']} style={styles.drawer}>
              <View style={styles.drawerHead}>
                <View style={styles.brandContainer}>
                  <Image resizeMode="contain" source={logo} style={styles.brandIcon} />
                  <View>
                    <Text style={styles.brandText}>
                      Estancia<Text style={styles.brandAccent}>App</Text>
                    </Text>
                    <Text style={styles.brandSubtitle}>GESTIÓN AGROPECUARIA</Text>
                  </View>
                </View>
                <Pressable
                  accessibilityLabel="Cerrar menú"
                  accessibilityRole="button"
                  onPress={() => setMenuOpen(false)}
                  style={styles.closeButton}
                >
                  <Ionicons color="#f0fdf4" name="close" size={22} />
                </Pressable>
              </View>

              <ScrollView contentContainerStyle={styles.mobileNav} showsVerticalScrollIndicator={false}>
                <Text style={styles.categoryTitle}>OPERACIONES Y GESTIÓN</Text>
                {visibleSections.map((item) => {
                  const active = isSectionActive(item);
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => navigate(item.key)}
                      style={[styles.mobileLink, active && styles.mobileLinkActive]}
                    >
                      <View style={[styles.mobileIconBadge, active && styles.mobileIconBadgeActive]}>
                        <Ionicons
                          color={active ? '#86efac' : '#b7c8ba'}
                          name={active ? item.activeIcon : item.icon}
                          size={19}
                        />
                      </View>
                      <Text style={[styles.mobileLinkText, active && styles.mobileLinkTextActive]}>
                        {item.label}
                      </Text>
                      <Ionicons
                        color={active ? '#86efac' : '#576f5b'}
                        name="chevron-forward"
                        size={16}
                      />
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Theme switch in mobile drawer */}
              <View style={styles.drawerThemeWrap}>
                <ThemeToggle variant="sidebar" />
              </View>

              {/* Mobile Profile Card */}
              <Pressable onPress={() => navigate('perfil')} style={styles.mobileProfile}>
                {session?.usuario.foto_perfil ? (
                  <Image source={{ uri: session.usuario.foto_perfil }} style={styles.profileImage} />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={styles.name}>
                    {session?.usuario.nombre} {session?.usuario.apellido}
                  </Text>
                  <View style={[styles.roleBadge, { backgroundColor: roleMeta.bg }]}>
                    <Text style={[styles.roleText, { color: roleMeta.color }]}>{roleMeta.label}</Text>
                  </View>
                </View>
              </Pressable>
            </SafeAreaView>
            <Pressable accessibilityLabel="Cerrar menú" onPress={() => setMenuOpen(false)} style={styles.overlayClose} />
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // Desktop layout
  return (
    <View style={[styles.desktopRoot, { backgroundColor: colors.bgCanvas }]}>
      {/* Desktop Sidebar */}
      <View style={[styles.sidebar, isDark && styles.sidebarDark]}>
        {/* Brand Header */}
        <View style={styles.brandRow}>
          <Image resizeMode="contain" source={logo} style={styles.brandIcon} />
          <View style={styles.brandMeta}>
            <Text style={styles.brandText}>
              Estancia<Text style={styles.brandAccent}>App</Text>
            </Text>
            <View style={styles.brandTag}>
              <Text style={styles.brandTagText}>AGRO & GANADERÍA</Text>
            </View>
          </View>
        </View>

        {/* Navigation items grouped */}
        <ScrollView contentContainerStyle={styles.navContainer} showsVerticalScrollIndicator={false} style={styles.navScroll}>
          <Text style={styles.categoryTitle}>OPERACIONES</Text>
          {visibleSections
            .filter((item) => item.category === 'operaciones')
            .map((item) => {
              const active = isSectionActive(item);
              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  onPress={() => navigate(item.key)}
                  style={({ pressed }) => [
                    styles.navItem,
                    active && styles.navItemActive,
                    pressed && styles.navItemPressed,
                  ]}
                >
                  {active ? <View style={styles.activeBar} /> : null}
                  <View style={[styles.navIconBadge, active && styles.navIconBadgeActive]}>
                    <Ionicons
                      color={active ? '#86efac' : '#b2c5b5'}
                      name={active ? item.activeIcon : item.icon}
                      size={18}
                    />
                  </View>
                  <Text style={[styles.navItemText, active && styles.navItemTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}

          {visibleSections.some((item) => item.category === 'gestion') ? (
            <>
              <Text style={styles.categoryTitle}>GESTIÓN DE CAMPO</Text>
              {visibleSections
                .filter((item) => item.category === 'gestion')
                .map((item) => {
                  const active = isSectionActive(item);
                  return (
                    <Pressable
                      key={item.key}
                      accessibilityRole="button"
                      onPress={() => navigate(item.key)}
                      style={({ pressed }) => [
                        styles.navItem,
                        active && styles.navItemActive,
                        pressed && styles.navItemPressed,
                      ]}
                    >
                      {active ? <View style={styles.activeBar} /> : null}
                      <View style={[styles.navIconBadge, active && styles.navIconBadgeActive]}>
                        <Ionicons
                          color={active ? '#86efac' : '#b2c5b5'}
                          name={active ? item.activeIcon : item.icon}
                          size={18}
                        />
                      </View>
                      <Text style={[styles.navItemText, active && styles.navItemTextActive]}>
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
            </>
          ) : null}

          <Text style={styles.categoryTitle}>CUENTA</Text>
          {visibleSections
            .filter((item) => item.category === 'cuenta')
            .map((item) => {
              const active = isSectionActive(item);
              return (
                <Pressable
                  key={item.key}
                  accessibilityRole="button"
                  onPress={() => navigate(item.key)}
                  style={({ pressed }) => [
                    styles.navItem,
                    active && styles.navItemActive,
                    pressed && styles.navItemPressed,
                  ]}
                >
                  {active ? <View style={styles.activeBar} /> : null}
                  <View style={[styles.navIconBadge, active && styles.navIconBadgeActive]}>
                    <Ionicons
                      color={active ? '#86efac' : '#b2c5b5'}
                      name={active ? item.activeIcon : item.icon}
                      size={18}
                    />
                  </View>
                  <Text style={[styles.navItemText, active && styles.navItemTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
        </ScrollView>

        {/* Theme toggle switch in sidebar */}
        <View style={styles.themeSection}>
          <ThemeToggle variant="sidebar" />
        </View>

        {/* Profile Card Footer */}
        <Pressable
          accessibilityLabel="Ver mi perfil"
          onPress={() => navigate('perfil')}
          style={styles.profileFooter}
        >
          {session?.usuario.foto_perfil ? (
            <Image source={{ uri: session.usuario.foto_perfil }} style={styles.profileImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          <View style={styles.profileMeta}>
            <Text numberOfLines={1} style={styles.name}>
              {session?.usuario.nombre} {session?.usuario.apellido}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: roleMeta.bg }]}>
              <Text style={[styles.roleText, { color: roleMeta.color }]}>{roleMeta.label}</Text>
            </View>
          </View>
          <Ionicons color="#849887" name="ellipsis-vertical" size={17} />
        </Pressable>
      </View>

      {/* Desktop Main Content Container */}
      <View style={styles.contentWrap}>
        {/* Top desktop sub-header */}
        <View style={[styles.desktopTopBar, { backgroundColor: colors.bgCard, borderBottomColor: colors.borderLight }]}>
          <View style={styles.breadWrap}>
            <Text style={[styles.breadRoot, { color: colors.textMuted }]}>Estancia</Text>
            <Ionicons color={colors.textMuted} name="chevron-forward" size={14} />
            <Text style={[styles.breadActive, { color: colors.textMain }]}>{currentSection?.label ?? 'Panel'}</Text>
          </View>

          <View style={styles.topBarRight}>
            <View style={[styles.onlineBadge, { backgroundColor: isDark ? 'rgba(64, 145, 108, 0.2)' : '#eaf4ec' }]}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Sistema Conectado</Text>
            </View>
            <ThemeToggle variant="compact" />
          </View>
        </View>

        {/* Inner screen content */}
        <View style={styles.screenInner}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Desktop Root Layout
  desktopRoot: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    minHeight: '100%',
    width: '100%',
  },
  sidebar: {
    backgroundColor: '#0f2418',
    borderRightColor: 'rgba(255, 255, 255, 0.08)',
    borderRightWidth: 1,
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 0,
    flexShrink: 0,
    height: '100%',
    paddingBottom: 16,
    paddingHorizontal: 14,
    paddingTop: 20,
    width: 260,
  },
  sidebarDark: {
    backgroundColor: '#0a160f',
    borderRightColor: 'rgba(255, 255, 255, 0.06)',
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  brandIcon: {
    borderRadius: 8,
    height: 38,
    width: 38,
  },
  brandMeta: {
    flex: 1,
  },
  brandText: {
    color: '#f0fdf4',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  brandAccent: {
    color: '#86efac',
  },
  brandTag: {
    marginTop: 2,
  },
  brandTagText: {
    color: '#8ba690',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  brandContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  brandSubtitle: {
    color: '#8ba690',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 2,
  },

  // Navigation Items
  navScroll: {
    flex: 1,
  },
  navContainer: {
    gap: 4,
    paddingBottom: 14,
  },
  categoryTitle: {
    color: '#657e6b',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    marginBottom: 4,
    marginTop: 14,
    paddingHorizontal: 10,
  },
  navItem: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 11,
    minHeight: 40,
    paddingHorizontal: 10,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: 'rgba(134, 239, 172, 0.14)',
  },
  navItemPressed: {
    opacity: 0.85,
  },
  activeBar: {
    backgroundColor: '#86efac',
    borderRadius: 2,
    height: 20,
    left: 2,
    position: 'absolute',
    width: 3,
  },
  navIconBadge: {
    alignItems: 'center',
    borderRadius: 8,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  navIconBadgeActive: {
    backgroundColor: 'rgba(134, 239, 172, 0.16)',
  },
  navItemText: {
    color: '#b7c8ba',
    fontSize: 12.5,
    fontWeight: '600',
  },
  navItemTextActive: {
    color: '#f0fdf4',
    fontWeight: '800',
  },

  // Theme section
  themeSection: {
    marginTop: 'auto',
    paddingVertical: 4,
  },

  // Sidebar Profile Card
  profileFooter: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  profileMeta: {
    flex: 1,
  },
  avatar: {
    alignItems: 'center',
    backgroundColor: 'rgba(134, 239, 172, 0.2)',
    borderRadius: 17,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  avatarText: {
    color: '#86efac',
    fontSize: 11,
    fontWeight: '800',
  },
  profileImage: {
    borderRadius: 17,
    height: 34,
    width: 34,
  },
  name: {
    color: '#f0fdf4',
    fontSize: 12,
    fontWeight: '700',
  },
  roleBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    marginTop: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  roleText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // Content Area
  contentWrap: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
  },
  desktopTopBar: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  breadWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  breadRoot: {
    fontSize: 13,
    fontWeight: '600',
  },
  breadActive: {
    fontSize: 14,
    fontWeight: '800',
  },
  topBarRight: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
  },
  onlineBadge: {
    alignItems: 'center',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  onlineDot: {
    backgroundColor: '#34d399',
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  onlineText: {
    color: '#2d6a4f',
    fontSize: 11,
    fontWeight: '700',
  },
  screenInner: {
    flex: 1,
  },

  // Mobile Styles
  mobileRoot: {
    flex: 1,
  },
  mobileHeader: {
    alignItems: 'center',
    backgroundColor: '#122e1e',
    flexDirection: 'row',
    height: 60,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  mobileHeaderDark: {
    backgroundColor: '#0a160f',
  },
  menuButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  mobileBrandWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  mobileBrandLogo: {
    height: 28,
    width: 28,
  },
  mobileBrand: {
    color: '#f0fdf4',
    fontSize: 18,
    fontWeight: '900',
  },
  mobileHeaderRight: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  mobileContent: {
    flex: 1,
  },

  // Drawer
  overlay: {
    backgroundColor: 'rgba(6, 15, 9, 0.65)',
    flex: 1,
    flexDirection: 'row',
  },
  overlayClose: {
    flex: 1,
  },
  drawer: {
    backgroundColor: '#0f2418',
    elevation: 16,
    height: '100%',
    maxWidth: 340,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    width: '85%',
  },
  drawerHead: {
    alignItems: 'center',
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 14,
    paddingTop: 6,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  mobileNav: {
    gap: 5,
    paddingVertical: 14,
  },
  mobileLink: {
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 10,
  },
  mobileLinkActive: {
    backgroundColor: 'rgba(134, 239, 172, 0.14)',
  },
  mobileIconBadge: {
    alignItems: 'center',
    borderRadius: 8,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  mobileIconBadgeActive: {
    backgroundColor: 'rgba(134, 239, 172, 0.18)',
  },
  mobileLinkText: {
    color: '#c9d8cc',
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
  },
  mobileLinkTextActive: {
    color: '#f0fdf4',
    fontWeight: '800',
  },
  drawerThemeWrap: {
    marginVertical: 10,
  },
  mobileProfile: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    padding: 12,
  },
});
