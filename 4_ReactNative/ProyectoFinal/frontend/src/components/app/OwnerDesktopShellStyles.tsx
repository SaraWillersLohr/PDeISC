// centralizo los estilos de este módulo para separar presentación y comportamiento.
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
