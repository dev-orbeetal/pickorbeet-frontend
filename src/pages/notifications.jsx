import Layout from '@/components/layout/Layout';
import NotificationsScreen from '@/components/notifications/NotificationsScreen';

export default function NotificationsPage() {
  return (
    <Layout
      appChrome
      title="Notifications - PickOrbeet"
      description="Stay updated with your orders, offers and more."
      noindex
    >
      <NotificationsScreen />
    </Layout>
  );
}
