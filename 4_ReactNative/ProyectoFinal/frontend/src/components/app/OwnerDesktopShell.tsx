// navegación y estructura responsiva optimizada para escritorio y dispositivos móviles.
import { Ionicons } from '@expo/vector-icons';
import { styles } from './OwnerDesktopShellStyles';
import { router, usePathname } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSession } from '../../context/SessionContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../ThemeToggle';
import { NotificationBell } from './NotificationBell';
import { OfflineSyncBanner } from './OfflineSyncBanner';

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
  { key: 'estancia', label: 'Mi estancia', icon: 'home-outline', activeIcon: 'home', category: 'operaciones', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'animales', label: 'Mis animales', icon: 'paw-outline', activeIcon: 'paw', category: 'operaciones', roles: ['administrador', 'dueno', 'peon'] },
  { key: 'tareas', label: 'Tareas', icon: 'checkbox-outline', activeIcon: 'checkbox', category: 'operaciones', roles: ['administrador', 'peon'] },
  { key: 'sanidad', label: 'Sanidad y Enfermería', icon: 'medkit-outline', activeIcon: 'medkit', category: 'operaciones', roles: ['administrador', 'dueno', 'veterinario'] },
  { key: 'reproduccion', label: 'Reproducción', icon: 'git-branch-outline', activeIcon: 'git-branch', category: 'operaciones', roles: ['administrador', 'dueno', 'peon'] },

  // Gestión de estancia
  { key: 'eventos', label: 'Eventos y Remates', icon: 'calendar-outline', activeIcon: 'calendar', category: 'gestion', roles: ['administrador', 'dueno'] },
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
        : item.key === 'estancia'
        ? 'estate'
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
    if (key === 'inicio') router.push('/(app)/home');
    else if (key === 'animales') router.push('/(app)/animals');
    else if (key === 'estancia') router.push('/(app)/estate');
    else if (key === 'eventos') router.push('/(app)/events');
    else if (key === 'equipo') router.push('/(app)/team');
    else if (key === 'perfil') router.push('/(app)/more');
    else if (key === 'tareas') router.push('/(app)/tasks');
    else if (key === 'sanidad') router.push('/(app)/health');
    else router.push({ pathname: '/(app)/[module]', params: { module: key } });
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
            <NotificationBell />
          </View>
        </View>

        <View style={styles.mobileContent}><OfflineSyncBanner />{children}</View>

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
            <NotificationBell />
          </View>
        </View>

        {/* Inner screen content */}
        <View style={styles.screenInner}><OfflineSyncBanner />{children}</View>
      </View>
    </View>
  );
}

