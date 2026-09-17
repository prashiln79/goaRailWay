import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export const MoreScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [disclaimerModal, setDisclaimerModal] = useState(false);
  const [aboutModal, setAboutModal] = useState(false);

  const renderMenuItem = (
    icon: keyof typeof Ionicons.glyphMap,
    title: string,
    subtitle: string,
    onPress: () => void,
    rightComponent?: React.ReactNode,
  ) => {
    return (
      <TouchableOpacity
        style={styles.menuItem}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.menuIconBox}>
          <Ionicons name={icon} size={20} color="#7A4321" />
        </View>
        <View style={styles.menuTextGroup}>
          <Text style={styles.menuTitle}>{title}</Text>
          <Text style={styles.menuSubtitle}>{subtitle}</Text>
        </View>
        {rightComponent ?? <Ionicons name="chevron-forward" size={18} color="#C4B7AF" />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F4" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 80 }]}
      >
        <View style={styles.menuCard}>
          {renderMenuItem(
            'notifications-outline',
            'Notifications',
            'Get alerts and updates',
            () => setNotificationsEnabled(!notificationsEnabled),
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E7EB', true: '#9E3C1B' }}
              thumbColor="#FFFFFF"
            />,
          )}

          <View style={styles.divider} />

          {renderMenuItem(
            'settings-outline',
            'Settings',
            'App preferences',
            () => {},
          )}

          <View style={styles.divider} />

          {renderMenuItem(
            'help-circle-outline',
            'Help & Feedback',
            "We'd love to hear from you",
            () => {},
          )}

          <View style={styles.divider} />

          {renderMenuItem(
            'information-circle-outline',
            'About',
            'App version, privacy policy',
            () => setAboutModal(true),
          )}

          <View style={styles.divider} />

          {renderMenuItem(
            'document-text-outline',
            'Data Disclaimer',
            'Train information is for reference only',
            () => setDisclaimerModal(true),
          )}
        </View>

        {/* Rate the App Card */}
        <TouchableOpacity style={styles.rateCard} activeOpacity={0.85}>
          <View style={styles.rateIconBox}>
            <Ionicons name="star-outline" size={22} color="#D97706" />
          </View>
          <View style={styles.rateTextGroup}>
            <Text style={styles.rateTitle}>Rate the App</Text>
            <Text style={styles.rateSubtitle}>Support future development</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Disclaimer Modal */}
      <Modal visible={disclaimerModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Data & Availability Disclaimer</Text>
            <Text style={styles.modalBody}>
              Konkan Train Planner is an independent helper tool designed to assist travelers in planning journeys, discovering connecting train routes, and checking timetable details.
              {'\n\n'}
              Live seat availability, train status, and bookings are managed exclusively by Indian Railways and IRCTC. Availability changes dynamically based on cancellations, Tatkal quotas, and chart preparation.
              {'\n\n'}
              Always verify final schedules and seat availability on the official IRCTC portal (irctc.co.in) before making travel bookings.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setDisclaimerModal(false)}
            >
              <Text style={styles.modalBtnText}>Understood</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* About Modal */}
      <Modal visible={aboutModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Konkan Train Planner</Text>
            <Text style={styles.versionTag}>Version 1.0.0 (MVP)</Text>
            <Text style={styles.modalBody}>
              Dedicated train journey planner designed specifically for travelers moving across the Mumbai - Konkan - Goa corridor.
              {'\n\n'}
              Built with React Native & Expo.
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setAboutModal(false)}
            >
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MoreScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF7F4',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2C201A',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F7EEE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextGroup: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C201A',
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#8A7A71',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F6F2EE',
    marginLeft: 66,
  },
  rateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEAE6',
    padding: 16,
  },
  rateIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rateTextGroup: {
    flex: 1,
  },
  rateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#B45309',
  },
  rateSubtitle: {
    fontSize: 12,
    color: '#8A7A71',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 22,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2C201A',
    marginBottom: 4,
  },
  versionTag: {
    fontSize: 12,
    color: '#8A7A71',
    marginBottom: 12,
    fontWeight: '600',
  },
  modalBody: {
    fontSize: 13,
    color: '#554238',
    lineHeight: 19,
    marginBottom: 20,
  },
  modalBtn: {
    backgroundColor: '#9E3C1B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
