import Layout from '@/components/layout/Layout';
import VouchersScreen from '@/components/vouchers/VouchersScreen';

export default function VouchersPage() {
  return (
    <Layout
      title="My Vouchers - Pickorbeet"
      description="Collect Pickorbeet vouchers and apply them at checkout."
      frame="vouchers"
      noindex
    >
      <VouchersScreen />
    </Layout>
  );
}
